const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// Grant super admin access to an organization user
router.post('/grant-super-admin', adminController.grantSuperAdminAccess);

// Revoke super admin access
router.post('/revoke-super-admin', adminController.revokeSuperAdminAccess);

// List all organization users who have super admin access
router.get('/org-super-admins', adminController.listOrgSuperAdmins);

// Verify if organization user has super admin access
router.post('/verify-org-admin', adminController.verifyOrgAdminAccess);

// Verify if current user has super admin access
router.get('/verify-access', adminController.verifyAccess);

module.exports = router; 