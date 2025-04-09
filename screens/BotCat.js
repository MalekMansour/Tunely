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
import { CATBOT_API_KEY, SPOTIFY_ACCESS_TOKEN } from "@env"; // ensure these are set in your .env
import ThemedScreen from "../components/ThemedScreen";
import { useTheme } from "../context/ThemeContext";
import { useNavigation } from "@react-navigation/native";

// ----- Mood Mapping for Spotify targets -----
const MOOD_MAPPING = {
  happy: { target_valence: 0.9, target_energy: 0.8 },
  sad: { target_valence: 0.3, target_energy: 0.3 },
  energetic: { target_valence: 0.8, target_energy: 0.9 },
  calm: { target_valence: 0.4, target_energy: 0.2 },
  default: { target_valence: 0.6, target_energy: 0.6 },
};

// Mapping mood to a seed genre for Spotify (adjust as desired)
const SEED_GENRE_MAPPING = {
  happy: "pop",
  sad: "acoustic",
  energetic: "rock",
  calm: "chill",
  default: "pop",
};

// ----- Spotify Recommendations Function -----
// Uses the extracted mood to build a Spotify Recommendations request
const getSpotifyRecommendations = async (mood) => {
  const mapping = MOOD_MAPPING[mood] || MOOD_MAPPING["default"];
  const seedGenre = SEED_GENRE_MAPPING[mood] || SEED_GENRE_MAPPING["default"];
  const endpoint = "https://api.spotify.com/v1/recommendations";
  const queryParams = new URLSearchParams({
    limit: "5",
    seed_genres: seedGenre,
    target_valence: mapping.target_valence.toString(),
    target_energy: mapping.target_energy.toString(),
  });
  const url = `${endpoint}?${queryParams.toString()}`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${SPOTIFY_ACCESS_TOKEN}`,
      },
    });
    const data = await response.json();
    if (data.tracks) {
      return data.tracks;
    } else {
      console.error("No tracks returned from Spotify:", data);
      return [];
    }
  } catch (error) {
    console.error("Error fetching Spotify recommendations:", error);
    return [];
  }
};

// ----- OpenAI API Call for Mood Extraction -----
// Sends the user's text to OpenAI and expects one word: "happy", "sad", "energetic", "calm"
// Returns "default" if an unrecognized word is received.
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

  // We no longer use our local songs hook since we're fetching recommendations from Spotify.
  // Conversation state holds all messages from both user and bot.
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
    // Append user's message to conversation
    const userMsg = { sender: "user", text: input };
    setConversation((prev) => [...prev, userMsg]);
    setLoading(true);

    // Extract mood from the user's message using OpenAI
    const extractedMood = await extractMoodFromText(input);
    const moodMsg = {
      sender: "bot",
      text: `Got it, you're feeling ${extractedMood}. Let me recommend some tracks for you...`,
    };
    setConversation((prev) => [...prev, moodMsg]);

    // Use Spotify API to get recommendations based on the extracted mood
    const spotifyRecs = await getSpotifyRecommendations(extractedMood);
    if (spotifyRecs.length === 0) {
      const errorMsg = {
        sender: "bot",
        text: "Sorry, I couldn't find any recommendations at the moment.",
      };
      setConversation((prev) => [...prev, errorMsg]);
    } else {
      // Build a vertical newline-separated string of recommended tracks
      const recsText = spotifyRecs
        .map(
          (track, index) =>
            `${index + 1}. ${track.name} — ${track.artists.map((a) => a.name).join(", ")}`
        )
        .join("\n");
      const recsMsg = {
        sender: "bot",
        text: `Here are some recommendations for you:\n${recsText}`,
      };
      setConversation((prev) => [...prev, recsMsg]);
    }

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
        {/* Chat Conversation */}
        <FlatList
          data={conversation}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <View
              style={[
                chatStyles.messageBubble,
                item.sender === "bot"
                  ? [chatStyles.botBubble, { alignSelf: "flex-start", backgroundColor: theme.secondary }]
                  : [chatStyles.userBubble, { alignSelf: "flex-end", backgroundColor: theme.primary }],
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
