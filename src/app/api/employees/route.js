import { NextResponse } from 'next/server';
import crypto from 'crypto';
import db from '../../../lib/db';
import { withAuth } from '../../../lib/auth';
import { sendEmail, generateInviteEmailTemplate } from '../../../lib/email';

// Get all employees (with pagination)
async function getEmployees(request) {
  try {
    const user = request.user;
    
    // Parse URL params for pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;
    const search = searchParams.get('search') || '';
    
    // Get organization ID based on user role
    let orgId;
    if (user.role === 'organization_admin') {
      orgId = user.id;
    } else if (user.role === 'super_admin') {
      // If super_admin, check if org_id is specified in the query
      orgId = searchParams.get('org_id');
      if (!orgId) {
        return NextResponse.json({ message: 'Organization ID required for super admin' }, { status: 400 });
      }
    } else {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }
    
    // Query with pagination and search
    let query = `
      SELECT id, name, email, position, department, phone, hire_date, status, created_at, updated_at
      FROM employees 
      WHERE org_id = ?
    `;
    
    let params = [orgId];
    
    // Add search condition if search term provided
    if (search) {
      query += ` AND (name LIKE ? OR email LIKE ? OR position LIKE ? OR department LIKE ?)`;
      const searchTerm = `%${search}%`;
      params = [...params, searchTerm, searchTerm, searchTerm, searchTerm];
    }
    
    // Add pagination
    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params = [...params, limit, offset];
    
    // Execute query
    const [employees] = await db.query(query, params);
    
    // Get total count for pagination
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM employees WHERE org_id = ?`,
      [orgId]
    );
    
    const totalEmployees = countResult[0].total;
    const totalPages = Math.ceil(totalEmployees / limit);
    
    return NextResponse.json({
      employees,
      pagination: {
        page,
        limit,
        totalEmployees,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}

// Create a new employee invitation
async function createEmployee(request) {
  try {
    const user = request.user;
    const { name, email, position, department, phone } = await request.json();
    
    // Validate required fields
    if (!name || !email) {
      return NextResponse.json({ message: 'Name and email are required' }, { status: 400 });
    }
    
    // Get organization ID based on user role
    let orgId;
    if (user.role === 'organization_admin') {
      orgId = user.id;
    } else if (user.role === 'super_admin' && user.org_id) {
      orgId = user.org_id;
    } else {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }
    
    // Check if employee with this email already exists
    const [existingEmployees] = await db.query(
      'SELECT * FROM employees WHERE email = ?',
      [email]
    );
    
    if (existingEmployees.length > 0) {
      return NextResponse.json({ message: 'Employee with this email already exists' }, { status: 400 });
    }
    
    // Generate invite token
    const inviteToken = crypto.randomBytes(32).toString('hex');
    
    // Set invite expiry to 7 days from now
    const inviteExpiry = new Date();
    inviteExpiry.setDate(inviteExpiry.getDate() + 7);
    
    // Insert new employee
    const [result] = await db.query(
      `INSERT INTO employees 
       (name, email, position, department, phone, org_id, status, invite_token, invite_expiry) 
       VALUES (?, ?, ?, ?, ?, ?, 'invited', ?, ?)`,
      [name, email, position, department, phone, orgId, inviteToken, inviteExpiry]
    );
    
    // Get organization name
    const [orgResult] = await db.query(
      'SELECT name FROM organizations WHERE id = ?',
      [orgId]
    );
    
    const orgName = orgResult[0]?.name || 'Our Company';
    
    // Send invitation email
    const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/invite/accept?token=${inviteToken}`;
    
    // Create beautiful HTML email
    const htmlEmail = generateInviteEmailTemplate({
      recipientName: name,
      organizationName: orgName,
      inviteLink,
      expiryDays: 7
    });
    
    await sendEmail({
      to: email,
      subject: `Invitation to join ${orgName} on TrackPro`,
      text: `Hello ${name}, you have been invited to join ${orgName} on TrackPro. Please use the following link to accept the invitation: ${inviteLink}. This link is valid for 7 days.`,
      html: htmlEmail
    });
    
    return NextResponse.json({
      message: 'Employee invited successfully',
      employee: {
        id: result.insertId,
        name,
        email,
        position,
        department,
        phone,
        status: 'invited',
        created_at: new Date()
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating employee:', error);
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}

export const GET = withAuth(getEmployees);
export const POST = withAuth(createEmployee); 