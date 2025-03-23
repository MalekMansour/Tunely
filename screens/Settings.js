import React, { useState } from "react";
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
import ThemedScreen from "../components/ThemedScreen";

export default function SettingsScreen({ navigation }) {
  const [isPrivate, setIsPrivate] = useState(false);
  const { theme } = useTheme();

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

  const settingsOptions = [
    {
      label: `Privacy: ${isPrivate ? "Private" : "Public"}`,
      icon: isPrivate ? "lock-closed-outline" : "lock-open-outline",
      onPress: () => setIsPrivate(!isPrivate),
    },
    {
      label: "Themes",
      icon: "color-palette-outline",
      onPress: () => navigation.navigate("ThemeSettings"),
    },
    {
      label: "ChatBot Buddy",
      icon: "chatbubbles-outline",
      onPress: () => navigation.navigate("ChatBotBuddy"),
    },
    {
      label: "Audio Quality",
      icon: "musical-notes-outline",
      onPress: () => navigation.navigate("AudioQuality"),
    },
    {
      label: "Notifications",
      icon: "notifications-outline",
      onPress: () => navigation.navigate("Notifications"),
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

      <Text style={[styles.title, { marginTop: 100, marginLeft: 160, fontSize: 28, color: theme.text }]}>
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
      </ScrollView>
    </ThemedScreen>
  );
}
