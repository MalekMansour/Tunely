import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  TextInput,
  Image,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { songService } from "../services/songService";
import { useTheme } from "../context/ThemeContext";
import { useUserData } from "../hooks/useUserData";
import ThemedScreen from "../components/ThemedScreen";

export default function Upload({ navigation }) {
  const { theme } = useTheme();
  const { username } = useUserData();

  const [loading, setLoading] = useState(false);
  const [songTitle, setSongTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [songFile, setSongFile] = useState(null);
  const [coverImage, setCoverImage] = useState(null);

  // Scheduling states
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledTime, setScheduledTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

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

  // The actual upload process
  const handleUpload = async () => {
    // Validate title (at least one non-space character)
    if (!songTitle.trim()) {
      Alert.alert("Error", "Song title is required.");
      return;
    }
    if (!songFile) {
      Alert.alert("Error", "Please select a song.");
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
      formData.append("artistName", username);
      formData.append("genre", genre);
      if (isScheduled) {
        formData.append("scheduledTime", scheduledTime.toISOString());
      }
      await songService.uploadSong(formData);
      Alert.alert("Success", "Song uploaded successfully!");
      if (navigation.canGoBack && navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate("Home");
      }
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert("Error", "Failed to upload song");
    } finally {
      setLoading(false);
    }
  };

  // Determines whether to schedule the upload or do it immediately.
  const submitUpload = () => {
    if (isScheduled) {
      const now = new Date();
      const threeMonthsLater = new Date();
      threeMonthsLater.setMonth(now.getMonth() + 3);
      if (scheduledTime < now) {
        Alert.alert("Error", "Scheduled time cannot be in the past.");
        return;
      }
      if (scheduledTime > threeMonthsLater) {
        Alert.alert("Error", "Scheduled time must be within the next 3 months.");
        return;
      }
      const delay = scheduledTime - now;
      // Schedule the upload via setTimeout
      setTimeout(() => {
        handleUpload();
      }, delay);
      // Confirm scheduling and exit the Upload screen immediately.
      Alert.alert(
        "Scheduled",
        `Your song will be uploaded at ${scheduledTime.toLocaleString()}`,
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } else {
      handleUpload();
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setScheduledTime(selectedDate);
    }
  };

  return (
    <ThemedScreen style={{ padding: 20 }}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color={theme.text} />
      </TouchableOpacity>
      <ScrollView keyboardShouldPersistTaps="handled">
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
            placeholderTextColor={theme.text}
            value={songTitle}
            onChangeText={setSongTitle}
          />

          <View style={[styles.pickerContainer, { backgroundColor: theme.secondary }]}>
            <Text style={[styles.pickerLabel, { color:theme.text }]}>Genre</Text>
            <Picker
              selectedValue={genre}
              onValueChange={setGenre}
              enabled={!loading}
              style={{ color: theme.text }}
            >
              <Picker.Item label="Select a genre" value="" color={theme.text} />
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

          {/* Schedule Upload Section */}
          <View style={styles.scheduleContainer}>
            <TouchableOpacity
              style={[
                styles.scheduleButton,
                { backgroundColor: isScheduled ? theme.delete : theme.primary },
              ]}
              onPress={() => setIsScheduled(!isScheduled)}
              disabled={loading}
            >
              <Text style={[styles.buttonText, { color: theme.text }]}>
                {isScheduled ? "Cancel Schedule" : "Schedule Upload"}
              </Text>
            </TouchableOpacity>
            {isScheduled && (
              <TouchableOpacity
                style={[styles.schedulePicker, { backgroundColor: theme.secondary }]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={{ color: theme.text }}>
                  {`Scheduled: ${scheduledTime.toLocaleString()}`}
                </Text>
              </TouchableOpacity>
            )}
            {showDatePicker && (
              <DateTimePicker
                value={scheduledTime}
                mode="datetime"
                display="default"
                onChange={onDateChange}
                minimumDate={new Date()}
                maximumDate={new Date(new Date().setMonth(new Date().getMonth() + 3))}
              />
            )}
          </View>

          <TouchableOpacity
            style={[styles.uploadButton, { backgroundColor: theme.primary }]}
            onPress={submitUpload}
            disabled={loading}
          >
            <Text style={[styles.buttonText, { color: theme.text }]}>
              {loading ? "Uploading..." : "Upload"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedScreen>
  );
}

const styles = StyleSheet.create({
  form: {
    marginTop: 60,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 10,
    padding: 10,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 10,
  },
  uploadButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  input: {
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    fontSize: 16,
  },
  coverPreview: {
    width: 150,
    height: 150,
    borderRadius: 10,
    alignSelf: "center",
    marginVertical: 10,
  },
  pickerContainer: {
    borderRadius: 10,
    marginVertical: 10,
    overflow: "hidden",
  },
  pickerLabel: {
    fontSize: 14,
    paddingLeft: 15,
    paddingTop: 5,
  },
  scheduleContainer: {
    marginVertical: 10,
    alignItems: "center",
  },
  scheduleButton: {
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 5,
    width: "60%",
  },
  schedulePicker: {
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },
});
