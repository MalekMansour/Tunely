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
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SongCard from "../components/SongCard";
import { useRoute, useNavigation } from "@react-navigation/native";
import { auth } from "../Utility/firebaseConfig";
import { playlistService } from "../services/playlistService";
import { songService } from "../services/songService";
import { useAudio } from "../context/AudioContext";
import * as ImagePicker from "expo-image-picker";

// THEME IMPORTS
import { useTheme } from "../context/ThemeContext";
import ThemedScreen from "../components/ThemedScreen";

const defaultCoverImage = require("../assets/note.jpg");

const PlaylistDetail = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { playlistId, title } = route.params;
  const { playSound } = useAudio();

  
  const { theme } = useTheme();

  // Local state
  const [playlistSongs, setPlaylistSongs] = useState([]);
  const [userSongs, setUserSongs] = useState([]);
  const [isOwnPlaylist, setIsOwnPlaylist] = useState(false);

  // Extra details for the footer
  const [creatorName, setCreatorName] = useState("");
  const [createdAt, setCreatedAt] = useState("");

  // Add-songs modal
  const [modalVisible, setModalVisible] = useState(false);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);

  // Edit playlist modal
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState(title);
  // Removed all references to "coverImage" or "handleChangeCover"

  useEffect(() => {
    loadPlaylistSongs();
    loadPlaylistDetails();
  }, [playlistId]);

  // 1) Fetch the songs in this playlist
  const loadPlaylistSongs = async () => {
    try {
      const songs = await playlistService.fetchPlaylist(playlistId);
      setUserSongs(songs);
      setPlaylistSongs(songs);
    } catch (error) {
      console.error("Error loading playlist:", error);
    }
  };

  // 2) Fetch additional info: creatorName, createdAt
  const loadPlaylistDetails = async () => {
    try {
      const user = auth.currentUser;
      const details = await playlistService.getPlaylistById(playlistId);

      setIsOwnPlaylist(user && details.user_id === user.uid);
      setCreatorName(details.username || "Unknown");
      setCreatedAt(details.created_at || "");
    } catch (error) {
      console.error("Error checking playlist ownership / details:", error);
      setIsOwnPlaylist(false);
    }
  };

  // Generate up to 4 covers
  const getSongCovers = () => {
    const covers = [];
    for (let i = 0; i < Math.min(userSongs.length, 4); i++) {
      if (userSongs[i]?.song_photo_url) {
        covers.push({ uri: userSongs[i].song_photo_url });
      } else if (userSongs[i]?.image) {
        covers.push(userSongs[i].image);
      } else {
        covers.push(defaultCoverImage);
      }
    }
    // fill up if fewer than 4
    while (covers.length < 4) {
      covers.push(defaultCoverImage);
    }
    return covers;
  };

  const songCovers = getSongCovers();

  // Play the first song
  const handlePlay = () => {
    if (userSongs.length > 0) {
      playSound(userSongs[0]);
    }
  };

  // Shuffle
  const handleShuffle = () => {
    if (userSongs.length > 0) {
      const randomSong = userSongs[Math.floor(Math.random() * userSongs.length)];
      playSound(randomSong);
    }
  };

  // Searching
  const handleSearch = async (text) => {
    setQuery(text);
    if (text.length > 2) {
      setIsSearching(true);
      setLoadingSearch(true);
      try {
        const results = await songService.searchSongs(text);
        // Exclude songs already in this playlist
        const filtered = results.filter(
          (song) => !playlistSongs.some((ps) => (ps.id || ps.songId) === song.id)
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

  // Add a song
  const handleAddToPlaylist = async (song) => {
    try {
      await playlistService.addSongToPlaylist(playlistId, song);
      setUserSongs((prev) => [...prev, song]);
      setPlaylistSongs((prev) => [...prev, song]);
      setSearchResults((prev) => prev.filter((s) => s.id !== song.id));
    } catch (error) {
      console.error("Error adding song:", error);
    }
  };

  // Remove a song
  const handleRemoveSong = async (songId) => {
    Alert.alert(
      "Remove Song",
      "Are you sure you want to remove this song from the playlist?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
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
          },
        },
      ]
    );
  };

  // Edit
  const handleEditPlaylist = () => {
    setEditModalVisible(true);
  };

  // Rename
  const handleRenamePlaylist = async () => {
    if (newTitle.trim() && newTitle !== title) {
      try {
        await playlistService.renamePlaylist(playlistId, newTitle);
        Alert.alert("Success", "Playlist name updated successfully.");
        navigation.setParams({ title: newTitle });
      } catch (error) {
        Alert.alert("Error", "Failed to update playlist name.");
      }
    }
    setEditModalVisible(false);
  };

  // Delete entire playlist
  const handleDeletePlaylist = async () => {
    Alert.alert(
      "Delete Playlist",
      "Are you sure you want to delete this playlist?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await playlistService.deletePlaylist(playlistId);
              navigation.goBack();
            } catch (error) {
              Alert.alert("Error", "Failed to delete playlist.");
            }
          },
        },
      ]
    );
    setEditModalVisible(false);
  };

  // Render top
  const renderHeader = () => (
    <>
      <View style={[styles.topBar, { backgroundColor: theme.background }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.arrowButton}>
          <Ionicons name="arrow-back" size={28} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.playlistTitleHeader, { color: theme.text }]}>{title}</Text>
        {isOwnPlaylist && (
          <TouchableOpacity onPress={handleEditPlaylist} style={styles.editButton}>
            <Ionicons name="pencil" size={24} color={theme.text} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.coverGrid}>
        {songCovers.map((cover, index) => (
          <Image key={index} source={cover} style={styles.coverQuadrant} />
        ))}
      </View>

      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.controlButton} onPress={handlePlay}>
          <Ionicons name="play-circle" size={32} color={theme.text} />
          <Text style={[styles.controlText, { color: theme.text }]}>Play</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={handleShuffle}>
          <Ionicons name="shuffle" size={32} color={theme.text} />
          <Text style={[styles.controlText, { color: theme.text }]}>Shuffle</Text>
        </TouchableOpacity>
        {isOwnPlaylist && (
          <TouchableOpacity style={styles.controlButton} onPress={() => setModalVisible(true)}>
            <Ionicons name="add-circle-outline" size={32} color={theme.text} />
            <Text style={[styles.controlText, { color: theme.text }]}>Add Songs</Text>
          </TouchableOpacity>
        )}
      </View>
    </>
  );

  // Render footer
  const renderFooter = () => (
    <View style={styles.footerContainer}>
      <Text style={[styles.footerTitle, { color: theme.text }]}>Playlist Details</Text>
      <Text style={[styles.footerText, { color: theme.text }]}>
        Created On:{" "}
        {createdAt
          ? new Date(createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "Unknown"}
      </Text>
    </View>
  );

  return (
    <ThemedScreen style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <FlatList
        data={userSongs}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        keyExtractor={(item, index) => (item?.id ? item.id.toString() : `fallback-${index}`)}
        renderItem={({ item }) => (
          <SongCard
            song={item}
            onRemove={() => handleRemoveSong(item.songId)}
            isOwnContent={isOwnPlaylist}
          />
        )}
      />

      {/* Edit Playlist Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.secondary }]}>
            <Text style={[styles.modalHeader, { color: theme.text }]}>Edit Playlist</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: theme.background, color: theme.text }]}
              onChangeText={setNewTitle}
              value={newTitle}
              placeholder="New playlist name"
              placeholderTextColor="#aaa"
            />
            <Pressable style={[styles.button, { backgroundColor: theme.primary }]} onPress={handleRenamePlaylist}>
              <Text style={[styles.buttonText, { color: theme.text }]}>Rename</Text>
            </Pressable>

            {/* The "Change Cover" is removed, so we skip that pressable */}

            <Pressable style={[styles.deleteButton, { backgroundColor: theme.delete }]} onPress={handleDeletePlaylist}>
              <Text style={[styles.buttonText, { color: theme.text }]}>Delete Playlist</Text>
            </Pressable>
            <Pressable
              style={[styles.closeButton, { backgroundColor: theme.primary }]}
              onPress={() => setEditModalVisible(false)}
            >
              <Text style={[styles.closeButtonText, { color: theme.text }]}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Add Songs Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.secondary }]}>
            <Text style={[styles.modalHeader, { color: theme.text }]}>Search for Songs to Add</Text>
            <View style={styles.searchBarContainer}>
              <TextInput
                style={[styles.searchBar, { backgroundColor: theme.background, color: theme.text }]}
                placeholder="Search by title or artist..."
                placeholderTextColor="#aaa"
                value={query}
                onChangeText={handleSearch}
              />
              {query ? (
                <TouchableOpacity style={styles.searchIcon} onPress={() => setQuery("")}>
                  <Text style={{ color: theme.text, fontSize: 18 }}>✕</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.searchIcon}>
                  <Text style={{ color: theme.text, fontSize: 18 }}>🔍</Text>
                </TouchableOpacity>
              )}
            </View>
            {loadingSearch && (
              <ActivityIndicator size="large" color={theme.text} style={{ marginVertical: 10 }} />
            )}
            <FlatList
              data={searchResults}
              keyExtractor={(item, index) => (item.id ? item.id.toString() : `fallback-${index}`)}
              renderItem={({ item }) => (
                <View style={styles.songItem}>
                  <Text style={[styles.songTitle, { color: theme.text }]}>
                    {item.title} - {item.artist}
                  </Text>
                  <TouchableOpacity onPress={() => handleAddToPlaylist(item)}>
                    <Ionicons name="add-circle" size={24} color="#28a745" />
                  </TouchableOpacity>
                </View>
              )}
              ListEmptyComponent={
                !loadingSearch && (
                  <Text style={[styles.emptyText, { color: theme.text }]}>No results found</Text>
                )
              }
            />
            <Pressable
              style={[styles.closeButton, { backgroundColor: theme.primary, marginTop: 20 }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={[styles.closeButtonText, { color: theme.text }]}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ThemedScreen>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    marginTop: 50,
  },
  arrowButton: {
    marginRight: 10,
  },
  playlistTitleHeader: {
    flex: 1,
    textAlign: "center",
    fontSize: 24,
  },
  editButton: {
    padding: 10,
  },
  coverGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: 200,
    height: 200,
    alignSelf: "center",
  },
  coverQuadrant: {
    width: "50%",
    height: "50%",
    resizeMode: "cover",
  },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginVertical: 10,
  },
  controlButton: { alignItems: "center" },
  controlText: {
    fontSize: 14,
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#333",
    padding: 20,
    borderRadius: 10,
  },
  modalHeader: {
    fontSize: 18,
    marginBottom: 10,
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  searchBar: {
    flex: 1,
    backgroundColor: "#444",
    padding: 10,
    borderRadius: 5,
  },
  searchIcon: {
    marginLeft: 10,
  },
  songItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  songTitle: {
    fontSize: 16,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
  },
  closeButton: {
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  closeButtonText: {
    fontSize: 16,
  },
  button: {
    padding: 10,
    marginTop: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
  },
  deleteButton: {
    padding: 10,
    marginTop: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  textInput: {
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  footerContainer: {
    padding: 20,
    marginBottom: 70,
  },
  footerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  footerText: {
    fontSize: 14,
    marginBottom: 2,
  },
});

export default PlaylistDetail;
