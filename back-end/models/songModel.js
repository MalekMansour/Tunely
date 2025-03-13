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
  }

};


module.exports = SongModel;