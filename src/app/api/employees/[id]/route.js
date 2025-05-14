import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function DELETE(request, { params }) {
  const { id } = params;
  try {
    // Optionally: check for authentication/authorization here
    await db.query('DELETE FROM employees WHERE id = ?', [id]);
    return NextResponse.json({ success: true, message: 'Employee deleted' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
} 