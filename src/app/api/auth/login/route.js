import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../../../../lib/db';

// Secret key for JWT
const JWT_SECRET = 'trackpro-secret-key';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Validate request
    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    // Check if user exists in organizations table
    const [organizations] = await db.query('SELECT * FROM organizations WHERE email = ?', [email]);
    
    if (organizations.length > 0) {
      // User is an organization admin
      const user = organizations[0];

      // Check password
      const isPasswordMatch = await bcrypt.compare(password, user.password);
      
      if (!isPasswordMatch) {
        return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
      }

      // Generate token
      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name, role: 'organization_admin' },
        JWT_SECRET,
        { expiresIn: '1d' }
      );

      // Return token and user info
      return NextResponse.json({
        message: 'Login successful',
        token,
        redirectUrl: '/dashboard', // Admin dashboard
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: 'organization_admin'
        }
      });
    }

    // Check if user exists in users table (employees who accepted invitations)
    const [users] = await db.query('SELECT u.*, e.employee_name, e.role, e.id as employee_id FROM users u JOIN employees e ON u.email = e.email WHERE u.email = ?', [email]);
    
    if (users.length > 0) {
      // User exists
      const user = users[0];

      // Check password
      const isPasswordMatch = await bcrypt.compare(password, user.password);
      
      if (!isPasswordMatch) {
        return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
      }

      // Determine user role and set appropriate redirect
      const role = user.role || 'employee';
      
      // Check if the user is a team member - handle both "Team Member" and "team_member" formats
      const isTeamMember = role.toLowerCase().replace(/\s/g, '_') === 'team_member' || 
                          role.toLowerCase() === 'team member';
      
      // Check if the user is an admin
      const isAdmin = role.toLowerCase() === 'admin';
      
      // Set redirect based on role
      let redirectUrl;
      if (isTeamMember) {
        redirectUrl = '/employee-dashboard';
      } else if (isAdmin) {
        redirectUrl = '/super-admin-dashboard';
      } else {
        redirectUrl = '/dashboard';
      }

      // --- Fetch today's total_hours and session count from time_tracking ---
      const today = new Date().toISOString().split('T')[0];
      let total_hours = 0;
      let session_count = 0;
      try {
        const [trackingRows] = await db.query(
          'SELECT total_hours, sessions FROM time_tracking WHERE employee_id = ? AND date = ?',
          [user.employee_id, today]
        );
        if (trackingRows.length > 0) {
          total_hours = parseFloat(trackingRows[0].total_hours) || 0;
          const sessions = trackingRows[0].sessions ? JSON.parse(trackingRows[0].sessions) : [];
          session_count = Array.isArray(sessions) ? sessions.length : 0;
        }
      } catch (err) {
        // If error, just leave as 0
      }
      // ---------------------------------------------------------------

      // Generate token
      const token = jwt.sign(
        { id: user.employee_id || user.id, email: user.email, name: user.employee_name, role: role },
        JWT_SECRET,
        { expiresIn: '1d' }
      );

      // Return token and user info
      return NextResponse.json({
        message: 'Login successful',
        token,
        redirectUrl: redirectUrl,
        user: {
          id: user.employee_id || user.id,
          name: user.employee_name,
          email: user.email,
          role: role,
          total_hours_today: total_hours,
          session_count_today: session_count
        }
      });
    }

    // If we get here, user was not found
    return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
} 