import { NextResponse } from 'next/server';
import db from '@/lib/db';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// Validate token (same implementation as in validate route)
function validateToken(token) {
  try {
    // Split the token into data and signature parts
    const [encodedData, signature] = token.split('.');
    
    if (!encodedData || !signature) {
      return { valid: false, error: 'Invalid token format' };
    }
    
    // Decode the data portion
    const decodedData = JSON.parse(Buffer.from(encodedData, 'base64').toString());
    
    // Check if token has expired
    if (decodedData.exp && decodedData.exp < Date.now()) {
      return { valid: false, error: 'Token has expired' };
    }
    
    // Verify signature
    const tokenSecret = process.env.TOKEN_SECRET || 'trackpro-secret-key';
    const hmac = crypto.createHmac('sha256', tokenSecret);
    const dataString = JSON.stringify({
      ...decodedData,
      // Note: don't recalculate exp here as it would be different
    });
    const expectedSignature = hmac.update(dataString).digest('hex');
    
    if (signature !== expectedSignature) {
      return { valid: false, error: 'Invalid token signature' };
    }
    
    return { 
      valid: true, 
      data: decodedData 
    };
  } catch (error) {
    console.error('Token validation error:', error);
    return { valid: false, error: 'Invalid token format' };
  }
}

export async function POST(request) {
  try {
    const { token, password } = await request.json();
    
    console.log("Token received for accept:", token?.substring(0, 20) + "...");
    
    if (!token || !password) {
      return NextResponse.json({
        success: false,
        error: 'Token and password are required'
      }, { status: 400 });
    }
    
    // Ensure token is properly decoded from URL encoding if needed
    const decodedToken = decodeURIComponent(token);
    console.log("Token length:", decodedToken.length);
    
    // Get token from database
    console.log("Checking database for token...");
    const [tokens] = await db.query(
      'SELECT * FROM invitation_tokens WHERE token = ?',
      [decodedToken]
    );
    
    console.log("DB query results:", tokens.length > 0 ? "Token found" : "Token not found");
    
    // If token not found, log sample tokens for debugging
    if (tokens.length === 0) {
      const [sampleTokens] = await db.query('SELECT id, token, email FROM invitation_tokens LIMIT 3');
      console.log("Sample tokens in DB:", sampleTokens.map(t => ({
        id: t.id,
        email: t.email,
        tokenPrefix: t.token?.substring(0, 20) + "...",
        tokenLength: t.token?.length
      })));
      
      return NextResponse.json({
        success: false,
        error: 'Invalid invitation token'
      }, { status: 404 });
    }
    
    const inviteToken = tokens[0];
    console.log("Token data from DB:", JSON.stringify({
      id: inviteToken.id,
      email: inviteToken.email,
      role: inviteToken.role,
      used_at: inviteToken.used_at
    }));
    
    // Check if token is already used
    if (inviteToken.used_at) {
      return NextResponse.json({
        success: false,
        error: 'This invitation has already been accepted'
      }, { status: 400 });
    }
    
    // Check if token has expired
    const tokenExpiry = new Date(inviteToken.expires_at);
    if (tokenExpiry < new Date()) {
      return NextResponse.json({
        success: false,
        error: 'This invitation has expired'
      }, { status: 400 });
    }
    
    // Get employee from database using the email in the token
    const email = inviteToken.email;
    const [employees] = await db.query(
      'SELECT * FROM employees WHERE email = ?',
      [email]
    );
    
    if (employees.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Employee not found'
      }, { status: 404 });
    }
    
    const employee = employees[0];
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Log the user data before insert for debugging
    console.log("Creating user with data:", {
      email: email,
      employee_name: employee.employee_name,
      role: employee.role,
      employee_id: employee.id
    });
    
    try {
      // First, get a valid organization ID
      const [organizations] = await db.query('SELECT id FROM organizations LIMIT 1');
      
      if (organizations.length === 0) {
        throw new Error('No organizations found in the database');
      }
      
      const organizationId = organizations[0].id;
      
      // Check if user already exists
      const [existingUser] = await db.query(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      
      // Preserve the original role exactly as it was set
      const employeeRole = employee.role;
      console.log("Preserving original employee role:", employeeRole);
      
      if (existingUser.length === 0) {
        // Create user account with the hashed password - let the database auto-generate the ID
        await db.query(
          'INSERT INTO users (email, password, role, organization_id, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
          [email, hashedPassword, employeeRole, organizationId]
        );
      } else {
        // Update existing user
        await db.query(
          'UPDATE users SET password = ?, role = ?, updated_at = NOW() WHERE email = ?',
          [hashedPassword, employeeRole, email]
        );
      }
    } catch (insertError) {
      console.error("Error inserting user:", insertError);
      
      // Try to get the table structure to see available columns
      const [userColumns] = await db.query('SHOW COLUMNS FROM users');
      console.log("Users table columns:", userColumns.map(col => col.Field));
      
      throw insertError;
    }
    
    // Update employee status to active
    await db.query(
      'UPDATE employees SET status = "" WHERE id = ?',
      [employee.id]
    );
    
    // Mark invitation token as used
    await db.query(
      'UPDATE invitation_tokens SET used_at = NOW() WHERE id = ?',
      [inviteToken.id]
    );
    
    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      employee: {
        id: employee.id,
        name: employee.employee_name,
        email: employee.email,
        role: employee.role
      }
    });
    
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return NextResponse.json({
      success: false,
      error: 'Server error: ' + error.message
    }, { status: 500 });
  }
} 