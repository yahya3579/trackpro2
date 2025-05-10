import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '../../../../lib/db';
import { withAuth } from '../../../../lib/auth';

async function handler(request) {
  try {
    const { userId, email } = await request.json();
    
    // Only existing super admins can grant access
    const requestingUser = request.user;
    if (requestingUser.role !== 'super_admin') {
      return NextResponse.json({ 
        message: 'Only super admins can grant super admin access' 
      }, { status: 403 });
    }

    // Verify if the user exists in organizations table
    const [users] = await db.query(
      'SELECT * FROM organizations WHERE id = ? OR email = ?', 
      [userId || 0, email || '']
    );

    if (users.length === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const user = users[0];

    // Check if user already has super admin access
    const [existingSuperAdmin] = await db.query(
      'SELECT * FROM super_admins WHERE email = ?', 
      [user.email]
    );

    if (existingSuperAdmin.length > 0) {
      return NextResponse.json({ message: 'User already has super admin access' }, { status: 400 });
    }

    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(tempPassword, salt);

    // Insert into super_admins table
    await db.query(
      'INSERT INTO super_admins (name, email, username, password, org_id, is_org_admin) VALUES (?, ?, ?, ?, ?, ?)',
      [user.name, user.email, user.email.split('@')[0], hashedPassword, user.id, true]
    );

    // Return success with the temporary password
    return NextResponse.json({
      message: 'Super admin access granted successfully',
      userEmail: user.email,
      tempPassword: tempPassword, // In a real app, you would email this instead of returning it
      note: 'Please ask the user to change this temporary password immediately'
    });
  } catch (error) {
    console.error('Error granting super admin access:', error);
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}

export const POST = withAuth(handler); 