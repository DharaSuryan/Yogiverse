import React, { useEffect, useState, useRef } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, FlatList, Image, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Dimensions, TouchableWithoutFeedback } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
const Ionicons = require('react-native-vector-icons/Ionicons').default;
import { getProfile } from '../../Api/Api';
import { useNavigation } from '@react-navigation/native';

interface InstagramCommentModalProps {
  visible: boolean;
  onClose: () => void;
  postId: string;
  mediaUrl?: string;
  username: string;
  userAvatar: string;
  content_type: string;
  caption?: string;
}

interface Comment {
  id: number;
  text: string;
  user_id: number;
  user_name: string;
  full_name: string;
  content_type: string;
  object_id: number;
  created_at: string;
  updated_at: string;
  is_liked?: boolean;
  likes_count?: number;
}

const emojiList = ['❤️', '🙌', '🔥', '👏', '😢', '😍', '😮', '😂'];
const { width } = Dimensions.get('window');

const InstagramCommentModal: React.FC<InstagramCommentModalProps> = ({ visible, onClose, postId, mediaUrl, username, userAvatar, content_type, caption }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [posting, setPosting] = useState(false);
  const [currentUserAvatar, setCurrentUserAvatar] = useState<string>('https://via.placeholder.com/150/CCCCCC/FFFFFF?text=User');
  const [userId, setUserId] = useState<number | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const navigation = useNavigation();

  useEffect(() => {
    if (visible) {
      fetchComments();
      fetchCurrentUserProfile();
    }
  }, [visible, postId, content_type]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      setError(null);
      const authToken = await AsyncStorage.getItem('accessToken');
      const res = await axios.get(`https://pashuahar.com/comment/list`, {
        params: { content_type, object_id: postId },
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });
      const formattedComments = res.data?.data?.map((item: any) => ({
        id: item.id,
        text: item.text,
        user_id: item.user_id,
        user_name: item.user_name,
        full_name: item.full_name,
        content_type: item.content_type,
        object_id: item.object_id,
        created_at: item.created_at,
        updated_at: item.updated_at,
        is_liked: item.is_liked || false,
        likes_count: item.likes_count || 0
      })) || [];
      setComments(formattedComments);
    } catch (err) {
      setError('Failed to load comments');
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentUserProfile = async () => {
    try {
      const profileRes = await getProfile();
      const profilePic = profileRes?.data?.data?.profile?.profile_picture;
      setUserId(profileRes?.data?.data?.profile?.id);
      setCurrentUserAvatar(profilePic || 'https://via.placeholder.com/150/CCCCCC/FFFFFF?text=User');
    } catch (e) {
      setCurrentUserAvatar('https://via.placeholder.com/150/CCCCCC/FFFFFF?text=User');
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    setPosting(true);
    try {
      const authToken = await AsyncStorage.getItem('accessToken');
      const response = await axios.post(`https://pashuahar.com/comment/`, {
        content_type,
        object_id: postId,
        text: newComment.trim(),
      }, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (response.data.success) {
        const newCommentData = response.data.data;
        setComments(prev => [...prev, {
          id: newCommentData.id,
          text: newCommentData.text,
          user_id: newCommentData.user_id,
          user_name: newCommentData.user_name,
          full_name: newCommentData.full_name,
          content_type: newCommentData.content_type,
          object_id: newCommentData.object_id,
          created_at: newCommentData.created_at,
          updated_at: newCommentData.updated_at,
          is_liked: false,
          likes_count: 0
        }]);
        setNewComment('');
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 200);
      }
    } catch (err) {
      setError('Failed to post comment');
    } finally {
      setPosting(false);
    }
  };

  const handleEmoji = (emoji: string) => {
    setNewComment(newComment + emoji);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);
    if (diffInHours < 1) {
      const diffInMinutes = Math.round(diffInHours * 60);
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.round(diffInHours)}h ago`;
    } else {
      return `${Math.round(diffInHours / 24)}d ago`;
    }
  };

  const renderComment = ({ item }: { item: Comment }) => (
    <View style={styles.commentRow}>
      <TouchableOpacity
        style={styles.avatarWrap}
        onPress={() => navigation.navigate('UserProfile', { userId: item.user_id.toString(), isFromSearch: true })}
      >
        {/* {item.full_name ? (
          <View style={styles.avatarInitials}>
            <Text style={styles.avatarInitialsText}>
              {item.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
            </Text>
          </View>
        ) : ( */}
        <View style={{
          width: 42,
          height: 42,
          borderRadius: 21,
          backgroundColor: '#f5f5f5',
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 1.5,
          borderColor: '#bea063',
          overflow: 'hidden',
          marginRight: 4,
        }}>
          <Ionicons name="person-circle" size={38} color="#bea063" />
        </View>
        {/* <Image source={{ uri: userAvatar }} style={styles.avatar} /> */}
        {/* )} */}
      </TouchableOpacity>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => navigation.navigate('UserProfile', { userId: item.user_id.toString(), isFromSearch: true })}
          >
            <Text style={styles.username}>{item.user_name}</Text>
          </TouchableOpacity>
          <Text style={styles.time}>{formatTime(item.created_at)}</Text>
        </View>
        <Text style={styles.commentText}>{item.text}</Text>
        {/* <TouchableOpacity><Text style={styles.reply}>Reply</Text></TouchableOpacity> */}
      </View>
      {/* Like button can be added here if needed */}
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => { }}>
            <View style={styles.modalContent}>
              {/* Drag handle */}
              <View style={styles.handleContainer}>
                <View style={styles.handle} />
              </View>
              {/* Title */}
              <Text style={styles.title}>Comments</Text>
              {/* Comments List */}
              <View style={{ flex: 1, minHeight: 120 }}>
                {loading ? (
                  <ActivityIndicator size="large" color="#bea063" style={{ marginTop: 20 }} />
                ) : error ? (
                  <Text style={styles.errorText}>{error}</Text>
                ) : (
                  <FlatList
                    ref={flatListRef}
                    data={comments}
                    keyExtractor={item => item.id.toString()}
                    style={{ flex: 1 }}
                    contentContainerStyle={{ flexGrow: 1, padding: 16, paddingBottom: 0 }}
                    renderItem={renderComment}
                    ListEmptyComponent={<Text style={styles.emptyComments}>No comments yet</Text>}
                    keyboardShouldPersistTaps="handled"
                  />
                )}
              </View>
              {/* Emoji bar and input */}
              <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <View style={styles.emojiBar}>
                  {emojiList.map((emoji, idx) => (
                    <TouchableOpacity key={idx} onPress={() => handleEmoji(emoji)}>
                      <Text style={styles.emoji}>{emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={styles.inputRow}>
                  <Image source={{ uri: currentUserAvatar }} style={styles.inputAvatar} />
                  <TextInput
                    style={styles.input}
                    placeholder={`Add a comment for ${username}`}
                    placeholderTextColor="#bea063"
                    value={newComment}
                    onChangeText={setNewComment}
                    editable={!posting}
                  />
                  <TouchableOpacity onPress={handlePostComment} style={styles.sendButton} disabled={posting || !newComment.trim()}>
                    {posting ? (
                      <ActivityIndicator size={18} color="#bea063" />
                    ) : (
                      <Ionicons name="send" size={22} color={newComment.trim() ? "#bea063" : "#ccc"} />
                    )}
                  </TouchableOpacity>
                </View>
              </KeyboardAvoidingView>
              {/* Close area */}
              <TouchableOpacity style={styles.closeArea} onPress={onClose} />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    minHeight: '55%',
    maxHeight: '85%',
    width: '100%',
    alignSelf: 'flex-end',
    overflow: 'hidden',
    flex: 1,
  },
  handleContainer: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 6,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e0e0e0',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#bea063',
    textAlign: 'center',
    marginBottom: 8,
  },
  postPreview: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  postImage: {
    width: 54,
    height: 54,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: '#f5f5f5',
  },
  postCaption: {
    flex: 1,
  },
  captionUsername: {
    fontWeight: 'bold',
    color: '#bea063',
    marginBottom: 2,
  },
  captionText: {
    color: '#222',
    fontSize: 14,
  },
  commentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  avatarWrap: {
    marginRight: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#f5f5f5',
  },
  avatarInitials: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#bea063',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitialsText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  username: {
    fontWeight: 'bold',
    color: '#bea063',
    marginRight: 8,
    fontSize: 15,
  },
  time: {
    color: '#888',
    fontSize: 12,
  },
  commentText: {
    color: '#222',
    fontSize: 15,
    marginTop: 2,
  },
  reply: {
    color: '#bea063',
    fontSize: 13,
    marginTop: 2,
  },
  likes: {
    color: '#bea063',
    fontSize: 13,
    marginTop: 2,
  },
  emojiBar: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
    justifyContent: 'space-between',
  },
  emoji: {
    fontSize: 24,
    marginHorizontal: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  inputAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#f5f5f5',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#222',
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
  },
  sendButton: {
    padding: 4,
  },
  closeArea: {
    height: 0,
    width: '100%',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  emptyComments: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
    padding: 15,
  },
});

export default InstagramCommentModal;