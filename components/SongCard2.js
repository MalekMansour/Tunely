import React from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { Image } from 'expo-image'; 
import { styles } from "../styles";
import { useNavigation } from "@react-navigation/native";
import { useAudio } from "../context/AudioContext";
import { Ionicons } from '@expo/vector-icons';

const defaultCoverImage = require('../assets/note.jpg');

const SongCard2 = ({ song, contextSongs }) => {
  const navigation = useNavigation();
  const { playSound, pauseSound, resumeSound, currentSong, isPlaying, changePlaylist } = useAudio();

  const handlePress = async () => {
    // If current song, toggle play/pause
    if (currentSong && currentSong.songId === song.songId) {
      if (isPlaying) {
        await pauseSound();
      } else {
        await resumeSound();
      }
    } else {
      // Set playlist context if available
      if (contextSongs && contextSongs.length > 0) {
        changePlaylist(contextSongs, 'recentlyPlayed');
      }
      await playSound(song);
    }
  };

  const isCurrentSong = currentSong?.songId === song.songId;

  return (
    <TouchableOpacity
      style={[styles.songCard2, isCurrentSong && styles.activeSongCard2]}
      onPress={handlePress}
    >
      <View style={isCurrentSong ? styles.activeSongCard2Image : styles.songCard2Image}>
        <Image 
          source={song.song_photo_url ? { uri: song.song_photo_url } : defaultCoverImage}
          style={{ width: '100%', height: '100%', borderRadius: 8 }}
          cachePolicy="memory-disk"
          transition={300}
        />
        <View style={[styles.songCard2TitleContainer, { position: 'absolute', bottom: 0, width: '100%' }]}>
          <Text style={styles.songCard2Title}>{song.title}</Text>
          <Text style={styles.songCard2Artist}>{song.artistName}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default SongCard2;