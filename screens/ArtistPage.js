import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
} from "react-native";
import { songService } from "../services/songService";
import SongCard from "../components/SongCard";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import ThemedScreen from "../components/ThemedScreen";

export default function ArtistPage() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [description, setDescription] = useState("");
  const [isDescriptionEditable, setIsDescriptionEditable] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { theme } = useTheme();
  const route = useRoute();
  const navigation = useNavigation();
  
  // Extract artistName and profilePicture from route params
  const { artistName, profilePicture } = route.params || {};

  useEffect(() => {
    const fetchSongsByArtist = async () => {
      if (!artistName) {
        console.error("Artist name is missing");
        return;
      }
      setLoading(true);
      try {
        const allSongs = await songService.getAllSongs();
        // Filter songs by the passed artistName
        const artistSongs = allSongs.filter(
          (song) => song.artistName.toLowerCase() === artistName.toLowerCase()
        );
        setSongs(artistSongs.slice(0, 5)); // Show 5 newest songs initially
      } catch (error) {
        console.error("Error fetching songs by artist:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSongsByArtist();
  }, [artistName]);

  const loadMoreSongs = () => {
    setCurrentPage((prevPage) => prevPage + 1);
    const nextSongs = songs.slice(0, (currentPage + 1) * 5); // Load 5 more songs
    setSongs(nextSongs);
  };

  const handleDescriptionChange = (text) => {
    if (isDescriptionEditable) {
      setDescription(text);
    }
  };

  const toggleDescriptionEdit = () => {
    setIsDescriptionEditable((prev) => !prev);
  };

  return (
    <ThemedScreen style={[styles.container, { backgroundColor: theme.background }]}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.arrowButton}>
        <Ionicons name="arrow-back" size={28} color={theme.text} />
      </TouchableOpacity>

      <View style={styles.headerContainer}>
        <Image
          source={
            profilePicture
              ? { uri: profilePicture }
              : require("../assets/profile.png")
          }
          style={styles.profileImage}
        />
        <Text style={[styles.artistName, { color: theme.text }]}>{artistName}</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.text} style={styles.loader} />
      ) : (
        <FlatList
          data={songs}
          keyExtractor={(item) => item.songId.toString()}
          renderItem={({ item }) => <SongCard song={item} />}
          contentContainerStyle={styles.list}
          ListFooterComponent={
            <TouchableOpacity onPress={loadMoreSongs} style={styles.loadMoreButton}>
              <Text style={[styles.loadMoreText, { color: theme.text }]}>Load More</Text>
            </TouchableOpacity>
          }
        />
      )}

      <View style={styles.descriptionContainer}>
        <Text style={[styles.descriptionTitle, { color: theme.text }]}>Description</Text>
        <TextInput
          style={[styles.descriptionInput, { color: theme.text, borderColor: theme.text }]}
          value={description}
          onChangeText={handleDescriptionChange}
          editable={isDescriptionEditable}
          multiline
          numberOfLines={4}
        />
        <TouchableOpacity onPress={toggleDescriptionEdit} style={styles.editButton}>
          <Text style={[styles.editButtonText, { color: theme.text }]}>
            {isDescriptionEditable ? "Save Description" : "Edit Description"}
          </Text>
        </TouchableOpacity>
      </View>
    </ThemedScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  arrowButton: {
    position: "absolute",
    left: 16,
    zIndex: 1,
    marginTop: 60,
  },
  headerContainer: {
    alignItems: "center",
    marginTop: 80,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  artistName: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  loader: {
    marginTop: 50,
  },
  list: {
    paddingBottom: 120,
  },
  loadMoreButton: {
    marginTop: 16,
    alignItems: "center",
  },
  loadMoreText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  descriptionContainer: {
    marginTop: 20,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  descriptionInput: {
    borderWidth: 1,
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  editButton: {
    alignItems: "center",
    paddingVertical: 8,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
