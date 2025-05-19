import { NextResponse } from 'next/server';
import db from '@/lib/db';
import jwt from 'jsonwebtoken';
import { getEmployeeIdFromToken } from '@/lib/auth';

// GET - Fetch leave requests with optional filters
export async function GET(request) {
  try {
    // Get token from header
    const token = request.headers.get('x-auth-token');
    if (!token) {
      return NextResponse.json({ 
        success: false, 
        error: 'Authorization token is required' 
      }, { status: 401 });
    }
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organization_id');
    const employeeId = searchParams.get('employee_id');
    const status = searchParams.get('status');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const leaveTypeId = searchParams.get('leave_type_id');
    
    // Build query
    let query = `
      SELECT 
        lr.id, 
        lr.employee_id,
        e.employee_name,
        lr.leave_type_id,
        lt.name as leave_type_name,
        lt.color as leave_type_color,
        lr.start_date,
        lr.end_date,
        lr.status,
        lr.total_days,
        lr.reason,
        lr.approved_by,
        a.employee_name as approved_by_name,
        lr.approved_at,
        lr.rejection_reason,
        lr.created_at,
        lr.updated_at
      FROM leave_requests lr
      JOIN employees e ON lr.employee_id = e.id
      JOIN leave_types lt ON lr.leave_type_id = lt.id
      LEFT JOIN employees a ON lr.approved_by = a.id
      WHERE 1=1
    `;
    
    const queryParams = [];
    
    // Add organization filter if provided
    if (organizationId && employeeId) {
      // Only fetch leave requests for this employee if they belong to the organization
      query += ' AND e.organization_id = ? AND lr.employee_id = ?';
      queryParams.push(organizationId, employeeId);
    } else if (organizationId) {
      query += ' AND e.organization_id = ?';
      queryParams.push(organizationId);
    } else if (employeeId) {
      query += ' AND lr.employee_id = ?';
      queryParams.push(employeeId);
    }
    
    // Add filters
    if (status) {
      query += ' AND lr.status = ?';
      queryParams.push(status);
    }
    
    if (startDate) {
      query += ' AND lr.start_date >= ?';
      queryParams.push(startDate);
    }
    
    if (endDate) {
      query += ' AND lr.end_date <= ?';
      queryParams.push(endDate);
    }
    
    if (leaveTypeId) {
      query += ' AND lr.leave_type_id = ?';
      queryParams.push(leaveTypeId);
    }
    
    // Order by
    query += ' ORDER BY lr.created_at DESC';
    
    console.log('Executing leave requests query:', query);
    console.log('Query params:', queryParams);
    
    // Execute query
    const [leaveRequests] = await db.query(query, queryParams);
    
    // Get leave types
    const [leaveTypes] = await db.query('SELECT * FROM leave_types');
    
    // Return data
    return NextResponse.json({ 
      success: true, 
      leaveRequests,
      leaveTypes
    });
    
  } catch (error) {
    console.error('Error fetching leave management data:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch leave management data',
      message: error.message 
    }, { status: 500 });
  }
}

