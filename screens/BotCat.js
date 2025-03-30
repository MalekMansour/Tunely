import React, { useState } from 'react';
import {
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

// THEME IMPORTS
import { useTheme } from '../context/ThemeContext';
import ThemedScreen from '../components/ThemedScreen';

export default function BotCat() {
  const navigation = useNavigation();
  const { playSong } = useAudio();
  
  const { theme } = useTheme();  
  
  const [selectedMood, setSelectedMood] = useState(null);
  const [recommendedSongs, setRecommendedSongs] = useState([]);
  const [loading, setLoading] = useState(false);

  const moodOptions = ['Happy', 'Sad', 'Energetic', 'Relaxed', 'Angry'];

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
    <ThemedScreen style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={32} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>CatBot 🎧</Text>
        <View style={{ width: 32, marginTop: 150 }} />
      </View>

      <ScrollView style={styles.chatContainer}>
        <View style={[styles.botBubble, { backgroundColor: theme.secondary }]}>
          <Text style={[styles.botText, { color: theme.text }]}>
            Hey there! How are you feeling today?
          </Text>
        </View>

        {!selectedMood && (
          <View style={styles.optionsContainer}>
            {moodOptions.map((mood) => (
              <TouchableOpacity
                key={mood}
                style={[styles.optionButton, { borderColor: theme.primary }]}
                onPress={() => handleMoodSelection(mood)}
              >
                <Text style={[styles.optionText, { color: theme.primary }]}>
                  {mood}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {selectedMood && (
          <>
            <View style={[styles.userBubble, { backgroundColor: theme.primary }]}>
              <Text style={[styles.userText, { color: theme.text }]}>
                {selectedMood}
              </Text>
            </View>

            <View style={[styles.botBubble, { backgroundColor: theme.secondary }]}>
              {loading ? (
                <ActivityIndicator size="small" color={theme.text} style={{ marginVertical: 10 }} />
              ) : recommendedSongs.length > 0 ? (
                <>
                  <Text style={[styles.botText, { color: theme.text }]}>
                    Here's your "{selectedMood}" mix:
                  </Text>
                  {recommendedSongs.map((song) => (
                    <SongCard
                      key={song.songId}
                      song={song}
                      onPress={() => handlePlaySong(song)}
                    />
                  ))}
                </>
              ) : (
                <Text style={[styles.botText, { color: theme.text }]}>
                  Sorry, couldn't find any songs right now.
                </Text>
              )}
            </View>
          </>
        )}
      </ScrollView>X
    </ThemedScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  chatContainer: {
    flex: 1,
  },
  botBubble: {
    borderRadius: 15,
    padding: 12,
    marginVertical: 8,
    alignSelf: 'flex-start',
    maxWidth: '80%',
  },
  userBubble: {
    borderRadius: 15,
    padding: 12,
    marginVertical: 8,
    alignSelf: 'flex-end',
  },
  botText: {
    fontSize: 16,
  },
  userText: {
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
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    margin: 5,
  },
  optionText: {
    fontSize: 15,
  },
});
