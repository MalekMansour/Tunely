import { auth } from '../Utility/firebaseConfig';
import { API_URL } from '../config/apiConfig';

const getAuthHeaders = async () => {
  const user = auth.currentUser;
  if (!user) return {};
  
  const token = await user.getIdToken();
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export const commentsService = {
  // Fetch comments for a specific song
  fetchComments: async (songId) => {
    try {
      const headers = await getAuthHeaders();
      // Updated to match backend route
      const response = await fetch(`${API_URL}/comments/${songId}`, {
        method: 'GET',
        headers
      });
      
      if (!response.ok) {
        throw new Error(`Error fetching comments: ${response.status} ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error("Error in fetchComments:", error);
      throw error;
    }
  },
  
  // Post a new comment for a song
  postComment: async (songId, text) => {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_URL}/comments/${songId}`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ text })
        });

        const data = await response.json(); // Convert response to JSON

        if (!response.ok) {
            throw new Error(data.message || 'Failed to post comment');
        }

        return data; // Return success message
    } catch (error) {
        // console.error("Error in postComment:", error);
        throw new Error(error.message || "Something went wrong. Please try again.");
    }
},

  
  // Delete a comment by ID
  deleteComment: async (commentId) => {
    try {
      const headers = await getAuthHeaders();
      // Updated to match backend route and removed unnecessary body
      const response = await fetch(`${API_URL}/comments/${commentId}`, {
        method: 'DELETE',
        headers
      });

      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }
      
      return response.json();
    } catch (error) {
      console.error("Error in deleteComment:", error);
      throw error;
    }
  }
};