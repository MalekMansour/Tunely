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

  // ✅ THEME USAGE
  const { theme } = useTheme();

  const [playlistSongs, setPlaylistSongs] = useState([]);
  const [userSongs, setUserSongs] = useState([]);
  const [isOwnPlaylist, setIsOwnPlaylist] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState(title);
  const [coverImage, setCoverImage] = useState(null);

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

  const getSongCovers = () => {
    const songCovers = [];
    if (userSongs.length > 0) {
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

  const handlePlay = () => {
    if (userSongs.length > 0) {
      playSound(userSongs[0]);
    }
  };

  const handleShuffle = () => {
    if (userSongs.length > 0) {
      const randomSong = userSongs[Math.floor(Math.random() * userSongs.length)];
      playSound(randomSong);
    }
  };

  const handleSearch = async (text) => {
    setQuery(text);
    if (text.length > 2) {
      setIsSearching(true);
      setLoadingSearch(true);
      try {
        const results = await songService.searchSongs(text);
        const filtered = results.filter(
          (song) =>
            !playlistSongs.some((ps) => (ps.id || ps.songId) === song.id)
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

  const handleRemoveSong = async (songId) => {
    Alert.alert(
      "Delete Song",
      "Are you sure you want to remove this song from the playlist?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
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

  const handleEditPlaylist = () => {
    setEditModalVisible(true);
  };

  const handleRenamePlaylist = async () => {
    if (newTitle.trim() && newTitle !== title) {
      try {
        await playlistService.updatePlaylistTitle(playlistId, { title: newTitle });
        Alert.alert("Success", "Playlist name updated successfully.");
        navigation.setParams({ title: newTitle });
      } catch (error) {
        Alert.alert("Error", "Failed to update playlist name.");
      }
    }
    setEditModalVisible(false);
  };

  const handleChangeCover = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: [ImagePicker.MediaType.IMAGE],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled) {
        const imageUrl = result.assets[0].uri;
        await playlistService.updatePlaylistCover(playlistId, { cover: imageUrl });
        setCoverImage({ uri: imageUrl });
        Alert.alert("Success", "Playlist cover updated successfully.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update playlist cover.");
    }
  };

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

  const renderHeader = () => (
    <>
      <View
        style={[
          styles.topBar,
          // Overriding default color from styles
          { backgroundColor: theme.background },
        ]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.arrowButton}>
          <Ionicons name="arrow-back" size={28} color={theme.text} />
        </TouchableOpacity>
        <Text
          style={[
            styles.playlistTitleHeader,
            { color: theme.text },
          ]}
        >
          {title}
        </Text>
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
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add-circle-outline" size={32} color={theme.text} />
            <Text style={[styles.controlText, { color: theme.text }]}>
              Add Songs
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </>
  );

  return (
    <ThemedScreen style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <FlatList
        data={userSongs}
        ListHeaderComponent={renderHeader}
        keyExtractor={(item, index) =>
          item?.id ? item.id.toString() : `fallback-${index}`
        }
        renderItem={({ item }) => (
          <SongCard
            song={item}
            onRemove={() => handleRemoveSong(item.songId)}
            isOwnContent={isOwnPlaylist}
          />
        )}
      />

      {/* Modal for editing playlist details */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={[styles.modalContainer]}>
          <View style={[styles.modalContent, { backgroundColor: theme.secondary }]}>
            <Text style={[styles.modalHeader, { color: theme.text }]}>
              Edit Playlist
            </Text>
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
            <Pressable style={[styles.button, { backgroundColor: theme.primary }]} onPress={handleChangeCover}>
              <Text style={[styles.buttonText, { color: theme.text }]}>Change Cover</Text>
            </Pressable>
            <Pressable style={[styles.deleteButton, { backgroundColor: theme.delete }]} onPress={handleDeletePlaylist}>
              <Text style={[styles.buttonText, { color: theme.text }]}>Delete Playlist</Text>
            </Pressable>
            <Pressable style={[styles.closeButton, { backgroundColor: theme.primary }]} onPress={() => setEditModalVisible(false)}>
              <Text style={[styles.closeButtonText, { color: theme.text }]}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Modal for adding songs with search */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.secondary }]}>
            <Text style={[styles.modalHeader, { color: theme.text }]}>
              Search for Songs to Add
            </Text>
            <View style={styles.searchBarContainer}>
              <TextInput
                style={[
                  styles.searchBar,
                  { backgroundColor: theme.background, color: theme.text },
                ]}
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
              keyExtractor={(item, index) =>
                item.id ? item.id.toString() : `fallback-${index}`
              }
              renderItem={({ item }) => (
                <View style={styles.songItem}>
                  <Text style={[styles.songTitle, { color: theme.text }]}>
                    {item.title} - {item.artist}
                  </Text>
                  <TouchableOpacity onPress={() => handleAddToPlaylist(item)}>
                    {/* Keeping #28a745 for success color not in theme */}
                    <Ionicons name="add-circle" size={24} color="#28a745" />
                  </TouchableOpacity>
                </View>
              )}
              ListEmptyComponent={
                !loadingSearch && (
                  <Text style={[styles.emptyText, { color: theme.text }]}>
                    No results found
                  </Text>
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
    // originally backgroundColor: "rgb(4,4,4)"
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    marginTop: 50,
  },
  playlistTitleHeader: {
    flex: 1,
    textAlign: "center",
    fontSize: 24,
    color: "#fff", 
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
    color: "#f1f1f1", // overridden in-line with theme.text
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
    backgroundColor: "#333", // overridden in-line with theme.secondary
    padding: 20,
    borderRadius: 10,
  },
  modalHeader: {
    fontSize: 18,
    color: "#fff", // overridden in-line
    marginBottom: 10,
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  searchBar: {
    flex: 1,
    backgroundColor: "#444", // overridden in-line
    color: "#fff", // overridden in-line
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
    color: "#fff", // overridden in-line
    fontSize: 16,
  },
  emptyText: {
    color: "#aaa", // overridden in-line
    textAlign: "center",
    marginTop: 20,
  },
  closeButton: {
    padding: 10,
    backgroundColor: "#555", // overridden in-line
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  closeButtonText: {
    color: "#fff", // overridden in-line
    fontSize: 16,
  },
  editButton: {
    padding: 10,
  },
  button: {
    padding: 10,
    marginTop: 10,
    backgroundColor: "#182952", // overridden in-line
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff", // overridden in-line
    fontSize: 16,
  },
  deleteButton: {
    padding: 10,
    marginTop: 10,
    backgroundColor: "#BF3131", // overridden in-line
    borderRadius: 5,
    alignItems: "center",
  },
  textInput: {
    backgroundColor: "#222", // overridden in-line
    color: "#fff", // overridden in-line
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
});

export default PlaylistDetail;
