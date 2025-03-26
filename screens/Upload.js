import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  TextInput,
  Image,
  StyleSheet,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { songService } from "../services/songService";
import { useTheme } from "../context/ThemeContext";
// Import useUserData to get user details like username
import { useUserData } from "../hooks/useUserData";
import ThemedScreen from "../components/ThemedScreen";

export default function Upload({ navigation }) {
  const { theme } = useTheme();
  const { username } = useUserData(); // Retrieve the username from your user data hook

  const [loading, setLoading] = useState(false);
  const [songTitle, setSongTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [songFile, setSongFile] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [uploadTimeout, setUploadTimeout] = useState(null);
  const [buttonColor, setButtonColor] = useState(theme.primary);

  const pickSong = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "audio/*",
        copyToCacheDirectory: true,
      });
      if (!result.canceled) setSongFile(result.assets[0]);
    } catch (error) {
      Alert.alert("Error", "Failed to pick song");
    }
  };

  const pickCover = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled) setCoverImage(result.assets[0]);
    } catch (error) {
      Alert.alert("Error", "Failed to pick cover image");
    }
  };

  const handleUpload = async () => {
    if (!songTitle || !songFile) {
      Alert.alert("Error", "Please fill in the required fields and select a song");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("song", {
        uri: songFile.uri,
        type: "audio/mpeg",
        name: songFile.name || "song.mp3",
      });
      if (coverImage) {
        formData.append("cover", {
          uri: coverImage.uri,
          type: "image/jpeg",
          name: "cover.jpg",
        });
      }
      formData.append("title", songTitle);
      // Use the username from useUserData as the artist name
      formData.append("artistName", username);
      formData.append("genre", genre);

      await songService.uploadSong(formData);
      Alert.alert("Success", "Song uploaded successfully!");
      navigation.goBack();
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert("Error", "Failed to upload song");
    } finally {
      setLoading(false);
    }
  };

  const startUploadHold = () => {
    if (loading) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    let colorChangeInterval = setInterval(() => {
      setButtonColor((prevColor) =>
        prevColor === theme.primary ? theme.secondary : theme.primary
      );
    }, 100);

    const timeout = setTimeout(() => {
      clearInterval(colorChangeInterval);
      handleUpload();
      setButtonColor(theme.primary);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 3000);

    setUploadTimeout({ timeout, colorChangeInterval });
  };

  const cancelUploadHold = () => {
    if (uploadTimeout) {
      clearTimeout(uploadTimeout.timeout);
      clearInterval(uploadTimeout.colorChangeInterval);
      setUploadTimeout(null);
      setButtonColor(theme.primary);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  };

  return (
    <ThemedScreen style={{ padding: 20 }}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color={theme.text} />
      </TouchableOpacity>

      <View style={styles.form}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.secondary }]}
          onPress={pickSong}
          disabled={loading}
        >
          <Text style={[styles.buttonText, { color: theme.text }]}>
            {songFile ? "Song Selected" : "Select Song"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.secondary }]}
          onPress={pickCover}
          disabled={loading}
        >
          <Text style={[styles.buttonText, { color: theme.text }]}>
            {coverImage ? "Cover Selected" : "Select Cover"}
          </Text>
        </TouchableOpacity>

        {coverImage && <Image source={{ uri: coverImage.uri }} style={styles.coverPreview} />}

        <TextInput
          style={[styles.input, { backgroundColor: theme.secondary, color: theme.text }]}
          placeholder="Song Title"
          placeholderTextColor="#aaa"
          value={songTitle}
          onChangeText={setSongTitle}
          editable={!loading}
        />

        {/* Artist Name input removed; username from useUserData will be used automatically */}

        <View style={[styles.pickerContainer, { backgroundColor: theme.secondary }]}>
          <Text style={[styles.pickerLabel, { color: "#aaa" }]}>Genre</Text>
          <Picker
            selectedValue={genre}
            onValueChange={setGenre}
            enabled={!loading}
            style={{ color: theme.text }}
          >
            <Picker.Item label="Select a genre" value="" color="#aaa" />
            <Picker.Item label="Pop" value="Pop" />
            <Picker.Item label="Rap" value="Rap" />
            <Picker.Item label="Acoustic" value="Acoustic" />
            <Picker.Item label="Lofi" value="Lofi" />
            <Picker.Item label="R&B" value="R&B" />
            <Picker.Item label="Rock" value="Rock" />
            <Picker.Item label="Electronic" value="Electronic" />
            <Picker.Item label="Alternative" value="Alternative" />
            <Picker.Item label="Jazz" value="Jazz" />
            <Picker.Item label="Trap" value="Trap" />
            <Picker.Item label="Country" value="Country" />
            <Picker.Item label="Other" value="Other" />
          </Picker>
        </View>

        <TouchableOpacity
          style={[
            styles.holdButton,
            { backgroundColor: buttonColor },
            loading && styles.buttonDisabled,
          ]}
          onPressIn={startUploadHold}
          onPressOut={cancelUploadHold}
        >
          <Text style={styles.buttonText}>
            {loading ? "Uploading..." : "Hold to Upload"}
          </Text>
        </TouchableOpacity>
      </View>
    </ThemedScreen>
  );
}

const styles = StyleSheet.create({
  form: { marginTop: 60 },
  backButton: { position: "absolute", top: 40, left: 10, padding: 10 },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 10,
  },
  holdButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 10,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  input: {
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    fontSize: 16,
  },
  coverPreview: {
    width: 150,
    height: 150,
    borderRadius: 8,
    alignSelf: "center",
    marginVertical: 10,
  },
  pickerContainer: {
    borderRadius: 8,
    marginVertical: 10,
    overflow: "hidden",
  },
  pickerLabel: {
    fontSize: 14,
    paddingLeft: 15,
    paddingTop: 5,
  },
});
