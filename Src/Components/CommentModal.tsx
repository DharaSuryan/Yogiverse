import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SectionList,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  Modal,
  ScrollView,
  Dimensions
} from 'react-native';
import axios, { AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
const Ionicons = require('react-native-vector-icons/Ionicons').default;
const defaultAvatar = require('../Assets/userProfile.png');

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
  profile_picture?: string; // Added profile_picture to the interface
}

interface CommentModalProps {
  visible: boolean;
  onClose: () => void;
  content_type: 'post' | 'reel';
  object_id: number;
  media_url?: string;
  username?: string;
  profile_picture?: string;
  caption?: string;
}

const { width, height } = Dimensions.get('window');
const CommentModal: React.FC<CommentModalProps> = ({
  visible,
  onClose,
  content_type,
  object_id,
  media_url,
  username,
  profile_picture,
  caption,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [posting, setPosting] = useState(false);
  const sectionListRef = useRef<SectionList>(null);

  useEffect(() => {
    if (visible) fetchComments();
    // eslint-disable-next-line
  }, [object_id, content_type, visible]);

  const fetchComments = async () => {
    console.log("content_type .....", content_type, object_id);
    if (!content_type || !object_id) {
      setError('Missing content_type or object_id');
      console.error('Missing content_type or object_id', { content_type, object_id });
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const authToken = await AsyncStorage.getItem('accessToken');
      const res = await axios.get(`https://pashuahar.com/comment/list`, {
        params: { content_type, object_id },
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });
      console.log("res .....",res?.data?.data);
      // Map the response data to our comment structure
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
        likes_count: item.likes_count || 0,
        profile_picture: item.profile_picture || 'https://i.imgur.com/dM8JY3A.jpg'
      })) || [];
      setComments(formattedComments);
    } catch (err) {
      const error = err as AxiosError;
      setError('Failed to load comments');
      if (error.response && error.response.data) {
        console.error('Error fetching comments:', error.response.data);
      } else {
        console.error('Error fetching comments:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    setPosting(true);
    try {
      const authToken = await AsyncStorage.getItem('accessToken');
      const response = await axios.post(`https://pashuahar.com/comment/`, {
        content_type,
        object_id,
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
          likes_count: 0,
           profile_picture: profile_picture || 'https://i.imgur.com/dM8JY3A.jpg'
        }]);
        setNewComment('');
      }
    } catch (err) {
      const error = err as AxiosError;
      setError('Failed to post comment');
      if (error.response && error.response.data) {
        console.error('Error posting comment:', error.response.data);
      } else {
        console.error('Error posting comment:', error);
      }
    } finally {
      setPosting(false);
    }
  };

  const renderComment = ({ item }: { item: Comment }) => (
    <View style={styles.commentContainer}>
      {/* Show default avatar with #bea063 color and initials if no profile picture */}
      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#bea063', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>
          {item.full_name ? item.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : (item.user_name ? item.user_name[0].toUpperCase() : '?')}
        </Text>
      </View>
      <View style={styles.commentContent}>
        <Text style={styles.commentUsername}>{item.user_name || 'user'}</Text>
        <Text style={styles.commentText}>{item.text}</Text>
        <View style={styles.commentFooter}>
          <Text style={styles.commentTime}>{formatTime(item.created_at)}</Text>
          {/* <Text style={styles.commentLikes}>{item.likes_count || 0} likes</Text> */}
          {/* <Text style={styles.commentReply}>Reply</Text> */}
        </View>
      </View>
    </View>
  );

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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Drag indicator */}
          <View style={styles.dragIndicator} />
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: '#bea063' }]}>Comments</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              {React.createElement(Ionicons, { name: 'close', size: 24, color: '#bea063' })}
            </TouchableOpacity>
          </View>
          {/* Content */}
          <ScrollView style={styles.contentContainer}>
            {/* Original Post Preview */}
            {media_url && (
              <View style={styles.postPreview}>
                <Image source={{ uri: media_url }} style={styles.postImage} />
                <View style={styles.postCaption}>
                  <Text style={[styles.captionUsername, { color: '#bea063' }]}>{username}</Text>
                  <Text style={styles.captionText}>{caption}</Text>
                </View>
              </View>
            )}
            {/* Comments List */}
            {loading ? (
              <ActivityIndicator size="large" color="#000" style={styles.loadingIndicator} />
            ) : error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : (
              <SectionList
                ref={sectionListRef}
                sections={[{ data: comments }]}
                keyExtractor={item => item.id.toString()}
                renderItem={renderComment}
                renderSectionHeader={() => null}
                ListEmptyComponent={
                  <Text style={[styles.emptyComments, { color: '#bea063' }]}>No comments yet</Text>
                }
              />
            )}
          </ScrollView>
          {/* Comment Input */}
          <View style={styles.inputContainer}>
            {/* <Image
              source={{ uri: profile_picture || 'https://i.imgur.com/dM8JY3A.jpg' }}
              style={styles.userAvatar}
            /> */}
            <TextInput
              style={[styles.input, { borderColor: '#bea063', color: '#bea063' }]}
              placeholder="Add a comment..."
              placeholderTextColor="#999"
              value={newComment}
              onChangeText={setNewComment}
              editable={!posting}
              multiline
            />
            <TouchableOpacity 
              onPress={handlePostComment} 
              disabled={posting || !newComment.trim()}
              style={[styles.postButton,  ]}
            >
              <Text style={[
                styles.postButtonText,
                { color: newComment.trim() ? '#fff' : '#c5e3fc' }
              ]}>
                {posting ? 'Posting...' : 'Post'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
    zIndex: 9999, // Add high z-index to ensure it shows on top
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    minHeight: height * 0.6,
    maxHeight: height * 0.95,
    paddingBottom: 0,
    overflow: 'hidden',
    zIndex: 10000, // Add high z-index to ensure it shows on top
  },
  dragIndicator: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 3,
    alignSelf: 'center',
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  closeButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
  contentContainer: {
    flex: 1,
    paddingBottom: 10,
  },
  postPreview: {
    padding: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  postImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 5,
    marginBottom: 10,
  },
  postCaption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  captionUsername: {
    fontWeight: 'bold',
    marginRight: 5,
  },
  captionText: {
    flex: 1,
  },
  commentContainer: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  commentContent: {
    flex: 1,
  },
  commentUsername: {
    fontWeight: 'bold',
    marginBottom: 2,
    color: '#bea063',
  },
  commentText: {
    marginBottom: 5,
    lineHeight: 20,
    color: '#000',
  },
  commentFooter: {
    flexDirection: 'row',
    marginTop: 5,
  },
  commentTime: {
    color: '#999',
    fontSize: 12,
    marginRight: 15,
  },
  commentLikes: {
    color: '#999',
    fontSize: 12,
    marginRight: 15,
  },
  commentReply: {
    color: '#999',
    fontSize: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 15,
    fontSize: 15,
  },
  postButton: {
    marginLeft: 10,
  },
  postButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  loadingIndicator: {
    marginTop: 20,
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
  commentUserImage: { // Added style for comment user image
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userAvatar: { // Added style for user avatar in input
    width: 30,
    height: 30,
    borderRadius: 15,
    marginLeft: 10,
  },
});

export default CommentModal;
