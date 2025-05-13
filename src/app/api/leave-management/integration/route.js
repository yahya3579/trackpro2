import { NextResponse } from 'next/server';
import db from '@/lib/db';

// POST - Process activity-monitoring data to update presence tracking
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
    
    // Get query parameters and body
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    
    // Process all employees by default, or a specific one if specified
    const employeeId = searchParams.get('employee_id');
    
    // Get all employees or a specific one
    let employeesQuery = 'SELECT id FROM employees WHERE 1=1';
    const queryParams = [];
    
    if (employeeId) {
      employeesQuery += ' AND id = ?';
      queryParams.push(employeeId);
    }
    
    const [employees] = await db.query(employeesQuery, queryParams);
    
    if (employees.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'No employees found' 
      }, { status: 404 });
    }
    
    // Process results
    const results = {
      processed: 0,
      present: 0,
      half_day: 0,
      absent: 0,
      leave: 0,
      new_leave_requests: 0
    };
    
    // Define thresholds for activity status
    const HALF_DAY_THRESHOLD_SECONDS = 30 * 60; // 30 minutes
    const FULL_DAY_THRESHOLD_SECONDS = 4 * 60 * 60; // 4 hours
    
    // Process each employee
    for (const employee of employees) {
      try {
        // Check if employee has approved leave for this date
        const [existingLeave] = await db.query(
          `SELECT * FROM leave_requests
           WHERE employee_id = ?
           AND status = 'approved'
           AND ? BETWEEN start_date AND end_date`,
          [employee.id, date]
        );
        
        if (existingLeave.length > 0) {
          // Employee is on approved leave - update or create presence record
          const [presence] = await db.query(
            `SELECT * FROM presence_tracking
             WHERE employee_id = ? AND date = ?`,
            [employee.id, date]
          );
          
          if (presence.length === 0) {
            // Create new presence record
            await db.query(
              `INSERT INTO presence_tracking
               (employee_id, date, status, leave_request_id)
               VALUES (?, ?, 'leave', ?)`,
              [employee.id, date, existingLeave[0].id]
            );
          } else {
            // Update existing presence record
            await db.query(
              `UPDATE presence_tracking
               SET status = 'leave', leave_request_id = ?
               WHERE id = ?`,
              [existingLeave[0].id, presence[0].id]
            );
          }
          
          results.leave++;
          results.processed++;
          continue;
        }
        
        // No approved leave - check activity data
        const [activityData] = await db.query(
          `SELECT
             MIN(start_time) as first_activity,
             MAX(end_time) as last_activity,
             SUM(duration_seconds) as total_seconds
           FROM app_usage
           WHERE employee_id = ? AND date = ?`,
          [employee.id, date]
        );
        
        const totalActiveSeconds = activityData[0].total_seconds || 0;
        
        // Determine status based on activity
        let status = 'absent';
        if (totalActiveSeconds >= FULL_DAY_THRESHOLD_SECONDS) {
          status = 'present';
          results.present++;
        } else if (totalActiveSeconds >= HALF_DAY_THRESHOLD_SECONDS) {
          status = 'half_day';
          results.half_day++;
        } else {
          status = 'absent';
          results.absent++;
        }
        
        // Check if we should create an auto-detected leave request
        let leaveRequestId = null;
        
        if (status === 'absent' || status === 'half_day') {
          // Check for existing auto-detected leave
          const [existingAutoLeave] = await db.query(
            `SELECT * FROM leave_requests
             WHERE employee_id = ?
             AND status = 'auto_detected'
             AND ? BETWEEN start_date AND end_date`,
            [employee.id, date]
          );
          
          if (existingAutoLeave.length === 0) {
            // Get default leave type for absences
            const [leaveType] = await db.query(
              `SELECT * FROM leave_types WHERE name = 'Sick Leave' LIMIT 1`
            );
            
            if (leaveType.length > 0) {
              // Create new auto-detected leave request
              const totalDays = status === 'absent' ? 1.0 : 0.5;
              
              const [leaveResult] = await db.query(
                `INSERT INTO leave_requests
                 (employee_id, leave_type_id, start_date, end_date, status, total_days, reason)
                 VALUES (?, ?, ?, ?, 'auto_detected', ?, 'Auto-detected from activity tracking')`,
                [employee.id, leaveType[0].id, date, date, totalDays]
              );
              
              leaveRequestId = leaveResult.insertId;
              results.new_leave_requests++;
            }
          } else {
            // Use existing auto-detected leave request
            leaveRequestId = existingAutoLeave[0].id;
            
            // Update the leave type if needed
            if ((status === 'half_day' && existingAutoLeave[0].total_days === 1.0) ||
                (status === 'absent' && existingAutoLeave[0].total_days === 0.5)) {
              
              const totalDays = status === 'absent' ? 1.0 : 0.5;
              
              await db.query(
                `UPDATE leave_requests
                 SET total_days = ?
                 WHERE id = ?`,
                [totalDays, leaveRequestId]
              );
            }
          }
        }
        
        // Update or create presence tracking record
        const [existingPresence] = await db.query(
          `SELECT * FROM presence_tracking
           WHERE employee_id = ? AND date = ?`,
          [employee.id, date]
        );
        
        if (existingPresence.length === 0) {
          // Create new presence record
          await db.query(
            `INSERT INTO presence_tracking
             (employee_id, date, first_activity, last_activity, total_active_seconds, status, leave_request_id)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              employee.id,
              date,
              activityData[0].first_activity,
              activityData[0].last_activity,
              totalActiveSeconds,
              status,
              leaveRequestId
            ]
          );
        } else {
          // Update existing presence record
          await db.query(
            `UPDATE presence_tracking
             SET first_activity = ?,
                 last_activity = ?,
                 total_active_seconds = ?,
                 status = ?,
                 leave_request_id = ?,
                 updated_at = NOW()
             WHERE id = ?`,
            [
              activityData[0].first_activity,
              activityData[0].last_activity,
              totalActiveSeconds,
              status,
              leaveRequestId,
              existingPresence[0].id
            ]
          );
        }
        
        results.processed++;
        
      } catch (employeeError) {
        console.error(`Error processing employee ${employee.id}:`, employeeError);
        // Continue processing other employees
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Processed activity data for ${results.processed} employees`,
      results,
      date
    });
    
  } catch (error) {
    console.error('Error in leave-activity integration:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to process activity data',
      message: error.message 
    }, { status: 500 });
  }
} 