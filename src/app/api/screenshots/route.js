import { NextResponse } from 'next/server';
import db from '@/lib/db';
import path from 'path';
import fs from 'fs';

// Constants
const SCREENSHOTS_PUBLIC_PATH = '/screenshots'; // Path relative to the public folder

// Helper function to convert DB path to full URL path
function formatImageUrl(url) {
  // If URL is already a full URL (starts with http), return as is
  if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
    return url;
  }
  
  // Otherwise, assume it's a path relative to the public folder
  // and convert to the proper path for the frontend
  return url ? `${SCREENSHOTS_PUBLIC_PATH}/${path.basename(url)}` : null;
}

// GET endpoint to fetch screenshots
export async function GET(request) {
  try {
    // Get token from header (for authentication)
    const token = request.headers.get('x-auth-token');
    if (!token) {
      return NextResponse.json({ 
        success: false, 
        error: 'Authorization token is required' 
      }, { status: 401 });
    }
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employee_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const page = parseInt(searchParams.get('page')) || 1;
    const pageSize = parseInt(searchParams.get('page_size')) || 20;
    const offset = (page - 1) * pageSize;
    
    // Build the base query
    let query = `
      SELECT s.id, s.employee_id, s.url, s.timestamp, s.created_at, 
             e.employee_name, e.email, e.role, e.team_name, e.status
      FROM screenshots s
      LEFT JOIN employees e ON s.employee_id = e.id
      WHERE 1=1
    `;
    
    const queryParams = [];
    
    // Add filters to the query if provided
    if (employeeId) {
      query += ' AND s.employee_id = ?';
      queryParams.push(employeeId);
    }
    
    if (startDate) {
      query += ' AND s.timestamp >= ?';
      queryParams.push(startDate);
    }
    
    if (endDate) {
      query += ' AND s.timestamp <= ?';
      queryParams.push(endDate);
    }
    
    // Add order by and pagination
    query += ' ORDER BY s.timestamp DESC LIMIT ? OFFSET ?';
    queryParams.push(pageSize, offset);
    
    // Execute the query
    const [screenshots] = await db.query(query, queryParams);
    
    // Format image URLs for frontend
    const formattedScreenshots = screenshots.map(screenshot => ({
      ...screenshot,
      url: formatImageUrl(screenshot.url)
    }));
    
    // Get total count for pagination
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM screenshots s WHERE 1=1
       ${employeeId ? ' AND s.employee_id = ?' : ''}
       ${startDate ? ' AND s.timestamp >= ?' : ''}
       ${endDate ? ' AND s.timestamp <= ?' : ''}`,
      queryParams.slice(0, -2) // Remove limit and offset
    );
    
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / pageSize);
    
    return NextResponse.json({
      success: true,
      screenshots: formattedScreenshots,
      pagination: {
        total,
        page,
        pageSize,
        totalPages
      }
    });
    
  } catch (error) {
    console.error('Error fetching screenshots:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch screenshots', 
      message: error.message 
    }, { status: 500 });
  }
}

// POST endpoint to create a new screenshot
export async function POST(request) {
  try {
    // Get token from header
    const token = request.headers.get('x-auth-token');
    if (!token) {
      return NextResponse.json({ 
        success: false, 
        error: 'Authorization token is required' 
      }, { status: 401 });
    }
    
    // Get the request body
    const { employee_id, url, timestamp } = await request.json();
    
    // Validate required fields
    if (!employee_id || !url) {
      return NextResponse.json({
        success: false,
        error: 'Employee ID and URL are required'
      }, { status: 400 });
    }
    
    // Check if employee exists
    const [employees] = await db.query(
      'SELECT id FROM employees WHERE id = ?',
      [employee_id]
    );
    
    if (employees.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Employee not found'
      }, { status: 404 });
    }
    
    // Use current timestamp if not provided
    const screenshotTimestamp = timestamp || new Date().toISOString();
    
    // Save the URL (which might be a path to a file in the public folder)
    // For uploaded files, url would be the path where it was saved
    const imageUrl = url;
    
    // Insert the screenshot into the database
    const [result] = await db.query(
      `INSERT INTO screenshots (employee_id, url, timestamp, created_at)
       VALUES (?, ?, ?, NOW())`,
      [employee_id, imageUrl, screenshotTimestamp]
    );
    
    return NextResponse.json({
      success: true,
      message: 'Screenshot created successfully',
      screenshot_id: result.insertId,
      url: formatImageUrl(imageUrl)
    });
    
  } catch (error) {
    console.error('Error creating screenshot:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create screenshot', 
      message: error.message 
    }, { status: 500 });
  }
}

// DELETE endpoint to delete a screenshot
export async function DELETE(request) {
  try {
    // Get token from header
    const token = request.headers.get('x-auth-token');
    if (!token) {
      return NextResponse.json({ 
        success: false, 
        error: 'Authorization token is required' 
      }, { status: 401 });
    }
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Screenshot ID is required'
      }, { status: 400 });
    }
    
    // Check if screenshot exists and get the URL
    const [screenshots] = await db.query(
      'SELECT id, url FROM screenshots WHERE id = ?',
      [id]
    );
    
    if (screenshots.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Screenshot not found'
      }, { status: 404 });
    }
    
    // Get URL to potentially delete the file
    const screenshotUrl = screenshots[0].url;
    
    // If the URL is a local file path, check if we need to delete the file
    if (screenshotUrl && !screenshotUrl.startsWith('http')) {
      // Construct the full path to the file
      const publicDir = path.join(process.cwd(), 'public');
      const filePath = path.join(publicDir, screenshotUrl);
      
      // Check if file exists and delete it
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          console.log(`Deleted file: ${filePath}`);
        } catch (fileError) {
          console.error(`Error deleting file ${filePath}:`, fileError);
          // Continue even if file deletion fails
        }
      }
    }
    
    // Delete the screenshot from the database
    await db.query(
      'DELETE FROM screenshots WHERE id = ?',
      [id]
    );
    
    return NextResponse.json({
      success: true,
      message: 'Screenshot deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting screenshot:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete screenshot', 
      message: error.message 
    }, { status: 500 });
  }
} 