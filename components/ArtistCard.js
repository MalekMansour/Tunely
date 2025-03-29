import React, { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import ThemedView from "../components/ThemedScreen";
import { styles } from "../styles";
import { songService } from "../services/songService";

const defaultProfileImage = require("../assets/profile.png");

const ArtistCard = ({ artist, isOwnContent }) => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [songCount, setSongCount] = useState(0);

  useEffect(() => {
    const fetchSongCount = async () => {
      try {
        const allSongs = await songService.getAllSongs();
        const count = allSongs.filter(
          (song) =>
            song.artistName &&
            song.artistName.toLowerCase() === artist.artistName.toLowerCase()
        ).length;
        setSongCount(count);
      } catch (error) {
        console.error("Error fetching song count:", error);
      }
    };
    fetchSongCount();
  }, [artist.artistName]);

  const handlePress = () => {
    navigation.navigate("ArtistPage", {
      artistName: artist.artistName,
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
            {`${songCount} songs`}
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
