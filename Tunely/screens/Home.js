import React from "react";
import { Text, View, FlatList, TouchableOpacity, Image } from "react-native";
import { styles } from "../styles";
import { useNavigation } from "@react-navigation/native";

export default function HomeScreen() {
  const navigation = useNavigation();

  const songs = [
    { id: "1", title: "Song 1", image: require("../assets/note.jpg") },
    { id: "2", title: "Song 2", image: require("../assets/note.jpg") },
    { id: "3", title: "Song 3", image: require("../assets/note.jpg"),},
    { id: "4", title: "Song 4", image: require("../assets/note.jpg") },
  ];
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Tunely</Text>
      <FlatList
        data={songs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.songCard}
            onPress={() => navigation.navigate("SongDetail", { song: item })}
          >
            <Text style={styles.songTitle}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
