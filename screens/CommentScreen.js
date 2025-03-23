import React, { useRef, useState, useEffect } from "react";
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
} from "react-native";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { auth } from "../Utility/firebaseConfig";
import { useUserData } from "../hooks/useUserData";
import { commentsService } from "../services/commentService";
import blankProfilePic from "../assets/blank_profile.png";

export default function CommentScreen({ route }) {
  const { song } = route.params;
  const navigation = useNavigation();
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { username, profilePic } = useUserData();
  const insets = useSafeAreaInsets();
  const defaultCoverImage = require("../assets/note.jpg");
  const inputRef = useRef(null);

  const [likedComments, setLikedComments] = useState(new Set());
  const [replyingTo, setReplyingTo] = useState(null);

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
      console.error("Error loading comments:", error);
      Alert.alert("Error", "Failed to load comments.");
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
          friction: 8,
          tension: 40,
        }).start();
      }
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";

    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
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

        setComment("");
        setReplyingTo(null);

        await loadComments();

        Alert.alert(
          "Comment Posted",
          "Your comment has been posted successfully.",
          [
            { text: "Stay", style: "cancel" },
            { text: "Return to Song", onPress: () => navigation.goBack() },
          ]
        );
      } catch (error) {
        console.error("Error posting comment:", error);
        Alert.alert("Error", "Failed to post your comment.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      Alert.alert(
        "Delete Comment",
        "Are you sure you want to delete this comment?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              await commentsService.deleteComment(commentId);
              setComments(
                comments.filter((comment) => comment.id !== commentId)
              );
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error deleting comment:", error);
      Alert.alert("Error", "Failed to delete the comment.");
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      const newLikedComments = new Set(likedComments);

      if (newLikedComments.has(commentId)) {
        newLikedComments.delete(commentId);
      } else {
        newLikedComments.add(commentId);
      }

      setLikedComments(newLikedComments);
    } catch (error) {
      console.error("Error toggling like:", error);
      Alert.alert("Error", "Failed to like/unlike the comment.");
    }
  };

  const handleReplyComment = (commentId, username, userId) => {
    // Check if the comment is user's own comment
    if (auth.currentUser && userId === auth.currentUser.uid) {
      Alert.alert("Cannot Reply", "You cannot reply to your own comment.");
      return;
    }

    setReplyingTo({ id: commentId, username });
    setComment(`@${username} `);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <SafeAreaView style={styles.mainContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 5 : 20}
      >
        <PanGestureHandler
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onHandlerStateChange}
        >
          <Animated.View
            style={[styles.container, { transform: [{ translateY }] }]}
          >
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.backButtonText}>←</Text>
              </TouchableOpacity>

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

            <View style={styles.contentDivider} />

            {replyingTo && (
              <View style={styles.replyingToContainer}>
                <Text style={styles.replyingToText}>
                  Replying to{" "}
                  <Text style={styles.replyingToUsername}>
                    {replyingTo.username}
                  </Text>
                </Text>
                <TouchableOpacity
                  style={styles.cancelReplyButton}
                  onPress={() => {
                    setReplyingTo(null);
                    setComment("");
                  }}
                >
                  <Text style={styles.cancelReplyText}>×</Text>
                </TouchableOpacity>
              </View>
            )}

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
                          source={
                            typeof item.profilePic === "string"
                              ? { uri: item.profilePic }
                              : blankProfilePic
                          }
                          style={styles.profilePic}
                        />
                        <View style={styles.commentContent}>
                          <View style={styles.commentHeader}>
                            <Text style={styles.username}>{item.username}</Text>
                            <Text style={styles.timestamp}>
                              {formatTimestamp(item.created_at)}
                            </Text>
                          </View>
                          <Text style={styles.commentText}>{item.text}</Text>

                          <View style={styles.commentActionBar}>
                            <TouchableOpacity
                              style={[
                                styles.actionButton,
                                likedComments.has(item.id) &&
                                  styles.actionButtonActive,
                              ]}
                              onPress={() => handleLikeComment(item.id)}
                            >
                              <Text
                                style={[
                                  styles.actionButtonText,
                                  likedComments.has(item.id) &&
                                    styles.actionButtonTextActive,
                                ]}
                              >
                                Like
                              </Text>
                            </TouchableOpacity>

                            {/* Hide Reply button for user's own comments */}
                            {!(
                              auth.currentUser &&
                              item.user_id === auth.currentUser.uid
                            ) && (
                              <TouchableOpacity
                                style={[
                                  styles.actionButton,
                                  replyingTo?.id === item.id &&
                                    styles.actionButtonActive,
                                ]}
                                onPress={() =>
                                  handleReplyComment(
                                    item.id,
                                    item.username,
                                    item.user_id
                                  )
                                }
                              >
                                <Text
                                  style={[
                                    styles.actionButtonText,
                                    replyingTo?.id === item.id &&
                                      styles.actionButtonTextActive,
                                  ]}
                                >
                                  Reply
                                </Text>
                              </TouchableOpacity>
                            )}

                            {auth.currentUser &&
                              item.user_id === auth.currentUser.uid && (
                                <TouchableOpacity
                                  style={styles.deleteButton}
                                  onPress={() => handleDeleteComment(item.id)}
                                >
                                  <Text style={styles.deleteText}>Delete</Text>
                                </TouchableOpacity>
                              )}
                          </View>
                        </View>
                      </View>
                    </View>
                  )}
                  style={styles.commentList}
                  ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                      <Text style={styles.emptyTitle}>No comments yet</Text>
                      <Text style={styles.emptyText}>
                        Be the first to share your thoughts!
                      </Text>
                    </View>
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
                  maxLength={200}
                />

                {comment.trim() === "" ? (
                  <TouchableOpacity
                    style={styles.doneButton}
                    onPress={() => navigation.goBack()}
                  >
                    <Text style={styles.doneButtonText}>Done</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[
                      styles.submitButton,
                      isSubmitting && styles.submitButtonDisabled,
                    ]}
                    onPress={handleSubmitComment}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.submitText}>Post</Text>
                    )}
                  </TouchableOpacity>
                )}
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
    backgroundColor: "#000",
  },
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "#333",
    backgroundColor: "#0a0a0a",
  },
  backButton: {
    padding: 8,
    marginRight: 5,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "300",
  },
  songImage: {
    width: 48,
    height: 48,
    borderRadius: 6,
  },
  songInfo: {
    marginLeft: 14,
    flex: 1,
  },
  songTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 2,
  },
  artistName: {
    color: "#999",
    fontSize: 14,
  },
  contentDivider: {
    height: 4,
    backgroundColor: "#111",
  },
  replyingToContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "#111",
    borderBottomWidth: 0.5,
    borderBottomColor: "#333",
  },
  replyingToText: {
    color: "#999",
    fontSize: 14,
  },
  replyingToUsername: {
    color: "#1e90ff",
    fontWeight: "500",
  },
  cancelReplyButton: {
    padding: 5,
  },
  cancelReplyText: {
    color: "#999",
    fontSize: 18,
  },
  contentContainer: {
    flex: 1,
  },
  commentList: {
    flex: 1,
    padding: 16,
  },
  commentItem: {
    backgroundColor: "#1a1a1a",
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#1e90ff",
  },
  commentWrapper: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  profilePic: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#333",
  },
  commentContent: {
    flex: 1,
    marginLeft: 10,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  username: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  timestamp: {
    color: "#666",
    fontSize: 12,
  },
  commentText: {
    color: "#fff",
    fontSize: 14,
    lineHeight: 20,
  },
  commentActionBar: {
    flexDirection: "row",
    marginTop: 12,
    alignItems: "center",
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 5,
    marginRight: 10,
    borderRadius: 11,
    backgroundColor: "#252525",
  },
  actionButtonText: {
    color: "#999",
    fontSize: 12,
  },
  actionButtonActive: {
    backgroundColor: "rgba(30, 144, 255, 0.2)",
  },
  actionButtonTextActive: {
    color: "#1e90ff",
    fontWeight: "500",
  },
  deleteButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 4,
    backgroundColor: "rgba(255, 59, 48, 0.15)",
  },
  deleteText: {
    color: "#ff3b30",
    fontSize: 12,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 14,
    borderTopWidth: 0.5,
    borderTopColor: "#333",
    backgroundColor: "rgba(0, 0, 0, 0.85)",
  },
  input: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
    color: "#fff",
    fontSize: 16,
    maxHeight: 80,
  },
  submitButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-end",
  },
  submitText: {
    color: "#fff",
    fontWeight: "600",
  },
  submitButtonDisabled: {
    backgroundColor: "#333",
    opacity: 0.6,
  },
  doneButton: {
    backgroundColor: "transparent",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-end",
    borderWidth: 1,
    borderColor: "#555",
  },
  doneButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    marginTop: 10,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    marginTop: 50,
  },
  emptyTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptyText: {
    color: "#999",
    textAlign: "center",
    fontSize: 14,
  },
});
