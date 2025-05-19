import { NextResponse } from 'next/server';
import db from '@/lib/db';

// POST - Update employee presence based on app_usage data
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
    
    // Get data from request body
    const data = await request.json();
    
    // Validate required fields
    if (!data.employee_id || !data.date) {
      return NextResponse.json({ 
        success: false, 
        error: 'Employee ID and date are required fields' 
      }, { status: 400 });
    }
    
    // Get or create presence record for this employee and date
    const [existingRecord] = await db.query(
      `SELECT * FROM presence_tracking WHERE employee_id = ? AND date = ? AND organization_id = ?`,
      [data.employee_id, data.date, data.organization_id]
    );
    
    let presenceId;
    let isNewRecord = false;
    
    if (existingRecord.length === 0) {
      // Create new presence record
      const [result] = await db.query(
        `INSERT INTO presence_tracking 
         (employee_id, date, first_activity, last_activity, total_active_seconds, status) 
         VALUES (?, ?, ?, ?, ?, 'absent')`,
        [
          data.employee_id,
          data.date,
          data.first_activity || null,
          data.last_activity || null,
          data.total_active_seconds || 0
        ]
      );
      presenceId = result.insertId;
      isNewRecord = true;
    } else {
      // Update existing presence record
      presenceId = existingRecord[0].id;
      
      await db.query(
        `UPDATE presence_tracking 
         SET first_activity = IFNULL(?, first_activity),
             last_activity = IFNULL(?, last_activity),
             total_active_seconds = IFNULL(?, total_active_seconds),
             updated_at = NOW()
         WHERE id = ?`,
        [
          data.first_activity || null,
          data.last_activity || null,
          data.total_active_seconds || existingRecord[0].total_active_seconds,
          presenceId
        ]
      );
    }
    
    // Check for existing leave request
    const [existingLeave] = await db.query(
      `SELECT lr.* FROM leave_requests lr
       WHERE lr.employee_id = ?
       AND lr.status = 'approved'
       AND ? BETWEEN lr.start_date AND lr.end_date`,
      [data.employee_id, data.date]
    );
    
    if (existingLeave.length > 0) {
      // Employee is on approved leave for this day
      await db.query(
        `UPDATE presence_tracking 
         SET status = 'leave', leave_request_id = ?
         WHERE id = ?`,
        [existingLeave[0].id, presenceId]
      );
      
      return NextResponse.json({ 
        success: true, 
        message: 'Employee is on approved leave for this date',
        presence: {
          id: presenceId,
          status: 'leave',
          leave_request_id: existingLeave[0].id
        }
      });
    }
    
    // No existing leave - determine status based on activity
    // Get latest presence data
    const [updatedPresence] = await db.query(
      `SELECT * FROM presence_tracking WHERE id = ?`,
      [presenceId]
    );
    
    const activeSeconds = updatedPresence[0].total_active_seconds || 0;
    let newStatus = 'absent';
    
    // Apply rule: 0-30 min activity = absent, 30min-4h = half_day, 4h+ = present
    const HALF_DAY_THRESHOLD_SECONDS = 30 * 60; // 30 minutes
    const FULL_DAY_THRESHOLD_SECONDS = 4 * 60 * 60; // 4 hours
    
    if (activeSeconds >= FULL_DAY_THRESHOLD_SECONDS) {
      newStatus = 'present';
    } else if (activeSeconds >= HALF_DAY_THRESHOLD_SECONDS) {
      newStatus = 'half_day';
    } else {
      newStatus = 'absent';
    }
    
    // Update status
    await db.query(
      `UPDATE presence_tracking SET status = ? WHERE id = ?`,
      [newStatus, presenceId]
    );
    
    // Auto-generate leave requests for absent or half-day
    if ((newStatus === 'absent' || newStatus === 'half_day') && !existingLeave.length) {
      // Get default leave type for auto-detected absences
      const [defaultLeaveType] = await db.query(
        `SELECT * FROM leave_types WHERE name = 'Sick Leave' LIMIT 1`
      );
      
      if (defaultLeaveType.length > 0) {
        // Check for existing auto-detected leave request for this date
        const [existingAutoLeave] = await db.query(
          `SELECT * FROM leave_requests 
           WHERE employee_id = ? 
           AND status = 'auto_detected'
           AND ? BETWEEN start_date AND end_date`,
          [data.employee_id, data.date]
        );
        
        if (existingAutoLeave.length === 0) {
          // Create new auto-detected leave request
          const totalDays = newStatus === 'absent' ? 1.0 : 0.5;
          
          const [leaveResult] = await db.query(
            `INSERT INTO leave_requests 
             (employee_id, leave_type_id, start_date, end_date, status, total_days, reason) 
             VALUES (?, ?, ?, ?, 'auto_detected', ?, 'Auto-detected absence')`,
            [
              data.employee_id,
              defaultLeaveType[0].id,
              data.date,
              data.date,
              totalDays
            ]
          );
          
          // Update presence record with leave request ID
          await db.query(
            `UPDATE presence_tracking 
             SET leave_request_id = ? 
             WHERE id = ?`,
            [leaveResult.insertId, presenceId]
          );
          
          return NextResponse.json({ 
            success: true, 
            message: `Auto-detected ${newStatus === 'absent' ? 'absence' : 'half-day'} recorded`,
            presence: {
              id: presenceId,
              status: newStatus,
              leave_request_id: leaveResult.insertId
            },
            leave_request_id: leaveResult.insertId
          });
        } else {
          // Update existing auto-detected leave if needed
          if ((newStatus === 'half_day' && existingAutoLeave[0].total_days === 1.0) ||
              (newStatus === 'absent' && existingAutoLeave[0].total_days === 0.5)) {
            
            const totalDays = newStatus === 'absent' ? 1.0 : 0.5;
            
            await db.query(
              `UPDATE leave_requests 
               SET total_days = ? 
               WHERE id = ?`,
              [totalDays, existingAutoLeave[0].id]
            );
          }
          
          // Update presence record with leave request ID if not already set
          await db.query(
            `UPDATE presence_tracking 
             SET leave_request_id = ? 
             WHERE id = ? AND (leave_request_id IS NULL OR leave_request_id != ?)`,
            [existingAutoLeave[0].id, presenceId, existingAutoLeave[0].id]
          );
          
          return NextResponse.json({ 
            success: true, 
            message: `Updated auto-detected ${newStatus === 'absent' ? 'absence' : 'half-day'}`,
            presence: {
              id: presenceId,
              status: newStatus,
              leave_request_id: existingAutoLeave[0].id
            },
            leave_request_id: existingAutoLeave[0].id
          });
        }
      }
    }
    
    // Default return for normal presence updates
    return NextResponse.json({ 
      success: true, 
      message: `Employee presence updated: ${newStatus}`,
      presence: {
        id: presenceId,
        status: newStatus,
        leave_request_id: null
      }
    });
    
  } catch (error) {
    console.error('Error updating employee presence:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update employee presence',
      message: error.message 
    }, { status: 500 });
  }
}

