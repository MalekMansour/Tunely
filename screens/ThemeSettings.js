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
import Slider from "@react-native-community/slider";

export default function ThemeSettings({ navigation }) {
  const { theme, themeName, changeTheme, opacity, setOpacity } = useTheme();

  const handleSelectTheme = (key) => {
    changeTheme(key);
  };

  const handleSliderChange = (value) => {
    const roundedValue = Math.round(value * 100) / 100; 
    setOpacity(roundedValue);
  };

  // This displays from 10% to 100% instead of 90%-100%
  const displayPercentage = `${Math.round((opacity - 0.9) * 1000)}%`;

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
            onPress={() => handleSelectTheme(key)}
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

        <View style={styles.sliderContainer}>
          <Text style={[styles.sliderLabel, { color: theme.text }]}>
            Song Detail Opacity: {displayPercentage}
          </Text>
          <Slider
            style={{ width: "100%", height: 40 }}
            minimumValue={0.9}
            maximumValue={1.0}
            step={0.01}
            minimumTrackTintColor="#4A90E2"
            maximumTrackTintColor="#555"
            thumbTintColor="#4A90E2"
            value={opacity}
            onValueChange={handleSliderChange}
          />

          <View style={styles.sliderMarksContainer}>
            {["0%", "100%"].map(
              (label, index) => (
                <Text
                  key={index}
                  style={[styles.markText, { color: theme.text }]}
                >
                  {label}
                </Text>
              )
            )}
          </View>
        </View>
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
  sliderContainer: {
    marginTop: 30,
    paddingVertical: 10,
  },
  sliderLabel: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: "center",
  },
  sliderMarksContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 5,
    marginTop: 5,
  },
  markText: {
    fontSize: 12,
  },
});
