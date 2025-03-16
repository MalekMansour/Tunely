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

  useEffect(() => {
    const checkLikeStatus = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const result = await likesService.checkLiked(song.songId);
        setIsLiked(result.liked);

        if (result.likeCount) {
          setLikeCount(result.likeCount);
        }
      } catch (error) {
        console.error("Error checking like status:", error);
      }
    };

    checkLikeStatus();
  }, [song.songId]);

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
            borderWidth: 1,
            borderColor: "#99a9b9",
            shadowColor: "#99a9b9",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 1,
            shadowRadius: 10,
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
            source={
              song.song_photo_url ? { uri: song.song_photo_url } : defaultCoverImage
            }
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

         {/* Control buttons for like and comment */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: 20 }}>
        <TouchableOpacity
          onPress={() => navigation.navigate("CommentScreen", { song: song })}
          style={{ alignSelf: 'flex-end' }} // Align to bottom left
        >
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={40}
            marginTop={60}
            marginLeft={30}
            color="#ffffff"
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={toggleLike}
          disabled={isLikeLoading}
          style={{ alignSelf: 'flex-end' }} 
        >
          <Ionicons
            name={isLiked ? "heart" : "heart-outline"}
            size={40}
            marginTop={60}
            marginRight={30}
            color={isLiked ? "#ff375f" : "#ffffff"}
          />
        </TouchableOpacity>
      </View>

        {/* Down Arrow Button */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.arrowButton}>
          <Ionicons name="chevron-down" size={32} color="#ffffff" />
        </TouchableOpacity>
      </Animated.View>
    </PanGestureHandler>
  );
}