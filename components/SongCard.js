import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "../context/ThemeContext"; // for colors
import ThemedView from "../components/ThemedScreen";   

import { styles } from "../styles";
import { useAudio } from "../context/AudioContext";
import { auth } from "../Utility/firebaseConfig";
import { likesService } from "../services/likesService";

const defaultCoverImage = require("../assets/note.jpg");

const SongCard = ({ song, playlistId, showOptions, onRemove, isOwnContent }) => {
  const navigation = useNavigation();
  const { theme } = useTheme(); // Access theme.* colors
  const { playSound, pauseSound, resumeSound, currentSong, isPlaying } = useAudio();

  // Determine if this is the current song
  const isCurrentSong = currentSong?.songId === song.songId;

  const handlePress = async () => {
    if (isCurrentSong) {
      if (isPlaying) {
        await pauseSound();
      } else {
        await resumeSound();
      }
    } else {
      await playSound(song);
    }
  };

  return (
    <ThemedView style={{ marginVertical: 4 }}>
      <TouchableOpacity
        style={[styles.songCard, isCurrentSong && styles.activeSongCard]}
        onPress={handlePress}
      >
        <Image
          source={song.song_photo_url ? { uri: song.song_photo_url } : defaultCoverImage}
          style={styles.songCardImage}
        />
        <View style={styles.songCardInfo}>
  
          {/* Apply the theme color here */}
          <Text style={[styles.songCardTitle, { color: theme.text }]}>
            {song.title}
          </Text>
          <Text style={[styles.songCardArtist, { color: theme.text }]}>
            {song.artistName}
          </Text>
  
        </View>
  
        {isOwnContent && (
          <TouchableOpacity
            onPress={() => onRemove(song.songId || song.id)}
            style={styles.optionsIcon}
          >
            <Ionicons name="ellipsis-vertical" size={24} color={theme.text} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </ThemedView>
  );
}
export default SongCard;
