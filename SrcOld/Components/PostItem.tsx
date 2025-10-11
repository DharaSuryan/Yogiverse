import React, { useState } from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Post } from '../Types';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import CommentModal from './CommentModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PostItemProps {
  post: Post;
  onLike: (postId: string) => void;
  onComment: (postId: string, comment: string) => void;
  onShare: (postId: string) => void;
  onSave: (postId: string) => void;
  onLikeComment: (postId: string, commentId: string) => void;
}

const PostItem: React.FC<PostItemProps> = ({
  post,
  onLike,
  onComment,
  onShare,
  onSave,
  onLikeComment,
}) => {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [isSaved, setIsSaved] = useState(post.isSaved);
  const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike(post.id);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    onSave(post.id);
  };

  const handleComment = (comment: string) => {
    onComment(post.id, comment);
  };

  const handleLikeComment = (commentId: string) => {
    onLikeComment(post.id, commentId);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image
            source={{ uri: post.userProfilePicture }}
            style={styles.avatar}
          />
          <Text style={styles.username}>{post.username}</Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      <Image source={{ uri: post.image }} style={styles.postImage} />

      <View style={styles.actions}>
        <View style={styles.leftActions}>
          <TouchableOpacity onPress={handleLike} style={styles.actionButton}>
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={24}
              color={isLiked ? '#ed4956' : '#000'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setIsCommentModalVisible(true)}
            style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onShare(post.id)} style={styles.actionButton}>
            <Ionicons name="paper-plane-outline" size={24} color="#000" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={handleSave} style={styles.actionButton}>
          <Ionicons
            name={isSaved ? 'bookmark' : 'bookmark-outline'}
            size={24}
            color="#000"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.likes}>
        <Text style={styles.likesText}>
          {post.likes.toLocaleString()} likes
        </Text>
      </View>

      <View style={styles.caption}>
        <Text style={styles.captionText}>
          <Text style={styles.username}>{post.username}</Text> {post.caption}
        </Text>
      </View>

      {post.comments.length > 0 && (
        <TouchableOpacity
          onPress={() => setIsCommentModalVisible(true)}
          style={styles.comments}>
          <Text style={styles.commentsText}>
            View all {post.comments.length} comments
          </Text>
        </TouchableOpacity>
      )}

      <Text style={styles.timestamp}>{post.timestamp}</Text>

      <CommentModal
        visible={isCommentModalVisible}
        onClose={() => setIsCommentModalVisible(false)}
        postId={post.id}
        comments={post.comments}
        onAddComment={handleComment}
        onLikeComment={handleLikeComment}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  username: {
    fontWeight: '600',
    fontSize: 14,
  },
  postImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },
  leftActions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginRight: 15,
  },
  likes: {
    paddingHorizontal: 10,
  },
  likesText: {
    fontWeight: '600',
    fontSize: 14,
  },
  caption: {
    paddingHorizontal: 10,
    marginTop: 5,
  },
  captionText: {
    fontSize: 14,
  },
  comments: {
    paddingHorizontal: 10,
    marginTop: 5,
  },
  commentsText: {
    color: '#8e8e8e',
    fontSize: 14,
  },
  timestamp: {
    paddingHorizontal: 10,
    marginTop: 5,
    color: '#8e8e8e',
    fontSize: 12,
  },
});

export default PostItem; 