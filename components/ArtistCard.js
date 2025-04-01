import React, { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import ThemedView from "../components/ThemedScreen";
import { styles } from "../styles";
import { songService } from "../services/songService";

// Updated default cover image (replace with your actual fallback asset)
const defaultCoverImage = require("../assets/profile.png");

const ArtistCard = ({ artist, isOwnContent }) => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [songCount, setSongCount] = useState(0);
  const [latestCover, setLatestCover] = useState(null);

  useEffect(() => {
    const fetchArtistData = async () => {
      try {
        const allSongs = await songService.getAllSongs();
        // Filter songs for the current artist
        const artistSongs = allSongs.filter(
          (song) =>
            song.artistName &&
            song.artistName.toLowerCase() === artist.artistName.toLowerCase()
        );
        setSongCount(artistSongs.length);

        // Sort songs by release date descending (ensure releaseDate exists)
        artistSongs.sort(
          (a, b) => new Date(b.releaseDate) - new Date(a.releaseDate)
        );

        // Use the cover from the latest song if available
        if (artistSongs.length > 0 && artistSongs[0].song_photo_url) {
          setLatestCover(artistSongs[0].song_photo_url);
        }
      } catch (error) {
        console.error("Error fetching artist data:", error);
      }
    };

    fetchArtistData();
  }, [artist.artistName]);

  const handlePress = () => {
    navigation.navigate("ArtistPage", {
      artistName: artist.artistName,
    });
  };

  return (
    <ThemedView style={{ marginVertical: 4 }}>
      <TouchableOpacity style={[styles.songCard]} onPress={handlePress}>
        <Image
          source={latestCover ? { uri: latestCover } : defaultCoverImage}
          style={[styles.songCardImage, { borderRadius: 80 }]}
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
          <TouchableOpacity onPress={() => {}} style={styles.optionsIcon}>
            <Ionicons name="ellipsis-vertical" size={24} color={theme.text} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </ThemedView>
  );
};

export default ArtistCard;
