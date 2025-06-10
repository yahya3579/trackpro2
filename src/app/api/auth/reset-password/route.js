import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '../../../../lib/db';

export async function POST(request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json({ message: 'Token and password are required' }, { status: 400 });
    }

    // Find token in database
    const [tokens] = await db.query(
      'SELECT * FROM password_reset_tokens WHERE token = ? AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
      [token]
    );

    if (tokens.length === 0) {
      return NextResponse.json({ message: 'Invalid or expired token' }, { status: 400 });
    }

    const { user_id, user_type } = tokens[0];

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update password based on user type
    if (user_type === 'organization') {
      await db.query(
        'UPDATE organizations SET password = ? WHERE id = ?',
        [hashedPassword, user_id]
      );
    } else if (user_type === 'super_admin') {
      await db.query(
        'UPDATE super_admins SET password = ? WHERE id = ?',
        [hashedPassword, user_id]
      );
    } else if (user_type === 'user') {
      await db.query(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, user_id]
      );
    } else {
      return NextResponse.json({ message: 'Invalid user type' }, { status: 400 });
    }

    // Delete all reset tokens for this user and type
    await db.query(
      'DELETE FROM password_reset_tokens WHERE user_id = ? AND user_type = ?',
      [user_id, user_type]
    );

    return NextResponse.json({
      message: 'Password has been successfully reset'
    });
    
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
} 