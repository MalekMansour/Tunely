import React, { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, Alert, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { auth } from "../Utility/firebaseConfig";
import { signOutUser, updateUserData, uploadProfilePicture } from "../Utility/firebaseConfig";
import { getCurrentUser, signOut as googleSignOut } from "../Utility/googleAuth";
import blankProfilePic from "../assets/blank_profile.png";
import { useUserData } from "../hooks/useUserData";
 
export default function ProfileScreen({ navigation }) {
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const { username, profilePic } = useUserData();
 
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
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#f1f1f1" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="search" size={24} color="#f1f1f1" />
        </TouchableOpacity>
      </View>
 
      <View style={styles.profileSection}>
        <Image
          source={typeof profilePic === "string" ? { uri: profilePic } : blankProfilePic}
          style={styles.profileImage}
        />
        <Text style={styles.username}>{username || "User"}</Text>
      </View>
 
      <View style={styles.separator} />
 
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={changeProfilePicture}>
          <Text style={styles.buttonText}>Change Profile Picture</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Settings")}>
          <Text style={styles.buttonText}>Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Upload")}>
          <Text style={styles.buttonText}>Upload</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleLogout}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
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
    borderColor: "#f1f1f1",
  },
  username: {
    color: "#f1f1f1",
    fontSize: 20,
    marginLeft: 15,
  },
  separator: {
    height: 2,
    backgroundColor: "#808080",
    width: "100%",
    marginBottom: 20,
  },
  buttonContainer: {
    alignItems: "center",
  },
  button: {
    backgroundColor: "#182952",
    padding: 15,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
    marginVertical: 10,
  },
  buttonText: {
    color: "#f1f1f1",
    fontSize: 16,
  },
});