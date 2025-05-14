import { NextResponse } from 'next/server';
import db from '@/lib/db';

// GET - Fetch employee productivity data
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
    const specificEmployeeId = searchParams.get('employee_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const limit = parseInt(searchParams.get('limit') || '0');
    
    // Check if app_usage table exists
    try {
      const [checkTable] = await db.query('SHOW TABLES LIKE "app_usage"');
      if (checkTable.length === 0) {
        return NextResponse.json({ 
          success: false, 
          error: 'app_usage table does not exist' 
        }, { status: 500 });
      }
    } catch (tableError) {
      console.error('Error checking app_usage table:', tableError);
    }
    
    // Build query to get productivity data per employee
    let query = `
      SELECT 
        au.employee_id,
        e.employee_name,
        SUM(CASE WHEN au.productive = 1 THEN au.duration_seconds ELSE 0 END) as productive_seconds,
        SUM(CASE WHEN au.productive = 0 THEN au.duration_seconds ELSE 0 END) as non_productive_seconds,
        SUM(au.duration_seconds) as total_seconds,
        ROUND(
          SUM(CASE WHEN au.productive = 1 THEN au.duration_seconds ELSE 0 END) * 100.0 / 
          SUM(au.duration_seconds)
        ) as productivity_rate
      FROM app_usage au
      JOIN employees e ON au.employee_id = e.id
      WHERE 1=1
    `;
    
    const queryParams = [];
    
    // Add filters
    if (specificEmployeeId) {
      query += ' AND au.employee_id = ?';
      queryParams.push(specificEmployeeId);
    }
    
    if (startDate) {
      query += ' AND au.date >= ?';
      queryParams.push(startDate);
    }
    
    if (endDate) {
      query += ' AND au.date <= ?';
      queryParams.push(endDate);
    }
    
    // Group by employee
    query += ' GROUP BY au.employee_id, e.employee_name';
    
    // Order by productivity rate (highest first)
    query += ' ORDER BY productivity_rate DESC';
    
    // Add limit if specified
    if (limit > 0) {
      query += ' LIMIT ?';
      queryParams.push(limit);
    }
    
    try {
      console.log('Executing employee productivity query:', query);
      console.log('Query params:', queryParams);
      
      // Execute query
      const [employees] = await db.query(query, queryParams);
      
      // Check if we have employee data
      if (employees.length === 0) {
        // Generate some sample data if no results
        if (specificEmployeeId) {
          return NextResponse.json({
            success: true,
            employees: [
              {
                employee_id: specificEmployeeId,
                employee_name: "Unknown Employee",
                productive_seconds: 0,
                non_productive_seconds: 0,
                total_seconds: 0,
                productivity_rate: 0
              }
            ]
          });
        } else {
          // Return empty array if no employees and no specific ID requested
          return NextResponse.json({
            success: true,
            employees: []
          });
        }
      }
      
      return NextResponse.json({
        success: true,
        employees
      });
    } catch (queryError) {
      console.error('Error querying employee productivity:', queryError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to query employee productivity',
        message: queryError.message,
        sql: queryError.sql
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error fetching employee productivity:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch employee productivity',
      message: error.message,
      errorDetails: error.toString(),
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
} 