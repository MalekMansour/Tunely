const SongModel = require('../models/songModel');
const { uploadToS3, extractAudioMetadata} = require('../middleware/upload');
const db = require('../db');

const songController = {
  upload: async (req, res) => {
    try {
      console.log('Request files:', req.files);
      console.log('Request body:', req.body);
      if (!req.files || !req.files.song) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const songUrl = await uploadToS3(req.files.song[0], 'songs');
      const metadata = await extractAudioMetadata(req.files.song[0].buffer);

      let coverUrl = null;
      if (req.files?.cover) {
        coverUrl = await uploadToS3(req.files.cover[0], 'covers');
      }

      const songData = {
        title: req.body.title || req.file.originalname.split('.')[0],
        artistName: req.body.artistName || 'Unknown Artist',
        genre: req.body.genre || 'Unknown Genre', 
        duration: metadata.duration || 0,
        fileUrl: songUrl,
        song_photo_url: coverUrl,
        user_id: req.user.uid
      };

      const result = await SongModel.create(songData);
      
      res.status(201).json({
        message: 'Song uploaded successfully',
        song: { songId: result.insertId, ...songData }
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Failed to upload song' });
    }
  },

  getSongById: async (req, res) => {
    try {
      const song = await SongModel.getById(req.params.id);
      
      if (!song) {
        return res.status(404).json({ error: 'Song not found' });
      }
      
      res.json(song);
    } catch (error) {
      console.error('Error fetching song:', error);
      res.status(500).json({ error: 'Failed to fetch song' });
    }
  },

  getAllSongs: async (req, res) => {
    try {
      const songs = await SongModel.getAll();
      res.json(songs);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch songs' });
    }
  },

getMyUploads: async (req, res) => {
  try {
    const userId = req.user.uid;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const uploads = await SongModel.getByUserId(userId);
    
    res.json(uploads);
  } catch (error) {
    console.error('Error fetching uploads:', error);
    res.status(500).json({ error: 'Failed to fetch user uploads' });
  }
},


getRecentlyPlayed: async (req, res) => {
  try {
    const userId = req.user.uid;
    const limit = parseInt(req.query.limit) || 7;
    
    // Create the query with hardcoded limit to avoid parameter issues
    const query = `
      SELECT s.*, MAX(sp.played_at) as most_recent_play
      FROM songs s
      JOIN song_plays sp ON s.songId = sp.song_id
      WHERE sp.user_id = ?
      GROUP BY s.songId 
      ORDER BY most_recent_play DESC
      LIMIT ${limit}
    `;
    
    const songs = await db.query(query, [userId]);
    res.json(songs);
  } catch (error) {
    console.error('Error fetching recently played songs:', error);
    res.json([]);
  }
},

recordSongPlay: async (req, res) => {
  try {
    const userId = req.user.uid;
    const songId = req.params.id;
    
    // Insert record into songs_plays table
    const query = `
      INSERT INTO song_plays (user_id, song_id, played_at)
      VALUES (?, ?, NOW())
    `;
    
    await db.query(query, [userId, songId]);
    res.status(200).json({ success: true, message: 'Play recorded successfully' });
  } catch (error) {
    console.error('Error recording song play:', error);
    res.status(500).json({ error: error.message });
  }
},
searchSongs: async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // Search for songs by title or artist
    const sql = `SELECT * FROM songs WHERE title LIKE ? OR artistName LIKE ?`;
    const values = [`%${query}%`, `%${query}%`];

    const rows = await db.query(sql, values);
    
    // return array
    const results = Array.isArray(rows) ? rows : [rows];
    res.json(results);
  } catch (error) {
    console.error('Error searching songs:', error);
    res.status(500).json({ error: error.message });
  }
}
};

module.exports = songController;