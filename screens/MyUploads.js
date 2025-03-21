import React, { useState } from "react";
import { View, Text, FlatList, SafeAreaView, TouchableOpacity, Alert } from "react-native";
import { styles } from "../styles";
import { useGetSongs } from "../hooks/useGetSongs";
import SongCard from "../components/SongCard";
import { songService } from "../services/songService";

export default function MyUploads() {
    const { songs, loading, error, refreshSongs } = useGetSongs('my-uploads');
    const [deletingId, setDeletingId] = useState(null);

    const handleDeleteSong = async (playlistId, songId) => {
        try {
            setDeletingId(songId);
            
            Alert.alert(
                "Delete Song",
                "Are you sure you want to delete this song? This action cannot be undone.",
                [
                    {
                        text: "Cancel",
                        style: "cancel",
                        onPress: () => setDeletingId(null)
                    },
                    {
                        text: "Delete",
                        style: "destructive",
                        onPress: async () => {
                            await songService.deleteSong(songId);
                            refreshSongs();
                            setDeletingId(null);
                        }
                    }
                ]
            );
        } catch (error) {
            console.error('Failed to delete song:', error);
            Alert.alert("Error", "Failed to delete song. Please try again later.");
            setDeletingId(null);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Your Uploads</Text>
            <FlatList
                data={songs}
                keyExtractor={(item) => item.songId.toString()}
                renderItem={({ item }) => (
                    <SongCard 
                        song={item} 
                        isOwnContent={true} 
                        onRemove={handleDeleteSong} 
                        isDeleting={deletingId === item.songId}
                    />
                )}
                ListEmptyComponent={() => (
                    <Text style={styles.emptyText}>No Uploaded Songs</Text>
                )}
            />
        </SafeAreaView>
    );
}