import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SongCard from "../components/SongCard";
import { LinearGradient } from "expo-linear-gradient";
import { useRoute, useNavigation } from "@react-navigation/native";
import { auth } from "../Utility/firebaseConfig";
import { playlistService } from "../services/playlistService";
import { songService } from "../services/songService";
import { useAudio } from "../context/AudioContext";

const defaultCoverImage = require("../assets/note.jpg");

const PlaylistDetail = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { playlistId, title } = route.params;

  // Playlist songs state
  const [playlistSongs, setPlaylistSongs] = useState([]);
  const [userSongs, setUserSongs] = useState([]);
  const [isOwnPlaylist, setIsOwnPlaylist] = useState(false);

  // Modal & search state for adding songs
  const [modalVisible, setModalVisible] = useState(false);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);

  // Audio context (assumes playSound is implemented)
  const { playSound } = useAudio();

  // Fetch playlist songs
  useEffect(() => {
    const loadPlaylist = async () => {
      try {
        const songs = await playlistService.fetchPlaylist(playlistId);
        setUserSongs(songs);
        setPlaylistSongs(songs);
      } catch (error) {
        console.error("Error loading playlist:", error);
      }
    };
    loadPlaylist();
  }, [playlistId]);

  // Check if current user owns the playlist
  useEffect(() => {
    const checkOwnership = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setIsOwnPlaylist(false);
          return;
        }
        const details = await playlistService.getPlaylistById(playlistId);
        setIsOwnPlaylist(details.user_id === user.uid);
      } catch (error) {
        console.error("Error checking playlist ownership:", error);
        setIsOwnPlaylist(false);
      }
    };
    checkOwnership();
  }, [playlistId]);

  // Back button handler: navigate to Library screen
  const handleBack = () => {
    navigation.navigate("Library");
  };

  // Get playlist cover image using the same logic as in your PlayList component
  const getSongCovers = () => {
    const songCovers = [];
    if (userSongs && userSongs.length > 0) {
      for (let i = 0; i < Math.min(userSongs.length, 4); i++) {
        if (userSongs[i]?.song_photo_url) {
          songCovers.push({ uri: userSongs[i].song_photo_url });
        } else if (userSongs[i]?.image) {
          songCovers.push(userSongs[i].image);
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
  const playlistCover = songCovers[0];

  // Control button handlers
  const handlePlay = () => {
    if (userSongs && userSongs.length > 0) {
      const firstSong = userSongs[0];
      playSound(firstSong);
      // Optionally navigate to SongDetail if desired:
      // navigation.navigate("SongDetail", { song: firstSong });
    }
  };

  const handleShuffle = () => {
    if (userSongs && userSongs.length > 0) {
      const randomIndex = Math.floor(Math.random() * userSongs.length);
      const randomSong = userSongs[randomIndex];
      playSound(randomSong);
      // Optionally navigate to SongDetail if desired:
      // navigation.navigate("SongDetail", { song: randomSong });
    }
  };

  // Search functionality in the add songs modal
  const handleSearch = async (text) => {
    setQuery(text);
    if (text.length > 2) {
      setIsSearching(true);
      setLoadingSearch(true);
      try {
        const results = await songService.searchSongs(text);
        // Filter out songs already in the playlist
        const filtered = results.filter(
          (song) =>
            !playlistSongs.some(
              (ps) => (ps.id || ps.songId) === song.id
            )
        );
        setSearchResults(filtered);
      } catch (error) {
        console.error("Error searching songs:", error);
        setSearchResults([]);
      } finally {
        setLoadingSearch(false);
      }
    } else {
      setIsSearching(false);
      setSearchResults([]);
    }
  };

  // Add a song to the playlist from search results
  const handleAddToPlaylist = async (song) => {
    try {
      await playlistService.addSongToPlaylist(playlistId, song);
      setUserSongs([...userSongs, song]);
      setPlaylistSongs([...playlistSongs, song]);
      setSearchResults(searchResults.filter((s) => s.id !== song.id));
    } catch (error) {
      console.error("Error adding song:", error);
    }
  };

  // Remove a song from the playlist (used inside SongCard)
  const handleRemoveSong = async (songId) => {
    try {
      await playlistService.removeSongFromPlaylist(playlistId, songId);
      setUserSongs((prev) =>
        prev.filter((song) => (song.id || song.songId) !== songId)
      );
      setPlaylistSongs((prev) =>
        prev.filter((song) => (song.id || song.songId) !== songId)
      );
    } catch (error) {
      console.error("Error removing song:", error);
    }
  };

  const renderHeader = () => (
    <>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#f1f1f1" />
        </TouchableOpacity>
        <Text style={styles.playlistTitleHeader}>{title}</Text>
      </View>
      <View style={styles.coverContainer}>
        <Image source={playlistCover} style={styles.coverImage} />
      </View>
      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.controlButton} onPress={handlePlay}>
          <Ionicons name="play-circle" size={32} color="#fff" />
          <Text style={styles.controlText}>Play</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={handleShuffle}>
          <Ionicons name="shuffle" size={32} color="#fff" />
          <Text style={styles.controlText}>Shuffle</Text>
        </TouchableOpacity>
        {isOwnPlaylist && (
          <TouchableOpacity style={styles.controlButton} onPress={() => setModalVisible(true)}>
            <Ionicons name="add-circle-outline" size={32} color="#fff" />
            <Text style={styles.controlText}>Add Songs</Text>
          </TouchableOpacity>
        )}
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <FlatList
          data={userSongs}
          ListHeaderComponent={renderHeader}
          keyExtractor={(item, index) =>
            item.id ? item.id.toString() : `fallback-${index}`
          }
          renderItem={({ item }) => (
            <SongCard
              song={item}
              onRemove={handleRemoveSong}
              isOwnContent={isOwnPlaylist}
            />
          )}
          contentContainerStyle={styles.contentContainer}
        />
      </View>

      {/* Modal for adding songs with search */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Search for Songs to Add</Text>
            {/* Search Bar */}
            <View style={styles.searchBarContainer}>
              <TextInput
                style={styles.searchBar}
                placeholder="Search by title or artist..."
                placeholderTextColor="#aaa"
                value={query}
                onChangeText={handleSearch}
              />
              {query ? (
                <TouchableOpacity style={styles.searchIcon} onPress={() => setQuery("")}>
                  <Text style={styles.searchIconText}>✕</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.searchIcon}>
                  <Text style={styles.searchIconText}>🔍</Text>
                </TouchableOpacity>
              )}
            </View>
            {loadingSearch && <ActivityIndicator size="large" color="#f1f1f1" />}
            <FlatList
              data={searchResults}
              keyExtractor={(item, index) =>
                item.id ? item.id.toString() : `fallback-${index}`
              }
              renderItem={({ item }) => (
                <View style={styles.songItem}>
                  <Text style={styles.songTitle}>{item.title} - {item.artist}</Text>
                  <TouchableOpacity onPress={() => handleAddToPlaylist(item)}>
                    <Ionicons name="add-circle" size={24} color="#28a745" />
                  </TouchableOpacity>
                </View>
              )}
              ListEmptyComponent={
                !loadingSearch && (
                  <Text style={styles.emptyText}>No results found</Text>
                )
              }
            />
            <Pressable style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgb(4,4,4)",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "rgb(4,4,4)",
  },
  contentContainer: {
    paddingTop: 20,
  },
  // Top Bar
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButton: {
    position: "absolute",
    left: 20,
  },
  playlistTitleHeader: {
    flex: 1,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
    color: "#f1f1f1",
  },
  // Cover Image
  coverContainer: {
    alignItems: "center",
    marginVertical: 10,
  },
  coverImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  // Control Buttons
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginVertical: 10,
  },
  controlButton: {
    alignItems: "center",
  },
  controlText: {
    color: "#f1f1f1",
    fontSize: 14,
    marginTop: 4,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "rgb(4,4,4)",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#f1f1f1",
    marginBottom: 15,
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  searchBar: {
    flex: 1,
    height: 40,
    backgroundColor: "#333",
    borderRadius: 20,
    color: "#fff",
    paddingHorizontal: 16,
  },
  searchIcon: {
    position: "absolute",
    right: 15,
  },
  searchIconText: {
    fontSize: 18,
    color: "#aaa",
  },
  songItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  songTitle: {
    color: "#f1f1f1",
    fontSize: 16,
  },
  emptyText: {
    color: "#888",
    fontSize: 14,
    textAlign: "center",
    marginTop: 10,
  },
  closeButton: {
    marginTop: 15,
    padding: 10,
    backgroundColor: "#444",
    borderRadius: 10,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#f1f1f1",
    fontSize: 16,
  },
});

export default PlaylistDetail;
