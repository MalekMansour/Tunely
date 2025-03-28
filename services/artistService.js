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

export const artistService = {
  // Search for artists based on a query string.
  searchArtists: async (query) => {
    try {
      const response = await fetch(`${API_URL}/artists/search?query=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch artists');
      }
      return await response.json();
    } catch (error) {
      console.error('Error searching artists:', error);
      return []; // Return an empty array on error
    }
  },

  // Retrieve all artists.
  getAllArtists: async () => {
    try {
      const response = await fetch(`${API_URL}/artists`);
      if (!response.ok) {
        throw new Error('Failed to fetch artists');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching all artists:', error);
      throw error;
    }
  },

  // Get a specific artist by their ID.
  getArtistById: async (artistId) => {
    try {
      const response = await fetch(`${API_URL}/artists/${artistId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch artist');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching artist by ID:', error);
      throw error;
    }
  },

  // Get songs associated with a specific artist.
  getSongsByArtistId: async (artistId) => {
    try {
      const response = await fetch(`${API_URL}/artists/${artistId}/songs`);
      if (!response.ok) {
        throw new Error(`Error fetching songs for artist with ID ${artistId}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching songs for artist:', error);
      throw error;
    }
  },

  // Fetch songs uploaded by a specific user (artist) using authentication.
  getByUserId: async (userId) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/artists/${userId}/songs`, {
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
  }
};
