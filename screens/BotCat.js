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
import { useChatbot } from "../context/ChatbotContext";
import { CATBOT_API_KEY } from "@env";

// ----- Energy Target Values by Mood -----
const ENERGY_TARGETS = {
  calm: 0.3,
  energetic: 0.9,
  sad: 0.2,
  hot: 0.7,
  default: 0.6,
};

// ----- Mood Filter Functions -----
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
      genre.includes("r&b") ||
      genre.includes("latin") ||
      genre.includes("soul")
    );
  },
};

// ----- Helper: Shuffle an Array -----
const shuffleArray = (array) => {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// ----- OpenAI Bot Response Generator -----
const generateBotResponse = async (mood) => {
  const apiUrl = "https://api.openai.com/v1/chat/completions";
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${CATBOT_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a creative and friendly music recommendation assistant. Given a mood, generate a short, unique confirmation message indicating that you have received the mood and are about to provide recommendations. Keep it varied and friendly.",
          },
          { role: "user", content: `I'm feeling ${mood}.` },
        ],
        temperature: 0.9,
        max_tokens: 50,
      }),
    });
    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error generating bot response:", error);
    return `Got it, you're feeling ${mood}. Let me recommend some tracks for you...`;
  }
};

// ----- Recommendation Function -----
const getFilteredRecommendations = (songs, mood) => {
  const matchingSongs = songs.filter(moodFilters[mood]);
  if (matchingSongs.length === 0) return [];
  return shuffleArray(matchingSongs).slice(0, 5);
};

// ----- Cat Icon Mapping -----
const catIconMapping = {
  blue: require("../assets/catbots/blue.png"),
  black: require("../assets/catbots/black.png"),
  red: require("../assets/catbots/red.png"),
  green: require("../assets/catbots/green.png"),
  purple: require("../assets/catbots/purple.png"),
  pink: require("../assets/catbots/pink.png"),
  orange: require("../assets/catbots/orange.png"),
  cyan: require("../assets/catbots/cyan.png"),
  yellow: require("../assets/catbots/yellow.png"),
};

export default function MoodChatBot() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { songs, loading: songsLoading, error: songsError, refreshSongs } = useGetSongs("all");

  // Get current cat icon from context; default to blue if not set.
  const { catbotIcon } = useChatbot();
  const currentCatIcon = catIconMapping[catbotIcon] || catIconMapping["blue"];

  // Initial conversation starts with a welcome message.
  const initialConversation = [
    {
      sender: "bot",
      type: "logo",
      text: "Hi, I'm Tunely! How are you feeling?",
    },
  ];
  const [conversation, setConversation] = useState(initialConversation);
  const [loading, setLoading] = useState(false);

  // Mood options (4 moods).
  const moods = [
    { key: "calm", label: "Calm" },
    { key: "energetic", label: "Energetic" },
    { key: "sad", label: "Sad" },
    { key: "hot", label: "Hot" },
  ];

  // When a mood button is pressed, reset conversation and generate recommendations.
  const handleMoodSelection = async (mood) => {
    setConversation(initialConversation);
    setLoading(true);

    const userMsg = { sender: "user", text: `I'm feeling ${mood}.` };
    setConversation((prev) => [...prev, userMsg]);

    const botResponse = await generateBotResponse(mood);
    const moodMsg = {
      sender: "bot",
      text: botResponse,
    };
    setConversation((prev) => [...prev, moodMsg]);

    if (songsLoading) {
      await refreshSongs();
    }
    const recommendations = getFilteredRecommendations(songs, mood);
    if (recommendations.length === 0) {
      const noRecMsg = { sender: "bot", text: "Sorry, I couldn't find any matching tracks for that mood." };
      setConversation((prev) => [...prev, noRecMsg]);
    } else {
      const recsMsg = { sender: "bot", type: "recommendation", data: recommendations };
      setConversation((prev) => [...prev, recsMsg]);
    }
    setLoading(false);
  };

  return (
    <ThemedScreen style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Simple Top Bar with Back Button */}
      <View style={simpleHeaderStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={simpleHeaderStyles.backButton}>
          <Ionicons name="arrow-back" size={28} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Big Cat Icon Displayed Above the Chat Conversation */}
      <View style={styles.bigCatIconContainer}>
        <Image source={currentCatIcon} style={styles.bigCatIcon} />
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
                  <Image source={currentCatIcon} style={chatStyles.logoInBubble} />
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

        {/* Mood Selection Buttons as 4 Circular Buttons */}
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

const simpleHeaderStyles = StyleSheet.create({
  header: {
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    padding: 8,
    marginTop: 32,
  },
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
  bigCatIconContainer: {
    alignItems: "center",
    marginVertical: 10,
  },
  bigCatIcon: {
    width: 180,
    height: 60,
    marginTop: -40,
  },
});

export { MoodChatBot };
