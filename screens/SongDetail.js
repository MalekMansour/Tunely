import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
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
import { Canvas, Image as CanvasImage } from "react-native-canvas";
import FastImage from "react-native-fast-image";

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
  const [bgColor, setBgColor] = useState("#222"); // Default background color

  useEffect(() => {
    if (currentSong && song.songId !== currentSong.songId) {
      navigation.replace("SongDetail", { song: currentSong });
    }
  }, [currentSong]);

  useEffect(() => {
    if (song.song_photo_url) {
      getDominantColor(song.song_photo_url)
        .then((color) => setBgColor(color))
        .catch((error) => console.error("Error extracting color:", error));
    }
  }, [song.song_photo_url]);

  const getDominantColor = async (imageUri) => {
    return new Promise((resolve, reject) => {
      const canvas = new Canvas();
      const context = canvas.getContext("2d");
      const img = new CanvasImage(canvas);

      img.src = imageUri;
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0, img.width, img.height);

        const imageData = context.getImageData(0, 0, img.width, img.height).data;
        let r = 0, g = 0, b = 0, count = 0;

        for (let i = 0; i < imageData.length; i += 4 * 10) { // Sample every 10th pixel
          r += imageData[i];
          g += imageData[i + 1];
          b += imageData[i + 2];
          count++;
        }

        r = Math.floor(r / count);
        g = Math.floor(g / count);
        b = Math.floor(b / count);

        resolve(`rgb(${r}, ${g}, ${b})`);
      };

      img.onerror = (error) => reject(error);
    });
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
        navigation.navigate("CommentScreen", { song: song });
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

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
    >
      <Animated.View
        style={[
          styles.songDetailsContainer,
          { backgroundColor: bgColor, transform: [{ translateY }] },
        ]}
      >
        <View style={styles.imageTitleContainer}>
          <Animated.Image
            source={song.song_photo_url ? { uri: song.song_photo_url } : defaultCoverImage}
            style={[
              styles.songImage,
              {
                transform: [{ scale }, { translateY: imageTranslateY }],
                width: IMAGE_SIZE,
                height: IMAGE_SIZE,
                alignSelf: "center",
              },
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

        <LinearGradient colors={["#111", "#3333"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.likeContainer}>
          <TouchableOpacity onPress={toggleLike} disabled={isLikeLoading} style={styles.likeButton}>
            <Ionicons name={isLiked ? "heart" : "heart-outline"} size={30} color={isLiked ? "#ff375f" : "#ffffff"} />
          </TouchableOpacity>
          <Text style={styles.likeCount}>{likeCount}</Text>
        </LinearGradient>
      </Animated.View>
    </PanGestureHandler>
  );
}
