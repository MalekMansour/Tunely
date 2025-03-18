import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet, SafeAreaView } from "react-native";
import { songService } from "../services/songService";
import SongCard from "../components/SongCard";
import { useRoute } from "@react-navigation/native";

export default function GenreSongs() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const route = useRoute();
  const { genre } = route.params;

  useEffect(() => {
    const fetchSongsByGenre = async () => {
      setLoading(true);
      try {
        const genreSongs = await songService.getSongsByGenre(genre);
        setSongs(genreSongs);
      } catch (error) {
        console.error("Error fetching songs by genre:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSongsByGenre();
  }, [genre]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.genreTitle}>{genre} Songs</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#f1f1f1" style={styles.loader} />
      ) : songs.length === 0 ? (
        <Text style={styles.emptyText}>No songs found for this genre.</Text>
      ) : (
        <FlatList
          data={songs}
          keyExtractor={(item) => item.songId.toString()}
          renderItem={({ item }) => <SongCard song={item} />}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 16,
  },
  genreTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  loader: {
    marginTop: 50,
  },
  emptyText: {
    color: "#888",
    fontSize: 16,
    textAlign: "center",
    marginTop: 30,
  },
  list: {
    paddingBottom: 20,
  },
});
