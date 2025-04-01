const UserModel = require('../models/userModel');
const { uploadToS3 } = require('../middleware/upload');

const userController = {
    registerUser: async (req, res) => {
        try {
            const userData = {
              id: req.user.uid,
              username: req.body.username || req.user.name || 'User',
              email: req.user.email,
              profile_pic_url: req.user.picture || null
            };
            
            // Check if user exists already
            const existingUser = await UserModel.getById(userData.id);
            
            if (existingUser) {
            
              res.status(200).json({ message: 'User already registered', user: existingUser });
            } else {
              // Create new user
              await UserModel.create(userData);
              res.status(201).json({ message: 'User registered', user: userData });
            }
          } catch (error) {
            console.error('Error registering user:', error);
            res.status(500).json({ error: error.message });
          }
    },
    getUserProfile: async (req, res) => {
        try {
            const user = await UserModel.getById(req.user.uid);
            if (!user) {
              return res.status(404).json({ error: 'User not found' });
            }
            res.json(user);
          } catch (error) {
            res.status(500).json({ error: error.message });
          }
    },
    getLikedSongs: async (req, res) => {
        try {
            const songs = await UserModel.getLikedSongs(req.user.uid);
            res.json(songs);
          } catch (error) {
            res.status(500).json({ error: error.message });
          }
    },
    
    updateProfilePicture: async (req, res) => {
      try {
        
        if (!req.file) {
          return res.status(400).json({ error: 'No profile image uploaded' });
        }
        
        // Upload to S3
        const profilePicUrl = await uploadToS3(req.file, 'profilepic');
        console.log('S3 upload successful, URL:', profilePicUrl);
        
        if (!profilePicUrl) {
          return res.status(500).json({ error: 'Failed to upload to S3' });
        }
        
        // Update in database
        await UserModel.updateProfilePicture(req.user.uid, profilePicUrl);
        
        res.status(200).json({
          success: true,
          message: 'Profile picture updated successfully',
          profilePicUrl
        });
      } catch (error) {
        console.error('Error updating profile picture:', error);
        res.status(500).json({ error: error.message });
      }
    },

};
module.exports = userController;
