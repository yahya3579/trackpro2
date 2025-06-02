import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '@/lib/db';

// GET: Get super admin info
export async function GET() {
  try {
    const [rows] = await db.query('SELECT id, email FROM super_admins ORDER BY id ASC LIMIT 1');
    if (rows.length === 0) {
      return NextResponse.json({ email: '' });
    }
    return NextResponse.json({ email: rows[0].email });
  } catch (error) {
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}

// PUT: Update super admin email and/or password
export async function PUT(request) {
  try {
    const { email, password } = await request.json();
    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }
    // Get the first super admin
    const [rows] = await db.query('SELECT id FROM super_admins ORDER BY id ASC LIMIT 1');
    if (rows.length === 0) {
      return NextResponse.json({ message: 'Super admin not found' }, { status: 404 });
    }
    const id = rows[0].id;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      await db.query('UPDATE super_admins SET email = ?, password = ? WHERE id = ?', [email, hashedPassword, id]);
    } else {
      await db.query('UPDATE super_admins SET email = ? WHERE id = ?', [email, id]);
    }
    return NextResponse.json({ message: 'Settings updated' });
  } catch (error) {
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
} 