import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Image,
  Animated,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Scrubber from "../components/Scrubber";
import PlayPauseButton from "../components/PlayPauseButton";
import SkipButton from "../components/SkipButton";
import { useAudio } from "../context/AudioContext";
import { likesService } from "../services/likesService";
import { auth } from "../Utility/firebaseConfig";
import { styles } from "../styles";

const defaultCoverImage = require("../assets/note.jpg");

const SCREEN_HEIGHT = Dimensions.get("window").height;
const IMAGE_SIZE = 350; // Standard image size

export default function SongDetailScreen({ route }) {
  const { song } = route.params;
  const navigation = useNavigation();
  const translateY = useRef(new Animated.Value(0)).current;
  const { currentSong, isPlaying, playNextSong, playPreviousSong, playlist } =
    useAudio();

  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(song.likes || 0);
  const [isLikeLoading, setIsLikeLoading] = useState(false);

  useEffect(() => {
    if (currentSong && song.songId !== currentSong.songId) {
      navigation.replace("SongDetail", { song: currentSong });
    }
  }, [currentSong]);

  const handleDismiss = () => {
    Animated.timing(translateY, {
      toValue: SCREEN_HEIGHT,
      duration: 300,
      useNativeDriver: false,
    }).start(() => navigation.goBack());
  };

  const handleNext = async () => {
    const currentIndex = playlist.findIndex((s) => s.songId === song.songId);
    if (currentIndex < playlist.length - 1) {
      const nextSong = playlist[currentIndex + 1];
      await playNextSong();
      navigation.replace("SongDetail", { song: nextSong });
    }
  };

  const handlePrevious = async () => {
    const currentIndex = playlist.findIndex((s) => s.songId === song.songId);
    if (currentIndex > 0) {
      const previousSong = playlist[currentIndex - 1];
      await playPreviousSong();
      navigation.replace("SongDetail", { song: previousSong });
    }
  };

  const toggleLike = async () => {
    if (isLikeLoading) return;

    try {
      setIsLikeLoading(true);
      const user = auth.currentUser;

      if (!user) {
        Alert.alert("Sign In Required", "Please sign in to like songs");
        return;
      }

      const result = await likesService.toggleLike(song.songId);
      setIsLiked(result.action === "liked");
      setLikeCount(result.likeCount);
    } catch (error) {
      console.error("Error toggling like:", error);
    } finally {
      setIsLikeLoading(false);
    }
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: translateY } }],
    { useNativeDriver: false }
  );

  const onHandlerStateChange = (event) => {
    if (event.nativeEvent.state === State.END) {
      if (event.nativeEvent.translationY > 100) {
        handleDismiss();
      } else {
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: false,
          friction: 6,
          tension: 30,
        }).start();
      }
    }
  };

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
    >
      <Animated.View
        style={[
          styles.songDetailsContainer,
          {
            transform: [{ translateY }],
            backgroundColor: "rgb(25, 26, 27)",
            borderWidth: 1.5,
            borderRadius: 16,
            borderColor: "#99a9b9",
            shadowColor: "#99a9b9",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 1,
            shadowRadius: 10,
            marginTop: 0, 
          },
        ]}
        
      >
        {/* Down Arrow Button */}
        <TouchableOpacity onPress={handleDismiss} style={styles.arrowButton}>
          <Ionicons name="chevron-down" size={32} color="#ffffff"/>
        </TouchableOpacity>

        <View style={styles.imageTitleContainer}>
          <Image
            source={
              song.song_photo_url ? { uri: song.song_photo_url } : defaultCoverImage
            }
            style={[
              styles.songImage,
              { width: IMAGE_SIZE, height: IMAGE_SIZE, alignSelf: "center" },
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
          colors={["#111", "#3333"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.likeContainer}
        >
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
