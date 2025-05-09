const db = require('../config/db.config');
const bcrypt = require('bcryptjs');

// Grant super admin access to an organization user
exports.grantSuperAdminAccess = async (req, res) => {
  try {
    const { userId, email } = req.body;
    
    // Only existing super admins can grant access
    const requestingUser = req.user;
    if (requestingUser.role !== 'super_admin') {
      return res.status(403).json({ 
        message: 'Only super admins can grant super admin access' 
      });
    }

    // Verify if the user exists in organizations table
    const [users] = await db.query(
      'SELECT * FROM organizations WHERE id = ? OR email = ?', 
      [userId || 0, email || '']
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    // Check if user already has super admin access
    const [existingSuperAdmin] = await db.query(
      'SELECT * FROM super_admins WHERE email = ?', 
      [user.email]
    );

    if (existingSuperAdmin.length > 0) {
      return res.status(400).json({ message: 'User already has super admin access' });
    }

    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(tempPassword, salt);

    // Insert into super_admins table
    await db.query(
      'INSERT INTO super_admins (name, email, username, password, org_id, is_org_admin) VALUES (?, ?, ?, ?, ?, ?)',
      [user.name, user.email, user.email.split('@')[0], hashedPassword, user.id, true]
    );

    // Return success with the temporary password
    return res.status(200).json({
      message: 'Super admin access granted successfully',
      userEmail: user.email,
      tempPassword: tempPassword, // In a real app, you would email this instead of returning it
      note: 'Please ask the user to change this temporary password immediately'
    });
  } catch (error) {
    console.error('Error granting super admin access:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Revoke super admin access
exports.revokeSuperAdminAccess = async (req, res) => {
  try {
    console.log("Received revoke request with body:", req.body);
    
    const { email } = req.body;
    
    if (!email) {
      console.log("Email is missing in the request");
      return res.status(400).json({ message: 'Email is required to revoke super admin access' });
    }
    
    // Only existing super admins can revoke access
    const requestingUser = req.user;
    if (requestingUser.role !== 'super_admin') {
      console.log("Non-super admin attempted to revoke access:", requestingUser);
      return res.status(403).json({ 
        message: 'Only super admins can revoke super admin access' 
      });
    }

    console.log(`Looking for super admin with email: ${email}`);
    
    // Check if the super admin exists before trying to delete
    const [checkAdmin] = await db.query(
      'SELECT * FROM super_admins WHERE email = ?',
      [email]
    );

    if (checkAdmin.length === 0) {
      console.log(`No super admin found with email: ${email}`);
      return res.status(404).json({ message: `Super admin not found with email: ${email}` });
    }
    
    console.log(`Found super admin:`, checkAdmin[0]);

    // Delete from super_admins table
    console.log(`Attempting to delete super admin with email: ${email}`);
    const [result] = await db.query(
      'DELETE FROM super_admins WHERE email = ?',
      [email]
    );

    console.log("Delete operation result:", result);
    
    if (result.affectedRows === 0) {
      console.log(`Failed to delete super admin with email: ${email}`);
      return res.status(500).json({ message: 'Failed to remove super admin access' });
    }

    console.log(`Successfully deleted super admin with email: ${email}`);
    return res.status(200).json({
      message: 'Super admin access revoked successfully',
      success: true
    });
  } catch (error) {
    console.error('Error revoking super admin access:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// List all organization users who have super admin access
exports.listOrgSuperAdmins = async (req, res) => {
  try {
    // Only existing super admins can view the list
    const requestingUser = req.user;
    if (requestingUser.role !== 'super_admin') {
      return res.status(403).json({ 
        message: 'Only super admins can view super admin list' 
      });
    }

    const [superAdmins] = await db.query(
      'SELECT id, name, email, created_at, is_org_admin FROM super_admins'
    );

    return res.status(200).json({
      message: 'Organization super admins retrieved successfully',
      superAdmins
    });
  } catch (error) {
    console.error('Error listing organization super admins:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Verify if an organization user has super admin access
exports.verifyOrgAdminAccess = async (req, res) => {
  try {
    // Get email from the request body or from the authenticated user token
    let email = req.body.email;
    
    // If no email provided in the body, use the email from token
    if (!email && req.user) {
      email = req.user.email;
    }
    
    if (!email) {
      return res.status(400).json({ 
        message: 'Email is required to verify super admin access' 
      });
    }
    
    // Check if the email exists in super_admins table with is_org_admin flag
    const [superAdmins] = await db.query(
      'SELECT * FROM super_admins WHERE email = ? AND is_org_admin = true',
      [email]
    );

    if (superAdmins.length === 0) {
      return res.status(403).json({ 
        message: 'No super admin privileges found for this organization account' 
      });
    }

    return res.status(200).json({
      message: 'Organization user has super admin privileges',
      verified: true,
      superAdmin: {
        id: superAdmins[0].id,
        name: superAdmins[0].name,
        email: superAdmins[0].email
      }
    });
  } catch (error) {
    console.error('Error verifying organization super admin access:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Verify if user has super admin access - for middleware verification
exports.verifyAccess = async (req, res) => {
  try {
    // The user will be attached from auth middleware
    const user = req.user;
    
    // If user role is already super_admin, they're verified
    if (user.role === 'super_admin') {
      return res.status(200).json({
        message: 'Super admin access verified',
        verified: true
      });
    }
    
    // Otherwise check if they have super admin access as organization user
    const [superAdmins] = await db.query(
      'SELECT * FROM super_admins WHERE email = ? AND (is_org_admin = true OR role = "super_admin")',
      [user.email]
    );

    if (superAdmins.length === 0) {
      return res.status(403).json({ 
        message: 'No super admin privileges found' 
      });
    }

    return res.status(200).json({
      message: 'Super admin access verified',
      verified: true
    });
  } catch (error) {
    console.error('Error verifying super admin access:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 