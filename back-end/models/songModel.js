const db = require('../db');

const SongModel = {
  create: async (songData) => {
    const sql = `
      INSERT INTO songs (title, artistName, genre, fileUrl, duration, song_photo_url, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      songData.title,
      songData.artistName,
      songData.genre,
      songData.fileUrl,
      songData.duration,
      songData.song_photo_url,
      songData.user_id
    ];
    return await db.query(sql, params);
  },

  getAll: async () => {
    return await db.query('SELECT * FROM songs ORDER BY songId DESC');
  },

  getById: async (songId) => {
    const sql = 'SELECT * FROM songs WHERE songId = ?';
    const results = await db.query(sql, [songId]);
    return results[0];
  },

  getByUserId: async (userId) => {
    try {
      const sql = 'SELECT * FROM songs WHERE user_id = ? ORDER BY songId DESC';
      const results = await db.query(sql, [userId]);
      return results;
    } catch (error) {
      console.error('Error fetching user songs:', error);
      throw error;
    }
  },

  delete: async (songId) => {
    try {
      // delete related records from other tables
      await db.query('DELETE FROM song_plays WHERE song_id = ?', [songId]);
      await db.query('DELETE FROM comments WHERE songId = ?', [songId]);
      await db.query('DELETE FROM song_likes WHERE song_id = ?', [songId]);
      await db.query('DELETE FROM playlist_songs WHERE song_id = ?', [songId]);
      
      // Then delete the song itself
      const sql = 'DELETE FROM songs WHERE songId = ?';
      return await db.query(sql, [songId]);
    } catch (error) {
      console.error('Error deleting song:', error);
      throw error;
    }
  },

  getSongStats: async (userId) => {
    const sql = `
      SELECT 
        s.songId,
        s.title,
        s.song_photo_url,
        s.artistName,
        COUNT(DISTINCT sp.id) AS play_count,
        COUNT(DISTINCT sl.song_id) AS like_count
        /* Removed s.created_at which doesn't exist in your table */
      FROM songs s
      LEFT JOIN song_plays sp ON s.songId = sp.song_id
      LEFT JOIN song_likes sl ON s.songId = sl.song_id
      WHERE s.user_id = ?
      GROUP BY s.songId
      ORDER BY play_count DESC
    `;
    return await db.query(sql, [userId]);
  },

  getArtistTotals: async (userId) => {
    const sql = `
      SELECT 
        COUNT(DISTINCT s.songId) AS total_songs,
        COUNT(DISTINCT sp.id) AS total_plays,
        COUNT(DISTINCT CONCAT(sl.user_id, sl.song_id)) AS total_likes
      FROM songs s
      LEFT JOIN song_plays sp ON s.songId = sp.song_id
      LEFT JOIN song_likes sl ON s.songId = sl.song_id
      WHERE s.user_id = ?
    `;
    const results = await db.query(sql, [userId]);
    return results[0];
  }
};

module.exports = SongModel;