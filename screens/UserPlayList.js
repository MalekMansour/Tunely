import React, { useState, useEffect } from "react";
import { View, Text, FlatList, SafeAreaView, TouchableOpacity, Alert, Modal, TextInput } from "react-native";
import { styles } from "../styles";
import PlayList from "../components/Playlist";
import { Ionicons } from '@expo/vector-icons';
import { playlistService } from "../services/playlistService";
import { useFocusEffect } from '@react-navigation/native';
import { songService } from "../services/songService";

export default function UserPlayList({ navigation }) {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [playlistTitle, setPlaylistTitle] = useState("");
  const [availableSongs, setAvailableSongs] = useState([]);
  const [selectedSongs, setSelectedSongs] = useState([]);

  // Fetch playlists when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchPlaylists();
      fetchAvailableSongs();
      return () => {};
    }, [])
  );

  // Fetch user's playlists
  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      const data = await playlistService.getUserPlaylists();
      setPlaylists(data);
    } catch (error) {
      console.error('Error fetching playlists:', error);
      Alert.alert('Error', 'Failed to load your playlists');
    } finally {
      setLoading(false);
    }
  };

  // Fetch available songs for playlist creation
  const fetchAvailableSongs = async () => {
    try {
      const songs = await songService.getAllSongs();
      setAvailableSongs(songs);
    } catch (error) {
      console.error('Error fetching songs:', error);
    }
  };

  // Toggle song selection
  const toggleSongSelection = (songId) => {
    setSelectedSongs(prevSelected =>
      prevSelected.includes(songId)
        ? prevSelected.filter(id => id !== songId)
        : [...prevSelected, songId]
    );
  };

  // Create new playlist
  const handleCreatePlaylist = async () => {
    if (playlistTitle.trim() === '') {
      Alert.alert('Error', 'Please enter a playlist title');
      return;
    }

    try {
      setLoading(true);
      const result = await playlistService.createPlaylist({
        title: playlistTitle,
        songs: selectedSongs
      });
      
      Alert.alert('Success', 'Playlist created successfully');
      setModalVisible(false);
      setPlaylistTitle('');
      setSelectedSongs([]);
      
      // Refresh playlists to show the new one
      fetchPlaylists();
    } catch (error) {
      console.error('Error creating playlist:', error);
      Alert.alert('Error', 'Failed to create playlist');
    } finally {
      setLoading(false);
    }
  };

  // Handle playlist selection
  

  // Delete playlist
  const handleDeletePlaylist = async (playlistId) => {
    try {
      setLoading(true);
      await playlistService.deletePlaylist(playlistId);
      // Refresh the playlists after deletion
      fetchPlaylists();
    } catch (error) {
      console.error('Error deleting playlist:', error);
      Alert.alert('Error', 'Failed to delete playlist');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Your Playlists</Text>
      
      {loading && <Text style={styles.loadingText}>Loading...</Text>}
      
      <FlatList
        data={playlists}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <PlayList
            title={item.title}
            playlistId={item.id}
            onDelete={handleDeletePlaylist}
          />
        )}
        numColumns={2}
        ListEmptyComponent={
          !loading && (
            <Text style={styles.emptyListText}>
              You don't have any playlists yet. Create one!
            </Text>
          )
        }
      />

      {/* Create Playlist Button */}
      <TouchableOpacity
        style={styles.fabButton}
        onPress={() => setModalVisible(true)}
        disabled={loading}
      >
        <Ionicons name="add-circle" size={24} color="black" />
        <Text style={styles.fabButtonText}>New</Text>
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
            <Text style={styles.modalTitle}>Create New Playlist</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Playlist title"
              value={playlistTitle}
              onChangeText={setPlaylistTitle}
            />

            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreatePlaylist}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Creating...' : 'Create Playlist'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setModalVisible(false);
                setPlaylistTitle('');
                setSelectedSongs([]);
              }}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
