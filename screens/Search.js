import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Image,
} from "react-native";
import { playlistService } from "../services/playlistService";
import { songService } from "../services/songService";
import { useNavigation } from "@react-navigation/native";
import PlayList from "../components/Playlist";
import SongCard from "../components/SongCard";
import ArtistCard from "../components/ArtistCard"; // Import ArtistCard
import { Ionicons } from "@expo/vector-icons";

// THEME IMPORTS
import { useTheme } from "../context/ThemeContext";
import ThemedScreen from "../components/ThemedScreen";

const musicGenres = [
  { id: "1", name: "Pop", color: "#E74C3C" },
  { id: "2", name: "Rap", color: "#9B59B6" },
  { id: "3", name: "Acoustic", color: "#3498DB" },
  { id: "4", name: "Lofi", color: "#F39C12" },
  { id: "5", name: "R&B", color: "#1ABC9C" },
  { id: "6", name: "Rock", color: "#34495E" },
  { id: "7", name: "Electronic", color: "#27AE60" },
  { id: "8", name: "Alternative", color: "#8E44AD" },
  { id: "9", name: "Jazz", color: "#F1C40F" },
  { id: "10", name: "Trap", color: "#E67E22" },
  { id: "11", name: "Country", color: "#D35400" },
  { id: "12", name: "Other", color: "#7F8C8D" },
];

// Helper function to get an icon image for each genre.
const getGenreIcon = (genreName) => {
  const lower = genreName.toLowerCase();
  switch (lower) {
    case "pop":
      return require("../assets/icons/pop.png");
    case "rap":
      return require("../assets/icons/rap.png");
    case "acoustic":
      return require("../assets/icons/acoustic.png");
    case "lofi":
      return require("../assets/icons/lofi.png");
    case "r&b":
      return require("../assets/icons/rnb.png");
    case "rock":
      return require("../assets/icons/rock.png");
    case "electronic":
      return require("../assets/icons/electronic.png");
    case "alternative":
      return require("../assets/icons/alternative.png");
    case "jazz":
      return require("../assets/icons/jazz.png");
    case "trap":
      return require("../assets/icons/trap.png");
    case "country":
      return require("../assets/icons/country.png");
    case "other":
      return require("../assets/icons/other.png");
    default:
      return null;
  }
};

