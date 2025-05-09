const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const db = require('./config/db.config');
const adminRoutes = require('./routes/admin.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// Test database connection
db.query('SELECT 1')
  .then(() => {
    console.log('Successfully connected to the database');
  })
  .catch(err => {
    console.error('Error connecting to the database:', err);
  });

// Simple route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to TrackPro API' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 