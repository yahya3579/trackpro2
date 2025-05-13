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
  // Create a unique ID for the token - this will be used as the actual token
  const tokenId = crypto.randomBytes(16).toString('hex');
  
  // Convert data to string and encode it - this won't be stored directly
  const dataString = JSON.stringify({
    ...data,
    exp: expiryDate.getTime() // Use the same expiry date as stored in DB
  });
  
  // We won't store the full encoded token, just the ID
  return tokenId;
}

// Setup email transporter - replace with your SMTP settings in production
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
  // App URL from environment or default
  const appUrl = 'http://localhost:3000';
  
  // Simple token doesn't need complex encoding
  const inviteUrl = `${appUrl}/invite/accept?token=${inviteToken}`;
  console.log("Invitation URL:", inviteUrl);
  
  // Create email content
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #333; text-align: center; border-bottom: 1px solid #eee; padding-bottom: 10px;">Welcome to TrackPro</h2>
      
      <p style="margin: 20px 0;">Hello ${employee.name},</p>
      
      <p>You've been invited to join TrackPro as a <strong>${employee.role}</strong> on the <strong>${employee.teams[0]?.teamName || ''}</strong> team.</p>
      
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
    
    console.log(`Email sent to ${employee.email}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}

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
    
    // Get admin ID from token or use a default value
    let inviterId = null;
    try {
      // Decode token to get admin ID if possible
      // This assumes your token has user ID information
      // Replace this with your actual token decoding logic
      const [existingAdmin] = await db.query('SELECT id FROM employees LIMIT 1');
      if (existingAdmin.length > 0) {
        inviterId = existingAdmin[0].id;
      }
    } catch (err) {
      console.error('Error getting inviter ID:', err);
      // Continue with null inviterId
    }
    
    // Get the request body
    const { users } = await request.json();
    
    if (!users || !Array.isArray(users) || users.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No valid users provided'
      }, { status: 400 });
    }
    
    // Create results array to track success/failure for each user
    const results = [];
    
    // Process each user
    for (const user of users) {
      try {
        // Validate required fields
        if (!user.name || !user.email || !user.role) {
          results.push({
            email: user.email || 'unknown',
            success: false,
            error: 'Missing required fields'
          });
          continue;
        }
        
        // Check if user already exists in database
        const [existingUsers] = await db.query(
          'SELECT id FROM employees WHERE email = ?',
          [user.email]
        );
        
        if (existingUsers.length > 0) {
          results.push({
            email: user.email,
            success: false,
            error: 'Employee with this email already exists'
          });
          continue;
        }
        
        // Insert the employee into database with 'invited' status
        const [result] = await db.query(
          `INSERT INTO employees 
           (employee_name, email, role, team_name, id, status) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            user.name,
            user.email,
            user.role,
            user.teams[0]?.teamName || '', // Use the first team if available
            user.employeeId || null,
            'invited'
          ]
        );
        
        const employeeId = result.insertId;
        
        // If we have multiple teams, handle them by creating additional records
        if (user.teams && user.teams.length > 1) {
          for (let i = 1; i < user.teams.length; i++) {
            if (user.teams[i]?.teamName) {
              await db.query(
                `INSERT INTO employee_teams (employee_id, team_name, created_at) 
                 VALUES (?, ?, NOW())`,
                [employeeId, user.teams[i].teamName]
              );
            }
          }
        }
        
        // Generate invitation token with employee data
        const tokenData = {
          email: user.email,
          name: user.name,
          role: user.role,
          team: user.teams[0]?.teamName || '',
          type: 'invite'
        };
        const inviteToken = generateToken(tokenData);
        
        console.log("Generated token:", inviteToken);
        console.log("Token length:", inviteToken.length);
        
        // Calculate expiration date - 7 days from now
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 7);
        
        // Store the token in the database
        await db.query(
          `INSERT INTO invitation_tokens (token, email, role, team_name, invited_by, created_at, expires_at, used_at)
           VALUES (?, ?, ?, ?, ?, NOW(), ?, NULL)`,
          [
            inviteToken,
            user.email, 
            user.role, 
            user.teams[0]?.teamName || '',
            inviterId,
            expiryDate
          ]
        );
        
        // Send invitation email
        const emailResult = await sendInvitationEmail(user, inviteToken);
        
        if (!emailResult.success) {
          results.push({
            email: user.email,
            success: false,
            error: `Failed to send invitation email: ${emailResult.error}`
          });
          continue;
        }
        
        results.push({
          email: user.email,
          success: true,
          id: result.insertId,
          message: 'Invitation email sent successfully'
        });
        
      } catch (userError) {
        console.error(`Error processing user ${user.email}:`, userError);
        results.push({
          email: user.email || 'unknown',
          success: false,
          error: userError.message
        });
      }
    }
    
    // Check if any users were successfully invited
    const successCount = results.filter(r => r.success).length;
    
    if (successCount === 0) {
      return NextResponse.json({
        success: false,
        error: 'Failed to invite any employees',
        results
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: `Successfully invited ${successCount} employee(s)`,
      results
    });
    
  } catch (error) {
    console.error('Error inviting employees:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Server error', 
      message: error.message 
    }, { status: 500 });
  }
} 