const CommentModel = require("../models/commentModel");
const db = require("../db");

const commentController = {
  // Add a comment
  addComment: async (req, res) => {
    try {
      console.log("This is the Song ID for the comment:", req.params.songId);
    console.log("This is the User ID: ", req.user.uid); // Access the user ID correctly
    console.log("Text:", req.body);
      const songId = req.params;
      const userId = req.user.uid;
      const { text } = req.body;

     

      const sql = `
        INSERT INTO comments (user_id, songId, text, created_at, updated_at)
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
        console.log("Received request for songId:", songId);
        

      const sql = `
        SELECT c.id, c.text, c.created_at, u.username 
        FROM comments c 
        JOIN users u ON c.user_id = u.id
        WHERE c.songId = ?
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
      const commentId = req.params.id;  // Extract the comment ID from params
      const userId = req.user.uid;      // Extract the user ID from the authenticated user

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
      console.error(error);  // Log the error for debugging
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = commentController;