const db = require("../db");

const CommentModel = {
  create: async (commentData) => {
    const sql = `
      INSERT INTO comments (user_id, songId, text, created_at, updated_at)
      VALUES (?, ?, ?, NOW(), NOW())
    `;
    const params = [commentData.user_id, commentData.songId, commentData.text];
    return await db.query(sql, params);
  },

  getBySongId: async (songId) => {
    const sql = `
      SELECT c.id, c.text, c.user_id, c.created_at, u.username 
      FROM comments c 
      JOIN users u ON c.user_id = u.id
      WHERE c.songId = ?
      ORDER BY c.created_at DESC
    `;
    return await db.query(sql, [songId]);
  },

  delete: async (commentId) => {
    const sql = `DELETE FROM comments WHERE id = ?`;
    return await db.query(sql, [commentId]);
  },
   // Method to delete comments by user ID
   deleteByUserId: async (userId) => {
    const sql = `DELETE FROM comments WHERE user_id = ?`;
    return await db.query(sql, [userId]);
  },
};

module.exports = CommentModel;