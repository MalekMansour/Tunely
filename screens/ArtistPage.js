import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { songService } from "../services/songService";
import SongCard from "../components/SongCard";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import ThemedScreen from "../components/ThemedScreen";

export default function ArtistPage() {
  const [allFilteredSongs, setAllFilteredSongs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const songsPerPage = 5;
  const displayedSongs = allFilteredSongs.slice(0, currentPage * songsPerPage);
  const [loading, setLoading] = useState(true);

  const { theme } = useTheme();
  const route = useRoute();
  const navigation = useNavigation();

  // Expect route.params to have artistName only.
  const { artistName } = route.params || {};

  useEffect(() => {
    const fetchSongsByArtist = async () => {
      if (!artistName) {
        console.error("Artist name is missing");
        return;
      }
      setLoading(true);
      try {
        const allSongs = await songService.getAllSongs();
        // Filter songs by artist name.
        const artistSongs = allSongs.filter(
          (song) => song.artistName.toLowerCase() === artistName.toLowerCase()
        );
        // Sort songs by release date descending (assuming releaseDate is a valid date string).
        artistSongs.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
        setAllFilteredSongs(artistSongs);
        setCurrentPage(1);
      } catch (error) {
        console.error("Error fetching songs by artist:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSongsByArtist();
  }, [artistName]);

  const loadMoreSongs = () => {
    if (displayedSongs.length < allFilteredSongs.length) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const latestCover =
  allFilteredSongs.length > 0 && allFilteredSongs[0].song_photo_url
    ? allFilteredSongs[0].song_photo_url
    : null;

  return (
    <ThemedScreen style={[styles.container, { backgroundColor: theme.background }]}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.arrowButton}>
        <Ionicons name="arrow-back" size={28} color={theme.text} />
      </TouchableOpacity>

      <View style={styles.headerContainer}>
        <Image
          source={
            latestCover
              ? { uri: latestCover }
              : require("../assets/profile.png")
          }
          style={styles.profileImage}
        />
        <Text style={[styles.artistName, { color: theme.text }]}>{artistName}</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.text} style={styles.loader} />
      ) : (
        <FlatList
          data={displayedSongs}
          keyExtractor={(item) => item.songId.toString()}
          renderItem={({ item }) => <SongCard song={item} noNavigation />}
          contentContainerStyle={styles.list}
          ListFooterComponent={() =>
            displayedSongs.length < allFilteredSongs.length ? (
              <TouchableOpacity onPress={loadMoreSongs} style={styles.loadMoreButton}>
                <Text style={[styles.loadMoreText, { color: theme.text }]}>Load More</Text>
              </TouchableOpacity>
            ) : null
          }
        />
      )}
    </ThemedScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  arrowButton: {
    position: "absolute",
    left: 16,
    zIndex: 1,
    marginTop: 60,
  },
  headerContainer: {
    alignItems: "center",
    marginTop: 80,
  },
  profileImage: {
    width: 200,
    height: 200,
    borderRadius: 150,
    marginBottom: 16,
  },
  artistName: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  loader: {
    marginTop: 50,
  },
  list: {
    paddingBottom: 120,
  },
  loadMoreButton: {
    marginTop: 16,
    alignItems: "center",
  },
  loadMoreText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
