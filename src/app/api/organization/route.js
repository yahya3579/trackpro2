import { NextResponse } from 'next/server';
import db from '../../../lib/db';
import { withAuth } from '../../../lib/auth';

// GET - Get all organizations (for super admins)
async function handleGet(request) {
  try {
    // Only super admins can list all organizations
    if (request.user.role !== 'super_admin') {
      return NextResponse.json({ 
        message: 'Only super admins can access this endpoint' 
      }, { status: 403 });
    }
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const offset = (page - 1) * limit;
    
    // Search condition
    const searchCondition = search ? 
      'WHERE name LIKE ? OR email LIKE ?' : 
      '';
    const searchQueryParams = search ? 
      [`%${search}%`, `%${search}%`] : 
      [];
    
    // Query organizations with pagination
    const [organizations] = await db.query(
      `SELECT id, name, email, photo_url, created_at
       FROM organizations
       ${searchCondition}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...searchQueryParams, limit, offset]
    );
    
    // Get total count for pagination
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total
       FROM organizations
       ${searchCondition}`,
      searchQueryParams
    );
    
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);
    
    return NextResponse.json({
      organizations: organizations.map(org => ({
        id: org.id,
        name: org.name,
        email: org.email,
        photoUrl: org.photo_url,
        createdAt: org.created_at
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    });
  } catch (error) {
    console.error('Get organizations error:', error);
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}

// POST - Create a new organization (for super admins)
async function handlePost(request) {
  try {
    // Only super admins can create organizations
    if (request.user.role !== 'super_admin') {
      return NextResponse.json({ 
        message: 'Only super admins can create organizations' 
      }, { status: 403 });
    }
    
    const { name, email, password } = await request.json();
    
    // Validate request
    if (!name || !email || !password) {
      return NextResponse.json({ 
        message: 'Name, email, and password are required' 
      }, { status: 400 });
    }
    
    // Check if email already exists
    const [existingUsers] = await db.query(
      'SELECT id FROM organizations WHERE email = ?',
      [email]
    );
    
    if (existingUsers.length > 0) {
      return NextResponse.json({ 
        message: 'Email already in use' 
      }, { status: 400 });
    }
    
    // Create new organization
    const [result] = await db.query(
      'INSERT INTO organizations (name, email, password) VALUES (?, ?, ?)',
      [name, email, password] // In a real app, password should be hashed
    );
    
    const orgId = result.insertId;
    
    return NextResponse.json({
      message: 'Organization created successfully',
      organization: {
        id: orgId,
        name,
        email
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Create organization error:', error);
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}

export const GET = withAuth(handleGet);
export const POST = withAuth(handlePost); 