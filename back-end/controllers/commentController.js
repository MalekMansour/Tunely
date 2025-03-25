const CommentModel = require("../models/commentModel");
const db = require("../db");
const axios = require("axios");


const AZURE_ENDPOINT = "https://tunelycontentmoderation.cognitiveservices.azure.com/"; 
const AZURE_KEY = "3SYDKxMLnMG0Jf2vKG45aPDFDbj4UHSgcTYGGVo0BlysaCfQ5S2mJQQJ99BCACYeBjFXJ3w3AAAHACOGwvMm"; 
const commentController = {
  // Add a comment
  addComment: async (req, res) => {
    try {
      console.log("This is the Song ID for the comment:", req.params.songId);
      console.log("This is the User ID: ", req.user.uid);
      console.log("Text:", req.body);
      
      const { songId } = req.params;
      const userId = req.user.uid;
      const { text } = req.body;

      // Send comment to Azure Content Safety for moderation
      const azureResponse = await axios.post(
        `${AZURE_ENDPOINT}/contentsafety/text:analyze?api-version=2023-10-01`,
        {
          text: text,
          categories: ["Hate", "SelfHarm", "Sexual", "Violence"]
        },
        {
          headers: {
            "Ocp-Apim-Subscription-Key": AZURE_KEY,
            "Content-Type": "application/json"
          }
        }
      );

      // Check if Azure flagged the comment
      const isFlagged = azureResponse.data.categoriesAnalysis.some(cat => cat.severity >= 2);
      if (isFlagged) {
        return res.status(403).json({ message: "Comment contains inappropriate content." });
      }

      
      await CommentModel.create({
        user_id: userId,
        songId: songId,
        text: text
      });

      res.status(201).json({ message: "Comment added successfully" });
    } catch (error) {
      console.error("Error adding comment:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get comments for a song
  getComments: async (req, res) => {
    try {
      const { songId } = req.params;
      console.log("Received request for songId:", songId);
      
      const comments = await CommentModel.getBySongId(songId);

      res.status(200).json(comments);
    } catch (error) {
      console.error("Error getting comments:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Delete a comment
  deleteComment: async (req, res) => {
    try {
      const { commentId } = req.params;
      const userId = req.user.uid;
      
      const checkSql = "SELECT * FROM comments WHERE id = ? AND user_id = ?";
      const results = await db.query(checkSql, [commentId, userId]);

      if (results.length === 0) {
        return res.status(403).json({ message: "Unauthorized or comment not found" });
      }

      await CommentModel.delete(commentId);

      res.status(200).json({ message: "Comment deleted successfully" });
    } catch (error) {
      console.error("Error deleting comment:", error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = commentController;