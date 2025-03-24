import React, { useState, useCallback, useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  FlatList,
  StatusBar,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Modal,
  TextInput,
  Alert
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

// Custom components & services
import TopBarProfileIcon from "../components/TopBarProfileIcon";
import SongCard from "../components/SongCard";
import PlayList from "../components/Playlist"; 
import { useGetSongs } from "../hooks/useGetSongs";
import { playlistService } from "../services/playlistService";
import { songService } from "../services/songService";

// THEME IMPORT
import { useTheme } from "../context/ThemeContext";
import ThemedScreen from "../components/ThemedScreen";

export default function LibraryScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();

  // Active tab can be: "Playlists", "MyUploads", "Liked", or false (for default: recently-played)
  const [activeTab, setActiveTab] = useState(false);

  // ***** 1) Liked songs
  const {
    songs: likedSongs,
    loading: likedLoading,
    error: likedError,
    refreshSongs: refreshLikedSongs,
  } = useGetSongs("liked");

  // ***** 2) Recently Played
  const {
    songs: recentlyPlayedSongs,
    loading: recentlyPlayedLoading,
    error: recentlyPlayedError,
    refreshSongs: refreshRecentlyPlayed,
  } = useGetSongs("recently-played");

  // ***** 3) My Uploads
  const {
    songs: myUploads,
    loading: myUploadsLoading,
    error: myUploadsError,
    refreshSongs: refreshMyUploads,
  } = useGetSongs("my-uploads");

  // For deleting a song from My Uploads
  const [deletingId, setDeletingId] = useState(null);

  const handleDeleteSong = async (songId) => {
    try {
      setDeletingId(songId);
      Alert.alert(
        "Delete Song",
        "Are you sure you want to delete this song? This action cannot be undone.",
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => setDeletingId(null),
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              await songService.deleteSong(songId);
              refreshMyUploads();
              setDeletingId(null);
            },
          },
        ]
      );
    } catch (error) {
      console.error("Failed to delete song:", error);
      Alert.alert("Error", "Failed to delete song. Please try again later.");
      setDeletingId(null);
    }
  };

  // ***** 4) Playlists
  const [playlists, setPlaylists] = useState([]);
  const [playlistsLoading, setPlaylistsLoading] = useState(false);
  const [playlistsError, setPlaylistsError] = useState(null);

  // For creating a new playlist
  const [modalVisible, setModalVisible] = useState(false);
  const [playlistTitle, setPlaylistTitle] = useState("");
  const [loadingCreate, setLoadingCreate] = useState(false);

  // On screen focus, refresh everything
  useFocusEffect(
    useCallback(() => {
      refreshLikedSongs();
      refreshRecentlyPlayed();
      refreshMyUploads();
      fetchPlaylists();
    }, [])
  );

  // Fetch all user playlists
  const fetchPlaylists = async () => {
    try {
      setPlaylistsLoading(true);
      const data = await playlistService.getUserPlaylists();
      setPlaylists(data);
    } catch (err) {
      setPlaylistsError(err.message || "Error fetching playlists");
    } finally {
      setPlaylistsLoading(false);
    }
  };

  // Create new playlist
  const handleCreatePlaylist = async () => {
    if (playlistTitle.trim() === "") {
      Alert.alert("Error", "Please enter a playlist title");
      return;
    }
    try {
      setLoadingCreate(true);
      await playlistService.createPlaylist({
        title: playlistTitle,
        songs: [], // or let user choose songs if you want
      });
      Alert.alert("Success", "Playlist created successfully!");
      setModalVisible(false);
      setPlaylistTitle("");
      fetchPlaylists();
    } catch (error) {
      console.error("Error creating playlist:", error);
      Alert.alert("Error", "Failed to create playlist");
    } finally {
      setLoadingCreate(false);
    }
  };

  // Delete entire playlist
  const handleDeletePlaylist = async (playlistId) => {
    try {
      setPlaylistsLoading(true);
      await playlistService.deletePlaylist(playlistId);
      fetchPlaylists();
    } catch (error) {
      console.error("Error deleting playlist:", error);
      Alert.alert("Error", "Failed to delete playlist");
    } finally {
      setPlaylistsLoading(false);
    }
  };

  // For top bar
  const handleProfilePress = () => {
    navigation.navigate("Profile");
  };

  // TabButton
  const TabButton = ({ title, isActive, onPress }) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        { backgroundColor: isActive ? theme.secondary : theme.background },
        isActive && { borderColor: theme.text, borderWidth: 1 },
      ]}
      onPress={onPress}
    >
      <Text style={{ color: theme.text }}>{title}</Text>
    </TouchableOpacity>
  );

  // ActionButton
  const ActionButton = ({ icon, title, onPress }) => (
    <TouchableOpacity style={styles.actionButton} onPress={onPress}>
      <View style={[styles.actionIconContainer, { backgroundColor: theme.primary }]}>
        <Text style={{ fontSize: 24, color: theme.text }}>{icon}</Text>
      </View>
      <Text style={[styles.actionText, { color: theme.text }]}>{title}</Text>
    </TouchableOpacity>
  );

  /*******************************************
   * RENDER: PLAYLISTS
   *******************************************/
  const renderPlaylists = () => {
    if (playlistsLoading) {
      return <ActivityIndicator size="large" color={theme.primary} />;
    }
    if (playlistsError) {
      return <Text style={[styles.errorText, { color: theme.text }]}>{playlistsError}</Text>;
    }
    return (
      <>
        <FlatList
          data={playlists}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.songListContainer}
          ListEmptyComponent={() => (
            <Text style={[styles.emptyText, { color: theme.text }]}>
              You don't have any playlists yet. Create one!
            </Text>
          )}
          renderItem={({ item }) => (
            <PlayList
              title={item.title}
              playlistId={item.id}
              onDelete={handleDeletePlaylist}
            />
          )}
        />

        {/* Create Playlist Button (FAB) */}
        <TouchableOpacity
          style={styles.fabButton}
          onPress={() => setModalVisible(true)}
          disabled={playlistsLoading}
        >
          <Ionicons name="add-circle" size={24} color={theme.text} />
          <Text style={[styles.fabButtonText, { color: theme.text }]}>New</Text>
        </TouchableOpacity>

        {/* Create Playlist Modal */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Create New Playlist</Text>

              <TextInput
                style={[styles.input, { color: theme.text, borderColor: theme.secondary }]}
                placeholder="Playlist title"
                placeholderTextColor="#666"
                value={playlistTitle}
                onChangeText={setPlaylistTitle}
              />

              <TouchableOpacity
                style={[styles.createButton, { backgroundColor: theme.primary }]}
                onPress={handleCreatePlaylist}
                disabled={loadingCreate}
              >
                <Text style={[styles.buttonText, { color: theme.text }]}>
                  {loadingCreate ? "Creating..." : "Create Playlist"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.cancelButton, { borderColor: theme.primary, borderWidth: 1 }]}
                onPress={() => {
                  setModalVisible(false);
                  setPlaylistTitle("");
                }}
                disabled={loadingCreate}
              >
                <Text style={[styles.cancelButtonText, { color: theme.text }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </>
    );
  };

  /*******************************************
   * RENDER: MY UPLOADS
   *******************************************/
  const renderMyUploads = () => {
    if (myUploadsLoading) {
      return <ActivityIndicator size="large" color={theme.primary} />;
    }
    if (myUploadsError) {
      return <Text style={[styles.errorText, { color: theme.text }]}>{myUploadsError}</Text>;
    }
    return (
      <FlatList
        data={myUploads}
        keyExtractor={(item) => item.songId.toString()}
        contentContainerStyle={styles.songListContainer}
        ListEmptyComponent={() => (
          <Text style={[styles.emptyText, { color: theme.text }]}>No Uploaded Songs</Text>
        )}
        renderItem={({ item }) => (
          <SongCard
            song={item}
            isOwnContent={true}
            onRemove={handleDeleteSong}
            isDeleting={deletingId === item.songId}
          />
        )}
      />
    );
  };

  /*******************************************
   * RENDER: LIKED
   *******************************************/
  const renderLiked = () => {
    return (
      <>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Your Liked Songs</Text>
        {likedLoading ? (
          <ActivityIndicator size="large" color={theme.primary} />
        ) : (
          <FlatList
            data={likedSongs}
            keyExtractor={(item) => item.songId.toString()}
            renderItem={({ item }) => <SongCard song={item} />}
            contentContainerStyle={styles.songListContainer}
            ListEmptyComponent={() => (
              <Text style={[styles.emptyText, { color: theme.text }]}>No liked songs yet</Text>
            )}
            showsVerticalScrollIndicator={false}
            onRefresh={refreshLikedSongs}
            refreshing={likedLoading}
          />
        )}
        {likedError && (
          <Text style={[styles.errorText, { color: theme.text }]}>{likedError}</Text>
        )}
      </>
    );
  };

  /*******************************************
   * RENDER: DEFAULT (RECENTLY PLAYED)
   *******************************************/
  const renderDefault = () => (
    <ScrollView style={styles.scrollContainer}>
      <ActionButton icon="+" title="Upload a Song" onPress={() => navigation.navigate("Upload")} />
      <ActionButton icon="♥" title="Your Liked Songs" onPress={() => setActiveTab("Liked")} />

      <View style={styles.sectionContainer}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Recently played</Text>
        {recentlyPlayedLoading ? (
          <ActivityIndicator size="small" color={theme.primary} />
        ) : recentlyPlayedSongs && recentlyPlayedSongs.length > 0 ? (
          <FlatList
            data={recentlyPlayedSongs}
            keyExtractor={(item) => `recent-${item.songId}`}
            scrollEnabled={false}
            renderItem={({ item }) => <SongCard song={item} />}
            ListEmptyComponent={() => (
              <Text style={[styles.emptyText, { color: theme.text }]}>
                No recently played songs
              </Text>
            )}
          />
        ) : (
          <Text style={[styles.emptyText, { color: theme.text }]}>
            No recently played songs
          </Text>
        )}
        {recentlyPlayedError && (
          <Text style={[styles.errorText, { color: theme.text }]}>{recentlyPlayedError}</Text>
        )}
      </View>
    </ScrollView>
  );

  /*******************************************
   * MAIN RENDER
   *******************************************/
  return (
    <ThemedScreen style={styles.fullContainer}>
      <StatusBar barStyle="light-content" />

      {/* Top Header */}
      <View style={[styles.headerRow, { backgroundColor: theme.background }]}>
        <View style={styles.titleContainer}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Your Library</Text>
        </View>
        <TouchableOpacity style={styles.profileButton} onPress={handleProfilePress}>
          <TopBarProfileIcon size={30} />
        </TouchableOpacity>
      </View>

      {/* Tabs & Content */}
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.tabContainer}>
          <TabButton
            title="Playlists"
            isActive={activeTab === "Playlists"}
            onPress={() => {
              setActiveTab(activeTab === "Playlists" ? false : "Playlists");
            }}
          />
          <TabButton
            title="My Uploads"
            isActive={activeTab === "MyUploads"}
            onPress={() => {
              setActiveTab(activeTab === "MyUploads" ? false : "MyUploads");
            }}
          />
          <TabButton
            title="Liked"
            isActive={activeTab === "Liked"}
            onPress={() => {
              setActiveTab(activeTab === "Liked" ? false : "Liked");
            }}
          />
        </View>

        {activeTab === "Playlists"
          ? renderPlaylists()
          : activeTab === "MyUploads"
          ? renderMyUploads()
          : activeTab === "Liked"
          ? renderLiked()
          : renderDefault()}
      </View>
    </ThemedScreen>
  );
}

const styles = StyleSheet.create({
  fullContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 45,
    paddingBottom: 16,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  profileButton: {
    padding: 4,
    marginTop: 10,
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
  },
  scrollContainer: {
    flex: 1,
  },
  songListContainer: {
    paddingBottom: 100,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  actionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  actionText: {
    fontSize: 16,
    fontWeight: "500",
  },
  sectionContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 20,
    fontStyle: "italic",
  },
  errorText: {
    textAlign: "center",
    marginTop: 20,
    color: "red",
  },

  // For the "New Playlist" FAB & Modal
  fabButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    backgroundColor: "#ccc",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    alignSelf: "flex-end",
    marginRight: 10,
  },
  fabButtonText: {
    marginLeft: 6,
    fontSize: 16,
    fontWeight: "600",
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
  modalTitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
    color: "#fff",
  },
  createButton: {
    borderRadius: 6,
    padding: 12,
    alignItems: "center",
    marginBottom: 8,
  },
  buttonText: {
    fontSize: 16,
  },
  cancelButton: {
    borderRadius: 6,
    padding: 12,
    alignItems: "center",
    marginBottom: 8,
    backgroundColor: "transparent",
  },
  cancelButtonText: {
    fontSize: 16,
  },
});
