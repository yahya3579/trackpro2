const bcrypt = require('bcryptjs');
const db = require('./config/db.config');

async function seedSuperAdmins() {
  try {
    console.log('Starting super admin seed process...');

    // Check if table exists, create if not
    await db.query(`
      CREATE TABLE IF NOT EXISTS super_admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        username VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Ensured super_admins table exists');

    // Clear existing data (optional, remove if you want to keep existing data)
    await db.query('DELETE FROM super_admins');
    console.log('Cleared existing super admin data');

    // Generate hashed password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Insert dummy super admin users
    await db.query(`
      INSERT INTO super_admins (name, email, username, password) VALUES 
      (?, ?, ?, ?),
      (?, ?, ?, ?),
      (?, ?, ?, ?)
    `, [
      'Super Admin', 'superadmin@trackpro.com', 'superadmin', hashedPassword,
      'John Doe', 'john@trackpro.com', 'johndoe', hashedPassword,
      'Jane Smith', 'jane@trackpro.com', 'janesmith', hashedPassword
    ]);

    console.log('Successfully added super admin users with password: admin123');
    console.log('You can login with any of the following credentials:');
    console.log('- Email: superadmin@trackpro.com, Password: admin123');
    console.log('- Email: john@trackpro.com, Password: admin123');
    console.log('- Email: jane@trackpro.com, Password: admin123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding super admin users:', error);
    process.exit(1);
  }
}

// Run the seed function
seedSuperAdmins(); 