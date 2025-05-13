/*
  This script imports existing images from the public/screenshots folder
  into the screenshots database.
*/

import db from '@/lib/db';
import fs from 'fs';
import path from 'path';
import { parseISO, subDays, format } from 'date-fns';

// Storage locations - ensure these match the route.js
const SCREENSHOT_DIR = path.join(process.cwd(), 'public/screenshots');
const SCREENSHOT_PATH = '/screenshots'; // Path to store in DB (relative to public)

// Valid image extensions
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

// Function to check if a file is an image
function isImageFile(filename) {
  const ext = path.extname(filename).toLowerCase();
  return IMAGE_EXTENSIONS.includes(ext);
}

// List all image files in the screenshots directory
async function listExistingImages() {
  try {
    if (!fs.existsSync(SCREENSHOT_DIR)) {
      console.error(`Screenshot directory does not exist: ${SCREENSHOT_DIR}`);
      return [];
    }

    const files = fs.readdirSync(SCREENSHOT_DIR);
    const imageFiles = files.filter(file => isImageFile(file));
    
    console.log(`Found ${imageFiles.length} image files in ${SCREENSHOT_DIR}`);
    return imageFiles;
  } catch (error) {
    console.error('Error listing image files:', error);
    return [];
  }
}

// Function to check if an image is already in the database
async function isImageInDatabase(filename) {
  try {
    const [rows] = await db.query(
      'SELECT id FROM screenshots WHERE url LIKE ?',
      [`%${filename}%`]
    );
    return rows.length > 0;
  } catch (error) {
    console.error(`Error checking database for image ${filename}:`, error);
    return true; // Assume it exists to avoid duplicates
  }
}

// Function to distribute timestamps over the past week (for demo purposes)
function generateTimestamp(index, totalImages) {
  const now = new Date();
  const oneWeekAgo = subDays(now, 7);
  
  // Calculate a time point between one week ago and now
  const timeRatio = index / (totalImages - 1 || 1);
  const timeDifference = now.getTime() - oneWeekAgo.getTime();
  const timePoint = oneWeekAgo.getTime() + (timeDifference * timeRatio);
  
  return new Date(timePoint);
}

// Main function to import existing images
export async function importExistingImages() {
  try {
    // Get list of employees
    const [employees] = await db.query(
      'SELECT id FROM employees WHERE status = "active" OR status = "activated" LIMIT 10'
    );
    
    if (employees.length === 0) {
      console.error('No active employees found in database');
      return { success: false, message: 'No active employees found' };
    }
    
    // Get list of images
    const imageFiles = await listExistingImages();
    if (imageFiles.length === 0) {
      return { success: false, message: 'No image files found in screenshots directory' };
    }
    
    let importedCount = 0;
    
    // Process each image
    for (let i = 0; i < imageFiles.length; i++) {
      const filename = imageFiles[i];
      
      // Skip if already in database
      if (await isImageInDatabase(filename)) {
        console.log(`Skipping ${filename} - already in database`);
        continue;
      }
      
      // Assign to a random employee
      const employeeIndex = Math.floor(Math.random() * employees.length);
      const employeeId = employees[employeeIndex].id;
      
      // Generate a timestamp (for demo purposes, distribute over past week)
      const timestamp = generateTimestamp(i, imageFiles.length);
      const formattedTimestamp = format(timestamp, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
      
      // Create URL path for database (relative to public folder)
      const dbPath = path.posix.join(SCREENSHOT_PATH, filename);
      
      // Insert into database
      await db.query(
        `INSERT INTO screenshots (employee_id, url, timestamp, created_at)
         VALUES (?, ?, ?, NOW())`,
        [employeeId, dbPath, formattedTimestamp]
      );
      
      importedCount++;
      console.log(`Imported ${filename} for employee ${employeeId} with timestamp ${formattedTimestamp}`);
    }
    
    return {
      success: true,
      message: `Successfully imported ${importedCount} of ${imageFiles.length} images`
    };
  } catch (error) {
    console.error('Error importing existing images:', error);
    return { success: false, error: error.message };
  }
}

// If this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  importExistingImages()
    .then(result => {
      console.log('Import result:', result);
      process.exit(0);
    })
    .catch(error => {
      console.error('Import error:', error);
      process.exit(1);
    });
}

// Export for external use
export default importExistingImages; 