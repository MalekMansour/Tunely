import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import ThemedScreen from "../components/ThemedScreen";

// Import your API key from .env (using react-native-dotenv)
import { CATBOT_API_KEY } from "@env";

export default function BotCat() {
  const navigation = useNavigation();
  const { theme } = useTheme();

  // Chat messages: each message has a role ("bot" or "user") and text.
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hey there! How can I help you today?" },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Function to call OpenAI's API and get a response.
  const getAIResponse = async (userMessage) => {
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
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: userMessage },
          ],
          temperature: 0.7,
        }),
      });
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error("Error fetching AI response:", error);
      return "Sorry, there was an error processing your request.";
    }
  };

  const handleSend = async () => {
    if (inputMessage.trim() === "") return;
    const userMsg = inputMessage;
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setInputMessage("");
    setLoading(true);

    const aiResponse = await getAIResponse(userMsg);
    setMessages((prev) => [...prev, { role: "bot", text: aiResponse }]);
    setLoading(false);
  };

  return (
    <ThemedScreen style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={100}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back-outline" size={32} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>ChatBot</Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView style={styles.chatContainer}>
          {messages.map((msg, index) => (
            <View
              key={index}
              style={
                msg.role === "bot"
                  ? [styles.botBubble, { backgroundColor: theme.secondary }]
                  : [styles.userBubble, { backgroundColor: theme.primary }]
              }
            >
              <Text
                style={
                  msg.role === "bot"
                    ? [styles.botText, { color: theme.text }]
                    : [styles.userText, { color: theme.text }]
                }
              >
                {msg.text}
              </Text>
            </View>
          ))}
          {loading && (
            <ActivityIndicator
              size="small"
              color={theme.text}
              style={{ marginVertical: 10 }}
            />
          )}
        </ScrollView>

        {/* Text input area for user messages */}
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.primary }]}
            placeholder="Type your message..."
            placeholderTextColor={theme.text}
            value={inputMessage}
            onChangeText={setInputMessage}
          />
          <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
            <Ionicons name="send" size={24} color={theme.primary} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ThemedScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  headerTitle: { fontSize: 22, fontWeight: "bold", flex: 1, textAlign: "center" },
  chatContainer: { flex: 1 },
  botBubble: {
    borderRadius: 15,
    padding: 12,
    marginVertical: 8,
    alignSelf: "flex-start",
    maxWidth: "80%",
  },
  userBubble: {
    borderRadius: 15,
    padding: 12,
    marginVertical: 8,
    alignSelf: "flex-end",
    maxWidth: "80%",
  },
  botText: { fontSize: 16 },
  userText: { fontSize: 16 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#ccc",
    paddingTop: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 90,
  },
  sendButton: { padding: 8, marginBottom: 90 },
});
