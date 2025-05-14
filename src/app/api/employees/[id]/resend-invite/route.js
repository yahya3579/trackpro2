import { NextResponse } from 'next/server';
import db from '@/lib/db';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

// Generate secure invitation token
function generateToken(data) {
  // Calculate expiry date - 7 days from now
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 7);
  
  // Create a shorter token that won't be truncated in the database
  const tokenId = crypto.randomBytes(16).toString('hex');
  
  return tokenId;
}

// Setup email transporter
const transporter = nodemailer.createTransport({
  host:  'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'ninjab330@gmail.com',
    pass: 'mgnh lvgw lpmp bzub'
  }
});

// Send invitation email
async function sendInvitationEmail(employee, inviteToken) {
  const appUrl = 'http://localhost:3000';
  const inviteUrl = `${appUrl}/invite/accept?token=${inviteToken}`;
  
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #333; text-align: center; border-bottom: 1px solid #eee; padding-bottom: 10px;">Welcome to TrackPro</h2>
      
      <p style="margin: 20px 0;">Hello ${employee.employee_name},</p>
      
      <p>You've been invited to join TrackPro as a <strong>${employee.role}</strong>.</p>
      
      <div style="margin: 30px 0; text-align: center;">
        <a href="${inviteUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Accept Invitation</a>
      </div>
      
      <p>This invitation link will expire in 7 days. If you have any questions, please contact your administrator.</p>
      
      <p style="color: #666; margin-top: 30px; font-size: 14px;">If you didn't expect this invitation, you can safely ignore this email.</p>
    </div>
  `;
  
  try {
    const info = await transporter.sendMail({
      from: '"TrackPro" <noreply@trackpro.com>',
      to: employee.email,
      subject: 'Invitation to join TrackPro',
      html: emailHtml
    });
    
    console.log(`Email resent to ${employee.email}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}

export async function POST(request, { params }) {
  try {
    const { id } = params;
    
    // Get token from header for authentication
    const token = request.headers.get('x-auth-token');
    if (!token) {
      return NextResponse.json({ 
        success: false, 
        error: 'Authorization token is required' 
      }, { status: 401 });
    }
    
    // Get employee data
    const [employees] = await db.query(
      'SELECT * FROM employees WHERE id = ?',
      [id]
    );
    
    if (employees.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Employee not found' 
      }, { status: 404 });
    }
    
    const employee = employees[0];
    
    // Verify employee status is 'invited'
    if (employee.status !== 'invited') {
      return NextResponse.json({ 
        success: false, 
        error: 'Employee is not in invited status' 
      }, { status: 400 });
    }
    
    // Generate new invitation token
    const inviteToken = generateToken({
      email: employee.email,
      name: employee.employee_name,
      role: employee.role
    });
    
    // Calculate expiration date - 7 days from now
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);
    
    // First, invalidate any existing tokens for this employee
    await db.query(
      'UPDATE invitation_tokens SET used_at = NOW() WHERE email = ? AND used_at IS NULL',
      [employee.email]
    );
    
    // Get admin ID for the inviter
    const [admins] = await db.query('SELECT id FROM employees WHERE role = "admin" LIMIT 1');
    const inviterId = admins.length > 0 ? admins[0].id : null;
    
    // Store the new token in the database
    await db.query(
      `INSERT INTO invitation_tokens (token, email, role, team_name, invited_by, created_at, expires_at, used_at)
       VALUES (?, ?, ?, ?, ?, NOW(), ?, NULL)`,
      [
        inviteToken,
        employee.email, 
        employee.role, 
        employee.team_name || '',
        inviterId,
        expiryDate
      ]
    );
    
    // Send invitation email
    const emailResult = await sendInvitationEmail(employee, inviteToken);
    
    if (!emailResult.success) {
      return NextResponse.json({ 
        success: false, 
        error: `Failed to send invitation email: ${emailResult.error}` 
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Invitation resent successfully'
    });
    
  } catch (error) {
    console.error('Error resending invitation:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Server error: ' + error.message 
    }, { status: 500 });
  }
} 