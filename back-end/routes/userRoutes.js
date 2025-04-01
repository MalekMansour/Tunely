const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const userController = require('../controllers/userController');
const multer = require('multer');
const { upload } = require('../middleware/upload'); // Import your existing upload middleware

// Register user after signup/login
router.post('/register', verifyToken, userController.registerUser);
    
// Get current user profile
router.get('/me', verifyToken, userController.getUserProfile);

// Get user's liked songs
router.get('/me/likes', verifyToken, userController.getLikedSongs);

router.post('/profile-picture', verifyToken, (req, res, next) => {
  const singleUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed for profile pictures'));
      }
    }
  }).single('profileImage');
  
  singleUpload(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, userController.updateProfilePicture);

module.exports = router;