// GET - Get presence tracking data
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
    const employeeId = searchParams.get('employee_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const status = searchParams.get('status');
    const organizationId = searchParams.get('organization_id');
    
    // Build query
    let query = `
      SELECT 
        pt.id,
        pt.employee_id,
        e.employee_name,
        pt.date,
        pt.first_activity,
        pt.last_activity,
        pt.total_active_seconds,
        pt.status,
        pt.leave_request_id,
        lr.leave_type_id,
        lt.name as leave_type_name,
        lt.color as leave_type_color,
        pt.created_at,
        pt.updated_at
      FROM presence_tracking pt
      JOIN employees e ON pt.employee_id = e.id
      LEFT JOIN leave_requests lr ON pt.leave_request_id = lr.id
      LEFT JOIN leave_types lt ON lr.leave_type_id = lt.id
      WHERE 1=1
    `;
    
    const queryParams = [organizationId];
    
    // Add filters
    if (employeeId) {
      query += ' AND pt.employee_id = ?';
      queryParams.push(employeeId);
    }
    
    if (startDate) {
      query += ' AND pt.date >= ?';
      queryParams.push(startDate);
    }
    
    if (endDate) {
      query += ' AND pt.date <= ?';
      queryParams.push(endDate);
    }
    
    if (status) {
      query += ' AND pt.status = ?';
      queryParams.push(status);
    }
    
    // Order by
    query += ' ORDER BY pt.date DESC, pt.employee_id';
    
    // Execute query
    const [presenceRecords] = await db.query(query, queryParams);
    
    // Transform data for display
    const formattedRecords = presenceRecords.map(record => {
      // Format active time as hours and minutes
      const hours = Math.floor(record.total_active_seconds / 3600);
      const minutes = Math.floor((record.total_active_seconds % 3600) / 60);
      const formattedTime = `${hours}h ${minutes}m`;
      
      return {
        ...record,
        active_time: formattedTime
      };
    });
    
    // Return data
    return NextResponse.json({ 
      success: true, 
      presenceRecords: formattedRecords
    });
    
  } catch (error) {
    console.error('Error fetching presence data:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch presence data',
      message: error.message 
    }, { status: 500 });
  }
} 