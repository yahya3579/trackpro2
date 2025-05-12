import { NextResponse } from 'next/server';
import crypto from 'crypto';
import db from '@/lib/db';

// Helper function to create invitation token
function createToken(data) {
  // Convert data to string and encode it
  const dataString = JSON.stringify(data);
  const encodedData = Buffer.from(dataString).toString('base64');
  
  // Create HMAC signature
  const tokenSecret = process.env.TOKEN_SECRET || 'trackpro-secret-key';
  const hmac = crypto.createHmac('sha256', tokenSecret);
  const signature = hmac.update(dataString).digest('hex');
  
  // Return the token as encoded data + signature
  return `${encodedData}.${signature}`;
}

// Helper function to send email (placeholder - implement with actual email provider)
async function sendInvitationEmail(employee, inviteToken) {
  try {
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invite/accept?token=${encodeURIComponent(inviteToken)}`;
    
    console.log(`[Email Service] Sending invitation to ${employee.email}`);
    console.log(`[Email Service] Invitation URL: ${inviteUrl}`);
    
    // In a real implementation, you would use an email service like Sendgrid, AWS SES, etc.
    // This is a placeholder for demonstration purposes
    
    return { success: true };
  } catch (error) {
    console.error('Error sending invitation email:', error);
    return { success: false, error: error.message };
  }
}

// POST - Resend invitation to an employee
export async function POST(request, { params }) {
  try {
    const { id } = params;
    
    // Get token from header
    const token = request.headers.get('x-auth-token');
    if (!token) {
      return NextResponse.json({ 
        success: false, 
        error: 'Authorization token is required' 
      }, { status: 401 });
    }
    
    // Check if employee exists and is in invited status
    const [employees] = await db.query(
      `SELECT id, first_name, last_name, email, position, department, status
       FROM employees
       WHERE id = ?`,
      [id]
    );
    
    if (employees.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Employee not found' 
      }, { status: 404 });
    }
    
    const employee = employees[0];
    
    if (employee.status !== 'invited' && employee.status !== 'pending') {
      return NextResponse.json({ 
        success: false, 
        error: 'Only invited employees can receive invitations' 
      }, { status: 400 });
    }
    
    // Create invitation token
    const inviteToken = createToken({
      employeeId: employee.id,
      email: employee.email,
      exp: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days expiry
      type: 'invite'
    });
    
    // Send invitation email
    const emailResult = await sendInvitationEmail(employee, inviteToken);
    
    if (!emailResult.success) {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to send invitation email',
        message: emailResult.error
      }, { status: 500 });
    }
    
    // Update invitation sent date if needed
    await db.query(
      `UPDATE employees 
       SET updated_at = NOW()
       WHERE id = ?`,
      [employee.id]
    );
    
    // Log re-invitation
    try {
      await db.query(
        `INSERT INTO activity_log (user_id, action_type, details, ip_address)
         VALUES (?, 'invitation_resent', ?, ?)`,
        [
          employee.id,
          JSON.stringify({ employeeId: employee.id }),
          request.headers.get('x-forwarded-for') || 'unknown'
        ]
      );
    } catch (logError) {
      // Silently ignore if activity_log table doesn't exist
      console.log('Note: activity logging skipped - table may not exist');
    }
    
    return NextResponse.json({
      success: true,
      message: 'Invitation resent successfully',
      employee: {
        id: employee.id,
        first_name: employee.first_name,
        last_name: employee.last_name,
        email: employee.email
      }
    });
  } catch (error) {
    console.error('Error resending invitation:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Server error', 
      message: error.message 
    }, { status: 500 });
  }
} 