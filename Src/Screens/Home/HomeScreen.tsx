import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import Post from '../../Component/Post';
import ShareModal from '../../Components/ShareModal';
import {Post as PostType, Story} from '../../Types/index';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getStories} from '../../Api/Api';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../Navigation/types';
import Video from 'react-native-video';

// Add dummyStories fallback at the top
// const dummyStories: (Partial<Story> | any)[] = [
//   { id: 'add', type: 'add' },
//   {
//     id: '1',
//     userId: '1',
//     username: 'Your Story',
//     userProfilePicture: 'https://via.placeholder.com/150/FF0000/FFFFFF?text=Your+Story',
//     mediaUrl: 'https://via.placeholder.com/400/FF0000/FFFFFF?text=Test+Image',
//     imageUrl: 'https://via.placeholder.com/400/FF0000/FFFFFF?text=Test+Image',
//     type: 'image',
//     timestamp: new Date().toISOString(),
//     duration: 5000,
//     viewers: [],
//     isViewed: false,
//     createdAt: new Date().toISOString(),
//     expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
//     user: {
//       username: 'Your Story',
//       email: 'your@story.com',
//       isVerified: false
//     }
//   },
//   {
//     id: '2',
//     userId: '2',
//     username: 'Jane Doe',
//     userProfilePicture: 'https://via.placeholder.com/150/00FF00/FFFFFF?text=Jane',
//     mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
//     imageUrl: 'https://via.placeholder.com/400/00FF00/FFFFFF?text=Video+Thumb',
//     type: 'video',
//     timestamp: new Date().toISOString(),
//     duration: 5000,
//     viewers: [],
//     isViewed: false,
//     createdAt: new Date().toISOString(),
//     expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
//     user: {
//       username: 'Jane Doe',
//       email: 'jane@example.com',
//       isVerified: false
//     }
//   },
//   {
//     id: '3',
//     userId: '3',
//     username: 'John Smith',
//     userProfilePicture: 'https://via.placeholder.com/150/0000FF/FFFFFF?text=John',
//     mediaUrl: 'https://via.placeholder.com/400/0000FF/FFFFFF?text=Another+Image',
//     imageUrl: 'https://via.placeholder.com/400/0000FF/FFFFFF?text=Another+Image',
//     type: 'image',
//     timestamp: new Date().toISOString(),
//     duration: 5000,
//     viewers: [],
//     isViewed: false,
//     createdAt: new Date().toISOString(),
//     expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
//     user: {
//       username: 'John Smith',
//       email: 'john@example.com',
//       isVerified: false
//     }
//   },
//   {
//     id: '4',
//     userId: '4',
//     username: 'Alice',
//     userProfilePicture: 'https://via.placeholder.com/150/FFFF00/000000?text=Alice',
//     mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
//     imageUrl: 'https://via.placeholder.com/400/FFFF00/000000?text=Video+Thumb+2',
//     type: 'video',
//     timestamp: new Date().toISOString(),
//     duration: 5000,
//     viewers: [],
//     isViewed: false,
//     createdAt: new Date().toISOString(),
//     expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
//     user: {
//       username: 'Alice',
//       email: 'alice@example.com',
//       isVerified: false
//     }
//   },
//   {
//     id: '5',
//     userId: '5',
//     username: 'Bob',
//     userProfilePicture: 'https://via.placeholder.com/150/FF00FF/FFFFFF?text=Bob',
//     mediaUrl: 'https://via.placeholder.com/400/FF00FF/FFFFFF?text=Bob+Image',
//     imageUrl: 'https://via.placeholder.com/400/FF00FF/FFFFFF?text=Bob+Image',
//     type: 'image',
//     timestamp: new Date().toISOString(),
//     duration: 5000,
//     viewers: [],
//     isViewed: false,
//     createdAt: new Date().toISOString(),
//     expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
//     user: {
//       username: 'Bob',
//       email: 'bob@example.com',
//       isVerified: false
//     }
//   },
// ];

