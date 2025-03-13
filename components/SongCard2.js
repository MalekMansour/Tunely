import React from "react";
import { Text, View, TouchableOpacity, ImageBackground } from "react-native";
import { styles } from "../styles";
import { useNavigation } from "@react-navigation/native";
import { useAudio } from "../context/AudioContext";
import { Ionicons } from '@expo/vector-icons';

const defaultCoverImage = require('../assets/note.jpg');

const SongCard2 = ({ song }) => {
  const navigation = useNavigation();
  const { playSound, pauseSound, resumeSound, currentSong, isPlaying } = useAudio();

  const handlePress = async () => {
    if (currentSong?.songId === song.songId) {
      if (isPlaying) {
        await pauseSound();
      } else {
        await resumeSound();
      }
    } else {
      await playSound(song);
    }
  };

  const isCurrentSong = currentSong?.songId === song.songId;

  return (
    <TouchableOpacity
      style={[styles.songCard2, isCurrentSong && styles.activeSongCard2]}
      onPress={handlePress}
    >
      <ImageBackground 
        source={song.song_photo_url ? { uri: song.song_photo_url } : defaultCoverImage}
        style={isCurrentSong ? styles.activeSongCard2Image : styles.songCard2Image}
        imageStyle={{ borderRadius: 8 }}
      >
        <View style={styles.songCard2TitleContainer}>
          <Text style={styles.songCard2Title}>{song.title}</Text>
          <Text style={styles.songCard2Artist}>{song.artistName}</Text>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

export default SongCard2;