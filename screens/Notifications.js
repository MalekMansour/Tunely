import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../styles";

export default function Notifications({ navigation }) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const notifications = [
    { id: 1, icon: "musical-notes", text: "New song added to your favorite playlist!" },
    { id: 2, icon: "person-add", text: "John Doe started following you!" },
    { id: 3, icon: "heart", text: "Your uploaded song received 50 new likes!" },
    { id: 4, icon: "chatbubble", text: "Someone commented on your track: 'Fire! 🔥'" },
    { id: 5, icon: "cloud-upload", text: "Your song 'Vibes' has been successfully uploaded." },
  ];
  return (
    <View style={[styles.container, { backgroundColor: "#121212", flex: 1 }]}>
      
      <TouchableOpacity style={{ position: "absolute", top: 50, left: 20 }} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color="#f1f1f1" />
      </TouchableOpacity>
      
      <Text style={[styles.title, { marginTop: 100, color: "#f1f1f1", fontSize: 24 }]}>Notifications</Text>

      <TouchableOpacity
        style={{
          backgroundColor: "#1e1e1e",
          padding: 10,
          borderRadius: 10,
          alignSelf: "center",
          marginTop: 10,
        }}
        onPress={() => setNotificationsEnabled(!notificationsEnabled)}
      >
        <Text style={{ color: "#f1f1f1", fontSize: 16 }}>
          {notificationsEnabled ? "Turn Off Notifications" : "Turn On Notifications"}
        </Text>
      </TouchableOpacity>

      <ScrollView style={{ width: "100%", marginTop: 20 }}>
        {notificationsEnabled &&
          notifications.map((notif) => (
            <View
              key={notif.id}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#1e1e1e",
                padding: 15,
                marginVertical: 5,
                marginHorizontal: 20,
                borderRadius: 10,
              }}
            >
              <Ionicons name={notif.icon} size={24} color="#f1f1f1" style={{ marginRight: 15 }} />
              <Text style={{ color: "#f1f1f1", fontSize: 16, flexShrink: 1 }}>{notif.text}</Text>
            </View>
          ))}
      </ScrollView>
    </View>
  );
}
