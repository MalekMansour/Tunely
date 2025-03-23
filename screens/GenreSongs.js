import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { songService } from "../services/songService";
import SongCard from "../components/SongCard";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

// THEME IMPORTS
import { useTheme } from "../context/ThemeContext";
import ThemedScreen from "../components/ThemedScreen";

export default function GenreSongs() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const route = useRoute();
  const navigation = useNavigation();
  const { genre } = route.params;

  // ✅ THEME HOOK
  const { theme } = useTheme();

  useEffect(() => {
    const fetchSongsByGenre = async () => {
      setLoading(true);
      try {
        const allSongs = await songService.getAllSongs();
        const genreSongs = allSongs.filter(
          (song) => song.genre.toLowerCase() === genre.toLowerCase()
        );
        setSongs(genreSongs);
      } catch (error) {
        console.error("Error fetching songs by genre:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSongsByGenre();
  }, [genre]);

  return (
    <ThemedScreen style={[styles.container, { backgroundColor: theme.background }]}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.arrowButton}>
        <Ionicons name="arrow-back" size={28} color={theme.text} />
      </TouchableOpacity>

      <Text style={[styles.genreTitle, { color: theme.text }]}>{genre} Songs</Text>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={theme.text}
          style={styles.loader}
        />
      ) : songs.length === 0 ? (
        <Text style={[styles.emptyText, { color: theme.text }]}>
          No songs found for this genre.
        </Text>
      ) : (
        <FlatList
          data={songs}
          keyExtractor={(item) => item.songId.toString()}
          renderItem={({ item }) => <SongCard song={item} />}
          contentContainerStyle={styles.list}
        />
      )}
    </ThemedScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // originally backgroundColor: "#000"
    padding: 16,
  },
  arrowButton: {
    position: "absolute",
    left: 16,
    zIndex: 1,
    marginTop: 60,
  },
  genreTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    marginTop: 80,
    textAlign: "center",
    // originally color: "#fff"
  },
  loader: {
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 30,
    // originally color: "#888"
  },
  list: {
    paddingBottom: 20,
  },
});
