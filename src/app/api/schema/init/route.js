import { NextResponse } from 'next/server';
import { createEmployeesTable } from '../employees-table';

export async function GET() {
  try {
    // Only allow this in development environment
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ 
        message: 'Schema initialization is only available in development environment' 
      }, { status: 403 });
    }
    
    const employeesResult = await createEmployeesTable();
    
    if (!employeesResult.success) {
      return NextResponse.json({ message: 'Failed to initialize database schema', error: employeesResult.error }, { status: 500 });
    }
    
    return NextResponse.json({
      message: 'Database schema initialized successfully'
    });
  } catch (error) {
    console.error('Schema initialization error:', error);
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
} 