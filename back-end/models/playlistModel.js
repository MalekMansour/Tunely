const db = require('../db');

const PlaylistModel = {
  create: async (playlistData) => {
    const sql = `
      INSERT INTO playlists (title, user_id, created_at)
      VALUES (?, ?, NOW())
    `;
    const params = [
      playlistData.title,
      playlistData.userId
    ];
    return await db.query(sql, params);
  },

  getAll: async () => {
    return await db.query('SELECT * FROM playlists ORDER BY created_at DESC');
  },

  getById: async (playlistId) => {
    const sql = 'SELECT * FROM playlists WHERE id = ?';
    const results = await db.query(sql, [playlistId]);
    return results[0];
  },

  getByUserId: async (userId) => {
    const sql = 'SELECT * FROM playlists WHERE user_id = ? ORDER BY created_at DESC';
    return await db.query(sql, [userId]);
  },

  delete: async (playlistId) => {
    // First delete playlist-song relationships
    await db.query('DELETE FROM playlist_songs WHERE playlist_id = ?', [playlistId]);
    // Then delete the playlist
    return await db.query('DELETE FROM playlists WHERE id = ?', [playlistId]);
  },

  addSongs: async (playlistId, songIds) => {
    if (!songIds.length) return { insertId: 0 };
    
    const values = songIds.map(songId => [playlistId, songId]); 
    const placeholders = values.map(() => "(?, ?)").join(", "); //adds multiple song ids to the playlist instead of making multiple inssert queries
    const flattenedValues = values.flat(); // Flat list instead of nested array for sql

    return await db.query(
        `INSERT INTO playlist_songs (playlist_id, song_id) VALUES ${placeholders}`,
        flattenedValues
    );
  },

  getSongs: async (playlistId) => {
    const sql = `
      SELECT s.* FROM songs s
      JOIN playlist_songs ps ON s.songId = ps.song_id
      WHERE ps.playlist_id = ?
    `;
    return await db.query(sql, [playlistId]);
  },

  removeSong: async (playlistId, songId) => {
    const sql = 'DELETE FROM playlist_songs WHERE playlist_id = ? AND song_id = ?';
    return await db.query(sql, [playlistId, songId]);
  }
};

module.exports = PlaylistModel;
