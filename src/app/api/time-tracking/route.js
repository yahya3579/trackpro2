import { NextResponse } from 'next/server';
import db from '@/lib/db';
import jwt from 'jsonwebtoken';

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
    
    // Decode JWT token to get user information
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, 'trackpro-secret-key');
    } catch (err) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid authentication token' 
      }, { status: 401 });
    }
    
    // Get organization ID based on user role
    let organizationId = null;
    const isSuperAdmin = decodedToken.role && decodedToken.role.toLowerCase().replace(/\s/g, '_') === 'super_admin';
    // Allow super_admin to filter by organization_id query param
    const { searchParams } = new URL(request.url);
    const orgIdParam = searchParams.get('organization_id');
    if (isSuperAdmin && orgIdParam) {
      organizationId = orgIdParam;
    } else if (decodedToken.role === 'organization_admin') {
      organizationId = decodedToken.id;
    } else if (decodedToken.id) {
      // For employees, get their organization ID
      const [userRecord] = await db.query(
        'SELECT organization_id FROM users WHERE id = ? OR email = ?',
        [decodedToken.id, decodedToken.email]
      );
      
      if (userRecord.length > 0) {
        organizationId = userRecord[0].organization_id;
      } else {
        // Try to get it from employees table
        const [employeeRecord] = await db.query(
          'SELECT organization_id FROM employees WHERE id = ? OR email = ?',
          [decodedToken.id, decodedToken.email]
        );
        
        if (employeeRecord.length > 0) {
          organizationId = employeeRecord[0].organization_id;
        }
      }
    }
    
    // Get query parameters
    const employeeId = searchParams.get('employee_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    
    // Build query
    let query = `
      SELECT tt.*, e.employee_name, e.organization_id
      FROM time_tracking tt
      JOIN employees e ON tt.employee_id = e.id
      WHERE 1=1
    `;
    
    const queryParams = [];
    
    // Add organization filter if applicable
    if (!isSuperAdmin && organizationId) {
      query += ' AND e.organization_id = ?';
      queryParams.push(organizationId);
    }
    
    // Add filters for employee
    if (employeeId) {
      query += ' AND tt.employee_id = ?';
      queryParams.push(employeeId);
      
      // For non-admin users, ensure they can only view their own data or 
      // data from employees in their organization
      if (decodedToken.role !== 'organization_admin' && 
          decodedToken.role !== 'super_admin' && 
          employeeId !== decodedToken.id) {
        // Check if this employee is in the same org
        const [empCheck] = await db.query(
          'SELECT id FROM employees WHERE id = ? AND organization_id = ?',
          [employeeId, organizationId]
        );
        
        if (empCheck.length === 0) {
          return NextResponse.json({
            success: false,
            error: 'You are not authorized to view this employee\'s time tracking data'
          }, { status: 403 });
        }
      }
    } else if (decodedToken.role !== 'organization_admin' && 
               decodedToken.role !== 'super_admin') {
      // Non-admin users can only see their own data when not requesting a specific employee
      query += ' AND tt.employee_id = ?';
      queryParams.push(decodedToken.id);
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
    
    // Transform to nested structure: { [date]: { [employee_id]: { ... } } }
    const nested = {};
    for (const row of timeData) {
      // Parse sessions
      const sessions = row.sessions ? JSON.parse(row.sessions) : [];
      // Calculate active_time, total_hours, and break_time from sessions
      let activeTime = 0;
      let totalHours = 0;
      let breakTime = 0;
      // Sort sessions by start time
      const sortedSessions = sessions.slice().sort((a, b) => (a.start > b.start ? 1 : -1));
      if (sortedSessions.length > 0) {
        // Calculate active time (sum of all session durations)
        for (let i = 0; i < sortedSessions.length; i++) {
          const session = sortedSessions[i];
          if (session.start && session.end) {
            const start = session.start.split(":");
            const end = session.end.split(":");
            const startSeconds = (+start[0]) * 3600 + (+start[1]) * 60 + (+start[2] || 0);
            const endSeconds = (+end[0]) * 3600 + (+end[1]) * 60 + (+end[2] || 0);
            activeTime += Math.max(0, endSeconds - startSeconds) / 3600;
          }
        }
        // Calculate total hours (last end - first start)
        const first = sortedSessions[0];
        const last = sortedSessions[sortedSessions.length - 1];
        if (first.start && last.end) {
          const firstStart = first.start.split(":");
          const lastEnd = last.end.split(":");
          const firstStartSeconds = (+firstStart[0]) * 3600 + (+firstStart[1]) * 60 + (+firstStart[2] || 0);
          const lastEndSeconds = (+lastEnd[0]) * 3600 + (+lastEnd[1]) * 60 + (+lastEnd[2] || 0);
          totalHours = Math.max(0, lastEndSeconds - firstStartSeconds) / 3600;
        }
        // Calculate break time (total hours - active time)
        breakTime = Math.max(0, totalHours - activeTime);
      }
      if (!nested[row.date]) nested[row.date] = {};
      nested[row.date][row.employee_id] = {
        employee_name: row.employee_name,
        sessions: sessions,
        total_hours: totalHours.toFixed(2),
        active_time: activeTime.toFixed(2),
        break_time: breakTime.toFixed(2),
        clock_in: row.clock_in,
        clock_out: row.clock_out,
        status: row.status,
        organization_id: row.organization_id,
        id: row.id,
        date: row.date || ""
      };
    }
    
    // Return data
    return NextResponse.json({ 
      success: true, 
      timeData: nested
    });
    
  } catch (error) {
    console.error('Error fetching time tracking data:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch time tracking data' 
    }, { status: 500 });
  }
}

