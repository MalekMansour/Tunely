const express = require("express");
const { addComment, getComments, deleteComment } = require("../controllers/commentController");
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

router.post("/songs/:songId/comments", verifyToken, addComment); // Add a comment to a song
router.get("/songs/:songId/comments", getComments); // Get comments for a song
router.delete("/comments/:commentId", deleteComment); // Delete a comment

module.exports = router;
