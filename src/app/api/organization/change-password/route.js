import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '../../../../lib/db';
import { withAuth } from '../../../../lib/auth';

async function handler(request) {
  try {
    const { currentPassword, newPassword } = await request.json();
    
    // Validate input
    if (!currentPassword || !newPassword) {
      return NextResponse.json({
        message: 'Current password and new password are required'
      }, { status: 400 });
    }
    
    // Get user ID from the authenticated token
    const userId = request.user.id;
    
    // Check if this is an organization admin
    if (request.user.role !== 'organization_admin') {
      return NextResponse.json({
        message: 'Only organization admins can change their password'
      }, { status: 403 });
    }
    
    // Get the organization's current password
    const [organizations] = await db.query(
      'SELECT password FROM organizations WHERE id = ?',
      [userId]
    );
    
    if (organizations.length === 0) {
      return NextResponse.json({ message: 'Organization not found' }, { status: 404 });
    }
    
    const organization = organizations[0];
    
    // Verify the current password
    const isPasswordValid = await bcrypt.compare(currentPassword, organization.password);
    
    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Current password is incorrect' }, { status: 401 });
    }
    
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update the password in the database
    await db.query(
      'UPDATE organizations SET password = ? WHERE id = ?',
      [hashedPassword, userId]
    );
    
    return NextResponse.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}

export const POST = withAuth(handler); 