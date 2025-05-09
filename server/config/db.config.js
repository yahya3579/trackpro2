const mysql = require('mysql2');

// Create a connection pool to MySQL database
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',  // Default XAMPP MySQL password is empty
  database: 'trackpro_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool.promise(); 