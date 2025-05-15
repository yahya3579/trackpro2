import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import db from '@/lib/db';

// Secret key for JWT
const JWT_SECRET = 'trackpro-secret-key';

/**
 * Authentication middleware for Next.js API routes
 * @param {Function} handler - The API route handler function
 * @returns {Function} - The wrapped handler function with authentication
 */
export function withAuth(handler) {
  return async (request, ...args) => {
    try {
      // Get token from header
      const headers = Object.fromEntries(request.headers);
      const token = headers['x-auth-token'];

      // Check if no token
      if (!token) {
        return NextResponse.json({ message: 'No token, authorization denied' }, { status: 401 });
      }

      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Create a new request object with the user attached
      const requestWithUser = new Request(request);
      requestWithUser.user = decoded;
      
      // Call the handler with the modified request
      return handler(requestWithUser, ...args);
    } catch (err) {
      return NextResponse.json({ message: 'Token is not valid' }, { status: 401 });
    }
  };
}

/**
 * Get user from request
 * @param {Request} request - The request object
 * @returns {Object|null} - The user object or null if not authenticated
 */
export function getUser(request) {
  try {
    const headers = Object.fromEntries(request.headers);
    const token = headers['x-auth-token'];
    
    if (!token) {
      return null;
    }
    
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

/**
 * Get employee ID from decoded token by matching email or name
 * @param {Object} decodedToken - The decoded JWT token
 * @returns {Promise<{employeeId: number|null, error: string|null}>} - Employee ID or error
 */
export async function getEmployeeIdFromToken(decodedToken) {
  if (!decodedToken) {
    return { employeeId: null, error: 'Invalid token' };
  }
  
  try {
    // Try to get employee by email first (more reliable)
    if (decodedToken.email) {
      const [employee] = await db.query(
        'SELECT id FROM employees WHERE email = ?',
        [decodedToken.email]
      );
      
      if (employee.length > 0) {
        return { employeeId: employee[0].id, error: null };
      }
    }
    
    // If no match by email and token has name, try by name
    if (decodedToken.name) {
      const [employee] = await db.query(
        'SELECT id FROM employees WHERE employee_name = ?',
        [decodedToken.name]
      );
      
      if (employee.length > 0) {
        return { employeeId: employee[0].id, error: null };
      }
    }
    
    // If all lookups failed
    return { 
      employeeId: null, 
      error: 'No matching employee record found for this user'
    };
  } catch (err) {
    console.error('Error finding employee ID:', err);
    return { 
      employeeId: null, 
      error: 'Database error when finding employee'
    };
  }
} 