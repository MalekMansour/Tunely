import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert, TextInput, Image, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { songService } from "../services/songService";

export default function Upload({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [songTitle, setSongTitle] = useState("");
  const [artistName, setArtistName] = useState("");
  const [genre, setGenre] = useState("");
  const [songFile, setSongFile] = useState(null);
  const [coverImage, setCoverImage] = useState(null);

  const pickSong = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ 
        type: "audio/*",
        copyToCacheDirectory: true
      });

      if (!result.canceled) {
        setSongFile(result.assets[0]);
      }
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

      if (!result.canceled) {
        setCoverImage(result.assets[0]);
      }
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
      
      // Append song file
      formData.append('song', {
        uri: songFile.uri,
        type: 'audio/mpeg',
        name: songFile.name || 'song.mp3'
      });

      // Append cover if selected
      if (coverImage) {
        formData.append('cover', {
          uri: coverImage.uri,
          type: 'image/jpeg',
          name: 'cover.jpg'
        });
      }

      // Append metadata
      formData.append('title', songTitle);
      formData.append('artistName', artistName);
      formData.append('genre', genre);

      const result = await songService.uploadSong(formData);
      Alert.alert("Success", "Song uploaded successfully!");
      navigation.goBack();
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert("Error", "Failed to upload song");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      <View style={styles.form}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={pickSong}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {songFile ? 'Song Selected' : 'Select Song'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button} 
          onPress={pickCover}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {coverImage ? 'Cover Selected' : 'Select Cover'}
          </Text>
        </TouchableOpacity>

        {coverImage && (
          <Image 
            source={{ uri: coverImage.uri }} 
            style={styles.coverPreview} 
          />
        )}

        <TextInput
          style={styles.input}
          placeholder="Song Title"
          placeholderTextColor="#aaa"
          value={songTitle}
          onChangeText={setSongTitle}
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Artist Name"
          placeholderTextColor="#aaa"
          value={artistName}
          onChangeText={setArtistName}
          editable={!loading}
        />
        {/*changed to picker so users can select genre that we use through out the app instead of random ones*/}
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Genre</Text>
          <Picker
            selectedValue={genre}
            onValueChange={(itemValue) => setGenre(itemValue)}
            enabled={!loading}
            style={styles.picker}
            dropdownIconColor="#fff"
            itemStyle={styles.pickerItem}
          >
            <Picker.Item label="Select a genre" value="" color="#aaa" />
            <Picker.Item label="Pop" value="Pop" color="#fff" />
            <Picker.Item label="HipHop/Rap" value="Rap" color="#fff" />
<Picker.Item label="R&B" value="R&B" color="#fff" />
<Picker.Item label="Rock" value="Rock" color="#fff" />
<Picker.Item label="Country" value="Country" color="#fff" />
<Picker.Item label="Electronic" value="Electronic" color="#fff" />
<Picker.Item label="Jazz" value="Jazz" color="#fff" />
<Picker.Item label="Alternative" value="Alternative" color="#fff" />
<Picker.Item label="Lofi" value="Lofi" color="#fff" />
<Picker.Item label="Trap" value="Trap" color="#fff" />
<Picker.Item label="Other" value="Other" color="#fff" />

          </Picker>
        </View>

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleUpload}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Uploading...' : 'Upload Song'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
  },
  form: {
    marginTop: 60,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 10,
    zIndex: 10,
    padding: 10,
  },
  button: {
    backgroundColor: '#213555',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#f1f1f1',
    fontWeight: 'bold',
    fontSize: 16,
  },
  input: {
    backgroundColor: '#2a2a2a',
    color: '#f1f1f1',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    fontSize: 16,
  },
  coverPreview: {
    width: 150,
    height: 150,
    borderRadius: 8,
    alignSelf: 'center',
    marginVertical: 10,
  },
  pickerContainer: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    marginVertical: 10,
    overflow: 'hidden',
  },
  pickerLabel: {
    color: '#aaa',
    fontSize: 14,
    paddingLeft: 15,
    paddingTop: 5,
  },
  picker: {
    color: '#f1f1f1',
    backgroundColor: 'transparent',
  },
  pickerItem: {
    color: '#f1f1f1',
    backgroundColor: '#2a2a2a',
  },
});