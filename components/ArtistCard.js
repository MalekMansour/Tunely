import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "../context/ThemeContext";
import ThemedView from "../components/ThemedScreen";   

import { styles } from "../styles";
import { auth } from "../Utility/firebaseConfig";

const defaultProfileImage = require("../assets/profile.png");  // Default image if no profile picture

const ArtistCard = ({ artist, isOwnContent }) => {
  const navigation = useNavigation();
  const { theme } = useTheme();

  const handlePress = () => {
    // Navigate to the Artist's page, passing the artist's name and profile picture
    navigation.navigate("ArtistPage", {
      artistName: artist.artistName,
      profilePicture: artist.profilePicture || defaultProfileImage,  // Fallback to default image
    });
  };

  return (
    <ThemedView style={{ marginVertical: 4 }}>
      <TouchableOpacity
        style={styles.artistCard}
        onPress={handlePress}
      >
        <Image
          source={artist.profilePicture ? { uri: artist.profilePicture } : defaultProfileImage}
          style={styles.artistCardImage}
        />
        <View style={styles.artistCardInfo}>
          {/* Apply the theme color here */}
          <Text style={[styles.artistCardName, { color: theme.text }]}>
            {artist.artistName}
          </Text>
          <Text style={[styles.artistCardBio, { color: theme.text }]}>
            {artist.bio || "No bio available."}
          </Text>
        </View>

        {isOwnContent && (
          <TouchableOpacity
            onPress={() => {}}
            style={styles.optionsIcon}
          >
            <Ionicons name="ellipsis-vertical" size={24} color={theme.text} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </ThemedView>
  );
};

export default ArtistCard;
