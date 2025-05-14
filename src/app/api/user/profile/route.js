import { NextResponse } from 'next/server';
import db from '../../../../lib/db';
import { withAuth } from '../../../../lib/auth';

async function handler(request) {
  try {
    const userId = request.user.id;
    const userRole = request.user.role;
    
    if (userRole === 'super_admin') {
      // Get super admin info
      const [admins] = await db.query('SELECT id, username, name, email FROM super_admins WHERE id = ?', [userId]);
      
      if (admins.length === 0) {
        return NextResponse.json({ message: 'Admin not found' }, { status: 404 });
      }

      const admin = admins[0];

      // Return admin info
      return NextResponse.json({
        user: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          username: admin.username,
          role: 'super_admin'
        }
      });
    } else {
      // Query the database to get organization information
      const [users] = await db.query('SELECT id, name, email, logo FROM organizations WHERE id = ?', [userId]);
      
      if (users.length === 0) {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
      }

      const user = users[0];

      // Return user info
      return NextResponse.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          photoUrl: user.logo,
          role: 'organization_admin'
        }
      });
    }
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}

export const GET = withAuth(handler);