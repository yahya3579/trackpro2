import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../../../../lib/db';

// Secret key for JWT
const JWT_SECRET = 'trackpro-secret-key';

export async function POST(request) {
  try {
    const { email, password, is_org_owner } = await request.json();
    const headers = Object.fromEntries(request.headers);

    // Validate request
    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }
    
    // If this is an organization owner auto-login
    if (is_org_owner === true) {
      // Verify the organization owner from the auth token
      const authToken = headers['x-auth-token'];
      
      if (!authToken) {
        return NextResponse.json({ message: 'Authorization token required for owner auto-login' }, { status: 401 });
      }
      
      try {
        // Verify token to get user data
        const decoded = jwt.verify(authToken, JWT_SECRET);
        
        // Check if the token user matches the requested email
        if (decoded.email !== email || decoded.role !== 'organization_admin') {
          return NextResponse.json({ message: 'Token does not match organization owner credentials' }, { status: 403 });
        }
        
        // Find the super admin entry for this organization owner
        const [superAdmins] = await db.query(
          'SELECT * FROM super_admins WHERE email = ? AND is_org_admin = true', 
          [email]
        );
        
        if (superAdmins.length === 0) {
          return NextResponse.json({ message: 'Organization owner does not have super admin privileges' }, { status: 401 });
        }
        
        const superAdmin = superAdmins[0];
        
        // Generate token
        const token = jwt.sign(
          { id: superAdmin.id, email: superAdmin.email, name: superAdmin.name, role: 'super_admin' },
          JWT_SECRET,
          { expiresIn: '1d' }
        );
        
        // Return token and user info
        return NextResponse.json({
          message: 'Super admin login successful',
          token,
          user: {
            id: superAdmin.id,
            name: superAdmin.name,
            email: superAdmin.email,
            role: 'super_admin',
            username: superAdmin.username
          }
        });
      } catch (error) {
        return NextResponse.json({ message: 'Invalid token', error: error.message }, { status: 401 });
      }
    }
    
    // For regular super admin login
    if (!password) {
      return NextResponse.json({ message: 'Password is required' }, { status: 400 });
    }
    
    // Find the super admin
    const [superAdmins] = await db.query('SELECT * FROM super_admins WHERE email = ?', [email]);
    
    if (superAdmins.length === 0) {
      return NextResponse.json({ message: 'Super admin not found' }, { status: 401 });
    }
    
    const superAdmin = superAdmins[0];
    
    // Check password
    const isPasswordMatch = await bcrypt.compare(password, superAdmin.password);
    
    if (!isPasswordMatch) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }
    
    // Generate token
    const token = jwt.sign(
      { id: superAdmin.id, email: superAdmin.email, name: superAdmin.name, role: 'super_admin' },
      JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    // Return token and user info
    return NextResponse.json({
      message: 'Super admin login successful',
      token,
      user: {
        id: superAdmin.id,
        name: superAdmin.name,
        email: superAdmin.email,
        role: 'super_admin',
        username: superAdmin.username
      }
    });
  } catch (error) {
    console.error('Super admin login error:', error);
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
} 