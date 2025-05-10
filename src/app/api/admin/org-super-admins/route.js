import { NextResponse } from 'next/server';
import db from '../../../../lib/db';
import { withAuth } from '../../../../lib/auth';

async function handler(request) {
  try {
    // Only existing super admins can view the list
    const requestingUser = request.user;
    if (requestingUser.role !== 'super_admin') {
      return NextResponse.json({ 
        message: 'Only super admins can view super admin list' 
      }, { status: 403 });
    }

    const [superAdmins] = await db.query(
      'SELECT id, name, email, created_at, is_org_admin FROM super_admins'
    );

    return NextResponse.json({
      message: 'Organization super admins retrieved successfully',
      superAdmins
    });
  } catch (error) {
    console.error('Error listing organization super admins:', error);
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}

export const GET = withAuth(handler); 