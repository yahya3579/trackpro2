import { NextResponse } from 'next/server';
import db from '@/lib/db';

// GET - Freehand: No auth, just login_id query param
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const loginId = searchParams.get('login_id');
    if (!loginId) {
      return NextResponse.json({ success: false, error: 'login_id is required' }, { status: 400 });
    }
    // Try to find employee by id or email
    let employeeId = null;
    const [empById] = await db.query('SELECT id FROM employees WHERE id = ? OR email = ?', [loginId, loginId]);
    if (empById.length > 0) {
      employeeId = empById[0].id;
    } else {
      return NextResponse.json({ success: false, error: 'Employee not found' }, { status: 404 });
    }
    // Fetch sessions summary for timesheet
    const [rows] = await db.query(
      'SELECT date, total_hours, sessions FROM time_tracking WHERE employee_id = ? ORDER BY date DESC',
      [employeeId]
    );
    // Format sessions as array and count
    const result = rows.map(row => {
      let sessionsArr = [];
      try {
        sessionsArr = row.sessions ? JSON.parse(row.sessions) : [];
      } catch {
        sessionsArr = [];
      }
      return {
        date: row.date,
        total_hours: row.total_hours,
        sessions_count: Array.isArray(sessionsArr) ? sessionsArr.length : 0
      };
    });
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching sessions summary:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch sessions summary' }, { status: 500 });
  }
} 