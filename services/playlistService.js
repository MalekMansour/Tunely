import { API_URL } from '../config/apiConfig';
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

export const playlistService = {
  getAllPlaylists: async () => {
    try {
      const response = await fetch(`${API_URL}/playlists`);
      if (!response.ok) throw new Error('Failed to fetch playlists');
      return await response.json();
    } catch (error) {
      console.error('Fetch playlists error:', error);
      throw error;
    }
  },

  getUserPlaylists: async () => {
    try {
      console.log('Fetching user playlists...');
      const headers = await getAuthHeaders();
      
      // Log request details for debugging
      console.log('Request URL:', `${API_URL}/playlists/user`);
      console.log('Headers:', JSON.stringify(headers));
      
      const response = await fetch(`${API_URL}/playlists/user`, {
        method: 'GET',
        headers
      });
      
      // Log response details
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`Failed to fetch user playlists: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Playlists fetched successfully:', data.length);
      return data;
    } catch (error) {
      console.error('Fetch user playlists error:', error);
      throw error;
    }
  },

  getPlaylistById: async (id) => {
    const headers = await getAuthHeaders();
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/playlists/${id}`, {
        method: 'GET',
        headers
      });
      
      if (!response.ok) throw new Error('Failed to fetch playlist');
      return await response.json();
    } catch (error) {
      console.error('Fetch playlist error:', error);
      throw error;
    }
  },

  createPlaylist: async (playlistData) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/playlists`, {
        method: 'POST',
        headers,
        body: JSON.stringify(playlistData)
      });
      if (!response.ok) throw new Error('Failed to create playlist');
      return await response.json();
    } catch (error) {
      console.error('Create playlist error:', error);
      throw error;
    }
  },

  // Rename playlist
  renamePlaylist: async (playlistId, newTitle) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/playlists/${playlistId}/rename`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({newTitle}),
      });
  
      if (!response.ok) {
        const errorBody = await response.text(); // To get the response body
        console.error('Error response:', errorBody);
        throw new Error('Failed to rename playlist');
    }
      return await response.json();
    } catch (error) {
      console.error('Rename playlist error:', error);
      throw error;
    }
  },  

  // Fetch available songs for modal
  fetchAvailableSongsForModal: async () => {
    try {
      const response = await fetch(`${API_URL}/songs`);
      const data = await response.json();
      if (response.ok) {
        console.log("Available Songs: ", data);
        return data; // Return the available songs
      } else {
        console.log("Could not fetch songs");
        return []; 
      }
    } catch (error) {
      console.error(error);
      return []; 
    }
  },

  // Fetch the playlist data
fetchPlaylist: async (playlistId) => {
  try {
    const response = await fetch(`${API_URL}/playlists/${playlistId}`);
    const data = await response.json();

    if (response.ok) {
      return data.songs; // Return the songs from the playlist
    } else {
      console.log('Failed to fetch playlist');
      return []; // Return empty array if there's an error
    }
  } catch (error) {
    console.error('Error fetching playlist:', error);
    return [];
  }
},

  // Add a song to a playlist
  addSongToPlaylist: async (playlistId, song) => {
    try {
      console.log("Song object:", song); // Debugging
  
      if (!song || !song.songId) {
        console.error("Invalid song object:", song);
        throw new Error("Invalid song object");
      }
  
      const headers = await getAuthHeaders(); 
      const requestBody = {
        songIds: [song.songId], 
      };
      
      const response = await fetch(`${API_URL}/playlists/${playlistId}/songs`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
  
      if (!response.ok) {
        throw new Error('Failed to add song to playlist');
      }
      
      return await response.json(); 
    } catch (error) {
      console.error('Add song to playlist error:', error);
      throw error; 
    }
  },

  removeSongFromPlaylist: async (playlistId, songId) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/playlists/${playlistId}/songs/${songId}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) throw new Error('Failed to remove song from playlist');
    return await response.json();
  } catch (error) {
    console.error('Remove song from playlist error:', error);
    throw error;
  }
},

  deletePlaylist: async (id) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/playlists/${id}`, {
        method: 'DELETE',
        headers
      });
      if (!response.ok) throw new Error('Failed to delete playlist');
      return await response.json();
    } catch (error) {
      console.error('Delete playlist error:', error);
      throw error;
    }
  }
};