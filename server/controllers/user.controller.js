const db = require('../config/db.config');

/**
 * Get user profile data
 */
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    
    if (userRole === 'super_admin') {
      // Get super admin info
      const [admins] = await db.query('SELECT id, username, name, email FROM super_admins WHERE id = ?', [userId]);
      
      if (admins.length === 0) {
        return res.status(404).json({ message: 'Admin not found' });
      }

      const admin = admins[0];

      // Return admin info
      return res.json({
        user: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          username: admin.username,
          role: 'super_admin'
        }
      });
    } else {
      // Query the database to get organization information
      const [users] = await db.query('SELECT id, name, email FROM organizations WHERE id = ?', [userId]);
      
      if (users.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      const user = users[0];

      // Return user info
      return res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: 'organization_admin'
        }
      });
    }
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 