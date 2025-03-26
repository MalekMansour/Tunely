import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
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
  const [replyingTo, setReplyingTo] = useState(null);
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

  const handleSubmitComment = async () => {
    if (comment.trim() && !isSubmitting) {
      try {
        setIsSubmitting(true);
        const songId = song.id || song.songId;
        await commentsService.postComment(songId, comment.trim(), replyingTo);
        await loadComments();
        setComment('');
        setReplyingTo(null);
        Keyboard.dismiss();
      } catch (error) {
        console.error('Error posting comment:', error);
        Alert.alert('Error', error.message || 'Failed to post your comment.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  const renderComment = (item, isReply = false) => (
    <View style={[styles.commentItem, isReply && styles.replyItem]}>
      <View style={styles.commentWrapper}>
        <Image
          source={typeof item.profilePic === 'string' ? { uri: item.profilePic } : blankProfilePic}
          style={styles.profilePic}
        />
        <View style={styles.commentContent}>
          <Text style={styles.username}>{item.username}</Text>
          <Text style={styles.commentText}>{item.text}</Text>
          {!isReply && (
            <TouchableOpacity onPress={() => setReplyingTo(item.id)}>
              <Text style={styles.replyText}>Reply</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      {item.replies && item.replies.map(reply => renderComment(reply, true))}
    </View>
  );

  return (
    <SafeAreaView style={styles.mainContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          data={comments}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => renderComment(item)}
          ListEmptyComponent={<Text style={styles.emptyText}>No comments yet. Be the first to comment!</Text>}
        />
        <View style={styles.inputContainer}>
          {replyingTo && (
            <View style={styles.replyingToContainer}>
              <Text style={styles.replyingToText}>Replying to a comment</Text>
              <TouchableOpacity onPress={cancelReply} style={styles.cancelReplyButton}>
                <Text style={styles.cancelReplyText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.inputWrapper}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              value={comment}
              onChangeText={setComment}
              placeholder={replyingTo ? "Add a reply..." : "Add a comment..."}
              placeholderTextColor="#666"
              multiline={false}
              returnKeyType="send"
              onSubmitEditing={handleSubmitComment}
            />
            <TouchableOpacity
              style={[styles.submitButton, (isSubmitting || !comment.trim()) && styles.submitButtonDisabled]}
              onPress={handleSubmitComment}
              disabled={isSubmitting || !comment.trim()}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitText}>Send</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: { 
    flex: 1, 
    backgroundColor: '#000' 
  },
  commentItem: { 
    padding: 16, 
    borderBottomWidth: 0.5, 
    borderBottomColor: '#333' 
  },
  commentWrapper: { 
    flexDirection: 'row', 
    alignItems: 'flex-start' 
  },
  profilePic: { 
    width: 30, 
    height: 30, 
    borderRadius: 15 
  },
  commentContent: { 
    marginLeft: 8, 
    flex: 1 
  },
  username: { 
    color: '#fff', 
    fontWeight: '600', 
    fontSize: 14 
  },
  commentText: { 
    color: '#fff', 
    fontSize: 14, 
    lineHeight: 20 
  },
  replyText: { 
    color: '#007AFF', 
    fontSize: 12, 
    marginTop: 4 
  },
  replyItem: { 
    marginLeft: 30, 
    borderLeftWidth: 1, 
    borderLeftColor: '#333', 
    paddingLeft: 10 
  },
  replyingToContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 14, 
    paddingTop: 8 
  },
  replyingToText: { 
    color: '#999', 
    fontSize: 12 
  },
  cancelReplyButton: { 
    padding: 5 
  },
  cancelReplyText: { 
    color: '#007AFF', 
    fontSize: 12 
  },
  inputContainer: { 
    borderTopWidth: 0.5, 
    borderTopColor: '#333', 
    backgroundColor: '#000' 
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  input: { 
    flex: 1,
    backgroundColor: '#1a1a1a', 
    borderRadius: 20, 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    color: '#fff', 
    fontSize: 16,
    maxHeight: 100
  },
  submitButton: { 
    backgroundColor: '#007AFF', 
    paddingHorizontal: 15, 
    paddingVertical: 8, 
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginLeft: 10
  },
  submitText: { 
    color: '#fff', 
    fontWeight: '600' 
  },
  submitButtonDisabled: { 
    backgroundColor: '#333', 
    opacity: 0.6 
  },
  emptyText: { 
    color: '#999', 
    textAlign: 'center', 
    padding: 20 
  },
});
