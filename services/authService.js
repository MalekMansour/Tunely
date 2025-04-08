import { auth } from '../Utility/firebaseConfig';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { API_URL } from '../config/apiConfig';
import { signInWithGoogle } from '../Utility/googleAuth';
import { sendPasswordResetEmail } from 'firebase/auth';

// Helper to get token and create headers
const getAuthHeaders = async () => {
  const user = auth.currentUser;
  if (!user) return {};
  
  const token = await user.getIdToken();
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export const authService = {
  // Register new user
  registerUser: async (email, password, username) => {
    // Create Firebase user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Get token
    const token = await userCredential.user.getIdToken();
    
    // Register in our database
    const response = await fetch(`${API_URL}/users/register`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username })
    });
    
    return response.json();
  },

  signInWithGoogleAuth: async () => {
    const userData = await signInWithGoogle();
    
    if (!userData || !userData.idToken) {
      throw new Error('Google sign-in failed or was canceled');
    }
    
    console.log('Google token (first 20 chars):', userData.idToken.substring(0, 20));
    
    const credential = GoogleAuthProvider.credential(userData.idToken);
    const firebaseResult = await signInWithCredential(auth, credential);
    const token = await firebaseResult.user.getIdToken();
    // Register in our database
    const response = await fetch(`${API_URL}/users/register`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username: userData.name })
    });
    
    return response.json();
  },

  updateProfilePicture: async (imageAsset) => {
    try {
      if (!imageAsset || !imageAsset.uri) {
        throw new Error('Image is required');
      }
      
      // Create form data for image upload
      const formData = new FormData();
      
      // Get filename from URI
      const uriParts = imageAsset.uri.split('/');
      const fileName = uriParts[uriParts.length - 1];
      
      // Append the image file
      formData.append('profileImage', {
        uri: imageAsset.uri,
        type: imageAsset.mimeType || 'image/jpeg',
        name: fileName
      });
      
      const headers = await getAuthHeaders();
      // Delete Content-Type so boundary is set correctly for multipart/form-data
      delete headers['Content-Type'];
      
      const response = await fetch(`${API_URL}/users/profile-picture`, {
        method: 'POST', // Change to POST for file upload
        headers,
        body: formData
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update profile picture: ${errorText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error in updateProfilePicture:', error);
      throw error;
    }
  },
  
  
  // Get current user profile
  getCurrentUserProfile: async () => {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_URL}/users/me`, {
      headers
    });
    
    return response.json();
  },
  
  // Sign out
  signOut: async () => {
    await firebaseSignOut(auth);
  },

  resetPassword: async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true, message: "Password reset email sent" };
    } catch (error) {
      console.error("Error sending password reset email:", error);
      throw error;
    }
  },
  
  deleteAccount: async () => {
    const headers = await getAuthHeaders();
  
    const response = await fetch(`${API_URL}/users/me`, {
      method: 'DELETE',
      headers,
    });
  
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete account');
    }
  
    return response.json();
  },
  
};