import React, { useState, useRef, useEffect } from "react";
import { View, Text, Image, Animated, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import { styles } from "../styles";
import Scrubber from "../components/Scrubber";
import PlayPauseButton from "../components/PlayPauseButton";
import SkipButton from "../components/SkipButton";
import { useAudio } from "../context/AudioContext";
import { Ionicons } from '@expo/vector-icons';
import { likesService } from "../services/likesService";
import { Alert } from 'react-native';
import { auth } from '../Utility/firebaseConfig';
import { LinearGradient } from 'expo-linear-gradient';

const defaultCoverImage = require('../assets/note.jpg');

export default function SongDetailScreen({ route }) {
  const { song } = route.params;
  const navigation = useNavigation();
  const SCREEN_HEIGHT = Dimensions.get('window').height;
  const translateY = useRef(new Animated.Value(0)).current;
  const { currentSong, isPlaying, playNextSong, playPreviousSong, playlist } = useAudio();

  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(song.likes || 0);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  
  useEffect(() => {
    // If the current song doesn't match the displayed song and we have a current song
    if (currentSong && song.songId !== currentSong.songId) {
      navigation.replace('SongDetail', { song: currentSong });
    }
  }, [currentSong]);

  const handleNext = async () => {
    const currentIndex = playlist.findIndex(s => s.songId === song.songId);
    if (currentIndex < playlist.length - 1) {
      const nextSong = playlist[currentIndex + 1];
      await playNextSong();
      navigation.replace('SongDetail', { song: nextSong });
    }
  };

  const handlePrevious = async () => {
    const currentIndex = playlist.findIndex(s => s.songId === song.songId);
    if (currentIndex > 0) {
      const previousSong = playlist[currentIndex - 1];
      await playPreviousSong();
      navigation.replace('SongDetail', { song: previousSong });
    }
  };

  const toggleLike = async () => {
    if (isLikeLoading) return;
    
    try {
      setIsLikeLoading(true);
      const user = auth.currentUser;
      
      if (!user) {
        Alert.alert('Sign In Required', 'Please sign in to like songs');
        return;
      }

      const result = await likesService.toggleLike(song.songId);
      console.log('Toggle like result:', result);
      
      // Update UI based on result
      setIsLiked(result.action === 'liked');
      setLikeCount(result.likeCount);
      
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setIsLikeLoading(false);
    }
  };
  
  
  const scale = translateY.interpolate({
    inputRange: [-150, 0, 400],
    outputRange: [0.25, 1, 0.40],
    extrapolate: 'clamp',
  });

  const translateX = translateY.interpolate({
    inputRange: [-200, 0, 400],
    outputRange: [-550, 0, -180],
    extrapolate: 'clamp',
  });

  const imageTranslateY = translateY.interpolate({
    inputRange: [-150, 0, 400],
    outputRange: [-280, 0, SCREEN_HEIGHT - 150],
    extrapolate: 'clamp',
  });

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: translateY } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event) => {
    if (event.nativeEvent.state === State.END) {
      if (event.nativeEvent.translationY > 100) {
        Animated.timing(translateY, {
          toValue: 200,
          duration: 200,
          useNativeDriver: true,
        }).start(() => navigation.goBack());
      } else if (event.nativeEvent.translationY < -100) {
        navigation.navigate('CommentScreen', { song: song});
        Animated.timing(translateY, {
          toValue: -200,
          duration: 200,
          useNativeDriver: true,
        }).start();
      } else {
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          friction: 8,
          tension: 40
        }).start();
      }
    }
  };
//resets screen position when coming back to it 
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      translateY.setValue(0);
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    const checkLikeStatus = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;
  
        const result = await likesService.checkLiked(song.songId);
        setIsLiked(result.liked);
        
        // Optionally update like count if your API returns it
        if (result.likeCount) {
          setLikeCount(result.likeCount);
        }
      } catch (error) {
        console.error('Error checking like status:', error);
      }
    };
  
    checkLikeStatus();
  }, [song.songId]);

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
    >
      <Animated.View style={[styles.songDetailsContainer, { transform: [{ translateY }] }]}>
        <View style={styles.imageTitleContainer}>
          <Animated.Image 
            source={
              song.song_photo_url 
                ? { uri: song.song_photo_url }
                : defaultCoverImage
            }
            style={[
              styles.songImage, 
              { 
                transform: [
                  { scale },
                  { translateX },
                  { translateY: imageTranslateY }
                ] 
              }
            ]} 
          />
          <Text style={styles.songTitle}>{song.title}</Text>
          <Text style={styles.songArtist}>{song.artistName}</Text>
        </View>
        
        
        <Scrubber />
        <View style={styles.controls}>
          <SkipButton direction="back" onPress={handlePrevious} />
          <PlayPauseButton 
            song={song}
            isPlaying={isPlaying && currentSong?.songId === song.songId}
          />
          <SkipButton direction="forward" onPress={handleNext} />
          
        </View>
        <LinearGradient
          colors={['#111', '#333']} 
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.likeContainer}>
            <TouchableOpacity 
              onPress={toggleLike}
              disabled={isLikeLoading}
              style={styles.likeButton}
            >
              <Ionicons 
                name={isLiked ? "heart" : "heart-outline"} 
                size={30} 
                color={isLiked ? "#ff375f" : "#ffffff"} 
              />
            </TouchableOpacity>
            <Text style={styles.likeCount}>{likeCount}</Text>
            </LinearGradient>
      </Animated.View>
    </PanGestureHandler>
  );
}