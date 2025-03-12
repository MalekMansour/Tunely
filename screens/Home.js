import React, { useCallback, useState } from "react";
import { Text, View, FlatList, ActivityIndicator } from "react-native";
import { styles } from "../styles";
import { useFocusEffect } from "@react-navigation/native";
import { useGetSongs } from "../hooks/useGetSongs";
import { useAudio } from "../context/AudioContext";
import { playlistService } from "../services/playlistService";
import SongCard from "../components/SongCard"; 
import SongCard2 from "../components/SongCard2";
import PlayList from "../components/Playlist";

export default function HomeScreen() {
  const { songs, loading, error, refreshSongs } = useGetSongs("all");
  const {
    songs: recentlyPlayedSongs,
    loading: recentPlayedLoading,
    refreshSongs: refreshRecentlyPlayedSongs, // Added refresh function
  } = useGetSongs("recently-played");
  
  const { changePlaylist } = useAudio();
  const [playlists, setPlaylists] = useState([]);
  const [playlistsLoading, setPlaylistsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      refreshSongs();
      refreshRecentlyPlayedSongs(); 

      const fetchPlaylists = async () => {
        try {
          setPlaylistsLoading(true);
          const playlistData = await playlistService.getAllPlaylists();
          setPlaylists(playlistData);
        } catch (error) {
          console.error("Error fetching playlists:", error);
        } finally {
          setPlaylistsLoading(false);
        }
      };

      fetchPlaylists();
    }, [])
  );

  // Get 10 newest songs
  const newSongs = songs.slice(0, 10);

  // Categorized genres
  const categorizedSongs = {
    Pop: songs.filter((song) => song.genre === "Pop").slice(0, 10),
    Rap: songs.filter((song) => song.genre === "Rap").slice(0, 10),
    "R&B": songs.filter((song) => song.genre === "R&B").slice(0, 10),
    Rock: songs.filter((song) => song.genre === "Rock").slice(0, 10),
    Country: songs.filter((song) => song.genre === "Country").slice(0, 10),
    Electronic: songs.filter((song) => song.genre === "Electronic").slice(0, 10),
    Jazz: songs.filter((song) => song.genre === "Jazz").slice(0, 10),
    Other: songs.filter(
      (song) =>
        !["Pop", "Rap", "R&B", "Rock", "Country", "Electronic", "Jazz"].includes(song.genre)
    ).slice(0, 10),
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={playlists}
        ListHeaderComponent={
          <>
            {/* Recently Played Songs - Horizontal Scroll */}
            <View style={styles.sectionContainer}>
              <Text style={styles.subtitle}>Recently Played</Text>
              {recentPlayedLoading ? (
                <ActivityIndicator size="large" color="#f1f1f1" />
              ) : (
                <FlatList
                  data={recentlyPlayedSongs.slice(0, 8)}
                  keyExtractor={(item) => item.songId.toString()}
                  horizontal
                  renderItem={({ item }) => <SongCard2 song={item} />} 
                  showsHorizontalScrollIndicator={false}
                  onRefresh={refreshRecentlyPlayedSongs} // Enable pull-to-refresh
                  refreshing={recentPlayedLoading} // Ensure refreshing state updates
                  ListEmptyComponent={
                    <Text style={styles.emptyText}>No recently played songs</Text>
                  }
                />
              )}
            </View>

            {/* New Songs - Vertical Scroll */}
            <View style={styles.sectionContainer}>
              <Text style={styles.subtitle}>New Songs</Text>
              <FlatList
                data={newSongs}
                keyExtractor={(item) => item.songId.toString()}
                renderItem={({ item }) => <SongCard song={item} />} 
                showsVerticalScrollIndicator={false}
              />
            </View>

            {/* Genre Sections */}
            {Object.entries(categorizedSongs).map(([genre, songs]) => (
              <View key={genre} style={styles.sectionContainer}>
                <Text style={styles.subtitle}>{genre}</Text>
                <FlatList
                  data={songs}
                  keyExtractor={(item) => item.songId.toString()}
                  renderItem={({ item }) => <SongCard song={item} />}
                  showsVerticalScrollIndicator={false}
                  ListEmptyComponent={
                    <Text style={styles.emptyText}>No {genre} songs</Text>
                  }
                />
              </View>
            ))}

            {/* Playlists */}
            <Text style={styles.subtitle}>Playlists</Text>
          </>
        }
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <PlayList
            title={item.title}
            playlistId={item.id}
            songs={item.songs || []}
            image={
              item.image
                ? { uri: item.image }
                : require("../assets/graduation.jpg")
            }
          />
        )}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        onRefresh={() => {
          refreshSongs();
          refreshRecentlyPlayedSongs(); 
        }}
        refreshing={loading}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No playlists available</Text>
        }
      />
      {error && <Text style={styles.errorText}>Error loading songs: {error}</Text>}
    </View>
  );
}
