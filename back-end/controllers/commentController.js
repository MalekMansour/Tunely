const CommentModel = require("../models/commentModel");
const db = require("../db");

const commentController = {
  // Add a comment
  addComment: async (req, res) => {
    try {
      const songId = req.params.id;
      const userId = req.user.uid;
      const { text } = req.body;

      const sql = `
        INSERT INTO comments (user_id, song_id, text, created_at, updated_at)
        VALUES (?, ?, ?, NOW(), NOW())
      `;
      await db.query(sql, [userId, songId, text]);

      res.status(201).json({ message: "Comment added successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get comments for a song
  getComments: async (req, res) => {
    try {
        const { songId } = req.params;


      const sql = `
        SELECT c.id, c.text, c.created_at, u.username 
        FROM comments c 
        JOIN users u ON c.user_id = u.id
        WHERE c.song_id = ?
        ORDER BY c.created_at DESC
      `;
      const comments = await db.query(sql, [songId]);

      res.status(200).json(comments);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Delete a comment
  deleteComment: async (req, res) => {
    try {
      const commentId = req.params.id;
      const userId = req.user.uid;

      // Check if the comment exists and belongs to the user
      const checkSql = "SELECT * FROM comments WHERE id = ? AND user_id = ?";
      const results = await db.query(checkSql, [commentId, userId]);

      if (results.length === 0) {
        return res.status(403).json({ message: "Unauthorized or comment not found" });
      }

      // Delete the comment
      const deleteSql = "DELETE FROM comments WHERE id = ?";
      await db.query(deleteSql, [commentId]);

      res.status(200).json({ message: "Comment deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = commentController;