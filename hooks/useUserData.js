import { useState, useEffect, useCallback } from 'react';
import { auth } from '../Utility/firebaseConfig';
import blankProfilePic from '../assets/blank_profile.png';
import { authService } from '../services/authService';

export const useUserData = () => {
  const [username, setUsername] = useState('User');
  const [profilePic, setProfilePic] = useState(blankProfilePic);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Add this state

  // Add a function to trigger refresh
  const refreshUserData = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Check if user is logged in with Firebase
        const firebaseUser = auth.currentUser;
        
        if (!firebaseUser) {
          // No user logged in
          setIsLoading(false);
          return;
        }
        
        // Get user data from backend API
        const userData = await authService.getCurrentUserProfile();
        
        if (userData && !userData.error) {
          setUsername(userData.username || 'User');
          setProfilePic(userData.profile_pic_url || blankProfilePic);
        }
      } catch (error) {
        setError(error);
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [refreshTrigger]); // Add refreshTrigger as dependency

  return { username, profilePic, isLoading, error, refreshUserData };
};