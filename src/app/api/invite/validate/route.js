import { NextResponse } from 'next/server';
import db from '@/lib/db';
import crypto from 'crypto';

// Validate token
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

export async function GET(request) {
  try {
    // Get token from query string
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    
    console.log("Token received in validation:", token?.substring(0, 20) + "...");
    
    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'Token is required'
      }, { status: 400 });
    }
    
    // Ensure token is properly decoded from URL encoding
    const decodedToken = decodeURIComponent(token);
    
    // Check if token exists in database - simplify to just look up the token
    console.log("Checking database for token...");
    console.log("Token length:", decodedToken.length);
    
    // First try direct match
    const [tokens] = await db.query(
      'SELECT * FROM invitation_tokens WHERE token = ?',
      [decodedToken]
    );
    
    console.log("DB query results:", tokens.length > 0 ? "Token found" : "Token not found");
    
    // If token not found, log the first few tokens from the database for comparison
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
      used_at: inviteToken.used_at,
      expires_at: inviteToken.expires_at
    }));
    
    // Check if token is already used
    if (inviteToken.used_at) {
      return NextResponse.json({
        success: false,
        error: 'Employee has already activated their account'
      }, { status: 400 });
    }
    
    // Check if token has expired
    const tokenExpiry = new Date(inviteToken.expires_at);
    if (tokenExpiry < new Date()) {
      return NextResponse.json({
        success: false,
        error: 'Token has expired'
      }, { status: 400 });
    }
    
    // Now get the employee data directly from the database
    const [employees] = await db.query(
      'SELECT * FROM employees WHERE email = ?',
      [inviteToken.email]
    );
    
    if (employees.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Employee not found'
      }, { status: 404 });
    }
    
    const employee = employees[0];
    
    // Return employee data for UI display
    return NextResponse.json({
      success: true,
      employee: {
        name: employee.employee_name,
        email: employee.email,
        role: employee.role,
        team: inviteToken.team_name
      }
    });
    
  } catch (error) {
    console.error('Error validating invitation token:', error);
    return NextResponse.json({
      success: false,
      error: 'Server error: ' + error.message
    }, { status: 500 });
  }
} 