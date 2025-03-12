import { Platform } from 'react-native';
import Constants from 'expo-constants';

const getApiUrl = () => {
  /*
  if (__DEV__) {
    
    // Handle web platform
    if (Platform.OS === 'web') {
      return 'http://localhost:3000/api';
    }

    // Get the local IP address from Expo dev server for native platforms
    const localhost = Constants.expoConfig?.hostUri?.split(':')[0];
    
    // Platform specific development URLs
    switch (Platform.OS) {
      case 'ios':
        return localhost 
          ? `http://${localhost}:3000/api` 
          : 'http://localhost:3000/api';
      case 'android':
        return 'http://10.0.2.2:3000/api';
      default:
        return 'http://localhost:3000/api';
    }
  } */
  return 'https://capstone-project-c256.onrender.com/api';
};

export const API_URL = getApiUrl();

console.log('Platform:', Platform.OS);
console.log('API URL:', API_URL);