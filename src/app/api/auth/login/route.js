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

    // First check if user exists in organizations table
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
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: 'organization_admin'
        }
      });
    }

    // Check if user exists in super_admins table
    const [superAdmins] = await db.query('SELECT * FROM super_admins WHERE email = ?', [email]);
    
    if (superAdmins.length > 0) {
      // User is a super admin
      const admin = superAdmins[0];

      // Check password
      const isPasswordMatch = await bcrypt.compare(password, admin.password);
      
      if (!isPasswordMatch) {
        return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
      }

      // Generate token
      const token = jwt.sign(
        { id: admin.id, email: admin.email, name: admin.name, role: 'super_admin' },
        JWT_SECRET,
        { expiresIn: '1d' }
      );

      // Return token and user info
      return NextResponse.json({
        message: 'Login successful',
        token,
        user: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: 'super_admin',
          username: admin.username
        }
      });
    }

    // Check if user exists in users table (employees who accepted invitations)
    const [users] = await db.query('SELECT u.*, e.employee_name FROM users u JOIN employees e ON u.email = e.email WHERE u.email = ?', [email]);
    
    if (users.length > 0) {
      // User is an employee
      const user = users[0];

      // Check password
      const isPasswordMatch = await bcrypt.compare(password, user.password);
      
      if (!isPasswordMatch) {
        return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
      }

      // Generate token
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          name: user.employee_name, 
          role: user.role,
          organization_id: user.organization_id
        },
        JWT_SECRET,
        { expiresIn: '1d' }
      );

      // Return token and user info
      return NextResponse.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          name: user.employee_name,
          email: user.email,
          role: user.role,
          userType: 'employee'
        }
      });
    }

    // If we reach here, no user was found
    return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
} 