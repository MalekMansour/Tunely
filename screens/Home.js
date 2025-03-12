import React, { useCallback, useState } from "react";
import { Text, View, FlatList, ActivityIndicator } from "react-native";
import { styles } from "../styles";
import { useFocusEffect } from "@react-navigation/native";
import { useGetSongs } from "../hooks/useGetSongs";
import { useAudio } from "../context/AudioContext";
import { playlistService } from "../services/playlistService";
import SongCard from "../components/SongCard";  // Use SongCard for uniform sizing
import PlayList from "../components/Playlist";

export default function HomeScreen() {
  const { songs, loading, error, refreshSongs } = useGetSongs("all");
  const {
    songs: recentlyPlayedSongs,
    loading: recentPlayedLoading,
  } = useGetSongs("recently-played");
  const { changePlaylist } = useAudio();
  const [playlists, setPlaylists] = useState([]);
  const [playlistsLoading, setPlaylistsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      refreshSongs();

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

  const recommendedSong = songs.length > 0 ? songs[0] : null;
  const newSongs = songs.slice(0, 10);  // Newest songs at the top
  const trendingSongs = songs.slice(5, 15);
  const rapSongs = songs.filter((song) => song.genre === "Rap").slice(0, 10);
  const popSongs = songs.filter((song) => song.genre === "Pop").slice(0, 10);

  return (
    <View style={styles.container}>
      <FlatList
        data={playlists}
        ListHeaderComponent={
          <>
            {/* New Songs */}
            <View style={styles.sectionContainer}>
              <Text style={styles.subtitle}>New Songs</Text>
              <FlatList
                data={newSongs}
                keyExtractor={(item) => item.songId.toString()}
                horizontal
                renderItem={({ item }) => <SongCard song={item} />}
                showsHorizontalScrollIndicator={false}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>No new songs</Text>
                }
              />
            </View>

            {/* You Might Like */}
            <View style={styles.recommendationContainer}>
              <Text style={styles.subtitle}>You Might Like</Text>
              {recommendedSong ? (
                <SongCard song={recommendedSong} large /> 
              ) : (
                <Text style={styles.emptyText}>No recommendations yet</Text>
              )}X
            </View>

            {/* Recent Songs */}
            <View style={styles.sectionContainer}>
              <Text style={styles.subtitle}>Recent</Text>
              {recentPlayedLoading ? (
                <ActivityIndicator size="large" color="#f1f1f1" />
              ) : (
                <FlatList
                  data={recentlyPlayedSongs.slice(0, 8)}
                  keyExtractor={(item) => item.songId.toString()}
                  horizontal
                  renderItem={({ item }) => <SongCard song={item} />}
                  showsHorizontalScrollIndicator={false}
                  ListEmptyComponent={
                    <Text style={styles.emptyText}>No recently played songs</Text>
                  }
                />
              )}
            </View>

            {/* Other Sections */}
            <View style={styles.sectionContainer}>
              <Text style={styles.subtitle}>Trending Songs</Text>
              <FlatList
                data={trendingSongs}
                keyExtractor={(item) => item.songId.toString()}
                horizontal
                renderItem={({ item }) => <SongCard song={item} />}
                showsHorizontalScrollIndicator={false}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>No trending songs</Text>
                }
              />
            </View>

            <View style={styles.sectionContainer}>
              <Text style={styles.subtitle}>Rap Songs</Text>
              <FlatList
                data={rapSongs}
                keyExtractor={(item) => item.songId.toString()}
                horizontal
                renderItem={({ item }) => <SongCard song={item} />}
                showsHorizontalScrollIndicator={false}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>No rap songs</Text>
                }
              />
            </View>

            <View style={styles.sectionContainer}>
              <Text style={styles.subtitle}>Pop Songs</Text>
              <FlatList
                data={popSongs}
                keyExtractor={(item) => item.songId.toString()}
                horizontal
                renderItem={({ item }) => <SongCard song={item} />}
                showsHorizontalScrollIndicator={false}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>No pop songs</Text>
                }
              />
            </View>

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
        onRefresh={refreshSongs}
        refreshing={loading}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No playlists available</Text>
        }
      />
      {error && <Text style={styles.errorText}>Error loading songs: {error}</Text>}
    </View>
  );
}
