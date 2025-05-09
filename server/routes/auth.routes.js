const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Register a new organization
router.post('/signup', authController.signup);

// Login
router.post('/login', authController.login);

// Super Admin Login
router.post('/super-admin-login', authController.superAdminLogin);

// Password reset routes
router.post('/request-reset', authController.requestPasswordReset);
router.post('/verify-reset-token', authController.verifyResetToken);
router.post('/reset-password', authController.resetPassword);

module.exports = router; 