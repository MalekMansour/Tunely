import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useGetSongs } from "../hooks/useGetSongs";
import { CATBOT_API_KEY } from "@env";
import ThemedScreen from "../components/ThemedScreen";
import { useTheme } from "../context/ThemeContext";
import { useNavigation } from "@react-navigation/native";

// ----- Mood Mapping (using valence and energy targets) -----
const MOOD_MAPPING = {
  happy: { target_valence: 0.9, target_energy: 0.8 },
  sad: { target_valence: 0.3, target_energy: 0.3 },
  energetic: { target_valence: 0.8, target_energy: 0.9 },
  calm: { target_valence: 0.4, target_energy: 0.2 },
  default: { target_valence: 0.6, target_energy: 0.6 },
};

// ----- Recommendation Function -----
// This function scores songs based on how close their 'valence' and 'energy' are to the target values.
// It receives an array of songs (in this case, a random sample of 50 songs) and returns the top 5 recommendations.
const getRecommendations = (songs, mood) => {
  const mapping = MOOD_MAPPING[mood] || MOOD_MAPPING["default"];
  const validSongs = songs.filter(
    (song) =>
      typeof song.valence === "number" && typeof song.energy === "number"
  );
  if (validSongs.length === 0) {
    return songs.slice(0, 5);
  }
  const scoredSongs = validSongs.map((song) => {
    const diffValence = Math.abs(song.valence - mapping.target_valence);
    const diffEnergy = Math.abs(song.energy - mapping.target_energy);
    return { song, score: diffValence + diffEnergy };
  });
  scoredSongs.sort((a, b) => a.score - b.score);
  return scoredSongs.slice(0, 5).map((item) => item.song);
};


const extractMoodFromText = async (text) => {
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
              "You are a mood extraction assistant. Analyze the following sentence and reply with one word: happy, sad, energetic, calm. Do not include any additional text.",
          },
          { role: "user", content: text },
        ],
        temperature: 0.3,
      }),
    });
    const data = await response.json();
    let mood = data.choices[0].message.content.trim().toLowerCase();
    if (!["happy", "sad", "energetic", "calm"].includes(mood)) {
      mood = "default";
    }
    return mood;
  } catch (error) {
    console.error("Error extracting mood:", error);
    return "default";
  }
};

// ----- Main Component: MoodChatBot -----
export default function MoodChatBot() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { songs, loading: songsLoading, error: songsError, refreshSongs } = useGetSongs("all");

  // Conversation holds the chat messages (both bot and user)
  const [conversation, setConversation] = useState([
    {
      sender: "bot",
      text: "Hi! Tell me how you're feeling and I'll recommend some tracks for you.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle sending a message
  const handleSend = async () => {
    if (input.trim() === "") return;

    // Append the user's message to the conversation
    const userMsg = { sender: "user", text: input };
    setConversation((prev) => [...prev, userMsg]);
    setLoading(true);

    // Extract mood using OpenAI
    const extractedMood = await extractMoodFromText(input);
    const moodMsg = {
      sender: "bot",
      text: `Got it, you're feeling ${extractedMood}. Let me recommend some tracks for you...`,
    };
    setConversation((prev) => [...prev, moodMsg]);

    // If songs are still loading, wait and refresh them
    if (songsLoading) {
      await refreshSongs();
    }

    // Pick 50 random songs from the loaded songs (if there are 50 or more)
    const randomSongs =
      songs.length >= 5
        ? [...songs].sort(() => Math.random() - 0.5).slice(0, 50)
        : songs;

    // Compute recommendations from these 50 random songs
    const recs = getRecommendations(randomSongs, extractedMood);

    // Build a newline-separated string of recommended tracks
    const recsText = recs
      .map(
        (song, index) =>
          `${index + 1}. ${song.name} — ${song.artists.join(", ")}`
      )
      .join("\n");

    // Append the recommended track list as a bot message (displayed vertically)
    const recsMsg = {
      sender: "bot",
      text: `Here are some recommendations for you:\n${recsText}`,
    };
    setConversation((prev) => [...prev, recsMsg]);
    setInput("");
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
          renderItem={({ item }) => (
            <View
              style={[
                chatStyles.messageBubble,
                item.sender === "bot"
                  ? [
                      chatStyles.botBubble,
                      { alignSelf: "flex-start", backgroundColor: theme.secondary },
                    ]
                  : [
                      chatStyles.userBubble,
                      { alignSelf: "flex-end", backgroundColor: theme.primary },
                    ],
              ]}
            >
              <Text style={[chatStyles.messageText, { color: theme.text }]}>{item.text}</Text>
            </View>
          )}
          style={chatStyles.chatContainer}
          contentContainerStyle={{ padding: 16 }}
        />

        {loading && (
          <ActivityIndicator size="small" color={theme.icon} style={{ marginVertical: 10 }} />
        )}

        {/* Input Area */}
        <View style={[inputStyles.inputContainer, { borderTopColor: theme.border }]}>
          <TextInput
            style={[inputStyles.input, { color: theme.text, borderColor: theme.primary }]}
            placeholder="Type your message..."
            placeholderTextColor={theme.text}
            value={input}
            onChangeText={setInput}
          />
          <TouchableOpacity onPress={handleSend} style={[inputStyles.sendButton, { backgroundColor: theme.icon }]}>
            <Ionicons name="send" size={24} color={theme.background} />
          </TouchableOpacity>
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
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
});

const chatStyles = StyleSheet.create({
  chatContainer: { flex: 1 },
  messageBubble: { padding: 12, borderRadius: 12, marginVertical: 6, maxWidth: "80%" },
  messageText: { fontSize: 16 },
  errorText: { fontSize: 16, marginTop: 10 },
});

const inputStyles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 80,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
