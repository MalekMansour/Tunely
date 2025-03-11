import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { playlistService } from "../services/playlistService";
import { songService } from "../services/songService";
import { useNavigation } from '@react-navigation/native';
import PlayList from "../components/Playlist";
import SongCard from "../components/SongCard";

export default function Search() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        setLoading(true);
        const playlistData = await playlistService.getAllPlaylists();
        setPlaylists(playlistData);
      } catch (error) {
        console.error("Error fetching playlists:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylists();
  }, []);

  // Handle search input
  const handleSearch = async (text) => {
    setQuery(text);
    
    if (text.length > 2) {
      setIsSearching(true);
      try {
        const songs = await songService.searchSongs(text);
        setResults(songs);
      } catch (error) {
        console.error("Error searching songs:", error);
        setResults([]);
      }
    } else {
      setIsSearching(false);
      setResults([]);
    }
  };

  // Clear search
  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setIsSearching(false);
  };

  // Browse categories 
  const browseCategories = [
    // Row 1
    {
      id: "1",
      name: "Made for You",
      color: "#4A90E2",
      icon: require("../assets/graduation.jpg"),
    },
    {
      id: "2",
      name: "Released",
      subtext: "Top New Songs",
      color: "#9013FE",
      icon: require("../assets/graduation.jpg"),
    },
    // Row 2
    {
      id: "3",
      name: "Music Charts",
      color: "#4F52FF",
      icon: require("../assets/graduation.jpg"),
    },
    {
      id: "4",
      name: "Rap/Hip-Hop",
      color: "#D0021B",
      icon: require("../assets/graduation.jpg"),
    },
    // Row 3
    {
      id: "5",
      name: "Jazz",
      color: "#B8860B",
      icon: require("../assets/graduation.jpg"),
    },
    {
      id: "6",
      name: "Pop Fusion",
      color: "#50E3C2",
      icon: require("../assets/graduation.jpg"),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search for something"
          placeholderTextColor="#888"
          value={query}
          onChangeText={handleSearch}
        />
        {query ? (
          <TouchableOpacity style={styles.searchIcon} onPress={clearSearch}>
            <Text style={styles.searchIconText}>✕</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.searchIcon}>
            <Text style={styles.searchIconText}>🔍</Text>
          </TouchableOpacity>
        )}
      </View>
      {/* view if is searching */}
      {isSearching ? (
        // Search Results
        <FlatList
          data={results}
          keyExtractor={(item) => item.songId.toString()}
          renderItem={({ item }) => <SongCard song={item} />}
          contentContainerStyle={styles.resultsList}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No results found</Text>
          }
        />
      ) : (
        // Regular Content
        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >

          {/* Playlist Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Playlists</Text>
            {loading ? (
              <ActivityIndicator size="large" color="#f1f1f1" />
            ) : playlists.length === 0 ? (
              <Text style={styles.emptyText}>No playlists available</Text>
            ) : (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
              >
                {playlists.slice(0, 10).map((playlist) => (
                  <PlayList
                    key={playlist.id}
                    title={playlist.title || playlist.name}
                    playlistId={playlist.id}
                    songs={playlist.songs || []}
                    image={
                      playlist.image
                        ? { uri: playlist.image }
                        : require("../assets/graduation.jpg")
                    }
                    style={{ width: 140, marginRight: 10 }}
                  />
                ))}
              </ScrollView>
            )}
          </View>

          {/* Browse All Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Browse</Text>
            <View style={styles.browseGrid}>
              {browseCategories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryCard,
                    { backgroundColor: category.color },
                  ]}
                >
                  <View style={styles.categoryContent}>
                    <Text style={styles.categoryName}>{category.name}</Text>
                    {category.subtext && (
                      <Text style={styles.categorySubtext}>
                        {category.subtext}
                      </Text>
                    )}
                  </View>
                  
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      )}

      {/* Bottom nav bar */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Home")}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navItem, styles.activeNavItem]}>
          <Text style={[styles.navIcon, styles.activeNavIcon]}>🔍</Text>
          <Text style={[styles.navText, styles.activeNavText]}>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Library")}>
          <Text style={styles.navIcon}>📚</Text>
          <Text style={styles.navText}>Library</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 16, 
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
    marginHorizontal: 16,
  },
  searchBar: {
    flex: 1,
    height: 40,
    backgroundColor: "#333",
    borderRadius: 20,
    color: "#fff",
    paddingHorizontal: 16,
    fontSize: 16,
  },
  searchIcon: {
    position: "absolute",
    right: 15,
  },
  searchIconText: {
    fontSize: 18,
    color: "#888",
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  // Artist styles
  artistCard: {
    marginRight: 16,
    width: 100,
    alignItems: "center",
  },
  artistImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginBottom: 8,
  },
  artistName: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
  },
  // Playlist styles
  playlistCard: {
    marginRight: 16,
    width: 160,
  },
  playlistImage: {
    width: 160,
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  playlistName: {
    color: "#fff",
    fontSize: 14,
  },
  // Browse categories styles
  browseGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  categoryCard: {
    width: "48%",
    height: 100,
    borderRadius: 8,
    marginBottom: 12,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    overflow: "hidden",
  },
  categoryContent: {
    flex: 1,
    justifyContent: "center",
  },
  categoryName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  categorySubtext: {
    color: "#fff",
    fontSize: 12,
    marginTop: 4,
  },
  categoryIconContainer: {
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryIcon: {
    width: 60,
    height: 60,
    resizeMode: "contain", 
  },
  // Bottom Navigation 
  navbar: {
    flexDirection: "row",
    height: 60,
    backgroundColor: "#0A0E20",
    borderTopWidth: 0,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  navIcon: {
    fontSize: 20,
    color: "#888",
    marginBottom: 4,
  },
  navText: {
    fontSize: 12,
    color: "#888",
  },
  activeNavItem: {
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  activeNavIcon: {
    color: "#fff",
  },
  activeNavText: {
    color: "#fff",
  },
  emptyText: {
    color: "#888",
    fontSize: 14,
    textAlign: "center",
    marginTop: 10,
  },
  playlistsContainer: {
    paddingRight: 10,
    paddingBottom: 5,
    flexDirection: 'row',
  },
  playlistWrap: {
    width: 300,
    marginRight: 0,
  },
  // search results 
  resultsList: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 70, // Space for the bottom navbar
  },
});
