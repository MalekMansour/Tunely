import React, { useState, useCallback } from "react";
import {
  Text,
  View,
  Image,
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

const COLORS = {
  BACKGROUND: "#000000",
  CARD_BACKGROUND: "#121212",
  PRIMARY: "#182952", 
  TEXT_PRIMARY: "#FFFFFF",
  TEXT_SECONDARY: "#AAAAAA",
  INACTIVE: "rgba(42, 42, 42, 0.7)",
  ACTIVE: "#1D1D1D",
  ACTIVE_BORDER: "#444",
};

export default function LibraryScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState(false);
  const { 
    songs: likedSongs, 
    loading: likedLoading, 
    error: likedError, 
    refreshSongs: refreshLikedSongs 
  } = useGetSongs('liked');
  const { 
    songs: recentlyPlayedSongs, 
    loading: recentlyPlayedLoading, 
    error: recentlyPlayedError, 
    refreshSongs: refreshRecentlyPlayed 
  } = useGetSongs('recently-played');

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

  const TabButton = ({ title, isActive, onPress }) => {
    return (
      <TouchableOpacity
        style={[styles.tabButton, isActive && styles.activeTabButton]}
        onPress={onPress}
      >
        <Text style={styles.tabButtonText}>{title}</Text>
      </TouchableOpacity>
    );
  };

  const ActionButton = ({ icon, title, onPress }) => {
    return (
      <TouchableOpacity style={styles.actionButton} onPress={onPress}>
        <View style={styles.actionIconContainer}>
          <Text style={styles.actionIcon}>{icon}</Text>
        </View>
        <Text style={styles.actionText}>{title}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.fullContainer}>
      <StatusBar barStyle="light-content" />

      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle}>Your Library</Text>
        </View>

        <TouchableOpacity
          style={styles.profileButton}
          onPress={handleProfilePress}
        >
          <TopBarProfileIcon size={30}/>
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
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
              // If already on Liked tab, go back to default view
              if (activeTab === "Liked") {
                setActiveTab(false); // Reset to default view
              } else {
                setActiveTab("Liked"); // Switch to Liked view
              }
            }}
          />
        </View>

        {activeTab === "Liked" ? (
          <>
            <Text style={styles.sectionTitle}>Your Liked Songs</Text>
            {likedLoading ? (
              <ActivityIndicator size="large" color={COLORS.PRIMARY} />
            ) : (
              <FlatList
                data={likedSongs}
                keyExtractor={(item) => item.songId.toString()}
                renderItem={({ item }) => <SongCard song={item} />}
                contentContainerStyle={styles.songListContainer}
                ListEmptyComponent={() => (
                  <Text style={styles.emptyText}>No liked songs yet</Text>
                )}
                showsVerticalScrollIndicator={false}
                onRefresh={refreshLikedSongs}
                refreshing={likedLoading}
              />
            )}
            {likedError && <Text style={styles.errorText}>{likedError}</Text>}
          </>
        ) : (
          <ScrollView style={styles.scrollContainer}>
            <ActionButton
              icon="+"
              title="Upload a Song"
              onPress={() => navigation.navigate("Upload")}
            />
           
            <ActionButton
              icon="♥"
              title="Your Liked Songs"
              onPress={() => setActiveTab("Liked")}
            />
            
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Recently played</Text>
              {recentlyPlayedLoading ? (
                <ActivityIndicator size="small" color={COLORS.PRIMARY} />
              ) : recentlyPlayedSongs && recentlyPlayedSongs.length > 0 ? (
                <FlatList
                  data={recentlyPlayedSongs} // Limit to 5 items
                  keyExtractor={(item) => `recent-${item.songId}`}
                  scrollEnabled={false}
                  renderItem={({ item }) => <SongCard song={item} />}
                  ListEmptyComponent={() => (
                    <Text style={styles.emptyText}>No recently played songs</Text>
                  )}
                />
              ) : (
                <Text style={styles.emptyText}>No recently played songs</Text>
              )}
              {recentlyPlayedError && (
                <Text style={styles.errorText}>{recentlyPlayedError}</Text>
              )}
            </View>
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fullContainer: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: COLORS.BACKGROUND,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 45,
    paddingBottom: 16,
    backgroundColor: COLORS.BACKGROUND,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  musicIcon: {
    fontSize: 30,
    color: COLORS.PRIMARY,
    marginRight: 8,
  },
  headerTitle: {
    color: COLORS.TEXT_PRIMARY,
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
    backgroundColor: COLORS.INACTIVE,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
  },
  activeTabButton: {
    backgroundColor: COLORS.ACTIVE,
    borderWidth: 1,
    borderColor: COLORS.ACTIVE_BORDER,
  },
  tabButtonText: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 14,
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
    backgroundColor: COLORS.PRIMARY,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  actionIcon: {
    fontSize: 24,
    color: COLORS.TEXT_PRIMARY,
  },
  actionText: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: "500",
  },
  sectionContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  emptyText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 14,
    textAlign: "center",
    marginTop: 20,
    fontStyle: "italic",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
  recentSongCardContainer: {
    marginBottom: 8,
  }
});