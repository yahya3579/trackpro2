import { NextResponse } from 'next/server';
import crypto from 'crypto';
import db from '../../../../lib/db';
import { sendEmail } from '../../../../lib/email';

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // Token valid for 1 hour
    
    // Check if the user exists in organizations table
    const [orgs] = await db.query('SELECT id FROM organizations WHERE email = ?', [email]);
    
    if (orgs.length > 0) {
      // Store the token in the database
      await db.query(
        'INSERT INTO password_reset_tokens (user_id, user_type, token, expires_at, used, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [orgs[0].id, 'organization', resetToken, resetTokenExpiry, 0, new Date()]
      );
    } else {
      // Check if the user exists in super_admins table
      const [admins] = await db.query('SELECT id FROM super_admins WHERE email = ?', [email]);
      
      if (admins.length > 0) {
        // Store the token in the database
        await db.query(
          'INSERT INTO password_reset_tokens (user_id, user_type, token, expires_at, used, created_at) VALUES (?, ?, ?, ?, ?, ?)',
          [admins[0].id, 'super_admin', resetToken, resetTokenExpiry, 0, new Date()]
        );
      } else {
        // Check if the user exists in users table (for employees/admins/team members)
        const [users] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (users.length > 0) {
          await db.query(
            'INSERT INTO password_reset_tokens (user_id, user_type, token, expires_at, used, created_at) VALUES (?, ?, ?, ?, ?, ?)',
            [users[0].id, 'user', resetToken, resetTokenExpiry, 0, new Date()]
          );
        } else {
          // We don't want to reveal if the email exists or not, so we'll return success anyway
          return NextResponse.json({
            message: 'If your email is in our system, you will receive password reset instructions'
          });
        }
      }
    }
    
    // Send password reset email
    const resetUrl = `${'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    await sendEmail({
      to: email,
      subject: 'Password Reset Request',
      text: `Please use the following link to reset your password: ${resetUrl}. This link is valid for 1 hour.`,
      html: `
        <h1>Password Reset</h1>
        <p>Please use the following link to reset your password:</p>
        <a href="${resetUrl}" target="_blank">Reset Password</a>
        <p>This link is valid for 1 hour.</p>
        <p>If you didn't request a password reset, please ignore this email.</p>
      `,
    });
    
    return NextResponse.json({
      message: 'If your email is in our system, you will receive password reset instructions'
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
} 