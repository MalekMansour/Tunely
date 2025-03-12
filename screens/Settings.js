import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../styles";
 
export default function SettingsScreen({ navigation }) {
  return (
    <View style={[styles.container, { backgroundColor: "#000", flex: 1, alignItems: "center" }]}>
      <TouchableOpacity style={{ position: "absolute", top: 50, left: 20 }} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color="#f1f1f1" />
      </TouchableOpacity>
 
      <Text style={[styles.title, { marginTop: 100, color: "#f1f1f1" }]}>Settings</Text>
 
      <View style={{ width: "90%", marginTop: 50, alignItems: "center" }}>
        <TouchableOpacity style={{ backgroundColor: "#182952", padding: 15, borderRadius: 10, marginBottom: 15, width: "80%", alignItems: "center" }}>
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>Privacy Settings</Text>
        </TouchableOpacity>
 
        <TouchableOpacity style={{ backgroundColor: "#182952", padding: 15, borderRadius: 10, width: "80%", alignItems: "center" }}>
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>Notifications</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}