export default function HomeScreen({navigation}: any) {
  // const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<PostType | null>(null);
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [storiesLoading, setStoriesLoading] = useState(true);
  const [storiesError, setStoriesError] = useState<string | null>(null);
  const [viewedStories, setViewedStories] = useState<Set<string>>(new Set());

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const authToken = await AsyncStorage.getItem('accessToken');
      const headers = {
        Accept: 'application/json',
        Authorization: `Bearer ${authToken}`,
      };
      const res = await axios.get('https://pashuahar.com/home-feed/', {
        headers,
      });
      console.log('res .....', res?.data?.data?.results);

      setPosts(res.data?.data?.results || []);
    } catch (err) {
      console.log('error .....comes ', err);

      setError('Failed to load posts error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStories = async () => {
    setStoriesLoading(true);
    setStoriesError(null);
    try {
      const res = await getStories();
      console.log('stores api data ---->>', JSON.stringify(res));
      const apiStories = res.data?.data || [];
      console.log(
        'API Stories structure:',
        JSON.stringify(apiStories, null, 2),
      );

      if (Array.isArray(apiStories) && apiStories.length > 0) {
        // Log the first story to see its structure
        if (apiStories[0]) {
          console.log(
            'First story structure:',
            JSON.stringify(apiStories[0], null, 2),
          );
          console.log('First story keys:', Object.keys(apiStories[0]));
        }

        // Map API response to Story interface
        const mappedStories = apiStories.map((apiStory: any) => ({
          id: apiStory.id.toString(),
          userId: apiStory.user.toString(),
          username: apiStory.profile?.username || 'Unknown User',
          userProfilePicture:
            apiStory.profile?.profile_picture ||
            'https://via.placeholder.com/150/CCCCCC/FFFFFF?text=User',
          mediaUrl: apiStory.media_file, // This is the key field for media
          imageUrl: apiStory.media_file, // Use same URL for imageUrl
          type: (apiStory.media_file?.toLowerCase().endsWith('.mp4')
            ? 'video'
            : 'image') as 'image' | 'video', // Determine type by file extension
          timestamp: apiStory.created_at,
          duration: 5000,
          viewers: [],
          isViewed: false,
          createdAt: apiStory.created_at,
          expiresAt: apiStory.expires_at,
          caption: apiStory.caption || '',
          location: '',
          user: {
            username: apiStory.profile?.username || 'Unknown User',
            email: apiStory.profile?.email || '',
            isVerified: false,
          },
        }));

        console.log('Mapped stories:', mappedStories);
        setStories(mappedStories);
      }
      // console.log("Using dummy stories as fallback");
      // setStories(dummyStories.slice(1) as Story[]); // skip 'add' for API fallback
    } catch (err) {
      console.log('Error fetching stories, using dummy data:', err);
      // setStories(dummyStories.slice(1) as Story[]); // skip 'add' for error fallback
      setStoriesError('Failed to load stories');
    } finally {
      setStoriesLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPosts();
      fetchStories();
    }, []),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPosts().finally(() => setRefreshing(false));
  }, []);

  const handleShare = (post: PostType) => {
    setSelectedPost(post);
    setShareModalVisible(true);
  };

  const handleStoryPress = (story: Story) => {
    // Mark story as viewed
    setViewedStories(prev => new Set([...prev, story.id]));
    // Navigate to story viewer
    navigation.navigate('StoryViewerScreen', {story});
  };

  // Helper function to get user initials
  const getUserInitials = (username: string): string => {
    if (!username) return '?';
    const words = username.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return username.substring(0, 2).toUpperCase();
  };

  // Helper function to render user avatar with fallback
  const renderUserAvatar = (story: Story) => {
    const avatar = story.userProfilePicture;
    const username = story.username;

    // If no avatar or avatar is null/empty, show initials placeholder
    if (!avatar || avatar === 'null' || avatar === '') {
      return (
        <View
          style={[
            styles.storyAvatar,
            styles.avatarPlaceholder,
            {borderColor: viewedStories.has(story.id) ? '#999' : '#bea063'},
          ]}>
          <Text style={styles.avatarInitials}>{getUserInitials(username)}</Text>
        </View>
      );
    }

    // Show image with fallback
    return (
      <Image
        source={{uri: avatar}}
        style={[
          styles.storyAvatar,
          {borderColor: viewedStories.has(story.id) ? '#999' : '#bea063'},
        ]}
        onError={() => {
          console.log('Profile image failed to load for:', username);
        }}
        defaultSource={require('../../Assets/yoga.jpg')}
      />
    );
  };

  const renderPost = ({item}: {item: any}) => {
    const post = item.data || {};
    const profile = item.profile || {};

    if (item.type === 'reel') {
      // Prepare media array for Post component
      const media = post.video_file
        ? [{media_file: post.video_file, is_video: true}]
        : [];

      return (
        <Post
          id={post.id?.toString()}
          username={profile.username || ''}
          media={media}
          caption={post.caption || ''}
          likes={post.like_count || 0}
          userAvatar={profile.profile_picture}
          isLiked={item.is_like || false}
          contentType={post.type || 'reel'}
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
    }

    // Default: render Post
    return (
      <Post
        id={post.id?.toString()}
        username={profile.username || ''}
        media={post.media || []}
        caption={post.caption || ''}
        likes={post.like_count || 0}
        userAvatar={profile.profile_picture}
        isLiked={item.is_like || false}
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
        {/* <Text style={styles.headerTitle}>Yogiverse</Text> */}
        <Image
          source={require('../../Assets/Logo.png')}
          style={{
            height: 36,
            width: 120,
            marginRight: 10,
          }}
          resizeMode="contain"
        />

        <View style={styles.headerIcons}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Notifications' as never)}>
            {React.createElement(Icon as any, {
              name: 'heart-outline',
              size: 24,
              color: '#bea063',
              style: styles.icon,
            })}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => console.log('Messages')}>
            {React.createElement(Icon as any, {
              name: 'chatbubble-outline',
              size: 24,
              color: '#bea063',
              style: styles.icon,
            })}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView>
        {/* Stories Section */}
        {storiesLoading ? (
          <ActivityIndicator size="small" style={{marginVertical: 20}} />
        ) : storiesError ? (
          <Text style={{color: 'red', textAlign: 'center', marginVertical: 20}}>
            {storiesError}
          </Text>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.storyList}>
            {/* Add Story Button */}
            <TouchableOpacity
              style={styles.addStoryButton}
              onPress={() => navigation.navigate('StoryCreation')}>
              {React.createElement(Icon as any, {
                name: 'add',
                size: 30,
                color: '#bea063',
              })}
              <Text style={styles.addStoryText}>Add Story</Text>
            </TouchableOpacity>

            {/* Stories */}
            {stories.map(story => {
              console.log('here comes story .....', story);
              const isVideo =
                story.type === 'video' ||
                story.mediaUrl?.toLowerCase().endsWith('.mp4');

              return (
                <TouchableOpacity
                  key={story.id}
                  style={styles.storyItem}
                  onPress={() => handleStoryPress(story)}>
                  <View style={styles.storyAvatarContainer}>
                    {renderUserAvatar(story)}
                    {/* Story type indicator */}
                    {isVideo && (
                      <View style={styles.videoIndicator}>
                        {React.createElement(Icon as any, {
                          name: 'videocam',
                          size: 12,
                          color: '#bea063',
                        })}
                      </View>
                    )}
                    {/* Story preview overlay */}
                    <View
                      style={[
                        styles.storyPreviewOverlay,
                        {
                          borderColor: viewedStories.has(story.id)
                            ? '#999'
                            : '#bea063',
                        },
                      ]}>
                      <View style={styles.storyPreviewInner} />
                    </View>
                  </View>
                  <Text style={styles.storyUsername} numberOfLines={1}>
                    {story.username}
                  </Text>
                  {/* Story caption preview */}
                  {story.caption && (
                    <Text style={styles.storyCaption} numberOfLines={1}>
                      {story.caption}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* Posts Section */}
        {loading ? (
          <ActivityIndicator size="large" style={{flex: 1, marginTop: 40}} />
        ) : error ? (
          <Text style={{color: 'red', textAlign: 'center', marginTop: 40}}>
            {error}
          </Text>
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
      </ScrollView>
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
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#dbdbdb',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#bea063',
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
    borderBottomWidth: 0.5,
    borderBottomColor: '#dbdbdb',
    backgroundColor: '#fff',
  },
  addStoryButton: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#fafafa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderColor: '#dbdbdb',
    borderWidth: 1,
  },
  addStoryText: {
    color: '#262626',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  storyItem: {
    alignItems: 'center',
    marginRight: 12,
    width: 62,
  },
  storyAvatarContainer: {
    position: 'relative',
    marginBottom: 5,
  },
  storyAvatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 2,
    borderColor: '#bea063',
    backgroundColor: '#f0f0f0',
  },
  videoIndicator: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#E1306C',
    borderRadius: 10,
    padding: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  storyPreviewOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 31,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderWidth: 2,
    borderColor: '#bea063',
  },
  storyPreviewInner: {
    flex: 1,
    borderRadius: 29,
    backgroundColor: 'transparent',
  },
  storyUsername: {
    fontSize: 10,
    marginTop: 4,
    color: '#262626',
    fontWeight: '400',
    textAlign: 'center',
    width: '100%',
  },
  storyCaption: {
    fontSize: 9,
    color: '#8e8e93',
    marginTop: 1,
    textAlign: 'center',
    width: '100%',
  },
  avatarPlaceholder: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // This will push the save icon to the right
    padding: 10,
  },
});
