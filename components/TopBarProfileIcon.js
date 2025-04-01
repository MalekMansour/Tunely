import React, { memo, useEffect } from 'react';
import { Image, ActivityIndicator, View } from 'react-native';
import { useUserData } from '../hooks/useUserData';
import blankProfilePic from '../assets/blank_profile.png';
import { useIsFocused } from '@react-navigation/native';

// Use memo to prevent unnecessary re-renders
const TopBarProfileIcon = memo(({ size = 30 }) => {
  const { profilePic, isLoading, refreshUserData } = useUserData();
  const isFocused = useIsFocused();
  
  // Refresh when screen comes into focus
  useEffect(() => {
    if (isFocused) {
      refreshUserData();
    }
  }, [isFocused, refreshUserData]);
  
  if (isLoading) {
    return (
      <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="small" />
      </View>
    );
  }
  
  return (
    <Image
      source={typeof profilePic === 'string' && profilePic ? { uri: profilePic } : blankProfilePic}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 1,
        borderColor: 'rgba(200, 200, 200, 0.3)',
      }}
      // Add key to force re-render when profilePic changes
      key={typeof profilePic === 'string' ? profilePic : 'default'}
      onError={(e) => console.log('Error loading profile image:', e.nativeEvent.error)}
    />
  );
});

export default TopBarProfileIcon;