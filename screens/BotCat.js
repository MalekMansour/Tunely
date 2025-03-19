import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function BotCat() {
  const navigation = useNavigation();
  const [selectedMood, setSelectedMood] = useState(null);

  const moodOptions = ['Happy', 'Sad', 'Energetic', 'Relaxed', 'Romantic', 'Angry'];

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={32} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CatBot 🎧</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView style={styles.chatContainer}>
        <View style={styles.botBubble}>
          <Text style={styles.botText}>Hey there! 🐱 How are you feeling today?</Text>
        </View>

        {!selectedMood ? (
          <View style={styles.optionsContainer}>
            {moodOptions.map((mood, index) => (
              <TouchableOpacity
                key={index}
                style={styles.optionButton}
                onPress={() => handleMoodSelect(mood)}
              >
                <Text style={styles.optionText}>{mood}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <>
            <View style={styles.userBubble}>
              <Text style={styles.userText}>{selectedMood}</Text>
            </View>

            <View style={styles.botBubble}>
              <Text style={styles.botText}>
                Nice! Let me find a perfect "{selectedMood}" song for you! 🎶
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
  },
  chatContainer: {
    flex: 1,
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 15,
    borderBottomLeftRadius: 0,
    marginBottom: 15,
    maxWidth: '80%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#4A90E2',
    padding: 12,
    borderRadius: 15,
    borderBottomRightRadius: 0,
    marginBottom: 15,
    maxWidth: '80%',
  },
  botText: {
    color: '#fff',
    fontSize: 16,
  },
  userText: {
    color: '#fff',
    fontSize: 16,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 20,
  },
  optionButton: {
    backgroundColor: '#222',
    borderWidth: 1,
    borderColor: '#4A90E2',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    margin: 6,
  },
  optionText: {
    color: '#4A90E2',
    fontSize: 16,
  },
});
