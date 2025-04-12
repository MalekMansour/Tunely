import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  TouchableOpacity,
  ActivityIndicator 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { songService } from '../services/songService';
import { auth } from '../Utility/firebaseConfig';
import ThemedScreen from '../components/ThemedScreen';

const defaultImage = require('../assets/note.jpg');

export default function ArtistDashboard() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [songStats, setSongStats] = useState([]);
  const [totals, setTotals] = useState({ total_songs: 0, total_plays: 0, total_likes: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const userId = auth.currentUser?.uid;
      
      if (!userId) {
        console.error("No user logged in");
        return;
      }
      
      const stats = await songService.getSongStats();
      const artistTotals = await songService.getArtistTotals();
      
      setSongStats(stats);
      setTotals(artistTotals);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderSongItem = ({ item }) => (
    <View 
      style={[styles.songCard, { backgroundColor: theme.secondary }]}
    >
      <Image 
        source={item.song_photo_url ? { uri: item.song_photo_url } : defaultImage} 
        style={styles.songImage} 
      />
      <View style={styles.songInfo}>
        <Text style={[styles.songTitle, { color: theme.text }]} numberOfLines={1}>
          {item.title}
        </Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="play" size={16} color={theme.text} />
            <Text style={[styles.statText, { color: theme.text }]}>{item.play_count}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="heart" size={16} color="#ff375f" />
            <Text style={[styles.statText, { color: theme.text }]}>{item.like_count}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <ThemedScreen>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
      >
        <Ionicons name="arrow-back" size={24} color={theme.text} />
      </TouchableOpacity>
      
      <Text style={[styles.title, { color: theme.text }]}>Dashboard</Text>
      
      {loading ? (
        <ActivityIndicator size="large" color={theme.primary} style={styles.loader} />
      ) : (
        <>
          <View style={styles.statsContainer}>
            <View style={[styles.statBox, { backgroundColor: theme.secondary }]}>
              <Text style={[styles.statNumber, { color: theme.text }]}>{totals.total_songs}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Songs</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: theme.secondary }]}>
              <Text style={[styles.statNumber, { color: theme.text }]}>{totals.total_plays}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Plays</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: theme.secondary }]}>
              <Text style={[styles.statNumber, { color: theme.text }]}>{totals.total_likes}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Likes</Text>
            </View>
          </View>
          
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Your Songs</Text>
          
          <FlatList
            data={songStats}
            renderItem={renderSongItem}
            keyExtractor={(item) => item.songId.toString()}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                No songs uploaded yet. Upload your first song now!
              </Text>
            }
          />
        </>
      )}
    </ThemedScreen>
  );
}

const styles = StyleSheet.create({
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 60,
    marginBottom: 20,
    textAlign: 'center',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
    paddingHorizontal: 10,
  },
  statBox: {
    width: '30%',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginLeft: 20,
    marginBottom: 10,
  },
  listContainer: {
    paddingHorizontal: 15,
    paddingBottom: 100,
  },
  songCard: {
    flexDirection: 'row',
    borderRadius: 12,
    marginBottom: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  songImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  songInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  songTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  statText: {
    marginLeft: 5,
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 30,
    padding: 20,
  },
});