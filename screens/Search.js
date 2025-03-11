import React, { useState } from "react";
import { TextInput, View, FlatList, TouchableOpacity, Text } from "react-native";
import { styles } from "../styles";
import SongCard from "../components/SongCard";
import { songService } from '../services/songService';


export default function SearchScreen() {

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async (text) => {
    setQuery(text);
    if (text.length > 2) { // Avoid searching for short queries
      const songs = await songService.searchSongs(text);
      setResults(songs);
    } else {
      setResults([]);
    }
  };
  
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search for a song"
        placeholderTextColor="#000"
        value={query}
        onChangeText={handleSearch}
      />
      <FlatList
        data={results}
        keyExtractor={(item) => item.songId.toString()}
        renderItem={({ item }) => <SongCard song={item} />}
      />
      </View>
  );
}
