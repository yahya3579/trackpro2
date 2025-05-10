import { NextResponse } from 'next/server';
import crypto from 'crypto';
import db from '@/lib/db';
import { sendEmail, generateInviteEmailTemplate } from '@/lib/email';

// POST endpoint to resend an invitation
export async function POST(request, { params }) {
  try {
    const employeeId = params.id;
    const token = request.headers.get('x-auth-token');
    
    // Fetch employee data
    const [employees] = await db.query(
      `SELECT id, name, email, org_id, status FROM employees WHERE id = ?`,
      [employeeId]
    );
    
    if (employees.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Employee not found' },
        { status: 404 }
      );
    }
    
    const employee = employees[0];
    
    // Check if employee is already active
    if (employee.status === 'active') {
      return NextResponse.json(
        { success: false, error: 'Cannot resend invitation to active employee' },
        { status: 400 }
      );
    }
    
    // Generate new invite token
    const inviteToken = crypto.randomBytes(32).toString('hex');
    
    // Set new invite expiry to 7 days from now
    const inviteExpiry = new Date();
    inviteExpiry.setDate(inviteExpiry.getDate() + 7);
    
    // Update employee with new token and expiry
    await db.query(
      `UPDATE employees 
       SET invite_token = ?, 
           invite_expiry = ?, 
           status = 'invited',
           updated_at = NOW()
       WHERE id = ?`,
      [inviteToken, inviteExpiry, employeeId]
    );
    
    // Get organization name if available
    let orgName = 'Your Organization';
    try {
      if (employee.org_id) {
        const [orgResult] = await db.query(
          `SELECT name FROM organizations WHERE id = ?`,
          [employee.org_id]
        );
        
        if (orgResult && orgResult.length > 0) {
          orgName = orgResult[0].name;
        }
      }
    } catch (error) {
      console.error('Error fetching organization name:', error);
    }
    
    // Create invitation link
    const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/invite/accept?token=${inviteToken}`;
    
    // Generate email content
    const htmlEmail = generateInviteEmailTemplate({
      recipientName: employee.name,
      organizationName: orgName,
      inviteLink,
      expiryDays: 7,
      isResend: true
    });
    
    // Send invitation email
    await sendEmail({
      to: employee.email,
      subject: `Invitation Reminder: Join ${orgName} on TrackPro`,
      text: `Hello ${employee.name}, you have been invited to join ${orgName} on TrackPro. Please use the following link to accept the invitation: ${inviteLink}. This link is valid for 7 days.`,
      html: htmlEmail
    });
    
    return NextResponse.json({
      success: true,
      message: 'Invitation resent successfully'
    });
  } catch (error) {
    console.error('Error resending invitation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to resend invitation' },
      { status: 500 }
    );
  }
} 