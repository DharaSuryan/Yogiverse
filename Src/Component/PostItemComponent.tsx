import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

interface Post {
  id: string;
  user: string;
  image: any;
  caption: string;
  liked: boolean;
  saved: boolean;
  comments: Array<{
    id: string;
    user: string;
    text: string;
    timestamp: string;
    likes: number;
    isLiked: boolean;
  }>;
}

interface PostItemProps {
  post: Post;
  onLike: () => void;
  onSave: () => void;
  onComment: (post: Post) => void;
}

const PostItem: React.FC<PostItemProps> = ({ post, onLike, onSave, onComment }) => {
  return (
    <View style={styles.postContainer}>
      <View style={styles.postHeader}>
        <View style={styles.postUser}>
          <Image
            source={{ uri: 'https://picsum.photos/100/100' }}
            style={styles.postUserAvatar}
          />
          <Text style={styles.postUsername}>{post.user}</Text>
        </View>
        <TouchableOpacity>
          <Icon name="ellipsis-horizontal" size={24} color="#262626" />
        </TouchableOpacity>
      </View>

      <Image source={post.image} style={styles.postImage} />

      <View style={styles.postActions}>
        <View style={styles.postLeftActions}>
          <TouchableOpacity onPress={onLike}>
            <Icon
              name={post.liked ? 'heart' : 'heart-outline'}
              size={28}
              color={post.liked ? '#FF3B30' : '#262626'}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onComment(post)}>
            <Icon name="chatbubble-outline" size={24} color="#262626" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Icon name="paper-plane-outline" size={24} color="#262626" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={onSave}>
          <Icon
            name={post.saved ? 'bookmark' : 'bookmark-outline'}
            size={24}
            color="#262626"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.postStats}>
        <Text style={styles.likesCount}>
          {post.liked ? '1 like' : '0 likes'}
        </Text>
        <View style={styles.caption}>
          <Text style={styles.captionUsername}>{post.user}</Text>
          <Text>{post.caption}</Text>
        </View>
        {post.comments.length > 0 && (
          <TouchableOpacity 
            style={styles.viewComments}
            onPress={() => onComment(post)}>
            <Text style={styles.viewCommentsText}>
              View all {post.comments.length} comments
            </Text>
          </TouchableOpacity>
        )}
        {post.comments.length > 0 && (
          <View style={styles.latestComment}>
            <Text style={styles.commentUsername}>
              {post.comments[0].user}
            </Text>
            <Text style={styles.commentText}>
              {post.comments[0].text}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  postContainer: {
    marginBottom: 10,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
  },
  postUser: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postUserAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  postUsername: {
    fontWeight: '600',
    fontSize: 14,
  },
  postImage: {
    width: '100%',
    height: width,
    resizeMode: 'cover',
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },
  postLeftActions: {
    flexDirection: 'row',
    gap: 15,
  },
  postStats: {
    padding: 10,
  },
  likesCount: {
    fontWeight: '600',
    marginBottom: 5,
  },
  caption: {
    flexDirection: 'row',
  },
  captionUsername: {
    fontWeight: '600',
    marginRight: 5,
  },
  viewComments: {
    marginTop: 8,
  },
  viewCommentsText: {
    color: '#8e8e8e',
    fontSize: 14,
  },
  latestComment: {
    flexDirection: 'row',
    marginTop: 4,
    flexWrap: 'wrap',
  },
  commentUsername: {
    fontWeight: '600',
    marginRight: 4,
  },
  commentText: {
    flex: 1,
  },
});

export default PostItem;
