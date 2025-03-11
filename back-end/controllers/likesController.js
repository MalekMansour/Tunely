const UserModel = require('../models/userModel');
const db = require('../db');

const getSongLikeCount = async (songId) => {
    const countSql = 'SELECT COUNT(*) as likeCount FROM song_likes WHERE song_id = ?';
    const countResults = await db.query(countSql, [songId]);
    return countResults[0]?.likeCount || 0;
  };

const likesController = {
    toggleLike: async (req, res) => {
        try {
            const songId = req.params.id;
      const userId = req.user.uid;
      
      const result = await UserModel.toggleLikeSong(userId, songId);
      const likeCount = await getSongLikeCount(songId);
      
      res.status(200).json({ action: result.action, likeCount });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
},

checkLike: async (req, res) => {
    try {
      const songId = req.params.id;
      const userId = req.user.uid;
      
      // Check if user has liked this song
      const sql = 'SELECT * FROM song_likes WHERE user_id = ? AND song_id = ?';
      const results = await db.query(sql, [userId, songId]);
      
      // Get the total like count
      const likeCount = await getSongLikeCount(songId);
      
      res.json({ 
        liked: results.length > 0,
        likeCount: likeCount
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = likesController;