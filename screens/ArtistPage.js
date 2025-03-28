import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import ThemedScreen from "../components/ThemedScreen";
import SongCard from "../components/SongCard";
import { API_URL } from "../config/apiConfig";
import { auth } from "../Utility/firebaseConfig";

export default function ArtistPage() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { artist } = useRoute().params; // Expected: { id, name, profilePicture, description }
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllSongs, setShowAllSongs] = useState(false);

  // Description state for the "About the Artist" section
  const [description, setDescription] = useState(artist.description || "");
  const [isEditing, setIsEditing] = useState(false);

  // Determine if the logged-in user is the artist
  const isArtist = auth.currentUser && auth.currentUser.uid === artist.id;

  useEffect(() => {
    const fetchSongsByArtist = async () => {
      try {
        // Fetch all songs and filter on the client side by artistName
        const response = await fetch(`${API_URL}/songs`);
        if (!response.ok) {
          throw new Error(`Error fetching songs: ${response.status}`);
        }
        const allSongs = await response.json();
        const filteredSongs = allSongs.filter(
          (song) => song.artistName === artist.name
        );
        setSongs(filteredSongs);
      } catch (error) {
        console.error("Error fetching songs for artist:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSongsByArtist();
  }, [artist]);

  const displayedSongs = showAllSongs ? songs : songs.slice(0, 5);

  const renderSongItem = ({ item }) => <SongCard song={item} />;

  const handleSaveDescription = () => {
    // Here you would call an API to update the artist's description.
    // For now, we'll simply exit edit mode and log the new description.
    setIsEditing(false);
    console.log("Saved description:", description);
  };

  const handleDescriptionChange = (text) => {
    // Enforce a maximum of 500 words.
    const words = text.trim().split(/\s+/);
    if (words.filter(Boolean).length <= 500) {
      setDescription(text);
    } else {
      alert("Description cannot exceed 500 words.");
    }
  };

  return (
    <ThemedScreen style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.header}>
          <Image source={{ uri: artist.profilePicture }} style={styles.profileImage} />
          <Text style={[styles.artistName, { color: theme.text }]}>{artist.name}</Text>
        </View>
        <View style={styles.songsSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Songs</Text>
          {loading ? (
            <ActivityIndicator size="large" color={theme.icon} />
          ) : (
            <>
              <FlatList
                data={displayedSongs}
                keyExtractor={(item) => item.songId.toString()}
                renderItem={renderSongItem}
                contentContainerStyle={styles.songList}
              />
              {songs.length > 5 && !showAllSongs && (
                <TouchableOpacity
                  style={styles.loadAllButton}
                  onPress={() => setShowAllSongs(true)}
                >
                  <Text style={[styles.loadAllText, { color: theme.text }]}>Load All</Text>
                </TouchableOpacity>
              )}
              {showAllSongs && songs.length > 5 && (
                <TouchableOpacity
                  style={styles.loadAllButton}
                  onPress={() => setShowAllSongs(false)}
                >
                  <Text style={[styles.loadAllText, { color: theme.text }]}>Show Less</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
        <View style={styles.descriptionSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>About the Artist</Text>
          {isEditing ? (
            <>
              <TextInput
                style={[styles.descriptionInput, { color: theme.text, borderColor: theme.border }]}
                value={description}
                onChangeText={handleDescriptionChange}
                multiline
              />
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveDescription}>
                <Text style={[styles.saveButtonText, { color: theme.text }]}>Save</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.descriptionContainer}>
              <Text style={[styles.descriptionText, { color: theme.text }]}>{description}</Text>
              {isArtist && (
                <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
                  <Ionicons name="create-outline" size={20} color={theme.text} />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </ThemedScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  backButton: {
    margin: 15,
  },
  header: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 10,
  },
  artistName: {
    fontSize: 24,
    fontWeight: "bold",
  },
  songsSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  songList: {
    paddingBottom: 20,
  },
  loadAllButton: {
    alignSelf: "center",
    padding: 10,
    marginVertical: 10,
  },
  loadAllText: {
    fontSize: 16,
    textDecorationLine: "underline",
  },
  descriptionSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  descriptionContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  descriptionText: {
    flex: 1,
    fontSize: 16,
  },
  editButton: {
    marginLeft: 10,
    marginTop: 5,
  },
  descriptionInput: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    minHeight: 100,
    textAlignVertical: "top",
    fontSize: 16,
  },
  saveButton: {
    alignSelf: "flex-end",
    marginTop: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    backgroundColor: "#007AFF",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});
