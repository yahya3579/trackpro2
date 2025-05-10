import { NextResponse } from 'next/server';
import db from '../../../../lib/db';
import { withAuth } from '../../../../lib/auth';

// Get a specific employee by ID
async function GET(request, { params }) {
  try {
    const employeeId = params.id;
    const user = request.user;
    
    // Verify employee belongs to user's organization
    let query = `
      SELECT e.id, e.name, e.email, e.position, e.department, e.phone, 
             e.hire_date, e.status, e.created_at, e.updated_at, e.org_id
      FROM employees e
      WHERE e.id = ?
    `;
    let queryParams = [employeeId];
    
    const [employees] = await db.query(query, queryParams);
    
    if (employees.length === 0) {
      return NextResponse.json({ message: 'Employee not found' }, { status: 404 });
    }
    
    const employee = employees[0];
    
    // Check if user has permission to access this employee
    if (user.role === 'organization_admin' && employee.org_id !== user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }
    
    // Remove sensitive fields before sending response
    delete employee.org_id;
    
    return NextResponse.json({ employee });
  } catch (error) {
    console.error('Error fetching employee details:', error);
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}

// Update an employee
async function PATCH(request, { params }) {
  try {
    const employeeId = params.id;
    const user = request.user;
    const updates = await request.json();
    
    // Check for allowed update fields
    const allowedUpdates = ['name', 'position', 'department', 'phone', 'status'];
    const updateFields = Object.keys(updates);
    
    const isValidUpdate = updateFields.every(field => allowedUpdates.includes(field));
    
    if (!isValidUpdate) {
      return NextResponse.json({ message: 'Invalid update fields' }, { status: 400 });
    }
    
    // Check if employee exists and belongs to user's organization
    const [checkResult] = await db.query(
      'SELECT org_id FROM employees WHERE id = ?',
      [employeeId]
    );
    
    if (checkResult.length === 0) {
      return NextResponse.json({ message: 'Employee not found' }, { status: 404 });
    }
    
    // Check if user has permission to update this employee
    if (user.role === 'organization_admin' && checkResult[0].org_id !== user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }
    
    // Build update query
    const updateValues = [];
    const updateParams = [];
    
    Object.entries(updates).forEach(([key, value]) => {
      if (allowedUpdates.includes(key)) {
        updateValues.push(`${key} = ?`);
        updateParams.push(value);
      }
    });
    
    // Add employee ID at the end
    updateParams.push(employeeId);
    
    // Execute update
    await db.query(
      `UPDATE employees SET ${updateValues.join(', ')} WHERE id = ?`,
      updateParams
    );
    
    // Get updated employee
    const [updatedEmployees] = await db.query(
      `SELECT id, name, email, position, department, phone, hire_date, 
              status, created_at, updated_at 
       FROM employees 
       WHERE id = ?`,
      [employeeId]
    );
    
    return NextResponse.json({
      message: 'Employee updated successfully',
      employee: updatedEmployees[0]
    });
  } catch (error) {
    console.error('Error updating employee:', error);
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}

// Delete an employee
async function DELETE(request, { params }) {
  try {
    const employeeId = params.id;
    const user = request.user;
    
    // Check if employee exists and belongs to user's organization
    const [checkResult] = await db.query(
      'SELECT * FROM employees WHERE id = ?',
      [employeeId]
    );
    
    if (checkResult.length === 0) {
      return NextResponse.json({ message: 'Employee not found' }, { status: 404 });
    }
    
    // Check if user has permission to delete this employee
    if (user.role === 'organization_admin' && checkResult[0].org_id !== user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }
    
    // Delete employee
    await db.query('DELETE FROM employees WHERE id = ?', [employeeId]);
    
    return NextResponse.json({
      message: 'Employee deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting employee:', error);
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}

export const GET = withAuth(GET);
export const PATCH = withAuth(PATCH);
export const DELETE = withAuth(DELETE); 