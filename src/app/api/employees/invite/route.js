import { NextResponse } from 'next/server';
import crypto from 'crypto';
import db from '@/lib/db';
import { sendEmail, generateInviteEmailTemplate } from '@/lib/email';

export async function POST(request) {
  try {
    const { 
      first_name,
      last_name,
      email, 
      position, 
      department, 
      phone 
    } = await request.json();
    
    // Validation
    if (!first_name || !last_name || !email || !position || !department) {
      return NextResponse.json(
        { success: false, message: 'First name, last name, email, position, and department are required' },
        { status: 400 }
      );
    }
    
    // First, check if the employee already exists but has 'active' status
    const [existingActiveEmployees] = await db.query(
      'SELECT id, status FROM employees WHERE email = ? AND status = "active"',
      [email]
    );

    if (existingActiveEmployees.length > 0) {
      return NextResponse.json(
        { success: false, message: 'An active employee with this email already exists' },
        { status: 409 }
      );
    }

    // Now check if there's an invited employee - if so, we'll delete the old record
    // This ensures we can send fresh invitations to the same email address
    const [existingInvitedEmployees] = await db.query(
      'SELECT id FROM employees WHERE email = ? AND status = "invited"',
      [email]
    );

    if (existingInvitedEmployees.length > 0) {
      // Delete the existing invitation
      await db.query(
        'DELETE FROM employees WHERE id = ?',
        [existingInvitedEmployees[0].id]
      );
      console.log(`Removed previous invitation for ${email}`);
    }
    
    // Get organization name (default value if query fails)
    let orgName = 'Our Company';
    
    try {
      const [orgResult] = await db.query('SELECT name FROM organizations LIMIT 1');
      if (orgResult && orgResult[0]) {
        orgName = orgResult[0].name;
      }
    } catch (error) {
      console.error('Error getting organization name:', error);
      // Continue with default org name
    }
    
    // Insert the new employee with invited status
    const query = `
      INSERT INTO employees 
      (first_name, last_name, email, position, department, phone, status)
      VALUES (?, ?, ?, ?, ?, ?, 'invited')
    `;
    
    const [result] = await db.query(query, [
      first_name,
      last_name,
      email, 
      position,
      department,
      phone
    ]);
    
    // Get the newly inserted employee's ID
    const employeeId = result.insertId;
    
    // Create a secure token that encodes the employee ID and expires in 7 days
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);
    
    // Simple token: employeeId + expiry + email (for verification)
    const tokenData = {
      id: employeeId,
      email: email,
      exp: expiryDate.getTime()
    };
    
    console.log('Creating invitation token for:', {
      id: employeeId,
      email: email,
      expiryDate: new Date(expiryDate.getTime()).toISOString()
    });
    
    // Create a simple token by hashing the data with a secret
    const tokenSecret = process.env.TOKEN_SECRET || 'trackpro-secret-key';
    const dataString = JSON.stringify(tokenData);
    const hmac = crypto.createHmac('sha256', tokenSecret);
    const signature = hmac.update(dataString).digest('hex');
    
    // Encode the token components and combine them with a period separator for better URL safety
    const encodedData = Buffer.from(dataString).toString('base64');
    const token = `${encodedData}.${signature}`;
    
    console.log('Token created with format: [encodedData].[signature]');
    
    // Create invitation link (don't need to further encode the token as it's already URL-safe)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const inviteLink = `${baseUrl}/invite/accept?token=${encodeURIComponent(token)}`;
    
    // Generate email template (now it's an async function)
    const name = `${first_name} ${last_name}`;
    const htmlEmail = await generateInviteEmailTemplate({
      recipientName: name,
      organizationName: orgName,
      inviteLink,
      expiryDays: 7
    });
    
    // Send invitation email
    const emailSent = await sendEmail({
      to: email,
      subject: `Invitation to join ${orgName} on TrackPro`,
      text: `Hello ${name}, you have been invited to join ${orgName} on TrackPro. Please use the following link to accept the invitation: ${inviteLink}. This link is valid for 7 days.`,
      html: htmlEmail
    });
    
    if (!emailSent) {
      console.log('Warning: Failed to send invitation email, but employee was created.');
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Employee invited successfully',
      employee: {
        id: employeeId,
        first_name,
        last_name,
        email,
        position,
        department,
        phone,
        status: 'invited',
        created_at: new Date()
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error inviting employee:', error);
    
    // Handle duplicate email error
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { success: false, message: 'Email already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: 'Failed to invite employee', error: error.message },
      { status: 500 }
    );
  }
} 