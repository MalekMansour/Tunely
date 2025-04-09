import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useGetSongs } from "../hooks/useGetSongs";
import ThemedScreen from "../components/ThemedScreen";
import { useTheme } from "../context/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import SongCard from "../components/SongCard";

// ----- Energy Target Values by Mood -----
// These target energy values are used for additional sorting if needed.
const ENERGY_TARGETS = {
  calm: 0.3,
  energetic: 0.9,
  angry: 0.8,
  joyful: 0.7,
  hot: 0.7,
  default: 0.6,
};

// ----- Mood Filter Functions -----
// Here we define criteria based on clues such as genre and song name.
const moodFilters = {
  calm: (song) => {
    const genre = song.genre ? song.genre.toLowerCase() : "";
    return song.energy < 0.5 || genre.includes("acoustic") || genre.includes("chill") || genre.includes("ambient") || genre.includes("lofi");
  },
  energetic: (song) => {
    const genre = song.genre ? song.genre.toLowerCase() : "";
    return song.energy > 0.7 || genre.includes("rock") || genre.includes("electronic") || genre.includes("pop");
  },
  angry: (song) => {
    const genre = song.genre ? song.genre.toLowerCase() : "";
    const name = song.name ? song.name.toLowerCase() : "";
    return song.energy > 0.6 && (genre.includes("metal") || genre.includes("rock") || name.includes("rage") || name.includes("anger"));
  },
  joyful: (song) => {
    const genre = song.genre ? song.genre.toLowerCase() : "";
    const name = song.name ? song.name.toLowerCase() : "";
    return song.energy > 0.5 && (genre.includes("pop") || genre.includes("dance") || name.includes("happy") || name.includes("joy"));
  },
  hot: (song) => {
    const genre = song.genre ? song.genre.toLowerCase() : "";
    return genre.includes("r&b") || genre.includes("latin") || genre.includes("soul");
  },
};

// ----- Recommendation Function -----
// This function filters the complete song library using the mood filter.
// If more than 5 songs match, it sorts them by how close the song energy is
// to a target value (from ENERGY_TARGETS) and picks the top 5.
const getFilteredRecommendations = (songs, mood) => {
  const filterFn = moodFilters[mood];
  if (!filterFn) return [];
  const filtered = songs.filter(filterFn);
  if (filtered.length === 0) return [];
  const targetEnergy = ENERGY_TARGETS[mood] || ENERGY_TARGETS.default;
  const sorted = filtered.sort(
    (a, b) => Math.abs(a.energy - targetEnergy) - Math.abs(b.energy - targetEnergy)
  );
  return sorted.slice(0, 5);
};

