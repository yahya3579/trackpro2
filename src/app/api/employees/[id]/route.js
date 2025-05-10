import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { withAuth } from '../../../../lib/auth';

// Get a specific employee by ID
export async function GET(request, { params }) {
  try {
    const employeeId = params.id;
    
    if (!employeeId) {
      return NextResponse.json(
        { success: false, error: 'Employee ID is required' },
        { status: 400 }
      );
    }
    
    // Fetch employee data
    const [employees] = await db.query(
      `SELECT id, first_name, last_name, email, position, department, phone, hire_date, status, 
              created_at, updated_at
       FROM employees 
       WHERE id = ?`,
      [employeeId]
    );
    
    if (employees.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Employee not found' },
        { status: 404 }
      );
    }
    
    // Combine first_name and last_name into name for UI consistency
    const employee = employees[0];
    employee.name = `${employee.first_name}${employee.last_name ? ' ' + employee.last_name : ''}`;
    
    // Return employee data
    return NextResponse.json({
      success: true,
      data: employee
    });
  } catch (error) {
    console.error('Error fetching employee:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch employee data' },
      { status: 500 }
    );
  }
}

// Update an employee
async function updateEmployee(request, { params }) {
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
async function deleteEmployee(request, { params }) {
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

export const PATCH = withAuth(updateEmployee);
export const DELETE = withAuth(deleteEmployee); 