import React from "react";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../styles";
import { useAudio } from "../context/AudioContext";
import { useTheme } from "../context/ThemeContext";

export default function PlayPauseButton({ song }) {
  const { playSound, pauseSound, resumeSound, currentSong, isPlaying } = useAudio();
  const { theme } = useTheme(); 

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
    <TouchableOpacity onPress={handlePress} style={styles.iconButton}>
      <Ionicons
        name={isCurrentSong && isPlaying ? "pause" : "play"}
        size={40}
        color={theme.text} 
      />
    </TouchableOpacity>
  );
}
