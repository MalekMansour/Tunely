import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { themes } from "../constants/themes";

export default function ThemeSettings({ navigation }) {
  const { theme, themeName, changeTheme } = useTheme();

  const handleSelectTheme = (theme) => {
    changeTheme(theme.value);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <TouchableOpacity
        style={{ position: "absolute", top: 50, left: 20 }}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back-outline" size={28} color={theme.text} />
      </TouchableOpacity>

      <Text style={[styles.title, { color: theme.text }]}>
        Choose Your Theme
      </Text>

      <ScrollView contentContainerStyle={styles.optionsContainer}>
        {Object.entries(themes).map(([key, value]) => (
          <TouchableOpacity
            key={key}
            onPress={() => handleSelectTheme({ value: key })}
            style={[
              styles.optionButton,
              { backgroundColor: theme.primary },
              themeName === key && styles.selectedOption,
            ]}
          >
            <Text style={[styles.optionText, { color: theme.text }]}>
              {value.name}
            </Text>
            {themeName === key && (
              <Ionicons name="checkmark" size={20} color={theme.text} />
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
    paddingTop: 100,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
  },
  optionsContainer: {
    paddingBottom: 30,
  },
  optionButton: {
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
    fontSize: 16,
  },
});
