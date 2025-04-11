import React from "react";
import { Text, TouchableOpacity, ScrollView, View, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../styles";
import { useTheme } from "../context/ThemeContext";
import { useChatbot } from "../context/ChatbotContext";
import ThemedScreen from "../components/ThemedScreen";

export default function ChatBotSettings({ navigation }) {
  const { theme } = useTheme();
  const { chatbotVisible, setChatbotVisible, catbotIcon, setCatbotIcon } = useChatbot();

  // Define 9 icon options from assets/catbots/
  const iconOptions = [
    { name: "blue", source: require("../assets/catbots/blue.png") },
    { name: "cyan", source: require("../assets/catbots/cyan.png") },
    { name: "black", source: require("../assets/catbots/black.png") },
    { name: "red", source: require("../assets/catbots/red.png") },
    { name: "orange", source: require("../assets/catbots/orange.png") },
    { name: "yellow", source: require("../assets/catbots/yellow.png") },
    { name: "green", source: require("../assets/catbots/green.png") },
    { name: "purple", source: require("../assets/catbots/purple.png") },
    { name: "pink", source: require("../assets/catbots/pink.png") },
  ];

  return (
    <ThemedScreen>
      {/* Back button */}
      <TouchableOpacity
        style={{ position: "absolute", top: 50, left: 20 }}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={28} color={theme.text} />
      </TouchableOpacity>

      <Text
        style={[
          styles.title,
          { marginTop: 100, marginLeft: 100, fontSize: 28, color: theme.text },
        ]}
      >
        ChatBot Settings
      </Text>

      <ScrollView
        contentContainerStyle={{ paddingVertical: 30, alignItems: "center" }}
        showsVerticalScrollIndicator={false}
      >
        {/* Chatbot Visibility Toggle */} 
        <TouchableOpacity
          onPress={() => setChatbotVisible(!chatbotVisible)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: theme.primary,
            paddingVertical: 15,
            paddingHorizontal: 20,
            borderRadius: 12,
            marginBottom: 15,
            width: "90%",
          }}
        >
          <Ionicons
            name={chatbotVisible ? "chatbubbles" : "chatbubbles-outline"}
            size={22}
            color={theme.text}
            style={{ marginRight: 15 }}
          />
          <Text style={{ color: theme.text, fontSize: 16 }}>
            ChatBot Buddy: {chatbotVisible ? "On" : "Off"}
          </Text>
        </TouchableOpacity>

        <Text style={{ color: theme.text, fontSize: 12, marginBottom: 20 }}>
          Toggle your ChatBot visibility on or off.
        </Text>

        {/* Icon Selection Grid */}
        <Text style={{ color: theme.text, fontSize: 18, marginBottom: 10 }}>
          Select CatBot Icon
        </Text>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {iconOptions.map((iconOption, index) => {
            const selected = catbotIcon === iconOption.name;
            return (
              <TouchableOpacity
                key={index}
                onPress={() => setCatbotIcon(iconOption.name)}
                style={{
                  backgroundColor: "#F1EFEC",
                  width: 100,
                  height: 100,
                  justifyContent: "center",
                  alignItems: "center",
                  margin: 10,
                  borderWidth: selected ? 3 : 0,
                  borderColor: selected ? theme.icon || theme.primary : "transparent",
                  borderRadius: 8,
                }}
              >
                <Image source={iconOption.source} style={{ width: 100, height: 100 }} />
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </ThemedScreen>
  );
}
