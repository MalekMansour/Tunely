import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const themes = [
  { name: "Classic Dark Mode", value: "dark" },
  { name: "Classic Light Mode", value: "light" },
  { name: "Astro Neon", value: "astro" },
  { name: "Deep Blue Sea", value: "ocean" },
  { name: "Cherry Blossom", value: "cherry" },
];

export default function ThemeSettings({ navigation }) {
  const [selectedTheme, setSelectedTheme] = useState("dark");

  const handleSelectTheme = (theme) => {
    setSelectedTheme(theme.value);
    // You can store this in context, firebase, or AsyncStorage later
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={{ position: "absolute", top: 50, left: 20 }}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back-outline" size={28} color="#f1f1f1" />
      </TouchableOpacity>

      <Text style={styles.title}>Choose Your Theme</Text>

      <ScrollView contentContainerStyle={styles.optionsContainer}>
        {themes.map((theme) => (
          <TouchableOpacity
            key={theme.value}
            onPress={() => handleSelectTheme(theme)}
            style={[
              styles.optionButton,
              selectedTheme === theme.value && styles.selectedOption,
            ]}
          >
            <Text style={styles.optionText}>{theme.name}</Text>
            {selectedTheme === theme.value && (
              <Ionicons name="checkmark" size={20} color="#4A90E2" />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingTop: 100,
    paddingHorizontal: 20,
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
  },
  optionsContainer: {
    paddingBottom: 30,
  },
  optionButton: {
    backgroundColor: "#1a1a1a",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectedOption: {
    borderWidth: 1,
    borderColor: "#4A90E2",
  },
  optionText: {
    color: "#fff",
    fontSize: 16,
  },
});
