import { NextResponse } from 'next/server';
import db from '../../../../lib/db';
import { withAuth } from '../../../../lib/auth';

async function handler(request) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ message: 'Email is required to revoke super admin access' }, { status: 400 });
    }
    
    // Only existing super admins can revoke access
    const requestingUser = request.user;
    if (requestingUser.role !== 'super_admin') {
      return NextResponse.json({ 
        message: 'Only super admins can revoke super admin access' 
      }, { status: 403 });
    }
    
    // Check if the super admin exists before trying to delete
    const [checkAdmin] = await db.query(
      'SELECT * FROM super_admins WHERE email = ?',
      [email]
    );

    if (checkAdmin.length === 0) {
      return NextResponse.json({ message: `Super admin not found with email: ${email}` }, { status: 404 });
    }

    // Delete from super_admins table
    const [result] = await db.query(
      'DELETE FROM super_admins WHERE email = ?',
      [email]
    );
    
    if (result.affectedRows === 0) {
      return NextResponse.json({ message: 'Failed to remove super admin access' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Super admin access revoked successfully',
      success: true
    });
  } catch (error) {
    console.error('Error revoking super admin access:', error);
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}

export const POST = withAuth(handler); 