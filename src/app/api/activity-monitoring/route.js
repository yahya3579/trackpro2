import { NextResponse } from 'next/server';
import db from '@/lib/db';

// GET - Fetch activity monitoring records
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
    
    // Check if app_usage table exists
    try {
      const [checkTable] = await db.query('SHOW TABLES LIKE "app_usage"');
      if (checkTable.length === 0) {
        return NextResponse.json({ 
          success: false, 
          error: 'app_usage table does not exist',
          debug: true
        }, { status: 500 });
      }
    } catch (tableError) {
      console.error('Error checking app_usage table:', tableError);
      return NextResponse.json({ 
        success: false, 
        error: 'Could not check if app_usage table exists',
        message: tableError.message
      }, { status: 500 });
    }
    
    // Check if employees table exists
    try {
      const [checkEmpTable] = await db.query('SHOW TABLES LIKE "employees"');
      if (checkEmpTable.length === 0) {
        return NextResponse.json({ 
          success: false, 
          error: 'employees table does not exist',
          debug: true
        }, { status: 500 });
      }
    } catch (tableError) {
      console.error('Error checking employees table:', tableError);
      return NextResponse.json({ 
        success: false, 
        error: 'Could not check if employees table exists',
        message: tableError.message
      }, { status: 500 });
    }
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employee_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const category = searchParams.get('category'); // app, website, etc.
    
    // Check if data exists in app_usage table
    try {
      const [count] = await db.query('SELECT COUNT(*) as count FROM app_usage');
      console.log('Records in app_usage:', count[0].count);
      
      if (count[0].count === 0) {
        // Let's create some sample data if the table is empty
        try {
          // Check if any records exist in employees table
          const [empCount] = await db.query('SELECT COUNT(*) as count FROM employees');
          
          if (empCount[0].count > 0) {
            const [firstEmployee] = await db.query('SELECT id FROM employees LIMIT 1');
            const employeeId = firstEmployee[0].id;
            
            // Insert a sample record
            await db.query(`
              INSERT INTO app_usage (
                employee_id, application_name, window_title, url, category,
                start_time, end_time, duration_seconds, date, productive, created_at
              ) VALUES (?, ?, ?, ?, ?, NOW(), NOW(), ?, CURDATE(), ?, NOW())`,
              [
                employeeId,
                'Sample App',
                'Sample Window',
                'https://example.com',
                'office',
                3600, // 1 hour
                1     // productive
              ]
            );
            console.log('Created sample app_usage record');
          }
        } catch (sampleError) {
          console.error('Error creating sample data:', sampleError);
        }
      }
    } catch (countError) {
      console.error('Error checking app_usage record count:', countError);
    }
    
    // Build query for application usage
    let query = `
      SELECT 
        au.id, au.employee_id, e.employee_name, 
        au.application_name, au.window_title, au.url,
        au.category, au.start_time, au.end_time, 
        au.duration_seconds,
        au.date, au.productive,
        au.created_at
      FROM app_usage au
      LEFT JOIN employees e ON au.employee_id = e.id
      WHERE 1=1
    `;
    
    const queryParams = [];
    
    // Add filters
    if (employeeId) {
      query += ' AND au.employee_id = ?';
      queryParams.push(employeeId);
    }
    
    if (startDate) {
      query += ' AND au.date >= ?';
      queryParams.push(startDate);
    }
    
    if (endDate) {
      query += ' AND au.date <= ?';
      queryParams.push(endDate);
    }
    
    if (category) {
      query += ' AND au.category = ?';
      queryParams.push(category);
    }
    
    // Order by date and start time
    query += ' ORDER BY au.date DESC, au.start_time DESC';
    
    console.log('Executing query:', query);
    console.log('Query params:', queryParams);
    
    // Execute query
    const [appUsage] = await db.query(query, queryParams);
    
    console.log(`Found ${appUsage.length} app usage records`);
    
    // Get summary by application
    const summaryQuery = `
      SELECT 
        application_name,
        category,
        SUM(duration_seconds) as total_duration,
        COUNT(*) as usage_count,
        productive
      FROM app_usage
      WHERE 1=1
      ${employeeId ? ' AND employee_id = ?' : ''}
      ${startDate ? ' AND date >= ?' : ''}
      ${endDate ? ' AND date <= ?' : ''}
      ${category ? ' AND category = ?' : ''}
      GROUP BY application_name, productive
      ORDER BY total_duration DESC
    `;
    
    const summaryParams = queryParams.filter(p => p !== category); // Remove category from params if it exists
    if (category) {
      summaryParams.push(category);
    }
    
    console.log('Executing summary query with params:', summaryParams);
    
    const [appSummary] = await db.query(summaryQuery, summaryParams);
    
    // Get productivity stats
    const productivityQuery = `
      SELECT 
        productive,
        SUM(duration_seconds) as total_duration,
        COUNT(*) as usage_count
      FROM app_usage
      WHERE 1=1
      ${employeeId ? ' AND employee_id = ?' : ''}
      ${startDate ? ' AND date >= ?' : ''}
      ${endDate ? ' AND date <= ?' : ''}
      GROUP BY productive
    `;
    
    const [productivityStats] = await db.query(productivityQuery, summaryParams);
    
    // Return data
    return NextResponse.json({ 
      success: true, 
      appUsage,
      appSummary,
      productivityStats
    });
    
  } catch (error) {
    console.error('Error fetching activity monitoring data:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch activity monitoring data',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    }, { status: 500 });
  }
}

