import React from "react";
import { Text, View, TouchableOpacity, Image, Modal } from "react-native";
import { styles } from "../styles";
import { useNavigation } from "@react-navigation/native";
import { useAudio } from "../context/AudioContext";
import { Ionicons } from '@expo/vector-icons';
import { useState } from "react";

const defaultCoverImage = require('../assets/note.jpg');

const SongCard = ({ song, playlistId, showOptions, onRemove, isOwnContent }) => {

  const navigation = useNavigation();
  const { playSound, pauseSound, resumeSound, currentSong, isPlaying } = useAudio();

  // Determine if this is the current song 
  const isCurrentSong = currentSong?.songId === song.songId;

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


  return (
    <View>
      <TouchableOpacity
        style={[styles.songCard, isCurrentSong && styles.activeSongCard]}
        onPress={handlePress}
      >
        <Image 
          source={song.song_photo_url ? { uri: song.song_photo_url } : defaultCoverImage}
          style={styles.songCardImage} 
        />
        <View style={styles.songCardInfo}>
          <Text style={styles.songCardTitle}>{song.title}</Text>
          <Text style={styles.songCardArtist}>{song.artistName}</Text>
        </View>
        
        {/* Only show options if it's the user's own content */}
        {isOwnContent && (
          <TouchableOpacity 
          onPress={() => onRemove(song.songId || song.id)} 
          style={styles.optionsIcon}
        >
            <Ionicons name="ellipsis-vertical" size={24} color="#333" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {/* Modal for confirming song removal */}

    </View>
  );
};

export default SongCard;