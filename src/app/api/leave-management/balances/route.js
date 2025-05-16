import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getEmployeeIdFromToken } from '@/lib/auth';
import jwt from 'jsonwebtoken';

// GET - Fetch leave balances for an employee
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
    const requestedEmployeeId = searchParams.get('employee_id');
    const year = searchParams.get('year') || new Date().getFullYear();
    
    // If specific employee ID is requested, use that (for admin)
    // Otherwise, get employee ID from token (for employee viewing their own balance)
    let employeeId = requestedEmployeeId;
    
    // If no specific employee requested, get from token
    if (!employeeId) {
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
      
      // Get employee ID from token
      const { employeeId: tokenEmployeeId, error } = await getEmployeeIdFromToken(decodedToken);
      
      if (!tokenEmployeeId) {
        return NextResponse.json({ 
          success: false, 
          error: error || 'Could not identify employee from token'
        }, { status: 400 });
      }
      
      employeeId = tokenEmployeeId;
    }
    
    // Query leave balances
    const query = `
      SELECT 
        lb.id, 
        lb.employee_id, 
        lb.leave_type_id, 
        lt.name AS leave_type_name,
        lt.color AS leave_type_color,
        lb.year, 
        lb.total_entitled, 
        lb.used, 
        lb.remaining, 
        lb.created_at, 
        lb.updated_at
      FROM 
        leave_balances lb
      JOIN 
        leave_types lt ON lb.leave_type_id = lt.id
      WHERE 
        lb.employee_id = ? AND lb.year = ?
    `;
    
    const [leaveBalances] = await db.query(query, [employeeId, year]);
    
    // Return the leave balances
    return NextResponse.json({ 
      success: true, 
      leaveBalances 
    });
    
  } catch (error) {
    console.error('Error fetching leave balances:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch leave balances',
      message: error.message 
    }, { status: 500 });
  }
}

// POST - Update leave balance
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
    if (!data.employee_id || !data.leave_type_id || !data.year) {
      return NextResponse.json({ 
        success: false, 
        error: 'Employee ID, leave type ID, and year are required fields' 
      }, { status: 400 });
    }
    
    // Check if balance record exists
    const [existingRecord] = await db.query(
      'SELECT * FROM leave_balances WHERE employee_id = ? AND leave_type_id = ? AND year = ?',
      [data.employee_id, data.leave_type_id, data.year]
    );
    
    if (existingRecord.length > 0) {
      // Update existing record
      await db.query(
        `UPDATE leave_balances 
         SET total_entitled = ?, used = ?, remaining = ?, updated_at = NOW() 
         WHERE id = ?`,
        [
          data.total_entitled,
          data.used,
          data.total_entitled - data.used,
          existingRecord[0].id
        ]
      );
      
      return NextResponse.json({ 
        success: true, 
        message: 'Leave balance updated successfully',
        id: existingRecord[0].id
      });
    } else {
      // Create new record
      const [result] = await db.query(
        `INSERT INTO leave_balances 
         (employee_id, leave_type_id, year, total_entitled, used, remaining) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          data.employee_id,
          data.leave_type_id,
          data.year,
          data.total_entitled,
          data.used,
          data.total_entitled - data.used
        ]
      );
      
      return NextResponse.json({ 
        success: true, 
        message: 'Leave balance created successfully',
        id: result.insertId
      });
    }
    
  } catch (error) {
    console.error('Error updating leave balance:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update leave balance',
      message: error.message 
    }, { status: 500 });
  }
} 