// POST - Create or update time tracking entries from nested JSON structure
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
    
    // Get organization ID
    let organizationId = null;
    if (decodedToken.role === 'organization_admin') {
      organizationId = decodedToken.id;
    } else if (decodedToken.id) {
      const [userRecord] = await db.query(
        'SELECT organization_id FROM users WHERE id = ?',
        [decodedToken.id]
      );
      if (userRecord.length > 0) {
        organizationId = userRecord[0].organization_id;
      }
    }
    
    // Get data from request body (nested JSON)
    const body = await request.json();
    const results = [];
    // Loop through each date and employee
    for (const date of Object.keys(body)) {
      const employees = body[date];
      for (const employeeId of Object.keys(employees)) {
        const data = employees[employeeId];
        // Validate required fields
        if (!employeeId || !date) {
          results.push({ 
            success: false, 
            error: 'Employee ID and date are required fields',
            employee_id: employeeId,
            date
          });
          continue;
        }
        // Check if employee belongs to the user's organization
        if (organizationId && decodedToken.role !== 'organization_admin') {
          const [empCheck] = await db.query(
            'SELECT id FROM employees WHERE id = ? AND organization_id = ?',
            [employeeId, organizationId]
          );
          if (empCheck.length === 0) {
            results.push({
              success: false,
              error: 'You are not authorized to create time entries for this employee',
              employee_id: employeeId,
              date
            });
            continue;
          }
        }
        // Check if a record exists for this employee and date
        const [existingRecords] = await db.query(
          'SELECT * FROM time_tracking WHERE employee_id = ? AND date = ?',
          [employeeId, date]
        );
        if (existingRecords.length > 0) {
          // Update existing record: merge sessions and increment time fields
          const existing = existingRecords[0];
          let existingSessions = [];
          try {
            existingSessions = existing.sessions ? JSON.parse(existing.sessions) : [];
          } catch (e) {
            existingSessions = [];
          }
          // Merge sessions
          const newSessions = Array.isArray(data.sessions) ? data.sessions : (data.sessions ? [data.sessions] : []);
          const mergedSessions = [...existingSessions, ...newSessions];
          // Increment time fields
          const total_hours = (parseFloat(existing.total_hours) || 0) + (parseFloat(data.total_hours) || 0);
          const active_time = (parseFloat(existing.active_time) || 0) + (parseFloat(data.active_time) || 0);
          const break_time = (parseFloat(existing.break_time) || 0) + (parseFloat(data.break_time) || 0);
          // Update record
          try {
            await db.query(
              `UPDATE time_tracking SET 
                clock_in = ?,
                clock_out = ?,
                total_hours = ?,
                active_time = ?,
                break_time = ?,
                status = ?,
                sessions = ?,
                updated_at = NOW()
              WHERE id = ?`,
              [
                data.clock_in || existing.clock_in || null,
                data.clock_out || existing.clock_out || null,
                total_hours,
                active_time,
                break_time,
                data.status || existing.status || 'present',
                JSON.stringify(mergedSessions),
                existing.id
              ]
            );
            results.push({
              success: true,
              message: 'Time tracking entry updated successfully',
              id: existing.id,
              employee_id: employeeId,
              date
            });
          } catch (updateError) {
            results.push({
              success: false,
              error: 'Failed to update time tracking entry',
              message: updateError.message,
              employee_id: employeeId,
              date
            });
          }
        } else {
          // Insert new record
          try {
            const [result] = await db.query(
              `INSERT INTO time_tracking (
                employee_id, date, clock_in, clock_out, total_hours, active_time, 
                break_time, status, sessions, created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
              [
                employeeId,
                date,
                data.clock_in || null,
                data.clock_out || null,
                data.total_hours || 0,
                data.active_time || 0,
                data.break_time || 0,
                data.status || 'present',
                JSON.stringify(Array.isArray(data.sessions) ? data.sessions : (data.sessions ? [data.sessions] : [])),
              ]
            );
            results.push({
              success: true,
              message: 'Time tracking entry created successfully',
              id: result.insertId,
              employee_id: employeeId,
              date
            });
          } catch (insertError) {
            results.push({
              success: false,
              error: 'Failed to create time tracking entry',
              message: insertError.message,
              employee_id: employeeId,
              date
            });
          }
        }
      }
    }
    return NextResponse.json({
      success: results.every(r => r.success),
      results
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