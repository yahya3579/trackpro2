import { NextResponse } from 'next/server';
import db from '../../../../lib/db';
import { withAuth } from '../../../../lib/auth';

// Handler for GET request - Get organization by ID
async function handleGet(request, { params }) {
  try {
    const { id } = params;
    
    // Query the database to get organization data
    const [organizations] = await db.query(
      'SELECT id, name, email, logo FROM organizations WHERE id = ?',
      [id]
    );
    
    if (organizations.length === 0) {
      return NextResponse.json({ message: 'Organization not found' }, { status: 404 });
    }
    
    const organization = organizations[0];
    
    // Return organization data
    return NextResponse.json({
      organization: {
        id: organization.id,
        name: organization.name,
        email: organization.email,
        photoUrl: organization.logo
      }
    });
  } catch (error) {
    console.error('Get organization error:', error);
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}

// Handler for PUT request - Update organization by ID
async function handlePut(request, { params }) {
  try {
    const { id } = params;
    const { name } = await request.json();
    
    // Validate the request
    if (!name) {
      return NextResponse.json({ message: 'Organization name is required' }, { status: 400 });
    }
    
    // Check if the authenticated user is allowed to update this organization
    const userId = request.user.id;
    if (userId !== parseInt(id) && request.user.role !== 'super_admin') {
      return NextResponse.json({ 
        message: 'You are not authorized to update this organization' 
      }, { status: 403 });
    }
    
    // Update the organization in the database
    await db.query(
      'UPDATE organizations SET name = ? WHERE id = ?',
      [name, id]
    );
    
    // Get the updated organization
    const [organizations] = await db.query(
      'SELECT id, name, email, logo FROM organizations WHERE id = ?',
      [id]
    );
    
    if (organizations.length === 0) {
      return NextResponse.json({ message: 'Organization not found' }, { status: 404 });
    }
    
    const organization = organizations[0];
    
    // Return updated organization data
    return NextResponse.json({
      message: 'Organization updated successfully',
      organization: {
        id: organization.id,
        name: organization.name,
        email: organization.email,
        photoUrl: organization.logo
      }
    });
  } catch (error) {
    console.error('Update organization error:', error);
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}

export const GET = withAuth(handleGet);
export const PUT = withAuth(handlePut); 