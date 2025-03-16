import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import { useAudio } from '../context/AudioContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from 'expo-blur'; 

// import { LinearGradient } from 'expo-linear-gradient'; 

const defaultCoverImage = require('../assets/note.jpg');

export default function FloatingPlayer() {
  const navigation = useNavigation();
  const { currentSong, isPlaying, playSound, pauseSound, playNextSong } = useAudio();
  const routes = useNavigationState(state => state?.routes);
  const currentRoute = routes?.[routes.length - 1];


  if (!currentSong || 
    currentRoute?.name === 'SongDetail' || 
    currentRoute?.name === 'CommentScreen' || 
    currentRoute?.name === 'Profile' || 
    currentRoute?.name === 'Upload' ||
    currentRoute?.name === 'Login' ||
    currentRoute?.name === 'LoginFormPage' ||
    currentRoute?.name === 'SignUp' ||
    currentRoute?.name === 'Settings' ||
    currentRoute?.name === 'PrivacySettings' ||
    currentRoute?.name === 'Notifications' ||
    currentRoute?.name === 'AdminPage' ||
    currentRoute?.name === 'AuthCheck'
) return null;

  const handlePress = () => {
    navigation.navigate('SongDetail', { song: currentSong });
  };

  const handleCommentPress = (event) => {
    event.stopPropagation();
    if (currentSong) {
      navigation.navigate('CommentScreen', { 
        song: currentSong 
      });
    }
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={handlePress}
      activeOpacity={0.9}
    >
    {/* <LinearGradient
    colors={['#000428', '#004e92']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={styles.gradientBackground}
    /> // gradient instead of blurview?? */} 
      <BlurView
        intensity={80}
        tint="dark"
        style={styles.blurContainer}
      />
      <View style={styles.content}>
        <Image
          source={currentSong.song_photo_url 
            ? { uri: currentSong.song_photo_url }
            : defaultCoverImage
          }
          style={styles.coverArt}
        />
        <View style={styles.songInfo}>
          <Text style={styles.title} numberOfLines={1}>
            {currentSong.title}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {currentSong.artistName}
          </Text>
        </View>
        <View style={styles.controls}>
          <TouchableOpacity 
            onPress={handleCommentPress}
            style={styles.commentButton}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => isPlaying ? pauseSound() : playSound(currentSong)}
            style={styles.playButton}
          >
            <Icon 
              name={isPlaying ? 'pause' : 'play-arrow'} 
              size={32} 
              color="#fff" 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={playNextSong}
            style={styles.nextButton}
          >
            <Icon name="skip-next" size={32} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 72,
    left: 8, 
    right: 8,
    height: 64,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  gradientBackground: { 
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  blurContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
  },
  coverArt: {
    width: 48,
    height: 48,
    borderRadius: 4,
    marginRight: 12,
  },
  songInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  artist: {
    color: '#b3b3b3',
    fontSize: 12,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8, 
  },
  commentButton: {
    padding: 4,
    marginRight: 8,
  },
  playButton: {
    marginRight: 8,
    padding: 4,
  },
  nextButton: {
    padding: 4,
  }
});