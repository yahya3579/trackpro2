import { NextResponse } from 'next/server';
import seedSuperAdmins from '../seed-superadmins';

export async function GET() {
  try {
    // Only allow this in development environment
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ 
        message: 'Seed endpoint is only available in development environment' 
      }, { status: 403 });
    }
    
    const result = await seedSuperAdmins();
    
    if (result.success) {
      return NextResponse.json({ message: result.message });
    } else {
      return NextResponse.json({ message: 'Failed to seed data', error: result.error }, { status: 500 });
    }
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
} 