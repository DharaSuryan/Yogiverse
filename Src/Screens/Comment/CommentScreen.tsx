import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  SafeAreaView,
  ScrollView,
  Dimensions
} from 'react-native';
import axios from 'axios';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';

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

interface RouteParams {
  content_type: 'Post_App | post' | 'Post_App | reel';
  object_id: number;
  media_url?: string;
  username?: string;
  profile_picture?: string;
  caption?: string;
}

const { width, height } = Dimensions.get('window');

const CommentScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { content_type, object_id, media_url, username, profile_picture, caption } = route.params as RouteParams;

  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [posting, setPosting] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    fetchComments();
  }, [object_id, content_type]);

  const fetchComments = async () => {
    console.log("content_type .....",content_type,object_id);
    
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
        likes_count: item.likes_count || 0
      })) || [];
      setComments(formattedComments);
    } catch (err) {
      setError('Failed to load comments');
      console.error('Error fetching comments:', err);
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
      console.log("yes called .....",response);
      

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
        }, 300);
      }
    } catch (err) {
      setError('Failed to post comment');
      console.error('Error posting comment:',  err);
    } finally {
      setPosting(false);
    }
  };

  const toggleLike = async (commentId: number, item: any) => {
    console.log("item .....",item);
    
    try {
      const authToken = await AsyncStorage.getItem('accessToken');
      const updatedComments = comments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            is_liked: !comment.is_liked,
            likes_count: comment.is_liked ? (comment.likes_count || 0) - 1 : (comment.likes_count || 0) + 1
          };
        }
        return comment;
      });
      setComments(updatedComments);
      console.log("here comes ....",content_type,object_id);
      
     let like =  await axios.post(`https://pashuahar.com/like-toggle/`, {
        content_type, object_id
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      console.log("likes .....",like?.data);
      

    } 
    
    catch (err) {
      // Revert if API call fails
      fetchComments();
      console.error('Error toggling like:', err);
    }
  };

  const renderComment = ({ item }: { item: Comment }) => (
    <View style={styles.commentContainer}>
      <Image
        source={{ uri: 'https://i.imgur.com/dM8JY3A.jpg' }} // Default image or use user's profile picture if available
        style={styles.commentUserImage}
      />
      <View style={styles.commentContent}>
        <Text style={styles.commentUsername}>{item.user_name || 'user'}</Text>
        <Text style={styles.commentText}>{item.text}</Text>
        <View style={styles.commentFooter}>
          <Text style={styles.commentTime}>{formatTime(item.created_at)}</Text>
          <Text style={styles.commentLikes}>{item.likes_count || 0} likes</Text>
          <Text style={styles.commentReply}>Reply</Text>
        </View>
      </View>
      <TouchableOpacity onPress={() => toggleLike(item.id , item)} style={styles.likeButton}>
        <Icon
          name={item.is_liked ? "heart" : "heart-outline"}
          size={16}
          color={item.is_liked ? "#ff3040" : "#333"}
        />
      </TouchableOpacity>
    </View>
  );

  const formatTime = (timestamp: string) => {
    // Implement your time formatting logic here
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
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => {
            navigation.navigate('MainTab', {
              screen: 'SearchTab',
              params: {
                userId: undefined
              },
            });
                 
                  // navigation.navigate('UserProfile' as any, { userId: undefined });
          }} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Comments</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Content */}
        <ScrollView style={styles.contentContainer}>
          {/* Original Post Preview */}
          {media_url && (
            <View style={styles.postPreview}>
              <Image source={{ uri: media_url }} style={styles.postImage} />
              <View style={styles.postCaption}>
                <Text style={styles.captionUsername}>{username}</Text>
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
            <FlatList
              ref={flatListRef}
              data={comments}
              renderItem={renderComment}
              keyExtractor={item => item.id.toString()}
              scrollEnabled={false}
              ListEmptyComponent={
                <Text style={styles.emptyComments}>No comments yet</Text>
              }
            />
          )}
        </ScrollView>

        {/* Comment Input */}
        <View style={styles.inputContainer}>
          <Image
            source={{ uri: profile_picture || 'https://i.imgur.com/dM8JY3A.jpg' }}
            style={styles.userAvatar}
          />
          <TextInput
            style={styles.input}
            placeholder="Add a comment..."
            placeholderTextColor="#999"
            value={newComment}
            onChangeText={setNewComment}
            editable={!posting}
          />
          <TouchableOpacity 
            onPress={handlePostComment} 
            disabled={posting || !newComment.trim()}
            style={styles.postButton}
          >
            <Text style={[
              styles.postButtonText,
              { color: newComment.trim() ? '#3897f0' : '#c5e3fc' }
            ]}>
              {posting ? 'Posting...' : 'Post'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ... (keep the same styles as in the previous implementation)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerRight: {
    width: 24,
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
  commentUserImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentUsername: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  commentText: {
    marginBottom: 5,
    lineHeight: 20,
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
  likeButton: {
    padding: 5,
    alignSelf: 'flex-start',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
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
});
export default CommentScreen;