// POST - Create a new leave request
export async function POST(request) {
  try {
    // Get token from header
    const token = request.headers.get('x-auth-token');
    if (!token) {
      return NextResponse.json({ 
        success: false, 
        error: 'Authorization token is required' 
      }, { status: 401 });
    }
    
    // Decode token to get user information
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, 'trackpro-secret-key');
    } catch (err) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid authentication token' 
      }, { status: 401 });
    }
    
    // Get data from request body
    const data = await request.json();
    
    // Get employee ID from token
    const { employeeId, error } = await getEmployeeIdFromToken(decodedToken);
    
    if (!employeeId) {
      return NextResponse.json({ 
        success: false, 
        error: error || 'Could not identify employee from token'
      }, { status: 400 });
    }
    
    // Use the validated employee ID
    data.employee_id = employeeId;
    
    // Validate required fields
    if (!data.leave_type_id || !data.start_date || !data.end_date || !data.total_days) {
      return NextResponse.json({ 
        success: false, 
        error: 'Leave type, start date, end date, and total days are required fields' 
      }, { status: 400 });
    }
    
    // Check for overlapping leave requests
    const [overlappingRequests] = await db.query(
      `SELECT * FROM leave_requests 
       WHERE employee_id = ? 
       AND status IN ('pending', 'approved') 
       AND ((start_date <= ? AND end_date >= ?) OR 
            (start_date <= ? AND end_date >= ?) OR
            (start_date >= ? AND end_date <= ?))`,
      [
        data.employee_id, 
        data.end_date, data.start_date,
        data.start_date, data.start_date,
        data.start_date, data.end_date
      ]
    );
    
    if (overlappingRequests.length > 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'You already have an overlapping leave request for the selected dates' 
      }, { status: 400 });
    }
    
    // Check leave balance
    const [leaveBalance] = await db.query(
      `SELECT * FROM leave_balances 
       WHERE employee_id = ? AND leave_type_id = ? AND year = YEAR(?)`,
      [data.employee_id, data.leave_type_id, data.start_date]
    );
    
    // If no balance record exists, create one with default values
    if (leaveBalance.length === 0) {
      // Get default entitlement for the leave type
      const [leaveType] = await db.query(
        `SELECT * FROM leave_types WHERE id = ?`,
        [data.leave_type_id]
      );
      
      if (leaveType.length === 0) {
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid leave type' 
        }, { status: 400 });
      }
      
      // Default annual entitlement
      const defaultEntitlement = leaveType[0].is_paid ? 20 : 0; // 20 days for paid leave types
      
      // Create new balance record
      await db.query(
        `INSERT INTO leave_balances 
         (employee_id, leave_type_id, year, total_entitled, used, remaining) 
         VALUES (?, ?, YEAR(?), ?, 0, ?)`,
        [data.employee_id, data.leave_type_id, data.start_date, defaultEntitlement, defaultEntitlement]
      );
    } else {
      // Check if employee has enough balance
      if (leaveBalance[0].remaining < data.total_days && leaveBalance[0].is_paid) {
        return NextResponse.json({ 
          success: false, 
          error: `Insufficient leave balance. Available: ${leaveBalance[0].remaining} days, Requested: ${data.total_days} days` 
        }, { status: 400 });
      }
    }
    
    // Insert new leave request
    const [result] = await db.query(
      `INSERT INTO leave_requests 
       (employee_id, leave_type_id, start_date, end_date, status, total_days, reason) 
       VALUES (?, ?, ?, ?, 'pending', ?, ?)`,
      [
        data.employee_id,
        data.leave_type_id,
        data.start_date,
        data.end_date,
        data.total_days,
        data.reason || null
      ]
    );
    
    // Return success response
    return NextResponse.json({ 
      success: true, 
      message: 'Leave request created successfully',
      id: result.insertId
    });
    
  } catch (error) {
    console.error('Error creating leave request:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create leave request',
      message: error.message 
    }, { status: 500 });
  }
}

