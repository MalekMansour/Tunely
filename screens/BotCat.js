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
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useGetSongs } from "../hooks/useGetSongs";
import ThemedScreen from "../components/ThemedScreen";
import { useTheme } from "../context/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import SongCard from "../components/SongCard";

// ----- Energy Target Values by Mood -----
// (These are kept for reference if you wish to further sort by energy.)
const ENERGY_TARGETS = {
  calm: 0.3,
  energetic: 0.9,
  inlove: 0.65,
  sad: 0.2,
  hot: 0.7,
  default: 0.6,
};

// ----- Mood Filter Functions -----
// Each function returns true if a song is considered to match that mood.
const moodFilters = {
  calm: (song) => {
    const genre = song.genre ? song.genre.toLowerCase() : "";
    return (
      song.energy < 0.5 ||
      genre.includes("lofi") ||
      genre.includes("acoustic") ||
      genre.includes("alternative") ||
      genre.includes("jazz")
    );
  },
  energetic: (song) => {
    const genre = song.genre ? song.genre.toLowerCase() : "";
    return (
      song.energy > 0.7 ||
      genre.includes("pop") ||
      genre.includes("rap") ||
      genre.includes("rock") ||
      genre.includes("electronic") ||
      genre.includes("trap")
    );
  },
  inlove: (song) => {
    const genre = song.genre ? song.genre.toLowerCase() : "";
    const name = song.name ? song.name.toLowerCase() : "";
    return (
      (genre.includes("romantic") ||
        genre.includes("love") ||
        genre.includes("ballad") ||
        name.includes("love") ||
        name.includes("romance")) &&
      song.energy > 0.4 &&
      song.energy < 0.8
    );
  },
  sad: (song) => {
    const genre = song.genre ? song.genre.toLowerCase() : "";
    return (
      song.energy < 0.4 ||
      genre.includes("acoustic") ||
      genre.includes("alternative")
    );
  },
  hot: (song) => {
    const genre = song.genre ? song.genre.toLowerCase() : "";
    return (
      genre.includes("r&b") || genre.includes("latin") || genre.includes("soul")
    );
  },
};

// ----- Helper: Shuffle an Array -----
// This function returns a new array in random order.
const shuffleArray = (array) => {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// ----- Main Component: MoodChatBot -----
export default function MoodChatBot() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { songs, loading: songsLoading, error: songsError, refreshSongs } = useGetSongs("all");

  // An initial conversation (welcome message with logo)
  const initialConversation = [
    {
      sender: "bot",
      type: "logo",
      text: "Hi, I'm Tunely! How are you feeling?",
    },
  ];
  const [conversation, setConversation] = useState(initialConversation);
  const [loading, setLoading] = useState(false);

  // Define mood options.
  const moods = [
    { key: "calm", label: "Calm" },
    { key: "energetic", label: "Energetic" },
    { key: "inlove", label: "In Love" },
    { key: "sad", label: "Sad" },
    { key: "hot", label: "Hot" },
  ];

  // When a mood button is pressed:
  // - Clear prior messages (keep the welcome message)
  // - Append user's mood selection and a bot confirmation
  // - Filter the full song library using the mood filter,
  //   then shuffle that list and pick 5 random songs.
  const handleMoodSelection = async (mood) => {
    setConversation(initialConversation); // Reset conversation
    setLoading(true);

    // Append user's mood selection.
    const userMsg = { sender: "user", text: `I'm feeling ${mood}.` };
    setConversation((prev) => [...prev, userMsg]);

    // Append bot confirmation.
    const moodMsg = {
      sender: "bot",
      text: `Got it, you're feeling ${mood}. Let me recommend some tracks for you...`,
    };
    setConversation((prev) => [...prev, moodMsg]);

    // Ensure songs are loaded.
    if (songsLoading) {
      await refreshSongs();
    }
    // Filter the songs that match the chosen mood.
    const matchingSongs = songs.filter(moodFilters[mood]);
    let recommendations = [];
    if (matchingSongs.length === 0) {
      const noRecMsg = {
        sender: "bot",
        text: "Sorry, I couldn't find any matching tracks for that mood.",
      };
      setConversation((prev) => [...prev, noRecMsg]);
    } else {
      // Always shuffle the matching songs, then slice the first 5.
      recommendations = shuffleArray(matchingSongs).slice(0, 5);
      const recsMsg = { sender: "bot", type: "recommendation", data: recommendations };
      setConversation((prev) => [...prev, recsMsg]);
    }
    setLoading(false);
  };

  return (
    <ThemedScreen style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header with Back Button and Logo */}
      <View style={[headerStyles.header, { backgroundColor: theme.primary, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={headerStyles.backButton}>
          <Ionicons name="arrow-back" size={28} color={theme.icon} />
        </TouchableOpacity>
        <View style={headerStyles.logoContainer}>
          <Image
            source={require("../assets/tunely_logo_top.png")}
            style={headerStyles.logo}
          />
          <Text style={[headerStyles.headerTitle, { color: theme.text }]}>Mood Chat</Text>
        </View>
        <View style={{ width: 32 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={80}
      >
        {/* Chat Conversation */}
        <FlatList
          data={conversation}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => {
            if (item.type === "recommendation") {
              return (
                <View style={[chatStyles.messageBubble, chatStyles.recommendationBubble, { alignSelf: "flex-start", backgroundColor: theme.secondary }]}>
                  <Text style={[chatStyles.messageText, { color: theme.text, marginBottom: 8 }]}>
                    Here are some recommendations:
                  </Text>
                  {item.data.map((song) => (
                    <SongCard key={song.songId ? song.songId : song.id} song={song} />
                  ))}
                </View>
              );
            } else if (item.type === "logo") {
              return (
                <View style={[chatStyles.messageBubble, { alignSelf: "flex-start", backgroundColor: theme.secondary, flexDirection: "row", alignItems: "center" }]}>
                  <Image source={require("../assets/tunely_logo_top.png")} style={chatStyles.logoInBubble} />
                  <Text style={[chatStyles.messageText, { color: theme.text, marginLeft: 8 }]}>{item.text}</Text>
                </View>
              );
            } else {
              return (
                <View style={[
                  chatStyles.messageBubble,
                  item.sender === "bot"
                    ? { alignSelf: "flex-start", backgroundColor: theme.secondary }
                    : { alignSelf: "flex-end", backgroundColor: theme.primary }
                ]}>
                  <Text style={[chatStyles.messageText, { color: theme.text }]}>{item.text}</Text>
                </View>
              );
            }
          }}
          style={chatStyles.chatContainer}
          contentContainerStyle={{ padding: 16 }}
        />

        {loading && <ActivityIndicator size="small" color={theme.icon} style={{ marginVertical: 10 }} />}

        {/* Mood Selection Buttons as 5 Circular Buttons */}
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
  logoContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: { width: 40, height: 40, marginRight: 8 },
  headerTitle: { fontSize: 20, fontWeight: "bold" },
});

const chatStyles = StyleSheet.create({
  chatContainer: { flex: 1 },
  messageBubble: {
    padding: 12,
    borderRadius: 12,
    marginVertical: 6,
    maxWidth: "80%",
    maxHeight: 370,
  },
  messageText: { fontSize: 16 },
  errorText: { fontSize: 16, marginTop: 10 },
  recommendationBubble: { padding: 12 },
  logoInBubble: { width: 30, height: 30 },
});

const buttonStyles = StyleSheet.create({
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginHorizontal: 16,
    marginBottom: 150,
  },
  moodButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  moodButtonText: { fontSize: 14, fontWeight: "bold" },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
});
