import { NextResponse } from 'next/server';
import db from '@/lib/db';
import jwt from 'jsonwebtoken';

// Get all holidays for a specific year
export async function GET(request) {
  try {
    // Get token from header
    const token = request.headers.get('x-auth-token');
    if (!token) {
      return NextResponse.json(
        { error: 'Authorization token is required' },
        { status: 401 }
      );
    }

    // Decode token to get user information
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, 'trackpro-secret-key');
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    // Determine user's organization_id
    let organizationId = null;
    if (decodedToken.role === 'organization_admin') {
      organizationId = decodedToken.id;
    } else {
      const [employee] = await db.query('SELECT organization_id FROM employees WHERE id = ?', [decodedToken.id]);
      if (employee.length > 0) {
        organizationId = employee[0].organization_id;
      }
    }
    if (!organizationId) {
      return NextResponse.json(
        { error: 'Could not determine user organization.' },
        { status: 403 }
      );
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year') || new Date().getFullYear();
    const type = searchParams.get('type');

    let query = 'SELECT * FROM holidays WHERE organization_id = ? AND year = ?';
    let params = [organizationId, year];

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    query += ' ORDER BY date ASC';

    const [rows] = await db.execute(query, params);

    return NextResponse.json({ holidays: rows });
  } catch (error) {
    console.error('Error fetching holidays:', error);
    return NextResponse.json(
      { error: 'Failed to fetch holidays' },
      { status: 500 }
    );
  }
}

// Add a new holiday
export async function POST(request) {
  try {
    // Get token from header
    const token = request.headers.get('x-auth-token');
    if (!token) {
      return NextResponse.json(
        { error: 'Authorization token is required' },
        { status: 401 }
      );
    }

    // Decode token to get user information
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, 'trackpro-secret-key');
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    // Determine user's organization_id
    let organizationId = null;
    if (decodedToken.role === 'organization_admin') {
      organizationId = decodedToken.id;
    } else {
      const [employee] = await db.query('SELECT organization_id FROM employees WHERE id = ?', [decodedToken.id]);
      if (employee.length > 0) {
        organizationId = employee[0].organization_id;
      }
    }
    if (!organizationId) {
      return NextResponse.json(
        { error: 'Could not determine user organization.' },
        { status: 403 }
      );
    }

    // Get data from request body
    const { title, date, type, session, assignedToAll } = await request.json();

    // Validate required fields (no organizationId from body)
    if (!title || !date || !type) {
      return NextResponse.json(
        { error: 'Title, date, and type are required' },
        { status: 400 }
      );
    }

    // Extract year from date
    const year = new Date(date).getFullYear();

    const [result] = await db.execute(
      'INSERT INTO holidays (title, date, year, type, session, assigned_to_all, organization_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, date, year, type, session || 'full_day', assignedToAll || false, organizationId]
    );

    // Get the created holiday
    const [rows] = await db.execute('SELECT * FROM holidays WHERE id = ? AND organization_id = ?', [result.insertId, organizationId]);

    return NextResponse.json({
      message: 'Holiday created successfully',
      holiday: rows[0]
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating holiday:', error);
    return NextResponse.json(
      { error: 'Failed to create holiday' },
      { status: 500 }
    );
  }
}

// Delete a holiday
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Holiday ID is required' },
        { status: 400 }
      );
    }

    await db.execute('DELETE FROM holidays WHERE id = ? AND organization_id = ?', [id, organizationId]);
    
    return NextResponse.json({ message: 'Holiday deleted successfully' });
  } catch (error) {
    console.error('Error deleting holiday:', error);
    return NextResponse.json(
      { error: 'Failed to delete holiday' },
      { status: 500 }
    );
  }
}

// Update a holiday
export async function PUT(request) {
  try {
    const { id, title, date, type, session, assignedToAll } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Holiday ID is required' },
        { status: 400 }
      );
    }

    await db.execute(
      'UPDATE holidays SET title = ?, date = ?, type = ?, session = ?, assigned_to_all = ? WHERE id = ?',
      [title, date, type, session, assignedToAll, id]
    );
    
    // Get the updated holiday
    const [rows] = await db.execute('SELECT * FROM holidays WHERE id = ? AND organization_id = ?', [id, organizationId]);
    
    return NextResponse.json({ 
      message: 'Holiday updated successfully',
      holiday: rows[0]
    });
  } catch (error) {
    console.error('Error updating holiday:', error);
    return NextResponse.json(
      { error: 'Failed to update holiday' },
      { status: 500 }
    );
  }
}