// PUT - Update a leave request (approve/reject)
export async function PUT(request) {
  try {
    // Get token from header
    const token = request.headers.get('x-auth-token');
    if (!token) {
      return NextResponse.json({ 
        success: false, 
        error: 'Authorization token is required' 
      }, { status: 401 });
    }
    
    // Get data from request body
    const data = await request.json();
    
    // Validate required fields
    if (!data.id || !data.status) {
      return NextResponse.json({ 
        success: false, 
        error: 'Leave request ID and status are required fields' 
      }, { status: 400 });
    }

    // If approving/rejecting, approver_id is required
    if ((data.status === 'approved' || data.status === 'rejected') && !data.approver_id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Approver ID is required when approving or rejecting a leave request' 
      }, { status: 400 });
    }

    // Validate status is either approved or rejected
    if (data.status !== 'approved' && data.status !== 'rejected' && data.status !== 'cancelled') {
      return NextResponse.json({ 
        success: false, 
        error: 'Status must be approved, rejected, or cancelled' 
      }, { status: 400 });
    }
    
    // If rejected, ensure there's a rejection reason
    if (data.status === 'rejected' && !data.rejection_reason) {
      return NextResponse.json({ 
        success: false, 
        error: 'Rejection reason is required when rejecting a leave request' 
      }, { status: 400 });
    }
    
    // Get current leave request
    const [leaveRequest] = await db.query(
      `SELECT lr.*, e.employee_name, lt.name as leave_type_name, lt.is_paid 
       FROM leave_requests lr
       JOIN employees e ON lr.employee_id = e.id
       JOIN leave_types lt ON lr.leave_type_id = lt.id
       WHERE lr.id = ?`,
      [data.id]
    );
    
    if (leaveRequest.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Leave request not found' 
      }, { status: 404 });
    }
    
    // For cancellation, check if it's the employee's own request
    if (data.status === 'cancelled' && data.approver_id === null) {
      // Employee is cancelling their own request, check if it's still pending
      if (leaveRequest[0].status !== 'pending') {
        return NextResponse.json({ 
          success: false, 
          error: `Leave request cannot be cancelled because it is already ${leaveRequest[0].status}` 
        }, { status: 400 });
      }
    } 
    // For approval/rejection, check if it's pending or auto-detected
    else if (leaveRequest[0].status !== 'pending' && leaveRequest[0].status !== 'auto_detected') {
      return NextResponse.json({ 
        success: false, 
        error: `Leave request cannot be updated because it is already ${leaveRequest[0].status}` 
      }, { status: 400 });
    }

    // Get approver information if present
    let approverName = null;
    if (data.approver_id) {
      const [approver] = await db.query(
        `SELECT employee_name FROM employees WHERE id = ?`,
        [data.approver_id]
      );

      if (approver.length === 0) {
        return NextResponse.json({ 
          success: false, 
          error: 'Approver not found' 
        }, { status: 404 });
      }
      
      approverName = approver[0].employee_name;
    }
    
    // Start a transaction
    await db.query('START TRANSACTION');
    
    try {
      // Update leave request
      await db.query(
        `UPDATE leave_requests 
         SET status = ?, approved_by = ?, approved_at = NOW(), rejection_reason = ? 
         WHERE id = ?`,
        [
          data.status,
          data.approver_id,
          data.rejection_reason || null,
          data.id
        ]
      );
      
      let responseMessage = '';
      const employee = leaveRequest[0].employee_name;
      const leaveType = leaveRequest[0].leave_type_name;
      const totalDays = leaveRequest[0].total_days;
      const isPaidLeave = leaveRequest[0].is_paid;
      
      // If approved, update leave balance
      if (data.status === 'approved') {
        // Update leave balance for paid leave types
        if (isPaidLeave) {
          // Check if balance record exists
          const [balance] = await db.query(
            `SELECT * FROM leave_balances 
             WHERE employee_id = ? AND leave_type_id = ? AND year = YEAR(?)`,
            [leaveRequest[0].employee_id, leaveRequest[0].leave_type_id, leaveRequest[0].start_date]
          );
          
          if (balance.length > 0) {
            await db.query(
              `UPDATE leave_balances 
               SET used = used + ?, remaining = total_entitled - (used + ?) 
               WHERE id = ?`,
              [
                leaveRequest[0].total_days,
                leaveRequest[0].total_days,
                balance[0].id
              ]
            );
            
            responseMessage = `Leave request for ${employee} has been approved. ${totalDays} days of ${leaveType} have been deducted from their balance.`;
          } else {
            // Get default entitlement for the leave type
            const [leaveType] = await db.query(
              `SELECT * FROM leave_types WHERE id = ?`,
              [leaveRequest[0].leave_type_id]
            );
            
            const defaultEntitlement = leaveType[0].is_paid ? 20 : 0; // 20 days for paid leave types
            
            // Create new balance record
            await db.query(
              `INSERT INTO leave_balances 
               (employee_id, leave_type_id, year, total_entitled, used, remaining) 
               VALUES (?, ?, YEAR(?), ?, ?, ?)`,
              [
                leaveRequest[0].employee_id,
                leaveRequest[0].leave_type_id,
                leaveRequest[0].start_date,
                defaultEntitlement,
                leaveRequest[0].total_days,
                defaultEntitlement - leaveRequest[0].total_days
              ]
            );
            
            responseMessage = `Leave request for ${employee} has been approved. A new leave balance record has been created with ${totalDays} days of ${leaveType} used.`;
          }
        } else {
          responseMessage = `Leave request for ${employee} has been approved for ${totalDays} days of unpaid ${leaveType}.`;
        }
        
        // Update presence tracking for leave days
        const startDate = new Date(leaveRequest[0].start_date);
        const endDate = new Date(leaveRequest[0].end_date);
        const currentDate = new Date(startDate);
        
        while (currentDate <= endDate) {
          const dateStr = currentDate.toISOString().split('T')[0];
          
          // Check if presence record exists for this date
          const [presence] = await db.query(
            `SELECT * FROM presence_tracking WHERE employee_id = ? AND date = ?`,
            [leaveRequest[0].employee_id, dateStr]
          );
          
          if (presence.length === 0) {
            // Create new presence record
            await db.query(
              `INSERT INTO presence_tracking 
               (employee_id, date, status, leave_request_id) 
               VALUES (?, ?, 'leave', ?)`,
              [leaveRequest[0].employee_id, dateStr, data.id]
            );
          } else {
            // Update existing presence record
            await db.query(
              `UPDATE presence_tracking 
               SET status = 'leave', leave_request_id = ? 
               WHERE id = ?`,
              [data.id, presence[0].id]
            );
          }
          
          // Move to the next day
          currentDate.setDate(currentDate.getDate() + 1);
        }
      } else if (data.status === 'rejected') {
        responseMessage = `Leave request for ${employee} has been rejected. Reason: ${data.rejection_reason}`;
      } else if (data.status === 'cancelled') {
        responseMessage = `Leave request for ${employee} has been cancelled.`;
      }
      
      // Create notification in the system
      if (data.status === 'approved' || data.status === 'rejected') {
        // Check if notifications table exists
        try {
          await db.query(
            `INSERT INTO notifications 
             (employee_id, type, title, message, is_read, created_at) 
             VALUES (?, ?, ?, ?, 0, NOW())`,
            [
              leaveRequest[0].employee_id,
              data.status === 'approved' ? 'leave_approved' : 'leave_rejected',
              data.status === 'approved' ? 'Leave Request Approved' : 'Leave Request Rejected',
              data.status === 'approved' 
                ? `Your ${leaveType} request for ${totalDays} days has been approved by ${approverName}.` 
                : `Your ${leaveType} request for ${totalDays} days has been rejected. Reason: ${data.rejection_reason}`
            ]
          );
        } catch (error) {
          console.error('Failed to create notification:', error);
          // Continue execution even if notification fails
        }
      }
      
      // Commit transaction
      await db.query('COMMIT');
      
      // Return success response with detailed message
      return NextResponse.json({ 
        success: true, 
        message: responseMessage,
        status: data.status,
        leaveRequest: {
          id: data.id,
          employee_name: employee,
          leave_type_name: leaveType,
          total_days: totalDays,
          status: data.status,
          approved_by: approverName,
          approved_at: new Date().toISOString(),
          rejection_reason: data.rejection_reason || null
        }
      });
      
    } catch (error) {
      // Rollback transaction
      await db.query('ROLLBACK');
      throw error;
    }
    
  } catch (error) {
    console.error('Error updating leave request:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update leave request',
      message: error.message 
    }, { status: 500 });
  }
} 