import { NextResponse } from 'next/server';
import crypto from 'crypto';
import db from '../../../../../lib/db';
import { withAuth } from '../../../../../lib/auth';
import { sendEmail, generateInviteEmailTemplate } from '../../../../../lib/email';

async function POST(request, { params }) {
  try {
    const employeeId = params.id;
    const user = request.user;
    
    // Find employee
    const [employees] = await db.query(
      'SELECT e.*, o.name as org_name FROM employees e JOIN organizations o ON e.org_id = o.id WHERE e.id = ?',
      [employeeId]
    );
    
    if (employees.length === 0) {
      return NextResponse.json({ message: 'Employee not found' }, { status: 404 });
    }
    
    const employee = employees[0];
    
    // Check if user has permission to resend invitation
    if (user.role === 'organization_admin' && employee.org_id !== user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }
    
    // Check if employee status is 'invited'
    if (employee.status !== 'invited') {
      return NextResponse.json({ 
        message: 'Can only resend invitations to employees with "invited" status' 
      }, { status: 400 });
    }
    
    // Generate new invite token
    const inviteToken = crypto.randomBytes(32).toString('hex');
    
    // Set invite expiry to 7 days from now
    const inviteExpiry = new Date();
    inviteExpiry.setDate(inviteExpiry.getDate() + 7);
    
    // Update employee with new token and expiry
    await db.query(
      'UPDATE employees SET invite_token = ?, invite_expiry = ? WHERE id = ?',
      [inviteToken, inviteExpiry, employeeId]
    );
    
    // Send invitation email
    const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/invite/accept?token=${inviteToken}`;
    const orgName = employee.org_name;
    
    // Create beautiful HTML email
    const htmlEmail = generateInviteEmailTemplate({
      recipientName: employee.name,
      organizationName: orgName,
      inviteLink,
      expiryDays: 7
    });
    
    await sendEmail({
      to: employee.email,
      subject: `Invitation to join ${orgName} on TrackPro`,
      text: `Hello ${employee.name}, you have been invited to join ${orgName} on TrackPro. Please use the following link to accept the invitation: ${inviteLink}. This link is valid for 7 days.`,
      html: htmlEmail
    });
    
    return NextResponse.json({
      message: 'Invitation resent successfully'
    });
  } catch (error) {
    console.error('Error resending invitation:', error);
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}

export const POST = withAuth(POST); 