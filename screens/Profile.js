import React, { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { auth } from "../Utility/firebaseConfig";
import { signOutUser, updateUserData, uploadProfilePicture } from "../Utility/firebaseConfig";
import { signOut as googleSignOut } from "../Utility/googleAuth";
import blankProfilePic from "../assets/blank_profile.png";
import { useUserData } from "../hooks/useUserData";
import { useTheme } from "../context/ThemeContext";
import ThemedScreen from "../components/ThemedScreen";
import { useAudio } from "../context/AudioContext";
import { authService } from "../services/authService";

export default function ProfileScreen({ navigation }) {
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const { username, profilePic, refreshUserData } = useUserData(); // Get the refresh function
  const { theme } = useTheme();
  const { stopSound } = useAudio();
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "We need permission to access your photos.");
      }
    };
    requestPermissions();
  }, []);

  const changeProfilePicture = async () => {
    if (isGoogleUser) return;
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled) {
        setUploading(true);
        
        // Skip Firebase upload and update - go directly to backend API
        const response = await authService.updateProfilePicture(result.assets[0]);
        
        // Refresh user data instead of navigating
        refreshUserData();
        
        Alert.alert("Success", "Profile picture updated successfully!");
      }
    } catch (error) {
      console.error("Failed to update profile picture:", error);
      Alert.alert("Error", "Failed to update profile picture.");
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Confirm Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        onPress: async () => {
          try {
            await stopSound();
            if (isGoogleUser) {
              await googleSignOut();
            } else {
              await signOutUser(auth);
            }
            navigation.replace("Login");
          } catch (error) {
            Alert.alert("Logout Error", "There was an issue logging out. Please try again.");
          }
        },
      },
    ]);
  };

  return (
    <ThemedScreen style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.profileSection}>
        <TouchableOpacity onPress={changeProfilePicture} disabled={uploading}>
          <View style={styles.imageContainer}>
            <Image
              source={typeof profilePic === "string" ? { uri: profilePic } : blankProfilePic}
              style={[styles.profileImage, { borderColor: theme.text }]}
            />
            {uploading && (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator size="large" color={theme.primary} />
              </View>
            )}
          </View>
        </TouchableOpacity>
        <View style={styles.usernameContainer}>
          <Text style={[styles.username, { color: theme.text }]}>{username || "User"}</Text>
        </View>
      </View>

      <View style={[styles.separator, { backgroundColor: theme.secondary }]} />

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.primary }]}
          onPress={changeProfilePicture}
          disabled={uploading}
        >
          <Text style={[styles.buttonText, { color: theme.text }]}>
            {uploading ? "Uploading..." : "Change Profile Picture"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate("Settings")}
        >
          <Text style={[styles.buttonText, { color: theme.text }]}>Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate("Upload")}
        >
          <Text style={[styles.buttonText, { color: theme.text }]}>Upload</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate('ArtistDashboard')}
        >
          <Text style={[styles.buttonText, { color: theme.text }]}>Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.delete }]}
          onPress={handleLogout}
        >
          <Text style={[styles.buttonText, { color: "#fff" }]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ThemedScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  usernameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 15,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
  },
  username: {
    fontSize: 20,
  },
  separator: {
    height: 2,
    width: "100%",
    marginBottom: 20,
  },
  buttonContainer: {
    alignItems: "center",
  },
  button: {
    padding: 15,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
    marginVertical: 10,
  },
  buttonText: {
    fontSize: 16,
  },
  imageContainer: {
    position: "relative",
  },
  uploadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    width: "80%",
    marginVertical: 10,
  },
  optionText: {
    fontSize: 16,
    marginLeft: 10,
  },
});
