import React from "react";
import { View, Text, FlatList, SafeAreaView, TouchableOpacity} from "react-native";
import { styles } from "../styles";
import { useGetSongs } from "../hooks/useGetSongs";
import SongCard from "../components/SongCard";

export default function MyUploads() {
    const { songs, loading, error, refreshSongs } = useGetSongs('my-uploads');

    return (
        <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Your Uploads</Text>
        <FlatList
            data={songs}
            keyExtractor={(item) => item.songId.toString()}
            renderItem={({ item }) => <SongCard song={item} />}
            ListEmptyComponent={() => (
                <Text style={styles.emptyText}>No Uploaded Songs</Text>
            )}
            />
        

        </SafeAreaView>
    );
    }