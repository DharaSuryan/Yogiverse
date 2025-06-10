import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../Store/store';
import { fetchPosts } from '../../Store/slices/postSlice';
import { fetchStoriesStart, fetchStoriesSuccess, fetchStoriesFailure } from '../../Store/slices/storySlice';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../Navigation/types';
import Ionicons from 'react-native-vector-icons/Ionicons';
import StoryItem from '../../Components/StoryItem';
import PostItem from '../../Components/PostItem';
import StoryList from '../../Components/StoryList';
import { Post } from '../../Types';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<HomeStackParamList, 'HomeScreen'>;
};

const { width } = Dimensions.get('window');

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch();
  const { posts, loading } = useSelector((state: RootState) => state.posts);
  const stories = useSelector((state: RootState) => state.stories.stories);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = () => {
    dispatch(fetchPosts());
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadPosts();
    setRefreshing(false);
  };

  const handleLike = (postId: string) => {
    // Handle like action
    console.log('Like post:', postId);
  };

  const handleComment = (postId: string, comment: string) => {
    // Handle comment action
    console.log('Comment on post:', postId, comment);
  };

  const handleShare = (postId: string) => {
    // Handle share action
    console.log('Share post:', postId);
  };

  const handleSave = (postId: string) => {
    // Handle save action
    console.log('Save post:', postId);
  };

  const handleLikeComment = (postId: string, commentId: string) => {
    // Handle like comment action
    console.log('Like comment:', postId, commentId);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Yogiverse</Text>
      <View style={styles.headerIcons}>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="heart-outline" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="chatbubble-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStories = () => (
    <View style={styles.storiesContainer}>
      <FlatList
        data={stories}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <StoryItem
            story={item}
            onPress={() => navigation.navigate('StoryViewer', { stories, initialIndex: stories.indexOf(item) })}
          />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.storiesList}
      />
    </View>
  );

  const renderItem = ({ item }: { item: Post }) => (
    <PostItem
      post={item}
      onLike={handleLike}
      onComment={handleComment}
      onShare={handleShare}
      onSave={handleSave}
      onLikeComment={handleLikeComment}
    />
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ListHeaderComponent={
          <>
            {renderHeader()}
            <StoryList />
          </>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

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
    borderBottomColor: '#dbdbdb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color:'black'
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 15,
  },
  storiesContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#dbdbdb',
    paddingVertical: 10,
  },
  storiesList: {
    paddingHorizontal: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeScreen;
