import React from "react";
import { TextInput, View, FlatList, TouchableOpacity, Text } from "react-native";
import { styles } from "../styles";

export default function SearchScreen() {
  return (
    <View style={styles.container}>
      {/* Search bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search song, artist, album..."
        placeholderTextColor="#1a1a1a"
      />
      {/* Search results */}
      <FlatList
        data={[
          { id: "1", title: "Search Result 1" },
          { id: "2", title: "Search Result 2" },
        ]}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.songCard}>
            <Text style={styles.songTitle}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
