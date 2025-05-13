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
    const [users] = await db.query('SELECT u.*, e.employee_name, e.role FROM users u JOIN employees e ON u.email = e.email WHERE u.email = ?', [email]);
    
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
        redirectUrl = '/super-admin';
      } else {
        redirectUrl = '/dashboard';
      }

      // Generate token
      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.employee_name, role: role },
        JWT_SECRET,
        { expiresIn: '1d' }
      );

      // Return token and user info
      return NextResponse.json({
        message: 'Login successful',
        token,
        redirectUrl: redirectUrl,
        user: {
          id: user.id,
          name: user.employee_name,
          email: user.email,
          role: role
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