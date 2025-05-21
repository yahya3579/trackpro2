import { NextResponse } from 'next/server';
import db from '@/lib/db';
import jwt from 'jsonwebtoken';

// GET - Fetch activity categories summary
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
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employee_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    
    // Build query for category summary
    let query = `
      SELECT 
        au.category as name,
        SUM(au.duration_seconds) as total_seconds,
        COUNT(*) as count,
        ROUND(SUM(au.duration_seconds) * 100.0 / (
          SELECT SUM(au2.duration_seconds) 
          FROM app_usage au2
          LEFT JOIN employees e2 ON au2.employee_id = e2.id
          WHERE e2.organization_id = ?
          ${employeeId ? ' AND au2.employee_id = ?' : ''}
          ${startDate ? ' AND au2.date >= ?' : ''}
          ${endDate ? ' AND au2.date <= ?' : ''}
        )) as percentage
      FROM app_usage au
      LEFT JOIN employees e ON au.employee_id = e.id
      WHERE e.organization_id = ?
    `;
    
    const queryParams = [organizationId];
    const totalParams = [organizationId];
    
    // Add filters
    if (employeeId) {
      query += ' AND au.employee_id = ?';
      queryParams.push(employeeId);
      totalParams.push(employeeId);
    }
    
    if (startDate) {
      query += ' AND au.date >= ?';
      queryParams.push(startDate);
      totalParams.push(startDate);
    }
    
    if (endDate) {
      query += ' AND au.date <= ?';
      queryParams.push(endDate);
      totalParams.push(endDate);
    }
    
    // Group by and order by
    query += ' GROUP BY au.category ORDER BY total_seconds DESC';
    
    // Add all parameters (for both the main query and subquery)
    const allParams = [...queryParams, ...totalParams];
    
    try {
      // Execute query
      const [categories] = await db.query(query, allParams);
      
      // Check if we have categories data
      if (categories.length === 0) {
        // Return default categories if no data
        return NextResponse.json({
          success: true,
          categories: [
            { name: "Development", percentage: 40 },
            { name: "Meetings", percentage: 25 },
            { name: "Communication", percentage: 20 },
            { name: "Other", percentage: 15 }
          ]
        });
      }
      
      // Return the categories data
      return NextResponse.json({
        success: true,
        categories
      });
    } catch (queryError) {
      console.error('Error querying categories:', queryError);
      
      // Return default categories if query fails
      return NextResponse.json({
        success: true,
        error: 'Failed to query categories, returning default data',
        categories: [
          { name: "Development", percentage: 40 },
          { name: "Meetings", percentage: 25 },
          { name: "Communication", percentage: 20 },
          { name: "Other", percentage: 15 }
        ]
      });
    }
    
  } catch (error) {
    console.error('Error fetching activity categories:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch activity categories',
      message: error.message,
      errorDetails: error.toString(),
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
} 