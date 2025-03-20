import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { songService } from '../services/songService';
import { useAudio } from '../context/AudioContext';
import SongCard from '../components/SongCard';

export default function BotCat() {
  const navigation = useNavigation();
  const { playSong } = useAudio();

  const [selectedMood, setSelectedMood] = useState(null);
  const [recommendedSongs, setRecommendedSongs] = useState([]);
  const [loading, setLoading] = useState(false);

  const moodOptions = ['Happy', 'Sad', 'Energetic', 'Relaxed', 'Romantic', 'Angry'];

  const handleMoodSelection = async (mood) => {
    setSelectedMood(mood);
    setLoading(true);
    try {
      const songs = await songService.getAllSongs();
      const shuffledSongs = songs.sort(() => 0.5 - Math.random());
      setRecommendedSongs(shuffledSongs.slice(0, 5));
    } catch (error) {
      console.error('Error fetching songs:', error);
      setRecommendedSongs([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaySong = async (song) => {
    await playSong(song);
    navigation.navigate('SongDetail', { song });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={32} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CatBot 🎧</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView style={styles.chatContainer}>
        <View style={styles.botBubble}>
          <Text style={styles.botText}>Hey there! How are you feeling today?</Text>
        </View>

        {!selectedMood && (
          <View style={styles.optionsContainer}>
            {moodOptions.map((mood) => (
              <TouchableOpacity
                key={mood}
                style={styles.optionButton}
                onPress={() => handleMoodSelection(mood)}
              >
                <Text style={styles.optionText}>{mood}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {selectedMood && (
          <>
            <View style={styles.userBubble}>
              <Text style={styles.userText}>{selectedMood}</Text>
            </View>

            <View style={styles.botBubble}>
              {loading ? (
                <ActivityIndicator size="small" color="#fff" style={{ marginVertical: 10 }} />
              ) : recommendedSongs.length > 0 ? (
                <>
                  <Text style={styles.botText}>Here's your "{selectedMood}" mix:</Text>
                  {recommendedSongs.map((song) => (
                    <SongCard key={song.songId} song={song} onPress={() => handlePlaySong(song)} />
                  ))}
                </>
              ) : (
                <Text style={styles.botText}>Sorry, couldn't find any songs right now.</Text>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  chatContainer: {
    flex: 1,
  },
  botBubble: {
    backgroundColor: '#333',
    borderRadius: 15,
    padding: 12,
    marginVertical: 8,
    alignSelf: 'flex-start',
    maxWidth: '80%',
  },
  userBubble: {
    backgroundColor: '#4A90E2',
    borderRadius: 15,
    padding: 12,
    marginVertical: 8,
    alignSelf: 'flex-end',
  },
  botText: {
    color: '#fff',
    fontSize: 16,
  },
  userText: {
    color: '#fff',
    fontSize: 16,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 20,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: '#4A90E2',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    margin: 5,
  },
  optionText: {
    color: '#4A90E2',
    fontSize: 15,
  }
});
