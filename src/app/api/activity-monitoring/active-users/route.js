import { NextResponse } from 'next/server';
import db from '@/lib/db';

// GET - Fetch count of active users
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
    const timeWindow = searchParams.get('time_window') || 'day'; // day, hour, week
    
    // Calculate time threshold based on window
    const now = new Date();
    let timeThreshold;
    
    switch (timeWindow) {
      case 'hour':
        // Active in the last hour
        timeThreshold = new Date(now);
        timeThreshold.setHours(now.getHours() - 1);
        break;
      case 'week':
        // Active in the last week
        timeThreshold = new Date(now);
        timeThreshold.setDate(now.getDate() - 7);
        break;
      case 'day':
      default:
        // Active in the last 24 hours (default)
        timeThreshold = new Date(now);
        timeThreshold.setDate(now.getDate() - 1);
        break;
    }
    
    const formattedTimeThreshold = timeThreshold.toISOString().slice(0, 19).replace('T', ' ');
    
    // Check if app_usage table exists
    try {
      const [checkTable] = await db.query('SHOW TABLES LIKE "app_usage"');
      if (checkTable.length === 0) {
        // If table doesn't exist, return active users based on employee status
        try {
          const [activeEmployees] = await db.query(
            `SELECT COUNT(*) as count FROM employees 
             WHERE status = 'active' OR status = 'activated'`
          );
          return NextResponse.json({
            success: true,
            activeCount: activeEmployees[0].count || 0,
            source: 'employee_status'
          });
        } catch (empError) {
          console.error('Error counting active employees:', empError);
          return NextResponse.json({
            success: true,
            activeCount: 0,
            error: 'Could not count active employees'
          });
        }
      }
    } catch (tableError) {
      console.error('Error checking app_usage table:', tableError);
    }
    
    // Get count of active users based on recent app usage
    const query = `
      SELECT COUNT(DISTINCT employee_id) as activeCount
      FROM app_usage
      WHERE created_at >= ?
    `;
    
    try {
      // Execute query
      const [result] = await db.query(query, [formattedTimeThreshold]);
      const activeCount = result[0].activeCount || 0;
      
      // If no active users found in app usage, fall back to employee status
      if (activeCount === 0) {
        try {
          const [activeEmployees] = await db.query(
            `SELECT COUNT(*) as count FROM employees 
             WHERE status = 'active' OR status = 'activated'`
          );
          return NextResponse.json({
            success: true,
            activeCount: activeEmployees[0].count || 0,
            source: 'employee_status_fallback'
          });
        } catch (empError) {
          console.error('Error counting active employees (fallback):', empError);
          return NextResponse.json({
            success: true,
            activeCount: 0,
            error: 'Could not count active employees'
          });
        }
      }
      
      // Return the active users count
      return NextResponse.json({
        success: true,
        activeCount,
        timeWindow,
        threshold: formattedTimeThreshold,
        source: 'app_usage'
      });
    } catch (queryError) {
      console.error('Error querying active users:', queryError);
      
      // Fall back to employee status if query fails
      try {
        const [activeEmployees] = await db.query(
          `SELECT COUNT(*) as count FROM employees 
           WHERE status = 'active' OR status = 'activated'`
        );
        return NextResponse.json({
          success: true,
          activeCount: activeEmployees[0].count || 0,
          source: 'employee_status_fallback_after_error'
        });
      } catch (empError) {
        console.error('Error counting active employees (fallback after error):', empError);
        return NextResponse.json({
          success: true,
          activeCount: 0,
          error: 'Could not count active users'
        });
      }
    }
  } catch (error) {
    console.error('Error fetching active users:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch active users',
      message: error.message,
      errorDetails: error.toString(),
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
} 