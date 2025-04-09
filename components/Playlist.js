import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Image } from 'expo-image'; 
import { useNavigation } from '@react-navigation/native';
import { playlistService } from "../services/playlistService";
import { useTheme } from "../context/ThemeContext";

const defaultCoverImage = require('../assets/note.jpg');

const PlayList = ({ title, playlistId, songs: initialSongs = [], image, style, onDelete }) => {
  const navigation = useNavigation();
  const [songs, setSongs] = useState(initialSongs);
  const { theme } = useTheme();
  
  useEffect(() => {
    const loadPlaylist = async () => {
      if (initialSongs.length === 0 && playlistId) {
        try {
          const fetchedSongs = await playlistService.fetchPlaylist(playlistId);
          setSongs(fetchedSongs || []);
        } catch (error) {
          console.error("Error fetching playlist songs:", error);
        }
      }
    };
    
    loadPlaylist();
  }, [playlistId]);
  
  useEffect(() => {
    if (initialSongs.length > 0) {
      setSongs(initialSongs);
    }
  }, [initialSongs]);
  
  const handlePress = () => {
    navigation.navigate("PlaylistDetail", {
      playlistId,
      title,
      songs,
      image
    });
  };
  
  const handleLongPress = () => {
    if (onDelete) {
      Alert.alert(
        'Delete Playlist',
        `Are you sure you want to delete "${title}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Delete', 
            style: 'destructive', 
            onPress: () => onDelete(playlistId) 
          }
        ]
      );
    }
  };
  
  const getSongCovers = () => {
    const songCovers = [];
    
    if (songs && songs.length > 0) {
      for (let i = 0; i < Math.min(songs.length, 4); i++) {
        if (songs[i]?.song_photo_url) {
          songCovers.push({ uri: songs[i].song_photo_url });
        } else if (songs[i]?.image) {
          songCovers.push(songs[i].image);
        } else {
          songCovers.push(defaultCoverImage);
        }
      }
    }
    
    while (songCovers.length < 4) {
      songCovers.push(defaultCoverImage);
    }
    
    return songCovers;
  };
  
  const songCovers = getSongCovers();
  
  return (
    <TouchableOpacity 
      style={[styles.container, style]} 
      onPress={handlePress}
      onLongPress={handleLongPress}
      delayLongPress={500}
    >
      <View style={styles.playlistCoverGrid}>
        <View style={styles.playlistCoverRow}>
          <Image 
            source={songCovers[0]} 
            style={styles.playlistCoverQuadrant} 
            cachePolicy="memory-disk"
            transition={300}
            contentFit="cover"
          />
          <Image 
            source={songCovers[1]} 
            style={styles.playlistCoverQuadrant} 
            cachePolicy="memory-disk"
            transition={300}
            contentFit="cover"
          />
        </View>
        <View style={styles.playlistCoverRow}>
          <Image 
            source={songCovers[2]} 
            style={styles.playlistCoverQuadrant} 
            cachePolicy="memory-disk"
            transition={300}
            contentFit="cover"
          />
          <Image 
            source={songCovers[3]} 
            style={styles.playlistCoverQuadrant}
            cachePolicy="memory-disk"
            transition={300}
            contentFit="cover"
          />
        </View>
      </View>
      
      <Text style={[styles.titleText, { color: theme.text }]} numberOfLines={1}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    borderRadius: 0,
    marginHorizontal: 10,
    marginVertical: 8,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    width: '45%',
  },
  playlistCoverGrid: {
    width: '100%',
    aspectRatio: 1,
    overflow: 'hidden',
  },
  playlistCoverRow: {
    flexDirection: 'row',
    height: '50%',
  },
  playlistCoverQuadrant: {
    width: '50%',
    height: '100%',
  },
  playlistOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 5,
  },
  titleText: {
    color: '#fff', 
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
    marginTop: 7,
  },
  subtitleText: {
    color: '#aaa',
    fontSize: 14,
  },
});

export default React.memo(PlayList);
