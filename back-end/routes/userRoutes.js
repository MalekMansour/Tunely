const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const userController = require('../controllers/userController');


// Register user after signup/login
router.post('/register', verifyToken, userController.registerUser);
  
    
// Get current user profile
router.get('/me', verifyToken, userController.getUserProfile);

// Get user's liked songs
router.get('/me/likes', verifyToken, userController.getLikedSongs);

module.exports = router;