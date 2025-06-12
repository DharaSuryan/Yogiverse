import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList, CreatePostStackParamList } from '../../Navigation/types';

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

export default function HomeScreen() {
  const navigation = useNavigation<HomeNavigationProp>();
  const createPostNavigation = useNavigation<CreatePostNavigationProp>();

  const handleAddStory = () => {
    createPostNavigation.navigate('CreateStory');
  };

  const handleViewStory = (storyId: string) => {
    // Navigate to a StoryViewerScreen or similar
    navigation.navigate('StoryViewer', { storyId });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>Yogiverse</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => console.log('Notifications')}>
            <Icon name="heart-outline" size={24} style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => console.log('Messages')}>
            <Icon name="chatbubble-outline" size={24} style={styles.icon} />
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
              <TouchableOpacity>
                <Icon name="chatbubble-outline" size={24} style={styles.icon} />
              </TouchableOpacity>
              <TouchableOpacity>
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
    borderBottomColor: '#eee',
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
});
