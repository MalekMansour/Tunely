const express = require("express");
const { addComment, getComments, deleteComment } = require("../controllers/commentController");
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

router.post("/:songId", verifyToken, addComment);
router.get("/:songId", getComments);
router.delete("/:commentId", verifyToken, deleteComment);

module.exports = router;
