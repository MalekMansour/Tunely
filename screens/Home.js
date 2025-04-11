import React, { useCallback, useState, useEffect } from "react";
import { Text, View, FlatList, ActivityIndicator } from "react-native";
import { Image } from 'expo-image';
import { styles } from "../styles";
import { useFocusEffect } from "@react-navigation/native";
import { useGetSongs } from "../hooks/useGetSongs";
import { useAudio } from "../context/AudioContext";
import { playlistService } from "../services/playlistService";
import SongCard from "../components/SongCard";
import SongCard2 from "../components/SongCard2";
import PlayList from "../components/Playlist";

// THEME IMPORTS
import { useTheme } from "../context/ThemeContext";
import ThemedScreen from "../components/ThemedScreen";

export default function HomeScreen() {
  // THEME HOOK
  const { theme } = useTheme();

  // Fetch all songs
  const { songs, loading, error, refreshSongs } = useGetSongs("all");

  // Fetch recently played songs
  const {
    songs: recentlyPlayedSongs,
    loading: recentPlayedLoading,
    refreshSongs: refreshRecentlyPlayedSongs,
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

  useEffect(() => {
    if (songs.length > 0) {
      const imagesToPrefetch = songs.slice(0, 20)
        .map(song => song.song_photo_url)
        .filter(url => url);
      
      Image.prefetch(imagesToPrefetch);
      
      console.log(`Prefetching ${imagesToPrefetch.length} images`);
    }
  }, [songs]);

  // Get 10 newest songs
  const newSongs = songs.slice(0, 10);

  const categorizedSongs = {
    Pop: songs.filter((song) => song.genre === "Pop").slice(0, 10),
    Rap: songs.filter((song) => song.genre === "Rap").slice(0, 10),
    Acoustic: songs.filter((song) => song.genre === "Acoustic").slice(0, 10),
    Lofi: songs.filter((song) => song.genre === "Lofi").slice(0, 10),
    "R&B": songs.filter((song) => song.genre === "R&B").slice(0, 10),
    Rock: songs.filter((song) => song.genre === "Rock").slice(0, 10),
    Electronic: songs.filter((song) => song.genre === "Electronic").slice(0, 10),
    Alternative: songs.filter((song) => song.genre === "Alternative").slice(0, 10),
    Jazz: songs.filter((song) => song.genre === "Jazz").slice(0, 10),
    Trap: songs.filter((song) => song.genre === "Trap").slice(0, 10),
    Country: songs.filter((song) => song.genre === "Country").slice(0, 10),
    Other: songs
      .filter(
        (song) =>
          ![
            "Pop",
            "Rap",
            "R&B",
            "Rock",
            "Country",
            "Electronic",
            "Jazz",
            "Alternative",
            "Lofi",
            "Trap",
            "Acoustic",
          ].includes(song.genre)
      )
      .slice(0, 10),
  };

  return (
    <ThemedScreen style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={playlists}
        ListHeaderComponent={
          <>
            {/* Recently Played - Horizontal Scroll */}
            <View style={styles.sectionContainer}>
              <Text style={[styles.subtitle, { color: theme.text }]}>Recently Played</Text>
              {recentPlayedLoading ? (
                <ActivityIndicator size={32} color={theme.text} />
              ) : (
                <View style={{ height: 180 }}>
                  <FlatList
                    data={recentlyPlayedSongs.slice(0, 8)}
                    keyExtractor={(item) => item.songId.toString()}
                    horizontal
                    renderItem={({ item }) => (
                      <SongCard2 
                        song={item} 
                        contextSongs={recentlyPlayedSongs} 
                      />
                    )}
                    showsHorizontalScrollIndicator={false}
                    onRefresh={refreshRecentlyPlayedSongs}
                    refreshing={recentPlayedLoading}
                    ListEmptyComponent={
                      <Text style={[styles.emptyText, { color: theme.text }]}>
                        No recently played songs
                      </Text>
                    }
                  />
                </View>
              )}
            </View>

            {/* New Songs - Vertical Scroll */}
            <View style={styles.sectionContainer}>
              <Text style={[styles.subtitle, { color: theme.text }]}>New Songs</Text>
              <FlatList
                data={newSongs}
                keyExtractor={(item) => item.songId.toString()}
                renderItem={({ item }) => (
                  <SongCard 
                    song={item} 
                    contextSongs={newSongs} // Add context songs
                  />
                )}
                showsVerticalScrollIndicator={false}
              />
            </View>

            {/* Genre Sections */}
            {Object.entries(categorizedSongs).map(([genre, songs]) => (
              <View key={genre} style={styles.sectionContainer}>
                <Text style={[styles.subtitle, { color: theme.text }]}>{genre}</Text>
                <FlatList
                  data={songs}
                  keyExtractor={(item) => item.songId.toString()}
                  renderItem={({ item }) => (
                    <SongCard 
                      song={item} 
                      contextSongs={songs} 
                    />
                  )}
                  showsVerticalScrollIndicator={false}
                  ListEmptyComponent={
                    <Text style={[styles.emptyText, { color: theme.text }]}>
                      No {genre} songs
                    </Text>
                  }
                />
              </View>
            ))}

            {/* Playlists Section */}
            <Text style={[styles.subtitle, { color: theme.text }]}>Playlists</Text>
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
          <Text style={[styles.emptyText, { color: theme.text }]}>
            No playlists available
          </Text>
        }
      />
      {error && (
        <Text style={[styles.errorText, { color: theme.text }]}>
          Error loading songs: {error}
        </Text>
      )}
    </ThemedScreen>
  );
}
