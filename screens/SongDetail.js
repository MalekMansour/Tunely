import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Image,
  Animated,
  TouchableOpacity,
  Dimensions,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import Scrubber from "../components/Scrubber";
import PlayPauseButton from "../components/PlayPauseButton";
import SkipButton from "../components/SkipButton";
import { useAudio } from "../context/AudioContext";
import { likesService } from "../services/likesService";
import { auth } from "../Utility/firebaseConfig";
import { styles } from "../styles";
import { useTheme } from "../context/ThemeContext";

const defaultCoverImage = require("../assets/note.jpg");
const SCREEN_HEIGHT = Dimensions.get("window").height;
const IMAGE_SIZE = 350;

export default function SongDetailScreen({ route }) {
  const { song: initialSong } = route.params;
  const navigation = useNavigation();
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;

  const { currentSong, isPlaying, playNextSong, playPreviousSong, playlist } = useAudio();
  const { theme, opacity } = useTheme();

  const [currentSongState, setCurrentSongState] = useState(initialSong);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialSong.likes || 0);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [isManuallyNavigating, setIsManuallyNavigating] = useState(false);

  const handleArtistPress = () => {
    navigation.replace("ArtistPage", {
      artistName: currentSongState.artistName,
      profilePicture: currentSongState.artistProfilePicture ? currentSongState.artistProfilePicture : defaultCoverImage,
    });
  };

  const animateSongChange = (direction, newSong) => {
    const startValue = direction === "next" ? Dimensions.get("window").width : -Dimensions.get("window").width;
    translateX.setValue(startValue);

    setCurrentSongState(newSong);

    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: false,
      friction: 8,
      tension: 40,
    }).start();
  };

  useEffect(() => {
    if (currentSong && currentSongState.songId !== currentSong.songId && !isManuallyNavigating) {
      const currentIndex = playlist.findIndex((s) => s.songId === currentSongState.songId);
      const newIndex = playlist.findIndex((s) => s.songId === currentSong.songId);
      const direction = newIndex > currentIndex ? "next" : "prev";

      animateSongChange(direction, currentSong);
    }
    setIsManuallyNavigating(false);
  }, [currentSong]);

  const handleNext = async () => {
    const currentIndex = playlist.findIndex((s) => s.songId === currentSongState.songId);
    if (currentIndex < playlist.length - 1) {
      const nextSong = playlist[currentIndex + 1];
      setIsManuallyNavigating(true);
      await playNextSong();
      animateSongChange("next", nextSong);
    }
  };

  const handlePrevious = async () => {
    const currentIndex = playlist.findIndex((s) => s.songId === currentSongState.songId);
    if (currentIndex > 0) {
      const previousSong = playlist[currentIndex - 1];
      setIsManuallyNavigating(true);
      await playPreviousSong();
      animateSongChange("prev", previousSong);
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
      const result = await likesService.toggleLike(currentSongState.songId);
      setIsLiked(result.action === "liked");
      setLikeCount(result.likeCount);
    } catch (error) {
      console.error("Error toggling like:", error);
    } finally {
      setIsLikeLoading(false);
    }
  };

  const scale = translateY.interpolate({
    inputRange: [-150, 0, 400],
    outputRange: [1.1, 1, 0.8],
    extrapolate: "clamp",
  });

  const imageTranslateY = translateY.interpolate({
    inputRange: [-200, 0, 200],
    outputRange: [-80, 0, 80],
    extrapolate: "clamp",
  });

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: translateY } }],
    { useNativeDriver: false }
  );

  const onHandlerStateChange = (event) => {
    if (event.nativeEvent.state === State.END) {
      if (event.nativeEvent.translationY > 100) {
        Animated.timing(translateY, {
          toValue: SCREEN_HEIGHT,
          duration: 300,
          useNativeDriver: false,
        }).start(() => navigation.goBack());
      } else if (event.nativeEvent.translationY < -100) {
        navigation.navigate("CommentScreen", { song: currentSongState });
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

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      translateY.setValue(0);
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    const checkLikeStatus = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;
        const result = await likesService.checkLiked(currentSongState.songId);
        setIsLiked(result.liked);
        if (result.likeCount) {
          setLikeCount(result.likeCount);
        }
      } catch (error) {
        console.error("Error checking like status:", error);
      }
    };
    checkLikeStatus();
  }, [currentSongState.songId]);

  return (
    <PanGestureHandler onGestureEvent={onGestureEvent} onHandlerStateChange={onHandlerStateChange}>
      <Animated.View
        style={[
          styles.songDetailsContainer,
          {
            transform: [{ translateY }],
            borderWidth: 1,
            borderColor: theme.border,
            backgroundColor: theme.background,
            opacity: opacity,
            shadowColor: theme.border,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 1,
            shadowRadius: 12,
            marginTop: 0,
            marginHorizontal: 0,
            borderRadius: 60,
            width: "100%",
            height: "100%",
          },
        ]}
      >
        <View style={styles.imageTitleContainer}>
          <Animated.Image
            source={currentSongState.song_photo_url ? { uri: currentSongState.song_photo_url } : defaultCoverImage}
            style={[
              styles.songImage,
              {
                transform: [
                  { scale },
                  { translateY: imageTranslateY },
                  { translateX },
                ],
                width: IMAGE_SIZE,
                height: IMAGE_SIZE,
                alignSelf: "center",
              },
            ]}
          />
          <Text
            style={[styles.songTitle, { color: theme.text }]}
            onPress={handleArtistPress}
          >
            {currentSongState.title}
          </Text>
          <Text
            style={[styles.songArtist, { color: theme.text }]}
            onPress={handleArtistPress}
          >
            {currentSongState.artistName}
          </Text>
        </View>

        <Scrubber />

        <View style={styles.controls}>
          <SkipButton direction="back" onPress={handlePrevious} />
          <PlayPauseButton
            song={currentSongState}
            isPlaying={isPlaying && currentSong?.songId === currentSongState.songId}
          />
          <SkipButton direction="forward" onPress={handleNext} />
        </View>

        <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%", paddingHorizontal: 20 }}>
          <TouchableOpacity onPress={() => navigation.navigate("CommentScreen", { song: currentSongState })}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={40}
              style={{ marginTop: 60, marginLeft: 30 }}
              color={theme.text}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleLike} disabled={isLikeLoading}>
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={40}
              style={{ marginTop: 60, marginRight: 30 }}
              color={isLiked ? "#ff375f" : theme.text}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.arrowButton}>
          <Ionicons name="chevron-down" size={32} color={theme.text} />
        </TouchableOpacity>
      </Animated.View>
    </PanGestureHandler>
  );
}
