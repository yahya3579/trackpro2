import { NextResponse } from 'next/server';
import db from '../../../../lib/db';

export async function POST(request) {
  try {
    const { token } = await request.json();
    
    if (!token) {
      return NextResponse.json({ message: 'Invitation token is required' }, { status: 400 });
    }
    
    // Find employee with this token
    const [employees] = await db.query(
      `SELECT e.*, o.name as organization_name 
       FROM employees e
       JOIN organizations o ON e.org_id = o.id 
       WHERE e.invite_token = ? 
       AND e.invite_expiry > NOW()
       AND e.status = 'invited'`,
      [token]
    );
    
    if (employees.length === 0) {
      return NextResponse.json({ message: 'Invalid or expired invitation' }, { status: 400 });
    }
    
    const employee = employees[0];
    
    // Update employee status and clear invitation token
    await db.query(
      `UPDATE employees 
       SET status = 'active', 
           invite_token = NULL, 
           invite_expiry = NULL,
           hire_date = CURRENT_DATE
       WHERE id = ?`,
      [employee.id]
    );
    
    // Try to log the acceptance event if activity_log table exists
    try {
      await db.query(
        `INSERT INTO activity_log (user_id, action_type, details, ip_address)
         VALUES (?, 'invitation_accepted', ?, ?)`,
        [
          employee.id,
          JSON.stringify({ employeeId: employee.id, employeeName: employee.name }),
          request.headers.get('x-forwarded-for') || 'unknown'
        ]
      );
    } catch (logError) {
      // Silently ignore if activity_log table doesn't exist
      console.log('Note: activity logging skipped - table may not exist');
    }
    
    return NextResponse.json({
      message: 'Invitation accepted successfully',
      employee: {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        organization: employee.organization_name,
        position: employee.position,
        department: employee.department
      }
    });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
} 