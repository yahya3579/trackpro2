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
    const statsOnly = searchParams.get('stats_only') === 'true';
    const statsMonthly = searchParams.get('stats_monthly') === 'true';
    
    // If stats_only is true, return organization stats
    if (statsOnly) {
      // Get total count of organizations
      const [orgCountResult] = await db.query(
        `SELECT COUNT(*) as total_organizations FROM organizations`
      );
      
      // Get total count of employees
      const [empCountResult] = await db.query(
        `SELECT COUNT(*) as total_employees FROM employees`
      );
      
      // Get organization with most employees
      const [topOrgResult] = await db.query(
        `SELECT o.name, COUNT(e.id) as employee_count 
         FROM organizations o
         JOIN employees e ON o.id = e.organization_id
         GROUP BY o.id
         ORDER BY employee_count DESC
         LIMIT 1`
      );
      
      // Get recent organizations
      const [recentOrgs] = await db.query(
        `SELECT id, name, email, created_at
         FROM organizations
         ORDER BY created_at DESC
         LIMIT 5`
      );
      
      return NextResponse.json({
        total_organizations: orgCountResult[0].total_organizations,
        total_employees: empCountResult[0].total_employees,
        top_organization: topOrgResult.length > 0 ? {
          name: topOrgResult[0].name,
          employee_count: topOrgResult[0].employee_count
        } : null,
        recent_organizations: recentOrgs.map(org => ({
          id: org.id,
          name: org.name,
          email: org.email,
          created_at: org.created_at
        }))
      });
    }
    
    // If stats_monthly is true, return count of organizations created per month for the last 12 months
    if (statsMonthly) {
      // Get count of organizations created per month for the last 12 months
      const [rows] = await db.query(`
        SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count
        FROM organizations
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
        GROUP BY month
        ORDER BY month ASC
      `);
      return NextResponse.json({
        monthly: rows
      });
    }
    
    // Search condition
    const searchCondition = search ? 
      'WHERE name LIKE ? OR email LIKE ?' : 
      '';
    const searchQueryParams = search ? 
      [`%${search}%`, `%${search}%`] : 
      [];
    
    // Query organizations with pagination
    const [organizations] = await db.query(
      `SELECT o.id, o.name, o.email, o.logo, o.created_at,
         (SELECT COUNT(*) FROM employees WHERE organization_id = o.id) as employee_count
       FROM organizations o
       ${searchCondition}
       ORDER BY o.created_at DESC
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
        photoUrl: org.logo,
        createdAt: org.created_at,
        employeeCount: org.employee_count || 0
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