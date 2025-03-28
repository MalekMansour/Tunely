import { API_URL } from '../config/apiConfig';
import { Platform } from 'react-native';
import { auth } from '../Utility/firebaseConfig';

const getAuthHeaders = async () => {
  const user = auth.currentUser;
  if (!user) return {};
  
  const token = await user.getIdToken();
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export const songService = {
  uploadSong: async (formData) => {
    const headers = await getAuthHeaders();
    try {
      if (!formData || !formData._parts || formData._parts.length === 0) {
        throw new Error('Invalid form data');
      }

      const response = await fetch(`${API_URL}/songs/upload`, {
        method: 'POST',
        body: formData,
        headers
      });

      const responseText = await response.text();
      console.log('Upload response:', {
        status: response.status,
        statusText: response.statusText,
        body: responseText
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${responseText}`);
      }

      return JSON.parse(responseText);
    } catch (error) {
      console.error('Upload error details:', {
        message: error.message,
        platform: Platform.OS,
        apiUrl: API_URL,
        stack: error.stack
      });
      throw error;
    }
  },

  getAllSongs: async () => {
    try {
      const response = await fetch(`${API_URL}/songs`);
      if (!response.ok) throw new Error('Failed to fetch songs');
      return await response.json();
    } catch (error) {
      console.error('Fetch songs error:', error);
      throw error;
    }
  },

  getSongById: async (id) => {
    try {
      const response = await fetch(`${API_URL}/songs/${id}`);
      if (!response.ok) throw new Error('Failed to fetch song');
      return await response.json();
    } catch (error) {
      console.error('Fetch song error:', error);
      throw error;
    }
  },

  getMyUploads: async () => {
    try {
      const headers = await getAuthHeaders();
      
      // Check if user is authenticated
      if (!auth.currentUser) {
        throw new Error('User not authenticated');
      }
      
      const response = await fetch(`${API_URL}/songs/myUploads`, {
        method: 'GET',
        headers
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch uploads: ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Fetch my uploads error:', error);
      throw error;
    }
  },

  // NEW: Fetch songs for a given user (artist)
  getByUserId: async (userId) => {
    try {
      const headers = await getAuthHeaders();
      // Updated endpoint to use query parameters – adjust this if your backend uses a different URL
      const response = await fetch(`${API_URL}/songs?userId=${userId}`, {
        method: 'GET',
        headers,
      });
      if (!response.ok) {
        throw new Error(`Error fetching songs for user ${userId}: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching songs for user:", error);
      throw error;
    }
  },

  getRecentlyPlayed: async (limit = 10) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/songs/recently-played?limit=${limit}`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        throw new Error(`Error fetching recently played: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching recently played songs:', error);
      throw error;
    }
  },

  recordSongPlay: async (songId) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/songs/${songId}/play`, {
        method: 'POST',
        headers
      });

      if (!response.ok) {
        throw new Error(`Error recording song play: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error recording song play:', error);
      return false;
    }
  },

  searchSongs: async (query) => {
    try {
      const response = await fetch(`${API_URL}/songs/search?query=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch songs');
      }
      return await response.json();
    } catch (error) {
      console.error('Error searching songs:', error);
      return [];
    }
  },
  
  deleteSong: async (songId) => {
    try {
      const headers = await getAuthHeaders();
      
      const response = await fetch(`${API_URL}/songs/${songId}`, {
        method: 'DELETE',
        headers
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete song');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Delete song error:', error);
      throw error;
    }
  }
};
