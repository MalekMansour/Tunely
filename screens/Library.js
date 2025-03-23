import React, { useState, useCallback } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  FlatList,
  StatusBar,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import TopBarProfileIcon from "../components/TopBarProfileIcon";
import SongCard from "../components/SongCard";
import { useGetSongs } from "../hooks/useGetSongs";

// THEME IMPORT
import { useTheme } from "../context/ThemeContext";
import ThemedScreen from "../components/ThemedScreen";

export default function LibraryScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState(false);

  // THEME HOOK
  const { theme } = useTheme();

  const {
    songs: likedSongs,
    loading: likedLoading,
    error: likedError,
    refreshSongs: refreshLikedSongs,
  } = useGetSongs("liked");

  const {
    songs: recentlyPlayedSongs,
    loading: recentlyPlayedLoading,
    error: recentlyPlayedError,
    refreshSongs: refreshRecentlyPlayed,
  } = useGetSongs("recently-played");

  useFocusEffect(
    useCallback(() => {
      refreshLikedSongs();
      refreshRecentlyPlayed();
    }, [])
  );

  const handleProfilePress = () => {
    navigation.navigate("Profile");
  };

  const handlePlaylistsPress = () => {
    navigation.navigate("UserPlayList");
  };

  const handleMyUploadsPress = () => {
    navigation.navigate("MyUploads");
  };

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

  const ActionButton = ({ icon, title, onPress }) => {
    return (
      <TouchableOpacity style={styles.actionButton} onPress={onPress}>
        <View style={[styles.actionIconContainer, { backgroundColor: theme.primary }]}>
          <Text style={{ fontSize: 24, color: theme.text }}>{icon}</Text>
        </View>
        <Text style={[styles.actionText, { color: theme.text }]}>{title}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <ThemedScreen style={styles.fullContainer}>
      <StatusBar barStyle="light-content" />

      <View style={[styles.headerRow, { backgroundColor: theme.background }]}>
        <View style={styles.titleContainer}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Your Library</Text>
        </View>
        <TouchableOpacity style={styles.profileButton} onPress={handleProfilePress}>
          <TopBarProfileIcon size={30} />
        </TouchableOpacity>
      </View>

      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.tabContainer}>
          <TabButton
            title="Playlists"
            isActive={activeTab === "Playlists"}
            onPress={() => {
              setActiveTab("Playlists");
              handlePlaylistsPress();
            }}
          />
          <TabButton
            title="My Uploads"
            isActive={activeTab === "MyUploads"}
            onPress={() => {
              setActiveTab("MyUploads");
              handleMyUploadsPress();
            }}
          />
          <TabButton
            title="Liked"
            isActive={activeTab === "Liked"}
            onPress={() => {
              if (activeTab === "Liked") {
                setActiveTab(false);
              } else {
                setActiveTab("Liked");
              }
            }}
          />
        </View>

        {activeTab === "Liked" ? (
          <>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Your Liked Songs
            </Text>
            {likedLoading ? (
              <ActivityIndicator size="large" color={theme.primary} />
            ) : (
              <FlatList
                data={likedSongs}
                keyExtractor={(item) => item.songId.toString()}
                renderItem={({ item }) => <SongCard song={item} />}
                contentContainerStyle={styles.songListContainer}
                ListEmptyComponent={() => (
                  <Text style={[styles.emptyText, { color: theme.text }]}>
                    No liked songs yet
                  </Text>
                )}
                showsVerticalScrollIndicator={false}
                onRefresh={refreshLikedSongs}
                refreshing={likedLoading}
              />
            )}
            {likedError && (
              <Text style={[styles.errorText, { color: theme.text }]}>
                {likedError}
              </Text>
            )}
          </>
        ) : (
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
                <Text style={[styles.errorText, { color: theme.text }]}>
                  {recentlyPlayedError}
                </Text>
              )}
            </View>
          </ScrollView>
        )}
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
  },
});
