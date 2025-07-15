import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert, ScrollView } from 'react-native';
import axios from 'axios';
import Post from '../../Component/Post';
import ShareModal from '../../Components/ShareModal';
import { Post as PostType, Story } from '../../Types/index';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStories, getProfile, followUser, unfollowUser } from '../../Api/Api';
import OptionsBottomSheet from '../../Components/OptionsBottomSheet';

const Ionicons = require('react-native-vector-icons/Ionicons').default;

export default function HomeScreen({ navigation, showOptionsModal = false }: any) {
  // const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<PostType | null>(null);
  const [posts, setPosts] = useState<PostType[]>([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true); // isLast = !hasNextPage
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false); // loadMore
  const [refreshing, setRefreshing] = useState(false);
  const pageSize = 10;
  const [error, setError] = useState<string | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [storiesLoading, setStoriesLoading] = useState(true);
  const [storiesError, setStoriesError] = useState<string | null>(null);
  const [viewedStories, setViewedStories] = useState<Set<string>>(new Set());
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserAvatar, setCurrentUserAvatar] = useState<string | null>(null);
  const [userid,setUserId] = useState();
  const [myStories, setMyStories] = useState<Story[]>([]);
  const [allStories, setAllStories] = useState<Story[]>([]);
  const onEndReachedCalledDuringMomentum = useRef(false);
  const [optionsModalVisible, setOptionsModalVisible] = useState(showOptionsModal);
  const [optionsPost, setOptionsPost] = useState<any>(null);

  useEffect(() => {
    getData()
  }, []);

  // Fetch posts and stories only after userid is set
  useEffect(() => {
    if (userid) {
      fetchPosts(1, false); // Always fetch first page when userid is set
      fetchStories();
    }
  }, [userid]);

  useEffect(() => {
    if (showOptionsModal) setOptionsModalVisible(true);
  }, [showOptionsModal]);

  const getData = async () => {

    await AsyncStorage.getItem('userId').then(setCurrentUserId);
    // Fetch profile picture
    await getProfile().then(profileRes => {
      const profilePic = profileRes?.data?.data?.profile?.profile_picture
      console.log("profile pix...." , profileRes?.data?.data?.profile?.id);
      setUserId(profileRes?.data?.data?.profile?.id)
      
      setCurrentUserAvatar(profilePic || 'https://via.placeholder.com/150/CCCCCC/FFFFFF?text=User');
    });
  }

  const fetchPosts = async (pageToFetch = 1, isRefresh = false) => {
    if (loading || loadingMore || refreshing) return;
    if (pageToFetch > 1 && !hasNextPage) return;

    if (isRefresh) {
      setRefreshing(true);
      setPage(1);
      setHasNextPage(true);
    } else if (pageToFetch === 1) {
      setLoading(true);
      setPage(1);
      setHasNextPage(true);
    } else {
      setLoadingMore(true);
    }

    setError(null);
    try {
      const authToken = await AsyncStorage.getItem('accessToken');
      const headers = {
        'Accept': 'application/json',
        'Authorization': `Bearer ${authToken}`
      };
      const res = await axios.get(`https://pashuahar.com/home-feed/?page=${pageToFetch}&page_size=${pageSize}`, { headers });
      const newPosts = res.data?.data?.results || [];
      console.log("new posts .....", newPosts);
      
      if (isRefresh || pageToFetch === 1) {
        setPosts(newPosts);
        setPage(1);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
        setPage(pageToFetch);
      }
      setHasNextPage(newPosts.length === pageSize);
    } catch (err) {
      setError('Failed to load posts');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  const fetchStories = async () => {
    setStoriesLoading(true);
    setStoriesError(null);
    try {
      const res = await getStories();
      const apiStories = res.data?.data || [];
      console.log("useriduseriduserid",userid);
      
      console.log("api res .....", apiStories);
      
      // Split stories into personal and others
      const myStoriesArr = apiStories.filter((apiStory: any) => String(apiStory.profile?.id) === String(userid)).map((apiStory: any) => ({
        id: apiStory.id.toString(),
        userId: apiStory.user?.toString?.() || apiStory.profile?.id?.toString?.() || '',
        username: apiStory.profile?.username || 'Unknown User',
        userProfilePicture: apiStory.profile?.profile_picture || 'https://via.placeholder.com/150/CCCCCC/FFFFFF?text=User',
        mediaUrl: apiStory.media_file,
        imageUrl: apiStory.media_file,
        type: (apiStory.media_file?.toLowerCase().endsWith('.mp4') ? 'video' : 'image') as 'image' | 'video',
        timestamp: apiStory.created_at,
        duration: 5000,
        viewers: [],
        isViewed: !apiStory.is_seen ? false : true,
        createdAt: apiStory.created_at,
        expiresAt: apiStory.expires_at,
        caption: apiStory.caption || '',
        location: '',
        user: {
          username: apiStory.profile?.username || 'Unknown User',
          email: apiStory.profile?.email || '',
          isVerified: false
        }
      }));
      setMyStories(myStoriesArr);
      const othersArr = apiStories.filter((apiStory: any) => String(apiStory.profile?.id) !== String(userid)).map((apiStory: any) => ({
        id: apiStory.id.toString(),
        userId: apiStory.user?.toString?.() || apiStory.profile?.id?.toString?.() || '',
        username: apiStory.profile?.username || 'Unknown User',
        userProfilePicture: apiStory.profile?.profile_picture || 'https://via.placeholder.com/150/CCCCCC/FFFFFF?text=User',
        mediaUrl: apiStory.media_file,
        imageUrl: apiStory.media_file,
        type: (apiStory.media_file?.toLowerCase().endsWith('.mp4') ? 'video' : 'image') as 'image' | 'video',
        timestamp: apiStory.created_at,
        duration: 5000,
        viewers: [],
        isViewed: !apiStory.is_seen ? false : true,
        createdAt: apiStory.created_at,
        expiresAt: apiStory.expires_at,
        caption: apiStory.caption || '',
        location: '',
        user: {
          username: apiStory.profile?.username || 'Unknown User',
          email: apiStory.profile?.email || '',
          isVerified: false
        }
      }));
      setAllStories(othersArr);
    } catch (err) {
      setMyStories([]);
      setAllStories([]);
      setStoriesError('Failed to load stories');
    } finally {
      setStoriesLoading(false);
    }
  };

  const onRefresh = () => {
    fetchPosts(1, true);
  };

  const onEndReached = () => {
    // Only load more if enough posts, not last page, and not already loading
    if (
      posts.length >= pageSize &&
      hasNextPage &&
      !loadingMore &&
      !loading &&
      !refreshing
    ) {
      fetchPosts(page + 1);
    }
  };


  // Helper function to get user initials

  // Helper function to render user avatar with fallback

  const renderPost = ({ item }: { item: any }) => {
    console.log("item.is_collectionitem.is_collection",item);
    
    const post = item.data || {};
    const profile = item.profile || {};

    // Determine avatar
    let userAvatar = profile.profile_picture;
    const showDefaultIcon = !userAvatar || userAvatar === 'null' || userAvatar === '' || userAvatar.includes('placeholder.com');

    // Prepare avatar element

    if (item.type === 'reel') {
      // Prepare media array for Post component
      const media = post.video_file
        ? [{ media_file: post.video_file, is_video: true }]
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
          is_collection={item.is_collection}
          collection_id={item.collection_id}
          type={item.type}
          onOptions={() => {
            setOptionsPost(item);
            setOptionsModalVisible(true);
          }}
        />
      );
    }
    {}

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
        is_collection={item.is_collection}
        collection_id={item.collection_id}
        type={item.type}
        onOptions={() => {
          setOptionsPost(item);
          setOptionsModalVisible(true);
        }}
      />
    );
  };

  console.log('currentUserId:', currentUserId);
  console.log('stories:', stories);

  // Group allStories by user
  const groupedStories = allStories.reduce((acc: any, story: any) => {
    const userId = story.userId;
    if (!acc[userId]) acc[userId] = [];
    acc[userId].push(story);
    return acc;
  }, {});
  const groupedStoriesArray = Object.values(groupedStories);

  const renderStoryCircle = (userStories: any[]) => {
    const firstStory = userStories[0];
    // Use isViewed (or is_seen) to determine border color
    const hasUnseen = userStories.some(s => !s.isViewed && !s.is_seen);
    const avatar = firstStory.userProfilePicture || '';
    const username = firstStory.username || 'Unknown';
    const showDefaultIcon = !avatar || avatar === 'null' || avatar === '' || avatar.includes('placeholder.com');
    if (showDefaultIcon) {
      console.log('Rendering default icon for', username, avatar);
    }
    return (
      <View style={{ alignItems: 'center', marginRight: 12 }} key={firstStory.userId || firstStory.username}>
        <TouchableOpacity
          style={{ position: 'relative' }}
          onPress={() => {
            // Open StoryViewerScreen with all stories for this user
            navigation.navigate('StoryViewerScreen', {
              stories: userStories,
              initialIndex: 0,
              isPersonal: String(firstStory.userId) === String(currentUserId),
            });
          }}
          activeOpacity={0.7}
        >
          {showDefaultIcon ? (
            <View
              style={{
                width: 62,
                height: 62,
                borderRadius: 31,
                borderWidth: 2,
                borderColor: hasUnseen ? '#bea063' : '#999',
                backgroundColor: '#f5f5f5',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden',
              }}
            >
              <Ionicons name="person-circle" size={48} color="#bea063" style={{}} />
            </View>
          ) : (
            <Image
              source={{ uri: avatar }}
              style={{
                width: 62,
                height: 62,
                borderRadius: 31,
                borderWidth: 2,
                borderColor: hasUnseen ? '#bea063' : '#999',
              }}
            />
          )}
        </TouchableOpacity>
        <Text style={styles.storyUsername} numberOfLines={1}>{username}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
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
          <TouchableOpacity onPress={() => navigation.navigate('Notifications' as never)}>
            <Ionicons name="notifications-outline" size={24} color="#bea063" style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('ChatListScreen')}>
            <Ionicons name="chatbubble-outline" size={24} color="#bea063" style={styles.icon} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stories Section as FlatList ListHeaderComponent */}
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={item => item.id?.toString()}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onEndReached={() => {
          if (
            !onEndReachedCalledDuringMomentum.current &&
            posts.length >= pageSize &&
            hasNextPage &&
            !loadingMore &&
            !loading &&
            !refreshing
          ) {
            fetchPosts(page + 1);
            onEndReachedCalledDuringMomentum.current = true;
          }
        }}
        onEndReachedThreshold={0.5}
        onMomentumScrollBegin={() => {
          onEndReachedCalledDuringMomentum.current = false;
        }}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={loadingMore ? <ActivityIndicator size="small" color="#bea063" style={{ marginVertical: 16 }} /> : null}
        ListHeaderComponent={
          storiesLoading ? (
            <ActivityIndicator size="small" style={{ marginVertical: 20 }} />
          ) : storiesError ? (
            <Text style={{ color: 'red', textAlign: 'center', marginVertical: 20 }}>{storiesError}</Text>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.storyList}
            >
              {/* My Story Avatar with Add Icon */}
              <View style={{ alignItems: 'center', marginRight: 12 }}>
                <TouchableOpacity
                  style={{ position: 'relative' }}
                  onPress={() => {
                    if (myStories.length > 0) {
                      navigation.navigate('StoryViewerScreen', {
                        stories: myStories,
                        initialIndex: 0,
                        isPersonal: true
                      });
                    } else {
                      Alert.alert('No Story', 'You have not added a story yet.');
                    }
                  }}
                  activeOpacity={0.7}
                >
                  {(!currentUserAvatar || currentUserAvatar === 'null' || currentUserAvatar.includes('placeholder.com')) ? (
                    <View style={{
                      width: 62,
                      height: 62,
                      borderRadius: 31,
                      borderWidth: 2,
                      borderColor: '#bea063',
                      backgroundColor: '#f5f5f5',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                      <Ionicons name="person-circle" size={48} color="#bea063" />
                    </View>
                  ) : (
                    <Image
                      source={{ uri: currentUserAvatar }}
                      style={{
                        width: 62,
                        height: 62,
                        borderRadius: 31,
                        borderWidth: 2,
                        borderColor: '#bea063',
                      }}
                    />
                  )}
                  {/* Add Icon Overlay */}
                  <TouchableOpacity
                    style={{
                      position: 'absolute',
                      bottom: -2,
                      right: -2,
                      backgroundColor: '#fff',
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor: '#bea063',
                      width: 24,
                      height: 24,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                    onPress={() => navigation.navigate('StoryUpload')}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="add" size={16} color="#bea063" />
                  </TouchableOpacity>
                </TouchableOpacity>
                <Text style={styles.storyUsername} numberOfLines={1}>Your Story</Text>
              </View>
              {/* Other users' stories */}
              {(allStories.length > 0 ? Object.values(allStories.reduce((acc: any, story: any) => {
                const userId = story.userId;
                if (!acc[userId]) acc[userId] = [];
                acc[userId].push(story);
                return acc;
              }, {})) : []).map((userStories) => renderStoryCircle(userStories as any[]))}
            </ScrollView>
          )
        }
        ListEmptyComponent={loading ? <ActivityIndicator size="large" style={{ flex: 1, marginTop: 40 }} /> : error ? <Text style={{ color: 'red', textAlign: 'center', marginTop: 40 }}>{error}</Text> : null}
      />
      <ShareModal
        visible={shareModalVisible}
        onClose={() => setShareModalVisible(false)}
        post={selectedPost}
      />
      {/* Options Modal */}
      <OptionsBottomSheet
        visible={optionsModalVisible}
        onClose={() => setOptionsModalVisible(false)}
        navigation={navigation}
        onReport={() => {
          setOptionsModalVisible(false);
          navigation.navigate('ContactUs');
        }}
        onSave={() => {
          setOptionsModalVisible(false);
          // Optionally, trigger save logic for optionsPost
        }}
        onRemix={() => {
          setOptionsModalVisible(false);
          Alert.alert('Remix', 'Remix functionality coming soon!');
        }}
        onCutout={() => {
          setOptionsModalVisible(false);
          Alert.alert('Cutout', 'Cutout sticker functionality coming soon!');
        }}
        onFavourite={() => {
          setOptionsModalVisible(false);
          Alert.alert('Favourites', 'Add to Favourites coming soon!');
        }}
        {...(optionsPost?.is_following
          ? { onUnfollow: async () => {
                setOptionsModalVisible(false);
                try {
                  await unfollowUser(optionsPost?.profile?.id?.toString());
                  Alert.alert('Success', 'You have unfollowed this user.');
                } catch (e) {
                  Alert.alert('Error', 'Failed to unfollow user.');
                }
              } }
          : { onFollow: async () => {
                setOptionsModalVisible(false);
                try {
                  await followUser(optionsPost?.profile?.id?.toString());
                  Alert.alert('Success', 'You are now following this user.');
                } catch (e) {
                  Alert.alert('Error', 'Failed to follow user.');
                }
              } })}
        onAbout={() => {
          // navigation.navigate('UserProfile', { userId: optionsPost?.profile?.id?.toString(), isFromSearch: true, isFromHome: true });
        }}
        onQRCode={() => {
          setOptionsModalVisible(false);
          Alert.alert('QR Code', 'QR code functionality coming soon!');
        }}
        onWhy={() => {
          setOptionsModalVisible(false);
          Alert.alert('Why', 'Why you\'re seeing this post coming soon!');
        }}
        onHide={() => {
          setOptionsModalVisible(false);
          Alert.alert('Hide', 'Hide functionality coming soon!');
        }}
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
    shadowOffset: { width: 0, height: 1 },
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
});