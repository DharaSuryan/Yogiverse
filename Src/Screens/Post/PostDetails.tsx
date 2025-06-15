import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, FlatList, Dimensions } from 'react-native';
import { useNavigation, useRoute, RouteProp, CommonActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CreatePostStackParamList } from '../../Navigation/types';
import Icon from 'react-native-vector-icons/Ionicons';
import { useBackHandler } from '../../Utils/BackHandler';

type NavigationProp = NativeStackNavigationProp<CreatePostStackParamList>;
type PostDetailsRouteProp = RouteProp<CreatePostStackParamList, 'PostDetails'>;

const { width } = Dimensions.get('window');

export default function PostDetailsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<PostDetailsRouteProp>();
  const [caption, setCaption] = useState('');
  const { media } = route.params;
  const [comment, setComment] = useState('');
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showComments, setShowComments] = useState(true);

  // Add back handler
  useBackHandler(() => {
    handleGoBack();
    return true; // Prevent default back behavior
  });

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleShare = async () => {
    try {
      // Here you would typically upload the media and caption to your backend
      console.log('Sharing post with:', { media, caption });
      
      // Reset the navigation state and go back to the main tab
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            {
              name: 'MainTab',
              state: {
                routes: [{ name: 'HomeTab' }],
              },
            },
          ],
        })
      );
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  const handleLike = () => {
    setLiked(!liked);
    // Update likes count in your backend
  };

  const handleComment = () => {
    // Add comment to your backend
  };

  const handleSave = () => {
    setSaved(!saved);
    // Update saved status in your backend
  };

  // Sample post data
  const post = {
    id: route.params.postId,
    user: {
      id: '1',
      username: 'yoga_master',
      profileImage: 'https://picsum.photos/200',
      isVerified: true,
    },
    image: 'https://picsum.photos/500',
    caption: 'Morning yoga session 🌅 #yoga #wellness',
    likes: 1234,
    comments: [
      {
        id: '1',
        user: {
          username: 'yoga_lover',
          profileImage: 'https://picsum.photos/201',
        },
        text: 'Beautiful pose! 🙏',
        likes: 12,
        timestamp: '2h',
      },
      {
        id: '2',
        user: {
          username: 'meditation_guru',
          profileImage: 'https://picsum.photos/202',
        },
        text: 'This is so inspiring!',
        likes: 8,
        timestamp: '1h',
      },
    ],
    timestamp: '3h',
  };

  const renderComment = ({ item }) => (
    <View style={styles.commentContainer}>
      <Image source={{ uri: item.user.profileImage }} style={styles.commentUserImage} />
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentUsername}>{item.user.username}</Text>
          <Text style={styles.commentTimestamp}>{item.timestamp}</Text>
        </View>
        <Text style={styles.commentText}>{item.text}</Text>
        <View style={styles.commentActions}>
          <TouchableOpacity style={styles.commentAction}>
            <Text style={styles.commentActionText}>Like</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.commentAction}>
            <Text style={styles.commentActionText}>Reply</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Icon name="close" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Post</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <Text style={styles.shareButtonText}>Share</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.mediaPreview}>
          {media.map((item, index) => (
            <Image
              key={index}
              source={{ uri: item.uri }}
              style={styles.mediaImage}
            />
          ))}
        </View>

        <TextInput
          style={styles.captionInput}
          placeholder="Write a caption..."
          value={caption}
          onChangeText={setCaption}
          multiline
          maxLength={2200}
        />

        <View style={styles.postHeader}>
          <Image source={{ uri: post.user.profileImage }} style={styles.profileImage} />
          <View style={styles.userInfo}>
            <Text style={styles.username}>
              {post.user.username}
              {post.user.isVerified && (
                <Icon name="checkmark-circle" size={16} color="#0095f6" style={styles.verifiedIcon} />
              )}
            </Text>
            <Text style={styles.location}>Yoga Studio</Text>
          </View>
        </View>

        <Image source={{ uri: post.image }} style={styles.postImage} />

        <View style={styles.actions}>
          <View style={styles.leftActions}>
            <TouchableOpacity onPress={handleLike}>
              <Icon
                name={liked ? 'heart' : 'heart-outline'}
                size={28}
                color={liked ? '#ed4956' : '#000'}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowComments(!showComments)}>
              <Icon name="chatbubble-outline" size={24} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Icon name="paper-plane-outline" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={handleSave}>
            <Icon
              name={saved ? 'bookmark' : 'bookmark-outline'}
              size={24}
              color="#000"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.likesContainer}>
          <Text style={styles.likesText}>{post.likes.toLocaleString()} likes</Text>
        </View>

        <View style={styles.captionContainer}>
          <Text style={styles.caption}>
            <Text style={styles.username}>{post.user.username}</Text> {post.caption}
          </Text>
        </View>

        {showComments && (
          <View style={styles.commentsContainer}>
            <FlatList
              data={post.comments}
              renderItem={renderComment}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          </View>
        )}

        <Text style={styles.timestamp}>{post.timestamp}</Text>
      </ScrollView>

      <View style={styles.commentInputContainer}>
        <TextInput
          style={styles.commentInput}
          placeholder="Add a comment..."
          value={comment}
          onChangeText={setComment}
        />
        <TouchableOpacity
          style={[styles.postButton, !comment && styles.postButtonDisabled]}
          disabled={!comment}
        >
          <Text style={[styles.postButtonText, !comment && styles.postButtonTextDisabled]}>
            Post
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  shareButton: {
    padding: 8,
  },
  shareButtonText: {
    color: '#0095f6',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  mediaPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  mediaImage: {
    width: 100,
    height: 100,
    margin: 4,
  },
  captionInput: {
    padding: 16,
    fontSize: 16,
    minHeight: 100,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  profileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontWeight: '600',
    fontSize: 14,
  },
  verifiedIcon: {
    marginLeft: 4,
  },
  location: {
    fontSize: 12,
    color: '#666',
  },
  postImage: {
    width: width,
    height: width,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginRight: 16,
  },
  likesContainer: {
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  likesText: {
    fontWeight: '600',
    fontSize: 14,
  },
  captionContainer: {
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
  },
  commentsContainer: {
    paddingHorizontal: 12,
  },
  commentContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  commentUserImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentUsername: {
    fontWeight: '600',
    fontSize: 14,
    marginRight: 8,
  },
  commentTimestamp: {
    fontSize: 12,
    color: '#666',
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  commentActions: {
    flexDirection: 'row',
    marginTop: 4,
  },
  commentAction: {
    marginRight: 16,
  },
  commentActionText: {
    fontSize: 12,
    color: '#666',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  commentInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  postButton: {
    paddingHorizontal: 16,
  },
  postButtonDisabled: {
    opacity: 0.5,
  },
  postButtonText: {
    color: '#0095f6',
    fontWeight: '600',
  },
  postButtonTextDisabled: {
    color: '#666',
  },
}); 