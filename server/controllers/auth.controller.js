const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db.config');
const emailUtil = require('../utils/email.util');

// Secret key for JWT
const JWT_SECRET = 'trackpro-secret-key';

// Register a new organization
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate request
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if email already exists
    const [existingUsers] = await db.query('SELECT * FROM organizations WHERE email = ?', [email]);
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new organization
    const [result] = await db.query(
      'INSERT INTO organizations (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    const orgId = result.insertId;

    // Automatically grant super admin access to the organization owner
    await db.query(
      'INSERT INTO super_admins (name, email, username, password, org_id, is_org_admin) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, email.split('@')[0], hashedPassword, orgId, true]
    );

    // Generate JWT token
    const token = jwt.sign(
      { id: orgId, email, name, role: 'organization_admin' },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Return token and user info
    res.status(201).json({
      message: 'Organization registered successfully',
      token,
      user: {
        id: orgId,
        name,
        email,
        role: 'organization_admin'
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate request
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // First check if user exists in organizations table
    const [organizations] = await db.query('SELECT * FROM organizations WHERE email = ?', [email]);
    
    if (organizations.length > 0) {
      // User is an organization admin
      const user = organizations[0];

      // Check password
      const isPasswordMatch = await bcrypt.compare(password, user.password);
      
      if (!isPasswordMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate token
      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name, role: 'organization_admin' },
        JWT_SECRET,
        { expiresIn: '1d' }
      );

      // Return token and user info
      return res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: 'organization_admin'
        }
      });
    }

    // Check if user exists in super_admins table
    const [superAdmins] = await db.query('SELECT * FROM super_admins WHERE email = ?', [email]);
    
    if (superAdmins.length > 0) {
      // User is a super admin
      const admin = superAdmins[0];

      // Check password
      const isPasswordMatch = await bcrypt.compare(password, admin.password);
      
      if (!isPasswordMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate token
      const token = jwt.sign(
        { id: admin.id, email: admin.email, name: admin.name, role: 'super_admin' },
        JWT_SECRET,
        { expiresIn: '1d' }
      );

      // Return token and user info
      return res.json({
        message: 'Login successful',
        token,
        user: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: 'super_admin',
          username: admin.username
        }
      });
    }

    // If we reach here, no user was found
    return res.status(401).json({ message: 'Invalid credentials' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Super admin login
exports.superAdminLogin = async (req, res) => {
  try {
    const { email, password, is_org_owner } = req.body;

    // Validate request
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // If this is an organization owner auto-login
    if (is_org_owner === true) {
      // Verify the organization owner from the auth token
      const authToken = req.header('x-auth-token');
      
      if (!authToken) {
        return res.status(401).json({ message: 'Authorization token required for owner auto-login' });
      }
      
      try {
        // Verify token to get user data
        const decoded = jwt.verify(authToken, JWT_SECRET);
        
        // Check if the token user matches the requested email
        if (decoded.email !== email || decoded.role !== 'organization_admin') {
          return res.status(403).json({ message: 'Token does not match organization owner credentials' });
        }
        
        // Find the super admin entry for this organization owner
        const [superAdmins] = await db.query(
          'SELECT * FROM super_admins WHERE email = ? AND is_org_admin = true', 
          [email]
        );
        
        if (superAdmins.length === 0) {
          return res.status(401).json({ message: 'Organization owner does not have super admin privileges' });
        }
        
        const superAdmin = superAdmins[0];
        
        // Generate token
        const token = jwt.sign(
          { id: superAdmin.id, email: superAdmin.email, name: superAdmin.name, role: 'super_admin' },
          JWT_SECRET,
          { expiresIn: '1d' }
        );
  
        // Return token and user info
        return res.json({
          message: 'Super admin login successful',
          token,
          user: {
            id: superAdmin.id,
            name: superAdmin.name,
            email: superAdmin.email,
            role: 'super_admin'
          }
        });
      } catch (tokenError) {
        return res.status(401).json({ message: 'Invalid authorization token' });
      }
    }
    
    // Regular super admin login requiring password
    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    // Check if user exists in super_admins table
    const [superAdmins] = await db.query('SELECT * FROM super_admins WHERE email = ?', [email]);
    
    if (superAdmins.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = superAdmins[0];

    // Check password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    
    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: 'super_admin' },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Return token and user info
    res.json({
      message: 'Super admin login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: 'super_admin'
      }
    });
  } catch (error) {
    console.error('Super admin login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Request password reset
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if user exists
    const [users] = await db.query(
      'SELECT * FROM organizations WHERE email = ?',
      [email]
    );

    // Also check super_admins table
    const [superAdmins] = await db.query(
      'SELECT * FROM super_admins WHERE email = ?',
      [email]
    );

    if (users.length === 0 && superAdmins.length === 0) {
      // For security reasons, don't reveal that the email doesn't exist
      // Instead, pretend we sent an email
      return res.json({ 
        message: 'If your email exists in our system, you will receive a password reset link' 
      });
    }

    // Generate a unique token
    const resetToken = require('crypto').randomBytes(32).toString('hex');
    
    // Set expiration time (1 hour from now)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    
    // Store token in database
    await db.query(
      'INSERT INTO password_reset_tokens (email, token, expires_at) VALUES (?, ?, ?)',
      [email, resetToken, expiresAt]
    );

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    // For demonstration, log the token
    console.log('Password reset requested for:', email);
    console.log('Reset URL:', resetUrl);
    
    // Send email with reset link
    await emailUtil.sendEmail({
      to: email,
      subject: 'Password Reset for TrackPro',
      text: `Please use the following link to reset your password: ${resetUrl}. This link will expire in 1 hour.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #0066FF; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">TrackPro</h1>
          </div>
          <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
            <h2>Password Reset Request</h2>
            <p>You requested a password reset for your TrackPro account.</p>
            <p>Please click the button below to reset your password. This link will expire in 1 hour.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #0066FF; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Your Password</a>
            </div>
            <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
            <p>Thanks,<br>The TrackPro Team</p>
          </div>
        </div>
      `
    });

    return res.json({ 
      message: 'If your email exists in our system, you will receive a password reset link' 
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Verify reset token
exports.verifyResetToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    // Find token in database
    const [tokens] = await db.query(
      'SELECT * FROM password_reset_tokens WHERE token = ? AND used = FALSE AND expires_at > NOW()',
      [token]
    );

    if (tokens.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    return res.json({ 
      message: 'Token is valid',
      email: tokens[0].email
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Reset password with token
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: 'Token and password are required' });
    }

    // Verify token exists and is valid
    const [tokens] = await db.query(
      'SELECT * FROM password_reset_tokens WHERE token = ? AND used = FALSE AND expires_at > NOW()',
      [token]
    );

    if (tokens.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const resetToken = tokens[0];
    const email = resetToken.email;

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update password in appropriate table (organizations or super_admins)
    const [orgs] = await db.query('SELECT id FROM organizations WHERE email = ?', [email]);
    
    if (orgs.length > 0) {
      await db.query(
        'UPDATE organizations SET password = ? WHERE email = ?',
        [hashedPassword, email]
      );
    }

    const [admins] = await db.query('SELECT id FROM super_admins WHERE email = ?', [email]);
    
    if (admins.length > 0) {
      await db.query(
        'UPDATE super_admins SET password = ? WHERE email = ?',
        [hashedPassword, email]
      );
    }

    // Mark token as used
    await db.query(
      'UPDATE password_reset_tokens SET used = TRUE WHERE token = ?',
      [token]
    );

    return res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 