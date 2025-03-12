import React, { useState, useEffect } from "react";
import { API_URL } from "../config/apiConfig";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SongCard from "../components/SongCard";
import { SafeAreaView } from "react-native";
import { styles as globalStyles } from "../styles";
import { LinearGradient } from "expo-linear-gradient";
import { useRoute } from "@react-navigation/native";
import { auth } from "../Utility/firebaseConfig";
import { playlistService } from "../services/playlistService";

const getAuthHeaders = async () => {
  const user = auth.currentUser;
  if (!user) return {};

  const token = await user.getIdToken();
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

const defaultCoverImage = require("../assets/note.jpg");

const PlaylistDetail = () => {
  const route = useRoute();
  const { playlistId, title, image } = route.params;
  const [playlistSongs, setPlaylistSongs] = useState([]);
  const [userSongs, setUserSongs] = useState();
  const [availableSongs, setAvailableSongs] = useState([]);
  const [modalVisible, setModalVisible] = useState(false); // State for modal visibility

  // Fetch playlist with its songs
  useEffect(() => {
    const loadPlaylist = async () => {
      const songs = await playlistService.fetchPlaylist(playlistId); // Call the service function to fetch songs
      setUserSongs(songs); // Set the songs fetched from the service
      setPlaylistSongs(songs);
    };

    loadPlaylist();
  }, [playlistId]);

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

  const handleAddSong = async () => {
    try {
      const songs = await playlistService.fetchAvailableSongsForModal();
      setAvailableSongs(songs); // Update state with the fetched songs
      setModalVisible(true); 
    } catch (error) {
      console.error("Error fetching available songs:", error);
    }
  };

  // Function to remove a song from the playlist
  const handleRemoveSong = async (playlistId, songId) => {
    try {
      console.log("Removing song with ID:", songId);
      await playlistService.removeSongFromPlaylist(playlistId, songId);
      
      // Update userSongs - this is what the FlatList displays
      setUserSongs((prevSongs) => 
        prevSongs.filter((song) => {
          const songIdentifier = song.id || song.songId;
          return songIdentifier !== songId;
        })
      );
      
      setPlaylistSongs((prevSongs) => 
        prevSongs.filter((song) => {
          const songIdentifier = song.id || song.songId;
          return songIdentifier !== songId;
        })
      );
    } catch (error) {
      console.error("Error removing song:", error);
    }
  };

  // Function to check if a song is already in the playlist
  const isSongInPlaylist = (songId) => {
    return playlistSongs.some((song) => {
      // Check both possible ID properties
      const playlistSongId = song.id || song.songId;
      return playlistSongId === songId;
    });
  };

  const handleAddToPlaylist = (song) => {
    playlistService.addSongToPlaylist(
      playlistId,
      song,
      setUserSongs,
      setModalVisible
    );
  };

  const renderHeader = () => (
    <>
      <View style={styles.artworkContainer}>
        <View style={styles.artworkRow}>
          <Image source={songCovers[0]} style={styles.artworkQuadrant} />
          <Image source={songCovers[1]} style={styles.artworkQuadrant} />
        </View>
        <View style={styles.artworkRow}>
          <Image source={songCovers[2]} style={styles.artworkQuadrant} />
          <Image source={songCovers[3]} style={styles.artworkQuadrant} />
        </View>
      </View>

      <View style={styles.headerContainer}>
        <Text style={styles.playlistTitle}>{title}</Text>
        <TouchableOpacity onPress={handleAddSong}>
          <LinearGradient
            colors={["#111", "#333"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.addButton}
          >
            <Ionicons name="add-circle-outline" size={24} color="#f1f1f1" />
            <Text style={styles.addButtonText}>Add Songs</Text>
          </LinearGradient>
        </TouchableOpacity>
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
            item.id?.toString() || `playlist-song-${index}`
          }
          renderItem={({ item }) => (
            <SongCard
              song={item}
              playlistId={playlistId} // Pass the playlist ID
              showOptions={true}
              onRemove={handleRemoveSong}
            />
          )}
          contentContainerStyle={styles.contentContainer}
        />
      </View>

      {/* Modal for adding songs */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Select Songs to Add</Text>
            <FlatList
              data={availableSongs}
              keyExtractor={(item, index) =>
                item?.id?.toString() || `fallback-id-${index}`
              }
              renderItem={({ item }) => (
                <View
                  style={[
                    styles.songItem,
                    isSongInPlaylist(item.id) && styles.greyedOut, // Apply greyed-out style for songs already in the playlist
                  ]}
                >
                  <Text style={styles.songTitle}>
                    {item.title} - {item.artist}
                  </Text>
                  {/* Display Add Button if song is not in playlist */}
                  {!isSongInPlaylist(item.id) && (
                    <TouchableOpacity onPress={() => handleAddToPlaylist(item)}>
                      <Ionicons name="add-circle" size={24} color="#28a745" />
                    </TouchableOpacity>
                  )}
                </View>
              )}
            />

            <FlatList
              data={playlistSongs}
              keyExtractor={(item, index) =>
                item?.id?.toString() || `fallback-id-${index}`
              }
              renderItem={({ item }) => (
                <View style={styles.songItem}>
                  <Text style={styles.songTitle}>
                    {item.title} - {item.artist}
                  </Text>
                </View>
              )}
            />

            <Pressable
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgb(4,4,4)",
  },
  artworkContainer: {
    width: 200,
    height: 200,
    alignSelf: "center",
    marginVertical: 20,
    overflow: "hidden",
  },
  artworkRow: {
    flexDirection: "row",
    height: "50%",
  },
  artworkQuadrant: {
    width: "50%",
    height: "100%",
    resizeMode: "cover",
  },
  headerContainer: {
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  playlistTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#f1f1f1",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 10,
    borderRadius: 20,
  },
  addButtonText: {
    color: "#f1f1f1",
    marginLeft: 5,
  },
  contentContainer: {
    paddingTop: 20,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "rgb(4, 4, 4)",
  },
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
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#f1f1f1",
    marginBottom: 15,
  },
  songItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    alignItems: "center",
  },
  songTitle: {
    color: "#f1f1f1",
    fontSize: 16,
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
