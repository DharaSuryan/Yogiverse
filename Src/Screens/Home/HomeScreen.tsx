import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList, CreatePostStackParamList } from '../../Navigation/types';
import ShareModal from '../../Components/ShareModal';
import CommentModal from '../../Components/CommentModal';
import { Comment, Post } from 'Src/Types';

type HomeNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'Home'>;
type CreatePostNavigationProp = NativeStackNavigationProp<CreatePostStackParamList, 'CreateStory'>;

const dummyStories = [
  { id: 'add', type: 'add' }, // Represents the "Add Story" button
  { id: '1', user: 'Your Story', avatar: require('../../Assets/yoga.jpg'), isYours: true },
  { id: '2', user: 'Jane Doe', avatar: require('../../Assets/yoga.jpg') },
  { id: '3', user: 'John Smith', avatar: require('../../Assets/yoga.jpg') },
  { id: '4', user: 'Alice', avatar: require('../../Assets/yoga.jpg') },
  { id: '5', user: 'Bob', avatar: require('../../Assets/yoga.jpg') },
];

const dummyPosts = [
  { id: '1', user: 'Jane Doe', avatar: require('../../Assets/yoga.jpg'), image: require('../../Assets/yoga.jpg'), caption: 'Beautiful sunset!', likes: 120, comments: 15 },
  { id: '2', user: 'John Smith', avatar: require('../../Assets/yoga.jpg'), image: require('../../Assets/yoga.jpg'), caption: 'Exploring the mountains.', likes: 230, comments: 30 },
];
const DUMMY_CURRENT_USER: User = {
  id: 'current_user_id',
  username: 'You',
  avatar: 'https://via.placeholder.com/40/FF5733/FFFFFF?text=YOU', // Replace with actual current user avatar
};

// Dummy comments data (you would fetch this from your API based on postId)
const DUMMY_COMMENTS_DATA: { [key: string]: Comment[] } = {
  'post1': [
    { id: 'c1-1', user: { id: 'u1', username: 'reader1', avatar: 'https://via.placeholder.com/40' }, text: 'Amazing!', timestamp: '2h' },
    { id: 'c1-2', user: { id: 'u2', username: 'fanboy', avatar: 'https://via.placeholder.com/40' }, text: 'Wow, great shot.', timestamp: '1h' },
  ],
  'post2': [
    { id: 'c2-1', user: { id: 'u3', username: 'traveler', avatar: 'https://via.placeholder.com/40' }, text: 'Jealous! Looks incredible.', timestamp: '4h' },
  ],
  'post3': [
    { id: 'c3-1', user: { id: 'u4', username: 'naturelover', avatar: 'https://via.placeholder.com/40' }, text: 'So serene.', timestamp: '1d' },
  ]
};
export default function HomeScreen() {
  const navigation = useNavigation<HomeNavigationProp>();
  const createPostNavigation = useNavigation<CreatePostNavigationProp>();
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isCommentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedPostForComments, setSelectedPostForComments] = useState<Post | null>(null);
  const [currentPostComments, setCurrentPostComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false); 
  const handleAddStory = () => {
    createPostNavigation.navigate('CreateStory');
  };

  const handleViewStory = (storyId: string) => {
    // Navigate to a StoryViewerScreen or similar
    navigation.navigate('StoryViewer', { storyId });
  };
 const handleShare = (post) => {
    setSelectedPost(post);
    setShareModalVisible(true);
  };
  const handleOpenCommentModal = async (post: Post) => {
    setSelectedPostForComments(post);
    setCommentModalVisible(true);
    setIsLoadingComments(true);
    setCurrentPostComments([]); // Clear previous comments

    // Simulate fetching comments from an API
    // In a real app, replace this with your actual API call to fetch comments for post.id
    console.log(`Fetching comments for post ID: ${post.id}`);
    setTimeout(() => {
      const comments = DUMMY_COMMENTS_DATA[post.id] || [];
      setCurrentPostComments(comments);
      setIsLoadingComments(false);
      console.log(`Comments loaded for ${post.id}:`, comments);
    }, 500); // Simulate network delay
  };

