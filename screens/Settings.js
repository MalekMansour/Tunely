import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../styles";
import { useTheme } from "../context/ThemeContext";
import { useChatbot } from "../context/ChatbotContext";
import ThemedScreen from "../components/ThemedScreen";

export default function SettingsScreen({ navigation }) {
  const { theme } = useTheme();
  const { chatbotVisible } = useChatbot();

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action is irreversible.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => console.log("Delete account logic here"),
        },
      ]
    );
  };

  // Removed Privacy and Notifications from settingsOptions
  const settingsOptions = [
    {
      label: "Themes",
      icon: "color-palette-outline",
      onPress: () => navigation.navigate("ThemeSettings"),
    },
    {
      label: "ChatBot Settings",
      icon: chatbotVisible ? "chatbubbles" : "chatbubbles-outline",
      onPress: () => navigation.navigate("ChatBotSettings"),
    },
    {
      label: "Terms and Services",
      icon: "document-text-outline",
      onPress: () => navigation.navigate("TermsAndServices"),
    },
  ];

  return (
    <ThemedScreen>
      <TouchableOpacity
        style={{ position: "absolute", top: 50, left: 20 }}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={28} color={theme.text} />
      </TouchableOpacity>

      <Text
        style={[
          styles.title,
          {
            marginTop: 100,
            marginLeft: 160,
            fontSize: 28,
            color: theme.text,
          },
        ]}
      >
        Settings
      </Text>

      <ScrollView
        contentContainerStyle={{ paddingVertical: 30, alignItems: "center" }}
        showsVerticalScrollIndicator={false}
      >
        {settingsOptions.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={item.onPress}
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
              name={item.icon}
              size={22}
              color={theme.text}
              style={{ marginRight: 15 }}
            />
            <Text style={{ color: theme.text, fontSize: 16 }}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          onPress={handleDeleteAccount}
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: theme.delete,
            paddingVertical: 15,
            paddingHorizontal: 20,
            borderRadius: 12,
            marginTop: 30,
            width: "90%",
          }}
        >
          <Ionicons
            name="trash-outline"
            size={22}
            color="#fff"
            style={{ marginRight: 15 }}
          />
          <Text
            style={{
              color: "#fff",
              fontSize: 16,
              fontWeight: "bold",
            }}
          >
            DELETE ACCOUNT
          </Text>
        </TouchableOpacity>

        <Text style={{ color: theme.text, fontSize: 12, marginTop: 20 }}>
          App Version: Early Access 0.8.3
        </Text>
      </ScrollView>
    </ThemedScreen>
  );
}
