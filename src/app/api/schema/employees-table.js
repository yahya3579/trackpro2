import db from '../../../lib/db';

export async function createEmployeesTable() {
  try {
    // Create employees table if it doesn't exist
    await db.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        position VARCHAR(255),
        department VARCHAR(255),
        phone VARCHAR(50),
        hire_date DATE,
        status ENUM('active', 'invited', 'inactive') DEFAULT 'invited',
        org_id INT,
        invite_token VARCHAR(255),
        invite_expiry DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE
      )
    `);
    
    console.log('Employees table created or already exists');
    return { success: true };
  } catch (error) {
    console.error('Error creating employees table:', error);
    return { success: false, error: error.message };
  }
} 