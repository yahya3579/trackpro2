import { NextResponse } from 'next/server';
import importExistingImages from '../import-existing';

// POST endpoint to trigger importing existing screenshots
export async function POST(request) {
  try {
    // Get token from header for authentication
    const token = request.headers.get('x-auth-token');
    if (!token) {
      return NextResponse.json({ 
        success: false, 
        error: 'Authorization token is required' 
      }, { status: 401 });
    }
    
    // Import the existing screenshots
    const result = await importExistingImages();
    
    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.message || 'Failed to import screenshots'
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: result.message,
      importedCount: result.importedCount || 0,
      totalImages: result.totalImages || 0
    });
    
  } catch (error) {
    console.error('Error in import API:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Server error', 
      message: error.message 
    }, { status: 500 });
  }
}

// GET endpoint to get status of imported screenshots
export async function GET(request) {
  try {
    // Get token from header for authentication
    const token = request.headers.get('x-auth-token');
    if (!token) {
      return NextResponse.json({ 
        success: false, 
        error: 'Authorization token is required' 
      }, { status: 401 });
    }
    
    // Here we could get statistics about imported screenshots
    // For now, we'll just return a simple message
    return NextResponse.json({
      success: true,
      message: 'Use POST to this endpoint to import existing screenshots from public/screenshots folder'
    });
    
  } catch (error) {
    console.error('Error in import API:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Server error', 
      message: error.message 
    }, { status: 500 });
  }
} 