// ----- Main Component: MoodChatBot -----  
export default function MoodChatBot() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { songs, loading: songsLoading, error: songsError, refreshSongs } = useGetSongs("all");

  // Conversation state holds all chat messages.
  // Messages are objects with at least a sender ("bot" or "user") and text.
  // For recommendations, we add a "type" of "recommendation" and attach the recommended songs in "data".
  const [conversation, setConversation] = useState([
    { sender: "bot", text: "Hi! How are you feeling? Choose one:" },
  ]);
  const [loading, setLoading] = useState(false);

  // Array of mood options and their labels (capitalized).
  const moods = [
    { key: "calm", label: "Calm" },
    { key: "energetic", label: "Energetic" },
    { key: "angry", label: "Angry" },
    { key: "joyful", label: "Joyful" },
    { key: "hot", label: "Hot" },
  ];

  // Called when a mood button is pressed
  const handleMoodSelection = async (mood) => {
    setLoading(true);
    // Append a user message to simulate selection
    const userMsg = { sender: "user", text: `I'm feeling ${mood}.` };
    setConversation((prev) => [...prev, userMsg]);

    // Append a bot message confirming the mood
    const moodMsg = { sender: "bot", text: `Got it, you're feeling ${mood}. Let me recommend some tracks for you...` };
    setConversation((prev) => [...prev, moodMsg]);

    // Ensure songs are loaded; if still loading, refresh them
    if (songsLoading) {
      await refreshSongs();
    }
    // Instead of random sampling, we use the full library here if desired.
    // (Optionally you can sample only 50 songs; here we use the full list for filtering.)
    const recs = getFilteredRecommendations(songs, mood);
    if (recs.length === 0) {
      const noRecMsg = { sender: "bot", text: "Sorry, I couldn't find any matching tracks for that mood." };
      setConversation((prev) => [...prev, noRecMsg]);
    } else {
      // Append a bot message of type "recommendation" with the recommended songs.
      const recsMsg = { sender: "bot", type: "recommendation", data: recs };
      setConversation((prev) => [...prev, recsMsg]);
    }
    setLoading(false);
  };

  return (
    <ThemedScreen style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header with Back Button */}
      <View style={[headerStyles.header, { backgroundColor: theme.primary, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={headerStyles.backButton}>
          <Ionicons name="arrow-back" size={28} color={theme.icon} />
        </TouchableOpacity>
        <Text style={[headerStyles.title, { color: theme.text }]}>Mood Chat</Text>
        <View style={{ width: 32 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={80}
      >
        {/* Conversation Messages */}
        <FlatList
          data={conversation}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => {
            if (item.type === "recommendation") {
              // Render recommended songs as a vertical list of SongCard components
              return (
                <View
                  style={[
                    chatStyles.messageBubble,
                    chatStyles.recommendationBubble,
                    { alignSelf: "flex-start", backgroundColor: theme.secondary },
                  ]}
                >
                  <Text style={[chatStyles.messageText, { color: theme.text, marginBottom: 8 }]}>
                    Here are some recommendations:
                  </Text>
                  {item.data.map((song) => (
                    <SongCard key={song.songId ? song.songId : song.id} song={song} />
                  ))}
                </View>
              );
            } else {
              return (
                <View
                  style={[
                    chatStyles.messageBubble,
                    item.sender === "bot"
                      ? { alignSelf: "flex-start", backgroundColor: theme.secondary }
                      : { alignSelf: "flex-end", backgroundColor: theme.primary },
                  ]}
                >
                  <Text style={[chatStyles.messageText, { color: theme.text }]}>{item.text}</Text>
                </View>
              );
            }
          }}
          style={chatStyles.chatContainer}
          contentContainerStyle={{ padding: 16 }}
        />

        {loading && (
          <ActivityIndicator size="small" color={theme.icon} style={{ marginVertical: 10 }} />
        )}

        {/* Mood Selection Buttons */}
        <View style={buttonStyles.buttonContainer}>
          {moods.map((m) => (
            <TouchableOpacity
              key={m.key}
              style={[buttonStyles.moodButton, { backgroundColor: theme.icon }]}
              onPress={() => handleMoodSelection(m.key)}
            >
              <Text style={[buttonStyles.moodButtonText, { color: theme.background }]}>{m.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {songsError && (
          <Text style={[chatStyles.errorText, { color: theme.text }]}>
            Error loading songs: {songsError}
          </Text>
        )}
      </KeyboardAvoidingView>
    </ThemedScreen>
  );
}

const headerStyles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    marginTop: 40,
  },
  backButton: { padding: 8 },
  title: { flex: 1, fontSize: 20, fontWeight: "bold", textAlign: "center" },
});

const chatStyles = StyleSheet.create({
  chatContainer: { flex: 1 },
  messageBubble: { padding: 12, borderRadius: 12, marginVertical: 6, maxWidth: "80%" },
  messageText: { fontSize: 16 },
  errorText: { fontSize: 16, marginTop: 10 },
  recommendationBubble: {
    // Additional styling for recommendation bubble if needed
  },
});

const buttonStyles = StyleSheet.create({
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginHorizontal: 16,
    marginBottom: 180,
  },
  moodButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  moodButtonText: { fontSize: 16, fontWeight: "bold" },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
});
