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
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/comments/songs/${songId}/comments`, {
      method: 'GET',
      headers
    });
    if (!response.ok) {
        throw new Error(`Error fetching comments: ${response.status} ${response.statusText}`);
      }
    
    return response.json();
  },
  
  // Post a new comment for a song
  postComment: async (songId, text) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/comments/songs/${songId}/comments`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ text })
    });
    
    if (!response.ok) {
      throw new Error('Failed to post comment');
    }

    const newComment = await response.json(); 
    return newComment; 
  },
  
  // Delete a comment by ID
  deleteComment: async (commentId, userId) => {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_URL}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
            ...headers,
            'Content-Type': 'application/json',  
        },
        body: JSON.stringify({
            commentId: commentId,
            userId: userId,
        }),
    });

    // If the deletion was successful, return the response
    if (response.ok) {
        console.log("Comment successfully deleted");
        return response.json();
    } else {
        throw new Error('Failed to delete comment');
    }
  }
};