const handleCloseCommentModal = () => {
    setCommentModalVisible(false);
    setSelectedPostForComments(null); // Clear selected post when modal closes
    setCurrentPostComments([]); // Clear comments
  };

  const handleSubmitComment = async (postId: string, commentText: string) => {
    // In a real app, you'd send this to your backend API
    console.log(`Submitting comment "${commentText}" for post ${postId}`);
    try {
      // Example API call (replace with your actual API integration)
      // const response = await axios.post('/api/comments', { postId, text: commentText, userId: DUMMY_CURRENT_USER.id });
      // const newCommentFromServer = response.data; // Assuming your API returns the new comment

      // For demonstration, create a dummy new comment
      const newComment: Comment = {
        id: `c${Date.now()}`,
        user: DUMMY_CURRENT_USER,
        text: commentText,
        timestamp: 'just now',
      };

      // Update the state for the comments of the specific post
      setCurrentPostComments((prevComments) => [...prevComments, newComment]);
      // You might also need to update the commentsCount in dummyPosts if it's dynamic
      
      Alert.alert('Success', 'Comment posted!');
    } catch (error) {
      console.error('Failed to post comment:', error);
      Alert.alert('Error', 'Could not post comment. Please try again.');
    }
  };
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
           <Image source={require('../../Assets/Logo.png')} style={{ width: 100,
    height: 30, }} resizeMode='contain'/>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
            <Icon name="heart-outline" size={24} color="#bea063" style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => console.log('Messages')}>
            <Icon name="chatbubble-outline" size={24} color="#bea063" style={styles.icon} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stories Section */}
      <FlatList
        data={dummyStories}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.storyList}
        renderItem={({ item }) => (
          item.type === 'add' ? (
            <TouchableOpacity style={styles.addStoryButton} onPress={handleAddStory}>
              <Icon name="add" size={30} color="#fff" />
              <Text style={styles.addStoryText}>Add Story</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.storyItem} onPress={() => handleViewStory(item.id)}>
              <Image source={item.avatar} style={styles.storyAvatar} />
              <Text style={styles.storyUsername} numberOfLines={1}>{item.user}</Text>
            </TouchableOpacity>
          )
        )}
      />

      {/* Posts Section */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {dummyPosts.map(post => (
          <View key={post.id} style={styles.postCard}>
            <View style={styles.postHeader}>
              <Image source={post.avatar} style={styles.postAvatar} />
              <Text style={styles.postUsername}>{post.user}</Text>
              <TouchableOpacity style={styles.moreIcon}>
                <Icon name="ellipsis-vertical" size={20} color="#000" />
              </TouchableOpacity>
            </View>
            <Image source={post.image} style={styles.postImage} />
            <View style={styles.postActions}>
              <TouchableOpacity>
                <Icon name="heart-outline" size={24} style={styles.icon} />
              </TouchableOpacity>
                 <TouchableOpacity onPress={() => handleOpenCommentModal(post)}>
                <Icon name="chatbubble-outline" size={24} style={styles.icon} />
              </TouchableOpacity>
           <TouchableOpacity onPress={() => setShareModalVisible(true)}>
                <Icon name="paper-plane-outline" size={24} style={styles.icon} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.bookmarkIcon}>
                <Icon name="bookmark-outline" size={24} />
              </TouchableOpacity>
            </View>
            <View style={styles.postDetails}>
              <Text style={styles.likesText}>{post.likes} likes</Text>
              <Text style={styles.captionText}>
                <Text style={styles.postUsername}>{post.user}</Text> {post.caption}
              </Text>
              <TouchableOpacity>
                <Text style={styles.commentsText}>View all {post.comments} comments</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
      {selectedPostForComments && ( // Render only when a post is selected for comments
        <CommentModal
          isVisible={isCommentModalVisible}
          onClose={handleCloseCommentModal}
          comments={currentPostComments} // Pass the comments fetched for the selected post
          postId={selectedPostForComments.id}
          onSubmitComment={handleSubmitComment}
          currentUser={DUMMY_CURRENT_USER}
        />
      )}
      {/* Optional: Show a loading indicator if comments are being fetched */}
      {isLoadingComments && isCommentModalVisible && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0095f6" />
        </View>
      )}
      <ShareModal
        visible={shareModalVisible}
        onClose={() => setShareModalVisible(false)}
        post={selectedPost}
      />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#bea063',
  },
  logo: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  icon: {
    marginLeft: 15,
  },
  storyList: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  addStoryButton: {
    width: 70,
    height: 70,
    borderRadius: 40,
    backgroundColor: '#0095F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  addStoryText: {
    color: '#fff',
    fontSize: 12,
    // marginTop: 5,
  },
  storyItem: {
    alignItems: 'center',
    marginRight: 15,
  },
  storyAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: '#E1306C',
  },
  storyUsername: {
    fontSize: 12,
    marginTop: 5,
    color: '#000',
  },
  postCard: {
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  postAvatar: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    marginRight: 10,
  },
  postUsername: {
    fontWeight: 'bold',
  },
  moreIcon: {
    marginLeft: 'auto',
    padding: 5,
  },
  postImage: {
    width: '100%',
    height: 400,
    resizeMode: 'cover',
  },
  postActions: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
  },
  bookmarkIcon: {
    marginLeft: 'auto',
  },
  postDetails: {
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  likesText: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  captionText: {
    marginBottom: 5,
  },
  commentsText: {
    color: '#888',
  },
    loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});
