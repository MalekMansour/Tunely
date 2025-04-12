import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import { useAudio } from '../context/AudioContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';

const defaultCoverImage = require('../assets/note.jpg');

export default function FloatingPlayer() {
  const navigation = useNavigation();
  const { currentSong, isPlaying, playSound, pauseSound, playNextSong } = useAudio();
  const routes = useNavigationState(state => state?.routes);
  const currentRoute = routes?.[routes.length - 1];

  const hiddenScreens = [
    "SongDetail", "CommentScreen", "Profile", "Upload", "Login",
    "LoginFormPage", "SignUp", "Settings", "PrivacySettings",
    "Notifications", "AdminPage", "AuthCheck", "ThemeSettings",
    "ChatBotSettings", "TermsAndServices", "ArtistDashboard"
  ];

  if (!currentSong || hiddenScreens.includes(currentRoute?.name)) return null;

  // Determine if we're on the ArtistPage (needs to be lower on artist page without nav bar)
  const isArtistPage = currentRoute?.name === "ArtistPage";

  const handlePress = () => {
    navigation.navigate('SongDetail', { song: currentSong });
  };

  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        isArtistPage && styles.artistPageContainer
      ]} 
      onPress={handlePress} 
      activeOpacity={0.9}
    >
      <BlurView intensity={80} tint="dark" style={styles.blurContainer} />
      <View style={styles.content}>
        <Image
          source={currentSong.song_photo_url ? { uri: currentSong.song_photo_url } : defaultCoverImage}
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
            onPress={() => isPlaying ? pauseSound() : playSound(currentSong)}
            style={styles.controlButton}
          >
            <Icon name={isPlaying ? 'pause' : 'play-arrow'} size={32} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity onPress={playNextSong} style={styles.controlButton}>
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
  artistPageContainer: {
    bottom: 24,
  },
  blurContainer: {
    ...StyleSheet.absoluteFillObject,
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
  controlButton: {
    padding: 4,
    marginHorizontal: 4,
  },
});
