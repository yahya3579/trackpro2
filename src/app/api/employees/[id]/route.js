import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function DELETE(request, { params }) {
  try {
    const id = params.id;
    
    // Check if id exists
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Employee ID is required' },
        { status: 400 }
      );
    }
    
    // Begin transaction to ensure all operations succeed or fail together
    await db.query('START TRANSACTION');
    
    // Update all tables that might reference this employee
    await db.query('UPDATE leave_requests SET approved_by = NULL WHERE approved_by = ?', [id]);
    await db.query('UPDATE leave_requests SET employee_id = NULL WHERE employee_id = ?', [id]);
    await db.query('UPDATE screenshots SET employee_id = NULL WHERE employee_id = ?', [id]);
    await db.query('UPDATE time_entries SET employee_id = NULL WHERE employee_id = ?', [id]);
    
    // Now it's safe to delete the employee
    await db.query('DELETE FROM employees WHERE id = ?', [id]);
    
    // Commit the transaction
    await db.query('COMMIT');
    
    return NextResponse.json({ success: true, message: 'Employee deleted' });
  } catch (error) {
    // Rollback the transaction in case of error
    await db.query('ROLLBACK');
    console.error('Error deleting employee:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
} 