export default function Search() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const [query, setQuery] = useState("");
  // results is an object with two arrays: one for songs and one for artists
  const [results, setResults] = useState({ songs: [], artists: [] });
  const [isSearching, setIsSearching] = useState(false);

  // THEME USAGE
  const { theme } = useTheme();

  useEffect(() => {
    async function fetchPlaylists() {
      setLoading(true);
      const playlistData = await playlistService.getAllPlaylists();
      setPlaylists(playlistData);
      setLoading(false);
    }
    fetchPlaylists();
  }, []);

  const handleSearch = async (text) => {
    setQuery(text);
    if (text.length > 2) {
      setIsSearching(true);
      try {
        // Get songs matching the search query
        const songs = await songService.searchSongs(text);
        // Derive unique artists from the songs results
        const artistMap = {};
        songs.forEach((song) => {
          if (song.artistName && !artistMap[song.artistName]) {
            // Using song.artistName and optionally song.artistProfilePic if available
            artistMap[song.artistName] = {
              artistId: song.userId || song.artistId || song.artistName,
              artistName: song.artistName,
              profilePicture: song.artistProfilePic || null,
            };
          }
        });
        const artists = Object.values(artistMap);
        setResults({ songs, artists });
      } catch (error) {
        console.error("Error searching songs:", error);
        setResults({ songs: [], artists: [] });
      }
    } else {
      setIsSearching(false);
      setResults({ songs: [], artists: [] });
    }
  };

  const clearSearch = () => {
    setQuery("");
    setResults({ songs: [], artists: [] });
    setIsSearching(false);
  };

  const openGenrePage = (genre) => {
    navigation.navigate("GenreSongs", { genre });
  };

  return (
    <ThemedScreen style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.searchBarContainer}>
        <TextInput
          style={[styles.searchBar, { color: "#000" }]}
          placeholder="Search for something"
          placeholderTextColor="#888"
          value={query}
          onChangeText={handleSearch}
        />
        {query ? (
          <TouchableOpacity style={styles.searchIcon} onPress={clearSearch}>
            <Text style={{ fontSize: 18, color: "#000" }}>✕</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.searchIcon}>
            <Ionicons name="search-outline" size={18} color="#000" />
          </TouchableOpacity>
        )}
      </View>

      {isSearching ? (
        <View style={styles.resultsList}>
          {/* Songs Results */}
          {results.songs && results.songs.length > 0 && (
            <FlatList
              data={results.songs}
              keyExtractor={(item) => item.songId.toString()}
              renderItem={({ item }) => <SongCard song={item} />}
              ListEmptyComponent={
                <Text style={[styles.emptyText, { color: "#000" }]}>No songs found</Text>
              }
            />
          )}
          {/* Artist Results */}
          {results.artists && results.artists.length > 0 && (
            <FlatList
              data={results.artists}
              keyExtractor={(item) => item.artistId.toString()}
              horizontal
              renderItem={({ item }) => <ArtistCard artist={item} />}
              ListEmptyComponent={
                <Text style={[styles.emptyText, { color: "#000" }]}>No artists found</Text>
              }
            />
          )}
        </View>
      ) : (
        <ScrollView>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Playlists</Text>
            {loading ? (
              <ActivityIndicator size="large" color={theme.text} />
            ) : (
              <ScrollView horizontal>
                {playlists.slice(0, 10).map((playlist) => (
                  <PlayList
                    key={playlist.id}
                    title={playlist.title || playlist.name}
                    playlistId={playlist.id}
                    songs={playlist.songs || []}
                    image={{ uri: playlist.image }}
                    style={{ width: 140, marginRight: 10 }}
                    textStyle={{ color: theme.text }}
                  />
                ))}
              </ScrollView>
            )}
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Browse by Genre</Text>
            <View style={styles.browseGrid}>
              {musicGenres.map((genre) => {
                const icon = getGenreIcon(genre.name);
                return (
                  <TouchableOpacity
                    key={genre.id}
                    style={[styles.categoryCard, { backgroundColor: genre.color }]}
                    onPress={() => openGenrePage(genre.name)}
                  >
                    <View style={styles.genreRow}>
                      <Text style={styles.categoryName}>{genre.name}</Text>
                      {icon && <Image source={icon} style={styles.genreIcon} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>
      )}
    </ThemedScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
    marginHorizontal: 16,
  },
  searchBar: {
    flex: 1,
    height: 40,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  searchIcon: {
    position: "absolute",
    right: 15,
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    marginLeft: 18,
  },
  artistCard: {
    marginRight: 16,
    width: 100,
    alignItems: "center",
  },
  artistImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginBottom: 8,
  },
  artistName: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
  },
  playlistCard: {
    marginRight: 16,
    width: 160,
  },
  playlistImage: {
    width: 160,
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  playlistName: {
    fontSize: 14,
  },
  browseGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "90%",
    margin: "auto",
    marginBottom: 100,
  },
  categoryCard: {
    width: "48%",
    height: 100,
    borderRadius: 8,
    marginBottom: 12,
    padding: 12,
    overflow: "hidden",
  },
  genreRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
    paddingHorizontal: 10,
  },
  categoryName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "left",
  },
  genreIcon: {
    width: 70,
    height: 70,
    resizeMode: "contain",
    marginLeft: 5,
  },
  categorySubtext: {
    color: "#fff",
    fontSize: 12,
    marginTop: 4,
  },
  categoryIconContainer: {
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryIcon: {
    width: 60,
    height: 60,
    resizeMode: "contain",
  },
  navbar: {
    flexDirection: "row",
    height: 60,
    backgroundColor: "#0A0E20",
    borderTopWidth: 0,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  navIcon: {
    fontSize: 20,
    color: "#888",
    marginBottom: 4,
  },
  navText: {
    fontSize: 12,
    color: "#888",
  },
  activeNavItem: {
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  activeNavIcon: {
    color: "#fff",
  },
  activeNavText: {
    color: "#fff",
  },
  emptyText: {
    color: "#888",
    fontSize: 14,
    textAlign: "center",
    marginTop: 10,
  },
  playlistsContainer: {
    paddingRight: 10,
    paddingBottom: 5,
    flexDirection: "row",
  },
  playlistWrap: {
    width: 300,
    marginRight: 0,
  },
  resultsList: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 70,
  },
});
