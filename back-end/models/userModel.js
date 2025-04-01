const db = require('../db');

const UserModel = {
  create: async (userData) => {
    const sql = `
    INSERT INTO users (id, username, email, profile_pic_url, role)
        VALUES (?, ?, ?, ?, ?) 
        `;
    const params = [
      userData.id,
      userData.username,
      userData.email,
      userData.profile_pic_url,
      userData.role || 'user'
    ];
    return await db.query(sql, params);
},

updateUserRole: async (userId, role) => {
  const sql = 'UPDATE users SET role = ? WHERE id = ?';
  return await db.query(sql, [role, userId]);
},

getAllUsers: async () => {
  const sql = 'SELECT id, username, email, profile_pic_url, role, created_at FROM users';
  return await db.query(sql);
},

deleteUser: async (userId) => {
  // Delete user from local database
  const sql = 'DELETE FROM users WHERE id = ?';
  return await db.query(sql, [userId]);
},

isAdmin: async (userId) => {
  const sql = 'SELECT role FROM users WHERE id = ?';
  const results = await db.query(sql, [userId]);
  if (results.length === 0) return false;
  return ['admin', 'superadmin'].includes(results[0].role);
},

// Check if a user is superadmin
isSuperAdmin: async (userId) => {
  const sql = 'SELECT role FROM users WHERE id = ?';
  const results = await db.query(sql, [userId]);
  if (results.length === 0) return false;
  return results[0].role === 'superadmin';
},

addLikedSong: async (userId, songId) => {
  const sql = `
    INSERT INTO song_likes (user_id, song_id)
    VALUES (?, ?)
  `;
  return db.query(sql, [userId, songId]);
},

removeLikedSong: async (userId, songId) => {
  const sql = `
    DELETE FROM song_likes
    WHERE user_id = ? AND song_id = ?
  `;
  return db.query(sql, [userId, songId]);
},

toggleLikeSong: async (userId, songId) => {
  // First check if song is already liked
  const checkSql = 'SELECT * FROM song_likes WHERE user_id = ? AND song_id = ?';
  const results = await db.query(checkSql, [userId, songId]);
  
  if (results.length > 0) {
    await UserModel.removeLikedSong(userId, songId);
    return { action: 'unliked' };
  } else {
    // Like the song
    await UserModel.addLikedSong(userId, songId);
    return { action: 'liked' };
  }
},

    getById: async (id) => {
        const sql = 'SELECT * FROM users WHERE id = ?';
        const results = await db.query(sql, [id]);
        return results[0];
    },

    getLikedSongs: async (userId) => {
        const sql = `
          SELECT s.* FROM songs s
          JOIN song_likes ul ON s.songId = ul.song_id
          WHERE ul.user_id = ?
        `;
        return db.query(sql, [userId]);
      },
    
      updateProfilePicture: async (userId, profilePicUrl) => {
        try {
          const sql = 'UPDATE users SET profile_pic_url = ? WHERE id = ?';
          const result = await db.query(sql, [profilePicUrl, userId]);
          return result;
        } catch (error) {
          console.error('Error in updateProfilePicture model:', error);
          throw error;
        }
      },


      
};

module.exports = UserModel;