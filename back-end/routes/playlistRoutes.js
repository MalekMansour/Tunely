const express = require('express');
const playlistController = require('../controllers/playlistController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', playlistController.getAllPlaylists);

// Protected routes - SPECIFIC ROUTES MUST COME BEFORE PARAMETER ROUTES
router.get('/user', verifyToken, playlistController.getUserPlaylists);

// Routes with parameters must come AFTER specific routes
router.get('/:id', playlistController.getPlaylistById);
router.post('/', verifyToken, playlistController.createPlaylist);
router.put('/:playlistId/rename', verifyToken, playlistController.renamePlaylist);
router.get('/:playlistId',playlistController.getUserSongs);
router.post('/:playlistId/songs', verifyToken, playlistController.addSongsToPlaylist);
router.delete('/:playlistId/songs/:songId', verifyToken, playlistController.removeSongFromPlaylist);
router.delete('/:id', verifyToken, playlistController.deletePlaylist);

module.exports = router;
