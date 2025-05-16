import { NextResponse } from 'next/server';
import db from '@/lib/db';

// GET - Fetch only pending leave requests
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
    
    // Build query for pending leave requests only
    const query = `
      SELECT 
        lr.id, 
        lr.employee_id,
        e.employee_name,
        lr.leave_type_id,
        lt.name as leave_type,
        lt.color as leave_type_color,
        lr.start_date,
        lr.end_date,
        lr.status,
        lr.total_days as days,
        lr.reason,
        lr.created_at,
        lr.updated_at
      FROM leave_requests lr
      JOIN employees e ON lr.employee_id = e.id
      JOIN leave_types lt ON lr.leave_type_id = lt.id
      WHERE lr.status = 'pending'
      ORDER BY lr.created_at DESC
    `;
    
    // Execute query
    const [pendingLeaves] = await db.query(query);
    
    console.log('Found pending leave requests:', pendingLeaves.length);

    // Return data
    return NextResponse.json({ 
      success: true, 
      pendingLeaves,
      count: pendingLeaves.length
    });
    
  } catch (error) {
    console.error('Error fetching pending leave requests:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch pending leave requests',
      message: error.message 
    }, { status: 500 });
  }
} 