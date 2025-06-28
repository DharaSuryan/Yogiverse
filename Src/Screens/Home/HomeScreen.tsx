import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import Post from '../../Component/Post';
import ShareModal from '../../Components/ShareModal';
import { Post as PostType, Story } from 'Src/Types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { navigate } from '../../Component/Route';


const dummyStories = [
  { id: 'add', type: 'add' },
  { id: '1', user: 'Your Story', avatar: require('../../Assets/yoga.jpg'), isYours: true },
  { id: '2', user: 'Jane Doe', avatar: require('../../Assets/yoga.jpg') },
  { id: '3', user: 'John Smith', avatar: require('../../Assets/yoga.jpg') },
  { id: '4', user: 'Alice', avatar: require('../../Assets/yoga.jpg') },
  { id: '5', user: 'Bob', avatar: require('../../Assets/yoga.jpg') },
];

export default function HomeScreen() {
  const navigation = useNavigation();
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<PostType | null>(null);
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stories, setStories] = useState<Story[]>([]);


  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const authToken = await AsyncStorage.getItem('accessToken');
      const headers = {
        'Accept': 'application/json',
        'Authorization': `Bearer ${authToken}`
      };
      const res = await axios.get('https://pashuahar.com/home-feed/',{headers});
      // console.log("res .....",res?.data?.data?.results);
      
      setPosts(res.data?.data?.results|| []);
    } catch (err) {
      console.log("error .....",err);
      
      setError('Failed to load posts error');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPosts();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPosts().finally(() => setRefreshing(false));
  }, []);

  const handleShare = (post: PostType) => {
    setSelectedPost(post);
    setShareModalVisible(true);
  };

  const renderPost = ({ item }: { item: any }) => {
    console.log("here comes items .....",item?.data?.media);
    
    // New API: item.data = post, item.profile = user
    const post = item.data || {};
    const profile = item.profile || {};
    // For carousel, pass the whole media array
    let userAvatar = '';
    if (profile.profile_picture) {
      userAvatar = profile.profile_picture.startsWith('http')
        ? profile.profile_picture
        : `http://192.168.1.160:9001${profile.profile_picture}`;
    }
    if (!userAvatar) userAvatar = Image.resolveAssetSource(require('../../Assets/yoga.jpg')).uri;
    return (
      <Post
        id={post?.id?.toString()}
        username={profile.username || ''}
        media={post.media || []}
        caption={post.caption || ''}
        likes={post.like_count || 0}
        userAvatar={userAvatar}
        isLiked={post.is_liked || false}
        contentType={post.type || 'post'}
        navigation={navigation}
        allowComments={post.allow_comments !== false}
        commentCount={post.comment_count || 0}
        hideLikeCount={post.hide_like_count || false}
        location={post.location || ''}
        createdAt={post.created_at || ''}
        profile={profile}
        item={item}
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={require('../../Assets/Logo.png')} style={{ width: 100, height: 30 }} resizeMode='contain' />
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => 
            navigate('Notifications')


            }>
            // @ts-ignore
            <Icon name="heart-outline" size={24} color="#bea063" style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => console.log('Messages')}>
            // @ts-ignore
            <Icon name="chatbubble-outline" size={24} color="#bea063" style={styles.icon} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stories Section */}
      <FlatList
          data={[{ id: 'add', type: 'add' }, ...stories]}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.storyList}
          renderItem={({ item }) => {
            console.log("here comes item .....",item);
            if ('type' in item && item.type === 'add') {
              return (
                <TouchableOpacity style={styles.addStoryButton} onPress={() => navigation.navigate('StoryCreation')}>
                  {/* @ts-ignore */}
                  <Icon name="add" size={30} color="#fff" />
                  <Text style={styles.addStoryText}>Add Story</Text>
                </TouchableOpacity>
              );
            } else {
              const story = item as Story;
              // fallback for dummy data avatar
              const avatar = story.userProfilePicture || require('../../Assets/yoga.jpg');
              return (
                <TouchableOpacity style={styles.storyItem} onPress={() => navigation.navigate('StoryViewerScreen', { story })}>
                  <Image source={typeof avatar === 'string' ? { uri: avatar } : avatar} style={styles.storyAvatar} />
                  <Text style={styles.storyUsername} numberOfLines={1}>{story.username}</Text>
                </TouchableOpacity>
              );
            }
          }}
        />

      {/* Posts Section */}
      {loading ? (
        <ActivityIndicator size="large" style={{ flex: 1, marginTop: 40 }} />
      ) : error ? (
        <Text style={{ color: 'red', textAlign: 'center', marginTop: 40 }}>{error}</Text>
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={item => item.id?.toString()}
          refreshing={refreshing}
          onRefresh={onRefresh}
          showsVerticalScrollIndicator={false}
        />
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
    borderBottomWidth: 0.5,
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
  },
  storyItem: {
    alignItems: 'center',
    marginRight: 15,
  },
  storyAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: '#ac8a48',
  },
  storyUsername: {
    fontSize: 12,
    marginTop: 5,
    color: '#000',
  },
});
