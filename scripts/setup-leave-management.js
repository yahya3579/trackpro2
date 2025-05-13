require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function main() {
  let connection;
  
  try {
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      multipleStatements: true
    });
    
    console.log('Connected to database successfully.');
    
    // Read schema file
    const schemaPath = path.join(__dirname, '..', 'src', 'app', 'api', 'leave-management', 'schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute schema SQL
    console.log('Creating leave management tables...');
    await connection.query(schemaSQL);
    console.log('Tables created successfully.');
    
    // Call seed API to populate data
    console.log('Seeding leave management data...');
    const seedResponse = await fetch('http://localhost:3000/api/leave-management/seed');
    const seedResult = await seedResponse.json();
    
    if (seedResult.success) {
      console.log('Leave management data seeded successfully.');
    } else {
      console.error('Error seeding leave management data:', seedResult.error);
    }
    
    console.log('Setup complete! The leave management system is ready to use.');
    
  } catch (error) {
    console.error('Error setting up leave management:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed.');
    }
  }
}

main(); 