import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import ThemedView from "../components/ThemedScreen";
import { styles } from "../styles";

const defaultProfileImage = require("../assets/profile.png");

const ArtistCard = ({ artist, isOwnContent }) => {
  const navigation = useNavigation();
  const { theme } = useTheme();

  const handlePress = () => {
    // Pass the artist's name and profilePicture via route params
    navigation.navigate("ArtistPage", {
      artistName: artist.artistName,  // ensure artist.artistName is defined!
      profilePicture: artist.profilePicture || defaultProfileImage,
    });
  };

  return (
    <ThemedView style={{ marginVertical: 4 }}>
      <TouchableOpacity style={[styles.songCard]} onPress={handlePress}>
        <Image
          source={
            artist.profilePicture
              ? { uri: artist.profilePicture }
              : defaultProfileImage
          }
          style={styles.songCardImage}
        />
        <View style={styles.songCardInfo}>
          <Text style={[styles.songCardTitle, { color: theme.text }]}>
            {artist.artistName}
          </Text>
          <Text style={[styles.songCardArtist, { color: theme.text }]}>
            {artist.bio || "No bio available."}
          </Text>
        </View>
        {isOwnContent && (
          <TouchableOpacity onPress={() => {}} style={styles.optionsIcon}>
            <Ionicons name="ellipsis-vertical" size={24} color={theme.text} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </ThemedView>
  );
};

export default ArtistCard;
