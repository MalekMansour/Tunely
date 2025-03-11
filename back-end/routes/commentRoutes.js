const express = require("express");
const { addComment, getComments, deleteComment } = require("../controllers/commentController");

const router = express.Router();

router.post("/:id", addComment); // Add a comment to a song
router.get("/songs/:songId/comments", getComments); // Get comments for a song
router.delete("/:id", deleteComment); // Delete a comment

module.exports = router;
