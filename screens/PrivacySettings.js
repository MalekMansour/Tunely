import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../styles";

export default function PrivacySettings({ navigation }) {
  return (
    <View style={[styles.container, { backgroundColor: "#000", flex: 1, alignItems: "center" }]}>      
      <TouchableOpacity style={{ position: "absolute", top: 50, left: 20 }} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color="#f1f1f1" />
      </TouchableOpacity>
      
      <Text style={[styles.title, { marginTop: 100, color: "#f1f1f1" }]}>Privacy Settings</Text>
    </View>
  );
}
