const PlaylistModel = require('../models/playlistModel');

const playlistController = {
  // Get all playlists (public endpoint)
  getAllPlaylists: async (req, res) => {
    try {
      const playlists = await PlaylistModel.getAll();
      res.json(playlists);
    } catch (error) {
      console.error('Error fetching playlists:', error);
      res.status(500).json({ error: 'Failed to fetch playlists' });
    }
  },

  getUserPlaylists: async (req, res) => {
    try {
      const userId = req.user.uid;
      const playlists = await PlaylistModel.getByUserId(userId);
      res.json(playlists);
    } catch (error) {
      console.error('Error fetching user playlists:', error);
      res.status(500).json({ error: 'Failed to fetch user playlists' });
    }
  },

  getPlaylistById: async (req, res) => {
    try {
      const playlist = await PlaylistModel.getById(req.params.id);
      
      if (!playlist) {
        return res.status(404).json({ error: 'Playlist not found' });
      }
      
      // Get songs in this playlist
      const songs = await PlaylistModel.getSongs(req.params.id);
      
      const response = {
        id: playlist.id,
        title: playlist.title,
        user_id: playlist.user_id,
        created_at: playlist.created_at,
        songs: songs || []
      };
      res.json(response);
    } catch (error) {
      console.error('Error fetching playlist:', error);
      res.status(500).json({ error: 'Failed to fetch playlist' });
    }
  },

  createPlaylist: async (req, res) => {
    try {
      const { title, songs } = req.body;
      
      if (!title) {
        return res.status(400).json({ error: 'Playlist title is required' });
      }
      
      const playlistData = {
        title,
        userId: req.user.uid
      };
      
      const result = await PlaylistModel.create(playlistData);
      
      // Add songs if provided
      if (songs && songs.length > 0) {
        await PlaylistModel.addSongs(result.insertId, songs);
      }
      
      res.status(201).json({
        id: result.insertId,
        title,
        message: 'Playlist created successfully'
      });
    } catch (error) {
      console.error('Error creating playlist:', error);
      res.status(500).json({ error: 'Failed to create playlist' });
    }
  },

  // Function that renames the playlist
  renamePlaylist: async (req, res) => {
    try {
      const { playlistId } = req.params;
      const { newTitle } = req.body;
  
      if (!newTitle) {
        return res.status(400).json({ error: 'New title is required' });
      }
  
      await PlaylistModel.rename(playlistId, newTitle);
      res.json({ message: 'Playlist renamed successfully' });
    } catch (error) {
      console.error('Error renaming playlist:', error);
      res.status(500).json({ error: 'Failed to rename playlist' });
    }
  },
  

  // Fetch songs to show the user
 getUserSongs: async(req, res) => {
    const { playlistId } = req.params
    try {
        const songs = await db.query(
          `SELECT id, title, artist, file_url 
            FROM Songs 
            WHERE user_id = ?`, 
            [playlistId]
        );

        res.status(200).json(songs)
    } catch (error) {
        console.error(error)
    }
 },

  addSongsToPlaylist: async (req, res) => {
    try {
      console.log("Received request body:", req.body);
console.log("Playlist ID:", req.params.playlistId);

      const { playlistId } = req.params;
      const { songIds } = req.body;
      
      if (!songIds || !songIds.length) {
        return res.status(400).json({ error: 'Song IDs are required' });
      }
      
      // Verify playlist exists and belongs to user
      const playlist = await PlaylistModel.getById(playlistId);
      
      if (!playlist) {
        return res.status(404).json({ error: 'Playlist not found' });
      }
      
      if (playlist.user_id !== req.user.uid) {
        return res.status(403).json({ error: 'You do not have permission to modify this playlist' });
      }
      
      await PlaylistModel.addSongs(playlistId, songIds);
      
      res.status(200).json({ message: 'Songs added to playlist successfully' });
    } catch (error) {
      console.error('Error adding songs to playlist:', error);
      res.status(500).json({ error: 'Failed to add songs to playlist' });
    }
  },

  removeSongFromPlaylist: async (req, res) => {
    try {
      const { playlistId, songId } = req.params;
      
      // Verify playlist exists and belongs to user
      const playlist = await PlaylistModel.getById(playlistId);
      
      if (!playlist) {
        return res.status(404).json({ error: 'Playlist not found' });
      }
      
      if (playlist.user_id !== req.user.uid) {
        return res.status(403).json({ error: 'You do not have permission to modify this playlist' });
      }
      
      await PlaylistModel.removeSong(playlistId, songId);
      
      res.status(200).json({ message: 'Song removed from playlist successfully' });
    } catch (error) {
      console.error('Error removing song from playlist:', error);
      res.status(500).json({ error: 'Failed to remove song from playlist' });
    }
  },

  deletePlaylist: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Verify playlist exists and belongs to user
      const playlist = await PlaylistModel.getById(id);
      
      if (!playlist) {
        return res.status(404).json({ error: 'Playlist not found' });
      }
      
      if (playlist.user_id !== req.user.uid) {
        return res.status(403).json({ error: 'You do not have permission to delete this playlist' });
      }
      
      await PlaylistModel.delete(id);
      
      res.status(200).json({ message: 'Playlist deleted successfully' });
    } catch (error) {
      console.error('Error deleting playlist:', error);
      res.status(500).json({ error: 'Failed to delete playlist' });
    }
  }
};

module.exports = playlistController;
