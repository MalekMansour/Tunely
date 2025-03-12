import React, { useState } from "react";
import { View, Text, TouchableOpacity, Switch, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../styles"; // Keep the imported styles

export default function PrivacySettings({ navigation }) {
  const [trackingEnabled, setTrackingEnabled] = useState(false);
  const [storeDataEnabled, setStoreDataEnabled] = useState(false);
  const [privateAccount, setPrivateAccount] = useState(false);

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action is irreversible.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => console.log("Account deleted") }
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: "#121212", flex: 1, paddingHorizontal: 20 }]}>
      {/* Back Button */}
      <TouchableOpacity style={{ position: "absolute", top: 50, left: 20 }} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color="#f1f1f1" />
      </TouchableOpacity>

      {/* Title */}
      <Text style={[styles.title, { marginTop: 100, color: "#f1f1f1", fontSize: 24 }]}>Privacy Settings</Text>

      {/* Privacy Terms */}
      <Text style={{ color: "#f1f1f1", fontSize: 14, marginTop: 20, textAlign: "justify" }}>
        At Tunely, we value your privacy. We collect limited personal data to improve your music experience and provide personalized recommendations.
        Your data is never shared with third parties without your consent.
      </Text>
      <Text style={{ color: "#f1f1f1", fontSize: 14, marginTop: 10, textAlign: "justify" }}>
        You have full control over your data preferences. You can disable tracking for relevant ads, prevent Tunely from storing your history, or 
        make your account private to restrict visibility. You can also delete your account permanently if you wish.
      </Text>

      {/* Toggle Options */}
      <View style={{ marginTop: 30 }}>
        <View style={toggleStyles.toggleContainer}>
          <Text style={toggleStyles.toggleText}>Allow Tracking for Relevant Ads</Text>
          <Switch value={trackingEnabled} onValueChange={setTrackingEnabled} />
        </View>

        <View style={toggleStyles.toggleContainer}>
          <Text style={toggleStyles.toggleText}>Allow Tunely to Store Your History and Personal Data</Text>
          <Switch value={storeDataEnabled} onValueChange={setStoreDataEnabled} />
        </View>

        <View style={toggleStyles.toggleContainer}>
          <Text style={toggleStyles.toggleText}>Make Account Private</Text>
          <Switch value={privateAccount} onValueChange={setPrivateAccount} />
        </View>
      </View>

      {/* Delete Account Button */}
      <TouchableOpacity style={toggleStyles.deleteButton} onPress={handleDeleteAccount}>
        <Text style={{ color: "#fff", fontWeight: "bold" }}>Delete My Account</Text>
      </TouchableOpacity>
    </View>
  );
}

// New styles for toggles and delete button
const toggleStyles = {
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1e1e1e",
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
  },
  toggleText: {
    color: "#f1f1f1",
    fontSize: 16,
    flexShrink: 1,
  },
  deleteButton: {
    backgroundColor: "red",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 30,
  },
};
