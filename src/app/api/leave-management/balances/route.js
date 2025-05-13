import { NextResponse } from 'next/server';
import db from '@/lib/db';

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
    const employeeId = searchParams.get('employee_id');
    const year = searchParams.get('year') || new Date().getFullYear();
    
    if (!employeeId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Employee ID is required' 
      }, { status: 400 });
    }
    
    // Get leave balances
    const [leaveBalances] = await db.query(
      `SELECT 
        lb.id,
        lb.employee_id,
        e.employee_name,
        lb.leave_type_id,
        lt.name as leave_type_name,
        lt.color as leave_type_color,
        lt.is_paid,
        lb.year,
        lb.total_entitled,
        lb.used,
        lb.remaining,
        lb.created_at,
        lb.updated_at
      FROM leave_balances lb
      JOIN employees e ON lb.employee_id = e.id
      JOIN leave_types lt ON lb.leave_type_id = lt.id
      WHERE lb.employee_id = ? AND lb.year = ?`,
      [employeeId, year]
    );
    
    // Get all leave types to ensure all types are represented
    const [leaveTypes] = await db.query('SELECT * FROM leave_types');
    
    // Create default balances for leave types that don't have a record
    const existingTypeIds = leaveBalances.map(balance => balance.leave_type_id);
    const missingTypes = leaveTypes.filter(type => !existingTypeIds.includes(type.id));
    
    // Add default balance entries for missing types
    const defaultBalances = missingTypes.map(type => ({
      id: null,
      employee_id: parseInt(employeeId),
      employee_name: leaveBalances[0]?.employee_name || 'Employee',
      leave_type_id: type.id,
      leave_type_name: type.name,
      leave_type_color: type.color,
      is_paid: type.is_paid,
      year: parseInt(year),
      total_entitled: type.is_paid ? 20 : 0, // Default 20 days for paid leave
      used: 0,
      remaining: type.is_paid ? 20 : 0,
      created_at: null,
      updated_at: null
    }));
    
    // Combine actual and default balances
    const allBalances = [...leaveBalances, ...defaultBalances];
    
    // Return data
    return NextResponse.json({ 
      success: true, 
      leaveBalances: allBalances
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