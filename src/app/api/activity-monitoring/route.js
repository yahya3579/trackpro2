import { NextResponse } from 'next/server';
import db from '@/lib/db';
import jwt from 'jsonwebtoken';

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
    
    if (decodedToken.role === 'organization_admin') {
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
    const requestedEmployeeId = searchParams.get('employee_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const category = searchParams.get('category'); // app, website, etc.
    const isFromEmployeeDashboard = searchParams.get('employee_view') === 'true' || 
                                   request.headers.get('referer')?.includes('/employee-dashboard');
    
    // Determine if we should filter by the authenticated user's ID
    let employeeId = requestedEmployeeId;
    
    // For employee dashboard, always filter by the authenticated user's ID
    if (isFromEmployeeDashboard || !requestedEmployeeId) {
      // Get employee ID for the authenticated user
      if (decodedToken.id && decodedToken.role !== 'organization_admin') {
        // Use the ID directly from token for regular employees
        employeeId = decodedToken.id;
      } else if (decodedToken.email) {
        // For admins, try to find their employee record by email
        const [employee] = await db.query(
          'SELECT id FROM employees WHERE email = ?',
          [decodedToken.email]
        );
        
        if (employee.length > 0) {
          employeeId = employee[0].id;
        }
      }
    }
    
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
                time, end_time, duration_seconds, date, productive, created_at
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
        au.employee_id, 
        e.employee_name, 
        au.application_name, 
        au.category, 
        au.window_title, 
        au.url, 
        au.date, 
        SUM(au.duration_seconds) as total_duration,
        MIN(au.time) as first_time,
        MAX(au.end_time) as last_end_time
      FROM app_usage au
      LEFT JOIN employees e ON au.employee_id = e.id
      WHERE 1=1
    `;
    
    const queryParams = [];
    
    // Add filters with employee_id as primary filter
    if (employeeId) {
      query += ' AND au.employee_id = ?';
      queryParams.push(employeeId);
    }
    // Only add organization filter for organization admins when not filtering by specific employee
    else if (organizationId && decodedToken.role === 'organization_admin') {
      // For org admins without specific employee filter, limit to their organization
      const [orgEmployees] = await db.query(
        'SELECT id FROM employees WHERE organization_id = ?', 
        [organizationId]
      );
      
      if (orgEmployees.length > 0) {
        const employeeIds = orgEmployees.map(e => e.id);
        query += ` AND au.employee_id IN (${employeeIds.map(() => '?').join(',')})`;
        queryParams.push(...employeeIds);
      } else {
        // No employees in this organization - add a condition that will return no results
        // but avoid SQL syntax errors
        query += ' AND 1=0';
      }
    }
    
    // For regular employees, ensure they can only see their own data
    if (decodedToken.role !== 'organization_admin' && decodedToken.role !== 'super_admin') {
      // Clear any previous employeeId condition and rebuild query params array
      query = query.replace(/AND au\.employee_id = \?/, '');
      const newParams = [];
      for (let i = 0; i < queryParams.length; i++) {
        if (queryParams[i] !== employeeId) {
          newParams.push(queryParams[i]);
        }
      }
      queryParams.length = 0;
      queryParams.push(...newParams);
      
      // Add filter to only show data for this employee
      query += ' AND au.employee_id = ?';
      queryParams.push(decodedToken.id);
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
    query += ' GROUP BY au.employee_id, au.application_name, au.date ORDER BY au.date DESC, first_time DESC';
    
    console.log('Executing query:', query);
    console.log('Query params:', queryParams);
    
    // Execute query
    const [appUsage] = await db.query(query, queryParams);
    
    // For each appUsage entry, if it's a browser, get URL breakdown
    for (const app of appUsage) {
      if (app.category === 'browser') {
        // Query for URL details for this app, employee, and date
        const [urlDetails] = await db.query(`
          SELECT 
            url, 
            SUM(duration_seconds) as total_duration,
            COUNT(*) as usage_count,
            GROUP_CONCAT(DISTINCT window_title SEPARATOR ' ||| ') as window_titles
          FROM app_usage
          WHERE employee_id = ? AND application_name = ? AND date = ? AND url IS NOT NULL AND url != ''
          GROUP BY url
          ORDER BY total_duration DESC
        `, [app.employee_id, app.application_name, app.date]);
        app.url_details = urlDetails.map(row => ({
          url: row.url,
          total_duration: Number(row.total_duration),
          usage_count: row.usage_count,
          window_titles: row.window_titles ? row.window_titles.split(' ||| ') : []
        }));
      } else {
        app.url_details = [];
      }
    }
    
    console.log(`Found ${appUsage.length} app usage records`);
    
    // Get summary by application
    let summaryQuery = `
      SELECT 
        application_name,
        category,
        SUM(duration_seconds) as total_duration,
        COUNT(*) as usage_count,
        productive
      FROM app_usage
      WHERE 1=1
    `;
    
    // Add filters to ensure consistent results with main query
    let summaryParams = [];
    
    // For regular users, only show their own data
    if (decodedToken.role !== 'organization_admin' && decodedToken.role !== 'super_admin') {
      summaryQuery += ' AND employee_id = ?';
      summaryParams.push(decodedToken.id);
    } 
    // For admins with a specific employee selected
    else if (employeeId) {
      summaryQuery += ' AND employee_id = ?';
      summaryParams.push(employeeId);
    }
    // For org admins without specific employee selected
    else if (organizationId && decodedToken.role === 'organization_admin') {
      const [orgEmployees] = await db.query(
        'SELECT id FROM employees WHERE organization_id = ?', 
        [organizationId]
      );
      
      if (orgEmployees.length > 0) {
        const employeeIds = orgEmployees.map(e => e.id);
        summaryQuery += ` AND employee_id IN (${employeeIds.map(() => '?').join(',')})`;
        summaryParams.push(...employeeIds);
      } else {
        summaryQuery += ' AND 1=0'; // No results
      }
    }
    
    if (startDate) {
      summaryQuery += ' AND date >= ?';
      summaryParams.push(startDate);
    }
    
    if (endDate) {
      summaryQuery += ' AND date <= ?';
      summaryParams.push(endDate);
    }
    
    if (category) {
      summaryQuery += ' AND category = ?';
      summaryParams.push(category);
    }
    
    summaryQuery += ' GROUP BY application_name, productive ORDER BY total_duration DESC';
    
    console.log('Executing summary query with params:', summaryParams);
    
    const [appSummary] = await db.query(summaryQuery, summaryParams);
    
    // Get productivity stats with the same filtering approach
    let productivityQuery = `
      SELECT 
        productive,
        SUM(duration_seconds) as total_duration,
        COUNT(*) as usage_count
      FROM app_usage
      WHERE 1=1
    `;
    
    // Reuse the same filtering logic as for summary
    if (decodedToken.role !== 'organization_admin' && decodedToken.role !== 'super_admin') {
      productivityQuery += ' AND employee_id = ?';
    } else if (employeeId) {
      productivityQuery += ' AND employee_id = ?';
    } else if (organizationId && decodedToken.role === 'organization_admin') {
      const employeeCount = summaryParams.length - (startDate ? 1 : 0) - (endDate ? 1 : 0) - (category ? 1 : 0);
      if (employeeCount > 0) {
        productivityQuery += ` AND employee_id IN (${Array(employeeCount).fill('?').join(',')})`;
      } else {
        productivityQuery += ' AND 1=0'; // No results
      }
    }
    
    if (startDate) {
      productivityQuery += ' AND date >= ?';
    }
    
    if (endDate) {
      productivityQuery += ' AND date <= ?';
    }
    
    productivityQuery += ' GROUP BY productive';
    
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
    const body = await request.json();
    // Support both single object and array
    const activities = Array.isArray(body) ? body : [body];
    const results = [];
    
    for (const data of activities) {
      try {
        // Validate required fields
        if (!data.employee_id || !data.application_name || !data.time) {
          results.push({ 
            success: false, 
            error: 'Employee ID, application name, and start time are required fields',
            employee_id: data.employee_id
          });
          continue;
        }
        // Calculate duration if end_time is provided
        let durationSeconds = data.duration_seconds || 0;
        if (data.end_time && !durationSeconds) {
          const startTime = new Date(data.time);
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
        // Get date from time if not provided
        const date = data.date || new Date(data.time).toISOString().split('T')[0];
        // Insert new record
        const [result] = await db.query(
          `INSERT INTO app_usage (
            employee_id, application_name, window_title, url, category,
            time, end_time, duration_seconds, date, productive,
            created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
          [
            data.employee_id,
            data.application_name,
            data.window_title || null,
            data.url || null,
            category,
            data.time,
            data.end_time || null,
            durationSeconds,
            date,
            data.productive || 0, // 0 for unproductive, 1 for productive
          ]
        );
        results.push({ 
          success: true, 
          message: 'Activity record created successfully',
          id: result.insertId,
          employee_id: data.employee_id
        });
      } catch (error) {
        results.push({
          success: false,
          error: 'Failed to create activity record',
          message: error.message,
          employee_id: data.employee_id
        });
      }
    }
    // If only one activity was sent, return a single object for backward compatibility
    if (!Array.isArray(body)) {
      return NextResponse.json(results[0]);
    }
    return NextResponse.json({
      success: results.every(r => r.success),
      results
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

// PUT - Update an existing activity record
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
        'SELECT organization_id FROM users WHERE id = ? OR email = ?',
        [decodedToken.id, decodedToken.email]
      );
      if (userRecord.length > 0) {
        organizationId = userRecord[0].organization_id;
      } else {
        const [employeeRecord] = await db.query(
          'SELECT organization_id FROM employees WHERE id = ? OR email = ?',
          [decodedToken.id, decodedToken.email]
        );
        if (employeeRecord.length > 0) {
          organizationId = employeeRecord[0].organization_id;
        }
      }
    }
    if (!organizationId) {
      return NextResponse.json({
        success: false,
        error: 'Could not determine organization for user.'
      }, { status: 403 });
    }
    // Get data from request body
    const data = await request.json();
    if (!data.id) {
      return NextResponse.json({
        success: false,
        error: 'Activity record ID is required.'
      }, { status: 400 });
    }
    // Check if the record belongs to the organization
    const [check] = await db.query(
      `SELECT au.id FROM app_usage au
       LEFT JOIN employees e ON au.employee_id = e.id
       WHERE au.id = ? AND e.organization_id = ?`,
      [data.id, organizationId]
    );
    if (check.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No such record for your organization.'
      }, { status: 404 });
    }
    // Build update fields
    const fields = [];
    const values = [];
    if (data.application_name) {
      fields.push('application_name = ?');
      values.push(data.application_name);
    }
    if (data.window_title) {
      fields.push('window_title = ?');
      values.push(data.window_title);
    }
    if (data.url) {
      fields.push('url = ?');
      values.push(data.url);
    }
    if (data.category) {
      fields.push('category = ?');
      values.push(data.category);
    }
    if (data.time) {
      fields.push('time = ?');
      values.push(data.time);
    }
    if (data.end_time) {
      fields.push('end_time = ?');
      values.push(data.end_time);
    }
    if (data.duration_seconds) {
      fields.push('duration_seconds = ?');
      values.push(data.duration_seconds);
    }
    if (data.date) {
      fields.push('date = ?');
      values.push(data.date);
    }
    if (typeof data.productive === 'number') {
      fields.push('productive = ?');
      values.push(data.productive);
    }
    if (fields.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No fields to update.'
      }, { status: 400 });
    }
    values.push(data.id);
    await db.query(
      `UPDATE app_usage SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return NextResponse.json({
      success: true,
      message: 'Activity record updated successfully.'
    });
  } catch (error) {
    console.error('Error updating activity record:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update activity record',
      message: error.message
    }, { status: 500 });
  }
} 