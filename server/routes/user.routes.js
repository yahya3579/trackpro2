const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Protected route - requires valid token
router.get('/profile', authMiddleware, userController.getProfile);

module.exports = router; 