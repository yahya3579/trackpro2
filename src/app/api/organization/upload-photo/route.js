import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import db from '../../../../lib/db';
import { withAuth } from '../../../../lib/auth';

// Profile photos directory - relative to the public directory
const PROFILE_PHOTOS_PATH = 'images';
const PROFILE_PHOTOS_DIR = path.join(process.cwd(), 'public', PROFILE_PHOTOS_PATH);

async function handler(request) {
  try {
    // Check if user is an organization admin
    if (request.user.role !== 'organization_admin') {
      return NextResponse.json({
        message: 'Only organization admins can upload profile photos'
      }, { status: 403 });
    }
    
    // Get user ID from the authenticated token
    const userId = request.user.id;
    
    // Get form data with the image file
    const formData = await request.formData();
    const file = formData.get('profileImage');
    
    if (!file) {
      return NextResponse.json({ message: 'No image file provided' }, { status: 400 });
    }
    
    // Validate file type (support common image formats)
    const fileType = file.type;
    if (!fileType.startsWith('image/')) {
      return NextResponse.json({ message: 'File must be an image' }, { status: 400 });
    }
    
    // Extract file extension from MIME type
    const fileExtension = fileType.split('/')[1];
    
    // Generate unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `org_${userId}_${timestamp}.${fileExtension}`;
    const filePath = path.join(PROFILE_PHOTOS_DIR, fileName);
    
    // Ensure the directory exists
    try {
      await mkdir(PROFILE_PHOTOS_DIR, { recursive: true });
    } catch (mkdirError) {
      console.error('Error creating directory:', mkdirError);
    }
    
    // Get the file contents as buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Write the file to disk
    await writeFile(filePath, buffer);
    
    // Generate URL path for the database (relative to public folder)
    const photoUrl = `/${PROFILE_PHOTOS_PATH}/${fileName}`;
    
    // Update the organization's photo_url in the database
    await db.query(
      'UPDATE organizations SET logo = ? WHERE id = ?',
      [photoUrl, userId]
    );
    
    return NextResponse.json({
      message: 'Profile photo uploaded successfully',
      photoUrl: photoUrl
    });
  } catch (error) {
    console.error('Upload photo error:', error);
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}

export const POST = withAuth(handler); 