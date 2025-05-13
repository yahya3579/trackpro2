import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../../../../lib/db';

// Secret key for JWT
const JWT_SECRET = 'trackpro-secret-key';

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    // Validate request
    if (!name || !email || !password) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    // Check if email already exists
    const [existingUsers] = await db.query('SELECT * FROM organizations WHERE email = ?', [email]);
    
    if (existingUsers.length > 0) {
      return NextResponse.json({ message: 'Email already in use' }, { status: 400 });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new organization
    const [result] = await db.query(
      'INSERT INTO organizations (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    const orgId = result.insertId;

    // Generate JWT token
    const token = jwt.sign(
      { id: orgId, email, name, role: 'organization_admin' },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Return token and user info
    return NextResponse.json({
      message: 'Organization registered successfully',
      token,
      user: {
        id: orgId,
        name,
        email,
        role: 'organization_admin'
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
} 