// POST - Create a new activity record
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
    if (!data.employee_id || !data.application_name || !data.start_time) {
      return NextResponse.json({ 
        success: false, 
        error: 'Employee ID, application name, and start time are required fields' 
      }, { status: 400 });
    }
    
    // Calculate duration if end_time is provided
    let durationSeconds = data.duration_seconds || 0;
    if (data.end_time && !durationSeconds) {
      const startTime = new Date(data.start_time);
      const endTime = new Date(data.end_time);
      durationSeconds = Math.round((endTime - startTime) / 1000);
    }
    
    // Determine app category (can be enhanced with a more comprehensive app categorization system)
    let category = data.category || 'other';
    if (!data.category) {
      const appLower = data.application_name.toLowerCase();
      if (appLower.includes('chrome') || appLower.includes('firefox') || appLower.includes('edge') || appLower.includes('safari')) {
        category = 'browser';
      } else if (appLower.includes('word') || appLower.includes('excel') || appLower.includes('powerpoint') || appLower.includes('office')) {
        category = 'office';
      } else if (appLower.includes('vscode') || appLower.includes('intellij') || appLower.includes('eclipse') || appLower.includes('sublime')) {
        category = 'development';
      } else if (appLower.includes('photoshop') || appLower.includes('illustrator') || appLower.includes('figma') || appLower.includes('sketch')) {
        category = 'design';
      } else if (appLower.includes('slack') || appLower.includes('teams') || appLower.includes('zoom') || appLower.includes('meet')) {
        category = 'communication';
      }
    }
    
    // Get date from start_time if not provided
    const date = data.date || new Date(data.start_time).toISOString().split('T')[0];
    
    // Insert new record
    const [result] = await db.query(
      `INSERT INTO app_usage (
        employee_id, application_name, window_title, url, category,
        start_time, end_time, duration_seconds, date, productive,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        data.employee_id,
        data.application_name,
        data.window_title || null,
        data.url || null,
        category,
        data.start_time,
        data.end_time || null,
        durationSeconds,
        date,
        data.productive || 0, // 0 for unproductive, 1 for productive
      ]
    );
    
    // Return success response
    return NextResponse.json({ 
      success: true, 
      message: 'Activity record created successfully',
      id: result.insertId
    });
    
  } catch (error) {
    console.error('Error creating activity record:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create activity record',
      message: error.message 
    }, { status: 500 });
  }
} 