import { NextResponse } from 'next/server';
import db from '@/lib/db';

// GET - Fetch time tracking records
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
    
    // Build query
    let query = `
      SELECT tt.*, e.employee_name
      FROM time_tracking tt
      JOIN employees e ON tt.employee_id = e.id
      WHERE 1=1
    `;
    
    const queryParams = [];
    
    // Add filters
    if (employeeId) {
      query += ' AND tt.employee_id = ?';
      queryParams.push(employeeId);
    }
    
    if (startDate) {
      query += ' AND tt.date >= ?';
      queryParams.push(startDate);
    }
    
    if (endDate) {
      query += ' AND tt.date <= ?';
      queryParams.push(endDate);
    }
    
    // Order by date desc, then by employee name
    query += ' ORDER BY tt.date DESC, e.employee_name ASC';
    
    // Execute query
    const [timeData] = await db.query(query, queryParams);
    
    // Return data
    return NextResponse.json({ 
      success: true, 
      timeData 
    });
    
  } catch (error) {
    console.error('Error fetching time tracking data:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch time tracking data' 
    }, { status: 500 });
  }
}

// POST - Create a new time tracking entry
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
    
    // Insert new record
    const [result] = await db.query(
      `INSERT INTO time_tracking (
        employee_id, date, clock_in, clock_out, total_hours, active_time, 
        break_time, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        data.employee_id,
        data.date,
        data.clock_in || null,
        data.clock_out || null,
        data.total_hours || 0,
        data.active_time || 0,
        data.break_time || 0,
        data.status || 'present',
      ]
    );
    
    // Return success response
    return NextResponse.json({ 
      success: true, 
      message: 'Time tracking entry created successfully',
      id: result.insertId
    });
    
  } catch (error) {
    console.error('Error creating time tracking entry:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create time tracking entry' 
    }, { status: 500 });
  }
}

// PUT - Update an existing time tracking entry
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
    if (!data.id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Time tracking entry ID is required' 
      }, { status: 400 });
    }
    
    // Update record
    const [result] = await db.query(
      `UPDATE time_tracking SET
        clock_in = ?,
        clock_out = ?,
        total_hours = ?,
        active_time = ?,
        break_time = ?,
        status = ?,
        updated_at = NOW()
      WHERE id = ?`,
      [
        data.clock_in || null,
        data.clock_out || null,
        data.total_hours || 0,
        data.active_time || 0,
        data.break_time || 0,
        data.status || 'present',
        data.id
      ]
    );
    
    // Check if record was found and updated
    if (result.affectedRows === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Time tracking entry not found' 
      }, { status: 404 });
    }
    
    // Return success response
    return NextResponse.json({ 
      success: true, 
      message: 'Time tracking entry updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating time tracking entry:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update time tracking entry' 
    }, { status: 500 });
  }
} 