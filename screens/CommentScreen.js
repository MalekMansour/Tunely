import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  Animated,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Keyboard,
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { auth } from '../Utility/firebaseConfig';
import { useUserData } from '../hooks/useUserData';
import { commentsService } from '../services/commentService';
import blankProfilePic from '../assets/blank_profile.png';

export default function CommentScreen({ route }) {
  const { song } = route.params;
  const navigation = useNavigation();
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { username, profilePic } = useUserData();
  const insets = useSafeAreaInsets();
  const defaultCoverImage = require('../assets/note.jpg');
  const inputRef = useRef(null);

  useEffect(() => {
    loadComments();
  }, []);

  const loadComments = async () => {
    try {
      setIsLoading(true);
      const songId = song.id || song.songId;
      const fetchedComments = await commentsService.fetchComments(songId);
      setComments(fetchedComments);
    } catch (error) {
      console.error('Error loading comments:', error);
      Alert.alert('Error', 'Failed to load comments.');
    } finally {
      setIsLoading(false);
    }
  };

  const translateY = useRef(new Animated.Value(0)).current;

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: translateY } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event) => {
    if (event.nativeEvent.state === State.END) {
      if (event.nativeEvent.translationY > 150) {
        navigation.goBack();
      } else {
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const handleSubmitComment = async () => {
    if (comment.trim() && !isSubmitting) {
        try {
            setIsSubmitting(true);
            const songId = song.id || song.songId;
            await commentsService.postComment(songId, comment.trim());
            await loadComments();
            setComment('');
            Keyboard.dismiss();
        } catch (error) {
            console.error('Error posting comment:', error);
            Alert.alert('Error', error.message || 'Failed to post your comment.');
        } finally {
            setIsSubmitting(false);
        }
    }
};


  const handleDeleteComment = async (commentId) => {
    try {
      await commentsService.deleteComment(commentId);
      setComments(comments.filter(comment => comment.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
      Alert.alert('Error', 'Failed to delete the comment.');
    }
  };

  return (
    <SafeAreaView style={styles.mainContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={70}
      >
        <PanGestureHandler
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onHandlerStateChange}
        >
          <Animated.View style={[styles.container, { transform: [{ translateY }] }]}>
            <View style={styles.header}>
              <Image
                source={
                  song.song_photo_url
                    ? { uri: song.song_photo_url }
                    : defaultCoverImage
                }
                style={styles.songImage}
              />
              <View style={styles.songInfo}>
                <Text style={styles.songTitle}>{song.title}</Text>
                <Text style={styles.artistName}>{song.artistName}</Text>
              </View>
            </View>

            <View style={styles.contentContainer}>
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="#fff" size="large" />
                  <Text style={styles.loadingText}>Loading comments...</Text>
                </View>
              ) : (
                <FlatList
                  data={comments}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <View style={styles.commentItem}>
                      <View style={styles.commentWrapper}>
                        <Image
                          source={typeof item.profilePic === 'string' ? { uri: item.profilePic } : blankProfilePic}
                          style={styles.profilePic}
                        />
                        <View style={styles.commentContent}>
                          <View style={styles.commentHeader}>
                            <Text style={styles.username}>{item.username}</Text>
                            <Text style={styles.timestamp}>{formatTimestamp(item.created_at)}</Text>
                          </View>
                          <Text style={styles.commentText}>{item.text}</Text>
                          {auth.currentUser && item.user_id === auth.currentUser.uid && (
                            <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteComment(item.id)}>
                              <Text style={styles.deleteText}>Delete</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    </View>
                  )}
                  style={styles.commentList}
                  ListEmptyComponent={
                    <Text style={styles.emptyText}>No comments yet. Be the first to comment!</Text>
                  }
                />
              )}

              <View style={styles.inputContainer}>
                <TextInput
                  ref={inputRef}
                  style={styles.input}
                  value={comment}
                  onChangeText={setComment}
                  placeholder="Add a comment..."
                  placeholderTextColor="#666"
                  multiline
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                />
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    (isSubmitting || !comment.trim()) && styles.submitButtonDisabled,
                  ]}
                  onPress={handleSubmitComment}
                  disabled={isSubmitting || !comment.trim()}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.submitText}>Post</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </PanGestureHandler>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333',
  },
  songImage: {
    width: 52,
    height: 52,
    borderRadius: 6,
  },
  songInfo: {
    marginLeft: 14,
    flex: 1,
  },
  songTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 2,
  },
  artistName: {
    color: '#999',
    fontSize: 14,
  },
  contentContainer: {
    flex: 1,
  },
  commentList: {
    flex: 1,
    padding: 16,
  },
  commentItem: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 8,
    marginBottom: 6,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  username: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  timestamp: {
    color: '#666',
    fontSize: 12,
  },
  commentText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 14,
    borderTopWidth: 0.5,
    borderTopColor: '#333',
    backgroundColor: '#000',
  },
  input: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    color: '#fff',
    fontSize: 16,
    maxHeight: 120,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  submitText: {
    color: '#fff',
    fontWeight: '600',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePic: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  commentWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  commentContent: {
    flex: 1,
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
  },
  emptyText: {
    color: '#999',
    textAlign: 'center',
    padding: 20,
  },
  deleteButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  deleteText: {
    color: '#ff3b30',
    fontSize: 12,
  },
  submitButtonDisabled: {
    backgroundColor: '#333',
    opacity: 0.6,
  },
});