import { NextResponse } from 'next/server';
import db from '@/lib/db';

// GET - Fetch all employees
export async function GET(request) {
  try {
    // Get token from header
    const token = request.headers.get('x-auth-token');
    if (!token) {
      return NextResponse.json({ 
        success: false, 
        error: 'Authorization token is required' 
      }, { status: 401 });
    }
    
    // Check if employees table exists
    try {
      const [checkTable] = await db.query('SHOW TABLES LIKE "employees"');
      if (checkTable.length === 0) {
        return NextResponse.json({ 
          success: false, 
          error: 'Employees table does not exist',
          debug: true
        }, { status: 500 });
      }
    } catch (tableError) {
      console.error('Error checking employees table:', tableError);
    }
    
    // Get query parameters if needed
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const department = searchParams.get('department');
    
    // Check table structure (optional)
    let columns = [];
    try {
      const [checkColumns] = await db.query('SHOW COLUMNS FROM employees');
      columns = checkColumns.map(col => col.Field);
      console.log('Available columns:', columns);
    } catch (columnError) {
      console.error('Error getting table structure:', columnError);
    }
    
    // Build query based on available columns
    let selectColumns = 'id';
    
    // These are the columns we want
    const wantedColumns = [
        'id', 'employee_name', 'email', 'role', 'team_name', 'status', 'joined_date'
    ];
    
    // Include only columns that exist in the table
    const availableColumns = wantedColumns.filter(col => columns.includes(col));
    
    if (availableColumns.length > 0) {
      selectColumns += ', ' + availableColumns.join(', ');
    }
    
    // Build query
    let query = `
      SELECT ${selectColumns}
      FROM employees
    `;
    
    // Add filters if provided
    const queryParams = [];
    const conditions = [];
    
    if (status && columns.includes('status')) {
      conditions.push('status = ?');
      queryParams.push(status);
    }
    
    if (department && columns.includes('department')) {
      conditions.push('department = ?');
      queryParams.push(department);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    // Order by created_at if it exists, otherwise by id
    if (columns.includes('created_at')) {
      query += ' ORDER BY created_at DESC';
    } else {
      query += ' ORDER BY id DESC';
    }
    
    console.log('Executing query:', query);
    
    // Execute query
    const [employees] = await db.query(query, queryParams);
    
    // Map results to ensure all expected fields exist (even if as null)
    const mappedEmployees = employees.map(emp => {
      const employee = { ...emp };
      
      // Ensure these fields always exist
      wantedColumns.forEach(col => {
        if (employee[col] === undefined) {
          employee[col] = null;
        }
      });
      
      // Handle name fields specially if they don't exist
      if (!employee.first_name && !employee.last_name && employee.employee_name) {
        // If we have employee_name but not first/last name, split it
        const nameParts = employee.employee_name.split(' ');
        employee.first_name = nameParts[0] || '';
        employee.last_name = nameParts.slice(1).join(' ') || '';
      }
      
      // Map role to position if needed
      if (!employee.position && employee.role) {
        employee.position = employee.role;
      }
      
      // Map team_name to department if needed
      if (!employee.department && employee.team_name) {
        employee.department = employee.team_name;
      }
      
      // Map joined_date to hire_date if needed
      if (!employee.hire_date && employee.joined_date) {
        employee.hire_date = employee.joined_date;
      }
      
      // Format date fields if they exist
      if (employee.joined_date && employee.joined_date instanceof Date) {
        employee.joined_date = employee.joined_date.toISOString().split('T')[0];
      }
      if (employee.hire_date && employee.hire_date instanceof Date) {
        employee.hire_date = employee.hire_date.toISOString().split('T')[0];
      }
      
      // Ensure status is set to a default if not present
      if (!employee.status) {
        employee.status = 'invited';
      }
      
      return employee;
    });
    
    return NextResponse.json({
      success: true,
      employees: mappedEmployees
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Server error', 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
} 