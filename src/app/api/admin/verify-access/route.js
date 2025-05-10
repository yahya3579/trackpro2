import { NextResponse } from 'next/server';
import db from '../../../../lib/db';
import { withAuth } from '../../../../lib/auth';

async function handler(request) {
  try {
    // The user will be attached from auth middleware
    const user = request.user;
    
    // If user role is already super_admin, they're verified
    if (user.role === 'super_admin') {
      return NextResponse.json({
        message: 'User has super admin access',
        verified: true
      });
    }
    
    // If user role is not super_admin, check if they might have access through organization
    if (user.role === 'organization_admin') {
      const [superAdmins] = await db.query(
        'SELECT * FROM super_admins WHERE email = ? AND is_org_admin = true',
        [user.email]
      );
      
      if (superAdmins.length > 0) {
        return NextResponse.json({
          message: 'User has super admin access through organization account',
          verified: true,
          note: 'User should use super admin login to access super admin features'
        });
      }
    }
    
    // If we reach here, the user doesn't have super admin access
    return NextResponse.json({
      message: 'User does not have super admin access',
      verified: false
    }, { status: 403 });
  } catch (error) {
    console.error('Error verifying access:', error);
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}

export const GET = withAuth(handler); 