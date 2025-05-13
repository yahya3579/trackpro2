/*
  This file simulates the generation of screenshot data
  to populate the database with sample records for testing.
*/

import db from '@/lib/db';
import { randomUUID } from 'crypto';
import { subDays, subHours, subMinutes, addMinutes, format } from 'date-fns';
import fs from 'fs';
import path from 'path';

// Storage locations - ensure these match the API route
const SCREENSHOT_DIR = path.join(process.cwd(), 'public/screenshots');
const SCREENSHOT_PATH = '/screenshots'; // Path to store in DB (relative to public)

// Array of sample screenshot URLs for fallback/remote images
const SAMPLE_SCREENSHOT_URLS = [
  'https://images.unsplash.com/photo-1587620962725-abab7fe55159',
  'https://images.unsplash.com/photo-1593642532744-d377ab507dc8',
  'https://images.unsplash.com/photo-1550439062-609e1531270e',
  'https://images.unsplash.com/photo-1531403009284-440f080d1e12',
  'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d',
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d',
  'https://images.unsplash.com/photo-1563986768609-322da13575f3',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97',
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c',
  'https://images.unsplash.com/photo-1596003906949-67221c37965c'
];

// Ensure screenshot directory exists
function ensureDirectoryExists() {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
    console.log(`Created screenshots directory: ${SCREENSHOT_DIR}`);
  }
}

// Function to get a reference to a screenshot
function getScreenshotReference() {
  // Decide randomly whether to use a remote URL or create a local file
  const useRemoteUrl = Math.random() > 0.5;
  
  if (useRemoteUrl) {
    // Return a remote Unsplash URL
    const randomIndex = Math.floor(Math.random() * SAMPLE_SCREENSHOT_URLS.length);
    return { url: SAMPLE_SCREENSHOT_URLS[randomIndex], isLocal: false };
  } else {
    // Create a placeholder local file with UUID
    const fileId = randomUUID().substring(0, 8);
    const filename = `sample_screenshot_${fileId}.txt`;
    const filePath = path.join(SCREENSHOT_DIR, filename);
    
    // Create a placeholder file
    try {
      fs.writeFileSync(filePath, `This is a placeholder for screenshot ${fileId}`);
    } catch (error) {
      console.error(`Error creating placeholder file: ${error.message}`);
      // Fallback to remote URL
      const randomIndex = Math.floor(Math.random() * SAMPLE_SCREENSHOT_URLS.length);
      return { url: SAMPLE_SCREENSHOT_URLS[randomIndex], isLocal: false };
    }
    
    // Return the path relative to public directory
    return { url: path.posix.join(SCREENSHOT_PATH, filename), isLocal: true };
  }
}

// Function to generate timestamps at 30-minute intervals
function generateTimestamps(startDate, count) {
  const timestamps = [];
  let currentDate = new Date(startDate);
  
  for (let i = 0; i < count; i++) {
    timestamps.push(new Date(currentDate));
    // Add 30 minutes for next screenshot
    currentDate = addMinutes(currentDate, 30);
  }
  
  return timestamps;
}

// Generate screenshots for a specific employee
async function generateScreenshotsForEmployee(employeeId, startDate, count) {
  try {
    const timestamps = generateTimestamps(startDate, count);
    let createdCount = 0;
    
    for (const timestamp of timestamps) {
      const { url, isLocal } = getScreenshotReference();
      const formattedTimestamp = format(timestamp, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
      
      // Insert the screenshot record
      await db.query(
        `INSERT INTO screenshots (employee_id, url, timestamp, created_at)
         VALUES (?, ?, ?, NOW())`,
        [employeeId, url, formattedTimestamp]
      );
      
      createdCount++;
      console.log(`Added screenshot for employee ${employeeId} at ${formattedTimestamp} (${isLocal ? 'local file' : 'remote URL'})`);
    }
    
    return { success: true, count: createdCount };
  } catch (error) {
    console.error(`Error generating screenshots for employee ${employeeId}:`, error);
    return { success: false, error: error.message };
  }
}

// Main function to generate sample screenshot data
export async function generateSampleScreenshots() {
  try {
    // Ensure the screenshots directory exists
    ensureDirectoryExists();
    
    // Fetch all active employees
    const [employees] = await db.query(
      `SELECT id FROM employees WHERE status = 'active' OR status = 'activated' LIMIT 10`
    );
    
    if (employees.length === 0) {
      console.log('No active employees found');
      return { success: false, message: 'No active employees found' };
    }
    
    console.log(`Generating screenshots for ${employees.length} employees`);
    
    // Generate screenshots for the past week, every 30 minutes during work hours (9am-5pm)
    const oneWeekAgo = subDays(new Date(), 7);
    const startOfWorkDay = new Date(oneWeekAgo);
    startOfWorkDay.setHours(9, 0, 0, 0); // 9:00 AM
    
    let totalCount = 0;
    
    for (const employee of employees) {
      // Generate 16 screenshots per day (every 30 min from 9am-5pm) for 5 workdays
      const countPerEmployee = 16 * 5; // 16 per day for 5 days
      const result = await generateScreenshotsForEmployee(employee.id, startOfWorkDay, countPerEmployee);
      
      if (result.success) {
        totalCount += result.count;
      }
    }
    
    return {
      success: true,
      message: `Generated ${totalCount} screenshot records for ${employees.length} employees`
    };
  } catch (error) {
    console.error('Error generating sample screenshots:', error);
    return { success: false, error: error.message };
  }
}

// If this file is executed directly (for testing)
if (typeof require !== 'undefined' && require.main === module) {
  generateSampleScreenshots()
    .then(result => {
      console.log('Result:', result);
      process.exit(0);
    })
    .catch(error => {
      console.error('Error:', error);
      process.exit(1);
    });
} 