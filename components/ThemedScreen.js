import React from "react";
import { View } from "react-native";
import { useTheme } from "../context/ThemeContext";

export default function ThemedScreen({ children, style }) {
  const { theme } = useTheme();

  return (
    <View style={[{ flex: 1, backgroundColor: theme.background }, style]}>
      {children}
    </View>
  );
}
