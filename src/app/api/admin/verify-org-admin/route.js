import { NextResponse } from 'next/server';
import db from '../../../../lib/db';
import { withAuth } from '../../../../lib/auth';

async function handler(request) {
  try {
    const body = await request.json();
    
    // Get email from the request body or from the authenticated user token
    let email = body.email;
    
    // If no email provided in the body, use the email from token
    if (!email && request.user) {
      email = request.user.email;
    }
    
    if (!email) {
      return NextResponse.json({ 
        message: 'Email is required to verify super admin access' 
      }, { status: 400 });
    }
    
    // Check if the email exists in super_admins table with is_org_admin flag
    const [superAdmins] = await db.query(
      'SELECT * FROM super_admins WHERE email = ? AND is_org_admin = true',
      [email]
    );

    if (superAdmins.length === 0) {
      return NextResponse.json({ 
        message: 'No super admin privileges found for this organization account' 
      }, { status: 403 });
    }

    return NextResponse.json({
      message: 'Organization user has super admin privileges',
      verified: true,
      superAdmin: {
        id: superAdmins[0].id,
        name: superAdmins[0].name,
        email: superAdmins[0].email
      }
    });
  } catch (error) {
    console.error('Error verifying organization super admin access:', error);
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}

export const POST = withAuth(handler); 