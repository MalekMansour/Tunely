import React, { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, Alert, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { auth } from "../Utility/firebaseConfig";
import { signOutUser, updateUserData, uploadProfilePicture } from "../Utility/firebaseConfig";
import { getCurrentUser, signOut as googleSignOut } from "../Utility/googleAuth";
import blankProfilePic from "../assets/blank_profile.png";
import { useUserData } from "../hooks/useUserData";
import { useTheme } from "../context/ThemeContext";
import ThemedScreen from "../components/ThemedScreen";

export default function ProfileScreen({ navigation }) {
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const { username, profilePic } = useUserData();
  const { theme } = useTheme();

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
        const userId = auth.currentUser.uid;
        const downloadURL = await uploadProfilePicture(userId, result.uri);
        await updateUserData(userId, { profilePic: downloadURL });
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update profile picture.");
    }
  };

  const handleLogout = () => {
    Alert.alert("Confirm Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        onPress: async () => {
          try {
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
        <TouchableOpacity>
          <Ionicons name="search" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.profileSection}>
        <Image
          source={typeof profilePic === "string" ? { uri: profilePic } : blankProfilePic}
          style={[styles.profileImage, { borderColor: theme.text }]}
        />
        <Text style={[styles.username, { color: theme.text }]}>{username || "User"}</Text>
      </View>

      <View style={[styles.separator, { backgroundColor: theme.secondary }]} />

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.primary }]}
          onPress={changeProfilePicture}
        >
          <Text style={[styles.buttonText, { color: theme.text }]}>Change Profile Picture</Text>
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
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
  },
  username: {
    fontSize: 20,
    marginLeft: 15,
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
});
