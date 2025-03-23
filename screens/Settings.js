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

export default function SettingsScreen({ navigation }) {
  const [darkMode, setDarkMode] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action is irreversible.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => console.log("Delete account logic here") }
      ]
    );
  };

  const settingsOptions = [
    {
      label: "Edit Profile Picture",
      icon: "image-outline",
      onPress: () => navigation.navigate("EditProfilePicture"),
    },
    {
      label: "Edit Username",
      icon: "person-outline",
      onPress: () => navigation.navigate("EditUsername"),
    },
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
    <View style={[styles.container, { backgroundColor: "#000", flex: 1 }]}>
      <TouchableOpacity
        style={{ position: "absolute", top: 50, left: 20 }}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={28} color="#f1f1f1" />
      </TouchableOpacity>

      <TouchableOpacity
        style={{ position: "absolute", top: 50, right: 20 }}
        onPress={() => setDarkMode(!darkMode)}
      >
        <Ionicons name={darkMode ? "sunny" : "moon"} size={28} color="#f1f1f1" />
      </TouchableOpacity>

      <Text style={[styles.title, { marginTop: 100, color: "#f1f1f1" }]}>Settings</Text>

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
              backgroundColor: "#182952",
              paddingVertical: 15,
              paddingHorizontal: 20,
              borderRadius: 12,
              marginBottom: 15,
              width: "90%",
            }}
          >
            <Ionicons name={item.icon} size={22} color="#fff" style={{ marginRight: 15 }} />
            <Text style={{ color: "#fff", fontSize: 16 }}>{item.label}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          onPress={handleDeleteAccount}
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#330000",
            paddingVertical: 15,
            paddingHorizontal: 20,
            borderRadius: 12,
            marginTop: 30,
            width: "90%",
          }}
        >
          <Ionicons name="trash-outline" size={22} color="#ff4d4d" style={{ marginRight: 15 }} />
          <Text style={{ color: "#ff4d4d", fontSize: 16, fontWeight: "bold" }}>
            DELETE ACCOUNT
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
