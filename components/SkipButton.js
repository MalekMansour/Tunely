import React from "react";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../styles";
import { useTheme } from "../context/ThemeContext"; 

export default function SkipButton({ direction, onPress }) {
  const { theme } = useTheme(); 
  const iconName = direction === "forward" ? "play-skip-forward" : "play-skip-back";

  return (
    <TouchableOpacity onPress={onPress} style={styles.iconButton}>
      <Ionicons
        name={iconName}
        size={30}
        color={theme.text} 
      />
    </TouchableOpacity>
  );
}
