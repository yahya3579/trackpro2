import { NextResponse } from 'next/server';
import crypto from 'crypto';
import db from '@/lib/db';

// Helper function to validate token
function verifyToken(token) {
  try {
    // Split the token into its parts using period as separator
    const [encodedData, signature] = token.split('.');
    
    if (!encodedData || !signature) {
      return { valid: false, message: 'Invalid token format' };
    }
    
    // Decode the data
    const dataString = Buffer.from(encodedData, 'base64').toString();
    
    // Verify the signature
    const tokenSecret = process.env.TOKEN_SECRET || 'trackpro-secret-key';
    const hmac = crypto.createHmac('sha256', tokenSecret);
    const expectedSignature = hmac.update(dataString).digest('hex');
    
    if (signature !== expectedSignature) {
      console.log('Signature mismatch:', {
        signature, 
        expectedSignature
      });
      return { valid: false, message: 'Invalid token signature' };
    }
    
    // Parse and validate the data
    const data = JSON.parse(dataString);
    console.log('Token data:', data); // Log token data for debugging
    
    // Check if token has expired
    if (data.exp < Date.now()) {
      return { valid: false, message: 'Token has expired' };
    }
    
    return { valid: true, data };
  } catch (error) {
    console.error('Error verifying token:', error);
    return { valid: false, message: 'Error verifying token: ' + error.message };
  }
}

// GET - Validate invitation token
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    if (!token) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invitation token is required' 
      }, { status: 400 });
    }
    
    // Verify the token
    const { valid, data, message } = verifyToken(token);
    
    if (!valid) {
      return NextResponse.json({ 
        success: false, 
        error: message || 'Invalid token' 
      }, { status: 400 });
    }
    
    console.log('Looking for employee with email:', data.email);
    
    // Check if the employee exists and has 'invited' status - search by email only for more flexibility
    const [employees] = await db.query(
      `SELECT id, first_name, last_name, email, position, department, status
       FROM employees 
       WHERE email = ?`,
      [data.email]
    );
    
    console.log(`Found ${employees.length} employee records:`, employees.map(e => ({ id: e.id, status: e.status })));
    
    if (employees.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Employee not found with the email in the invitation' 
      }, { status: 400 });
    }
    
    // Check if any of the found employees has 'invited' status
    const invitedEmployee = employees.find(emp => emp.status === 'invited');
    
    if (!invitedEmployee) {
      console.log('No employee with invited status found for email:', data.email);
      return NextResponse.json({
        success: false,
        error: 'Employee has already activated their account'
      }, { status: 400 });
    }
    
    const employee = invitedEmployee;
    
    // Get organization name - use default
    let orgName = 'Our Company';
    try {
      const [orgResult] = await db.query('SELECT name FROM organizations LIMIT 1');
      if (orgResult && orgResult.length > 0) {
        orgName = orgResult[0].name;
      }
    } catch (error) {
      console.error('Error fetching organization name:', error);
      // Continue with default
    }
    
    return NextResponse.json({
      success: true,
      employee: {
        id: employee.id,
        first_name: employee.first_name,
        last_name: employee.last_name,
        email: employee.email,
        position: employee.position,
        department: employee.department,
        organization: orgName
      }
    });
  } catch (error) {
    console.error('Error validating invitation:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Server error', 
      message: error.message 
    }, { status: 500 });
  }
}

// POST - Accept invitation and create account
export async function POST(request) {
  try {
    const { token, password } = await request.json();
    
    if (!token) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invitation token is required' 
      }, { status: 400 });
    }
    
    if (!password || password.length < 6) {
      return NextResponse.json({ 
        success: false, 
        error: 'Password is required and must be at least 6 characters' 
      }, { status: 400 });
    }
    
    // Verify the token
    const { valid, data, message } = verifyToken(token);
    
    if (!valid) {
      return NextResponse.json({ 
        success: false, 
        error: message || 'Invalid token' 
      }, { status: 400 });
    }
    
    // Check if the employee exists and has 'invited' status - search by email only
    const [employees] = await db.query(
      `SELECT * FROM employees 
       WHERE email = ?`,
      [data.email]
    );
    
    if (employees.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Employee not found with the email in the invitation' 
      }, { status: 400 });
    }
    
    // Find the employee with 'invited' status
    const invitedEmployee = employees.find(emp => emp.status === 'invited');
    
    if (!invitedEmployee) {
      return NextResponse.json({
        success: false,
        error: 'Employee has already activated their account'
      }, { status: 400 });
    }
    
    const employee = invitedEmployee;
    
    // Get organization name - use default
    let orgName = 'Our Company';
    try {
      const [orgResult] = await db.query('SELECT name FROM organizations LIMIT 1');
      if (orgResult && orgResult.length > 0) {
        orgName = orgResult[0].name;
      }
    } catch (error) {
      console.error('Error fetching organization name:', error);
      // Continue with default
    }
    
    // Hash the password in a real application
    // For this example we're storing directly, but you should use bcrypt
    // const bcrypt = require('bcryptjs');
    // const hashedPassword = await bcrypt.hash(password, 10);
    
    // Update employee status and set credentials
    await db.query(
      `UPDATE employees 
       SET status = 'active', 
           password = ?, 
           hire_date = CURRENT_DATE,
           updated_at = NOW()
       WHERE id = ?`,
      [password, employee.id]
    );
    
    // Log acceptance for audit trail (if possible)
    try {
      await db.query(
        `INSERT INTO activity_log (user_id, action_type, details, ip_address)
         VALUES (?, 'invitation_accepted', ?, ?)`,
        [
          employee.id,
          JSON.stringify({ 
            employeeId: employee.id, 
            firstName: employee.first_name,
            lastName: employee.last_name
          }),
          request.headers.get('x-forwarded-for') || 'unknown'
        ]
      );
    } catch (logError) {
      // Silently ignore if activity_log table doesn't exist
      console.log('Note: activity logging skipped - table may not exist');
    }
    
    return NextResponse.json({
      success: true,
      message: 'Invitation accepted successfully',
      employee: {
        id: employee.id,
        first_name: employee.first_name,
        last_name: employee.last_name,
        email: employee.email,
        organization: orgName,
        position: employee.position,
        department: employee.department
      }
    });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Server error', 
      message: error.message 
    }, { status: 500 });
  }
} 