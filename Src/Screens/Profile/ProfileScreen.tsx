import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Dimensions,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
const Ionicons = require('react-native-vector-icons/Ionicons').default;
import Video from 'react-native-video';
import Post from '../../Component/Post';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { getProfile, getUserPosts, getUserReels } from '../../Api/Api';
import { Image as Compressor } from 'react-native-compressor';

const { width } = Dimensions.get('window');
const NUM_COLUMNS = 3;
const ITEM_SIZE = width / NUM_COLUMNS;

interface Post {
  id: string;
  type: 'image' | 'reel';
  uri: string;
  compressedUri?: string;
  likes: number;
  comments: number;
  caption?: string;
  location?: string;
  createdAt?: string;
  collection_id?: number;
  mediaCount?: number; // Number of media files in this post
  isLiked?: boolean;
}

const ProfileScreen = () => {
  const [activeTab, setActiveTab] = useState<'posts' | 'reels' | 'saved'>('posts');
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    username: '',
    fullName: '',
    bio: '',
    profileImage: 'https://picsum.photos/200',
    postsCount: 0,
    followersCount: 0,
    followingCount: 0
  });

  // Real data from API
  const [posts, setPosts] = useState<Post[]>([]);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]); // For saved tab
  const [savedLoading, setSavedLoading] = useState(false);
  const [savedError, setSavedError] = useState<string | null>(null);

  const [fullscreenVisible, setFullscreenVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [videoLoading, setVideoLoading] = useState(false);
  const [currentFullscreenIndex, setCurrentFullscreenIndex] = useState(0);
  const [shouldPauseAllVideos, setShouldPauseAllVideos] = useState(false);
  const fullscreenFlatListRef = useRef<FlatList>(null);

  // Individual video controls state
  const [videoStates, setVideoStates] = useState<{ [key: string]: { isPlaying: boolean; isMuted: boolean } }>({});
  const [videoRefs, setVideoRefs] = useState<{ [key: string]: any }>({});

  // Post functionality state
  const [postStates, setPostStates] = useState<{ [key: string]: { isLiked: boolean; likesCount: number; likeLoading: boolean } }>({});
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Simple swipe-to-close using ScrollView drag
  const dragOffsetY = useRef(0);
  const handleScroll = (event: any) => {
    dragOffsetY.current = event.nativeEvent.contentOffset.y;
  };
  const handleScrollEndDrag = () => {
    if (dragOffsetY.current < -100) {
      setFullscreenVisible(false);
    }
  };

  // FlatList viewability config for reels autoplay
  const viewabilityConfig = { viewAreaCoveragePercentThreshold: 80 };
  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: any }) => {
    if (viewableItems && viewableItems.length > 0) {
      const newIndex = viewableItems[0].index ?? 0;
      setCurrentFullscreenIndex(newIndex);
      
      // Handle video playback based on currently visible item
      if (fullscreenVisible) {
        const currentItem = filteredPosts[newIndex];
        if (currentItem && currentItem.type === 'reel') {
          pauseAllVideosExcept(currentItem.id);
          playCurrentVideo(currentItem.id);
        }
      }
    }
  }).current;

  useEffect(() => {
    if (fullscreenVisible && fullscreenFlatListRef.current) {
      setTimeout(() => {
        fullscreenFlatListRef.current?.scrollToIndex({ index: selectedIndex, animated: false });
        setCurrentFullscreenIndex(selectedIndex);
        setShouldPauseAllVideos(false);
        
        // Play the selected video and pause others
        const selectedItem = filteredPosts[selectedIndex];
        if (selectedItem && selectedItem.type === 'reel') {
          pauseAllVideosExcept(selectedItem.id);
          playCurrentVideo(selectedItem.id);
        }
      }, 0);
    }
  }, [fullscreenVisible, selectedIndex]);

  // Pause all videos when modal is closed
  useEffect(() => {
    if (!fullscreenVisible) {
      setShouldPauseAllVideos(true);
      // Pause all videos when modal closes
      setVideoStates(prev => {
        const newStates = { ...prev };
        Object.keys(newStates).forEach(itemId => {
          newStates[itemId] = {
            ...newStates[itemId],
            isPlaying: false
          };
        });
        return newStates;
      });
    }
  }, [fullscreenVisible]);

  // Pause all videos when switching tabs - Fixed to prevent infinite loop
  useEffect(() => {
    if (activeTab !== 'reels') {
      setShouldPauseAllVideos(true);
    }
  }, [activeTab]);

  // Reset video controls when switching to reels tab
  useEffect(() => {
    if (activeTab === 'reels') {
      setShouldPauseAllVideos(false);
    }
  }, [activeTab]);

  const handleShare = (post: any) => {
    // Implement your share logic here
    Alert.alert('Share', 'Share functionality coming soon!');
  };

  const handleLike = async (post: any) => {
    const postId = post.id;
    const currentState = postStates[postId] || { isLiked: false, likesCount: post.likes, likeLoading: false };
    
    if (currentState.likeLoading) return;
    
    setPostStates(prev => ({
      ...prev,
      [postId]: { ...currentState, likeLoading: true }
    }));

    try {
      const authToken = await AsyncStorage.getItem('accessToken');
      const headers = {
        'Accept': 'application/json',
        'Authorization': `Bearer ${authToken}`
      };
      
      await axios.post('https://pashuahar.com/like-toggle/', {
        content_type: post.type === "reel" ? "reel" : "post",
        object_id: post.id,
      }, { headers});
      
      // Update the post state
      setPostStates(prev => ({
        ...prev,
        [postId]: {
          isLiked: !currentState.isLiked,
          likesCount: currentState.isLiked ? currentState.likesCount - 1 : currentState.likesCount + 1,
          likeLoading: false
        }
      }));

      // Also update the posts array
      setPosts(prevPosts => 
        prevPosts.map(p => 
          p.id === postId 
            ? { ...p, likes: currentState.isLiked ? p.likes - 1 : p.likes + 1, isLiked: !currentState.isLiked }
            : p
        )
      );
    } catch (error) {
      console.error('Error toggling like:', error);
      Alert.alert('Error', 'Failed to update like.');
      
      // Revert the state on error
      setPostStates(prev => ({
        ...prev,
        [postId]: { ...currentState, likeLoading: false }
      }));
    }
  };

  const handleComment = (post: any) => {
    navigation.navigate('CommentScreen', {
      content_type: post.type === 'reel' ? 'reel' : 'post',
      object_id: post.id,
    });
  };

  const handleOptions = (post: any) => {
    setSelectedPost(post);
    setOptionsVisible(true);
  };

  const handleDelete = async () => {
    if (!selectedPost) return;
    setDeleteLoading(true);
    try {
      const authToken = await AsyncStorage.getItem('accessToken');
      const headers = {
        'Accept': 'application/json',
        'Authorization': `Bearer ${authToken}`
      };
      const collectionId = selectedPost.collection_id || 1;
      const postId = selectedPost.id;
      await axios.delete(`https://pashuahar.com/collections/${collectionId}/post/${postId}/`, { headers });
      setPosts(posts.filter(p => p.id !== postId));
      setOptionsVisible(false);
      setSelectedPost(null);
      Alert.alert('Deleted', 'Post deleted successfully.');
    } catch (err) {
      Alert.alert('Error', 'Failed to delete post.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEdit = () => {
    setOptionsVisible(false);
    Alert.alert('Edit', 'Edit functionality coming soon!');
  };

  const navigation = useNavigation<any>();

  // Video control functions
  const toggleMute = (itemId: string) => {
    setVideoStates(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        isMuted: !prev[itemId].isMuted
      }
    }));
  };

  const togglePlayPause = (itemId: string) => {
    setVideoStates(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        isPlaying: !prev[itemId].isPlaying
      }
    }));
  };

  const handleVideoRef = (videoRef: any, itemId: string) => {
    if (videoRef && !videoRefs[itemId]) {
      setVideoRefs(prev => ({
        ...prev,
        [itemId]: videoRef
      }));
      
      // Initialize video state if not exists
      if (!videoStates[itemId]) {
        setVideoStates(prev => ({
          ...prev,
          [itemId]: {
            isPlaying: false,
            isMuted: true
          }
        }));
      }
    }
  };

  // Initialize video states for all videos
  const initializeVideoStates = (mediaItems: Post[]) => {
    const newVideoStates: { [key: string]: { isPlaying: boolean; isMuted: boolean } } = {};
    mediaItems.forEach(item => {
      if (item.type === 'reel') {
        newVideoStates[item.id] = {
          isPlaying: false,
          isMuted: true
        };
      }
    });
    setVideoStates(newVideoStates);
  };

  // Pause all videos except the current one
  const pauseAllVideosExcept = (currentItemId: string) => {
    setVideoStates(prev => {
      const newStates = { ...prev };
      Object.keys(newStates).forEach(itemId => {
        if (itemId !== currentItemId) {
          newStates[itemId] = {
            ...newStates[itemId],
            isPlaying: false
          };
        }
      });
      return newStates;
    });
  };

  // Play only the current video in fullscreen
  const playCurrentVideo = (itemId: string) => {
    setVideoStates(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        isPlaying: true
      }
    }));
  };

  const playVideo = (itemId: string) => {
    const videoRef = videoRefs[itemId];
    if (videoRef && !videoStates[itemId].isPlaying) {
      videoRef.seek(0);
      setVideoStates(prev => ({
        ...prev,
        [itemId]: {
          ...prev[itemId],
          isPlaying: true
        }
      }));
    }
  };

  const pauseVideo = (itemId: string) => {
    if (videoStates[itemId].isPlaying) {
      setVideoStates(prev => ({
        ...prev,
        [itemId]: {
          ...prev[itemId],
          isPlaying: false
        }
      }));
    }
  };

  // Compress image function
  const compressImage = async (imageUri: string): Promise<string> => {
    try {
      const result = await Compressor.compress(imageUri, {
        quality: 0.8,
        maxWidth: 800,
        maxHeight: 800,
      });
      return result;
    } catch (error) {
      console.error('Image compression failed:', error);
      return imageUri; // Return original if compression fails
    }
  };

  // Process media data with compression and multiple media detection
  const processMediaData = async (mediaData: any[], type: 'image' | 'reel'): Promise<Post[]> => {
    const processedPosts: Post[] = [];
    
    for (const item of mediaData) {
      try {
        let mediaFiles: string[] = [];
        
        if (type === 'image') {
          // For posts, check if there are multiple media files
          if (item.media && Array.isArray(item.media)) {
            mediaFiles = item.media.map((media: any) => media.media_file).filter(Boolean);
          } else if (item.media_file) {
            mediaFiles = [item.media_file];
          }
        } else {
          // For reels, use video_file
          if (item.video_file) {
            mediaFiles = [item.video_file];
          }
        }

        if (mediaFiles.length > 0) {
          // Compress the first image for thumbnail (only for images, not videos)
          let compressedUri = mediaFiles[0];
          if (type === 'image') {
            compressedUri = await compressImage(mediaFiles[0]);
          }

          const post: Post = {
            id: item.id?.toString() || '',
            type: type,
            uri: mediaFiles[0], // Original URI for fullscreen
            compressedUri: compressedUri, // Compressed URI for grid
            likes: item.like_count || 0,
            comments: item.comment_count || 0,
            caption: item.caption || '',
            location: item.location || '',
            createdAt: item.created_at || '',
            collection_id: item.collection_id || 1,
            mediaCount: mediaFiles.length > 1 ? mediaFiles.length : undefined
          };
          
          processedPosts.push(post);
        }
      } catch (error) {
        console.error('Error processing media item:', error);
      }
    }
    
    return processedPosts;
  };

  // Fetch followers and following counts
  const fetchFollowersCount = async () => {
    try {
      const authToken = await AsyncStorage.getItem('accessToken');
      const headers = {
        'Accept': 'application/json',
        'Authorization': `Bearer ${authToken}`
      };
      const res = await axios.get('https://pashuahar.com/follower/followers', { headers });
      // Assume response: { data: { count: number } }
      return res.data?.data?.count || 0;
    } catch (err) {
      return 0;
    }
  };

  const fetchFollowingCount = async () => {
    try {
      const authToken = await AsyncStorage.getItem('accessToken');
      const headers = {
        'Accept': 'application/json',
        'Authorization': `Bearer ${authToken}`
      };
      const res = await axios.get('https://pashuahar.com/follower/following', { headers });
      // Assume response: { data: { count: number } }
      return res.data?.data?.count || 0;
    } catch (err) {
      return 0;
    }
  };

  // Fetch profile and posts data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch profile data
      const profileResponse = await getProfile();
      console.log("profileResponse",profileResponse.data?.data?.results);
      
      let followersCount = 0;
      let followingCount = 0;
      // Fetch followers/following counts in parallel
      [followersCount, followingCount] = await Promise.all([
        fetchFollowersCount(),
        fetchFollowingCount()
      ]);
      console.log("followersCount",followersCount);
      
      if (profileResponse.data) {
        const profileData = profileResponse.data.data?.profile;
        // console.log("profileDataprofileData",profileData);
        
        setProfile({
          username: profileData.username || 'jk',
          fullName: `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() || 'Jay Chhaniyara',
          bio: profileData.bio || 'Its Boy Jk',
          profileImage: profileData.profile_picture || 'https://picsum.photos/200',
          postsCount: profileData.posts_count || 7,
          followersCount,
          followingCount
        });
      }

      // Fetch posts data
      const postsResponse = await getUserPosts();
      // console.log("postsResponse",postsResponse?.data?.data?.results);
      
      // Fetch reels data
      const reelsResponse = await getUserReels();
      // console.log("reelsResponse",reelsResponse.data.data.results);
      
      let allMedia: Post[] = [];
      
      // Transform posts data with compression and multiple media detection
      if (postsResponse.data) {
        const postsData = postsResponse.data.data.results;
        const processedPosts = await processMediaData(postsData, 'image');
        allMedia = [...allMedia, ...processedPosts];
      }
      
      // Transform reels data with compression and multiple media detection
      if (reelsResponse.data) {
        const reelsData = reelsResponse.data.data.results;
        const processedReels = await processMediaData(reelsData, 'reel');
        allMedia = [...allMedia, ...processedReels];
      }
      
      console.log("allMedia........",allMedia);
      setPosts(allMedia);
      
      // Initialize video states for all reels
      initializeVideoStates(allMedia);

      // Initialize post states when posts are loaded
      initializePostStates(allMedia);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch saved posts for the Saved tab
  const fetchSavedPosts = async () => {
    setSavedLoading(true);
    setSavedError(null);
    try {
      const authToken = await AsyncStorage.getItem('accessToken');
      const headers = {
        'Accept': 'application/json',
        'Authorization': `Bearer ${authToken}`
      };
      const res = await axios.get('https://pashuahar.com/collections', { headers });
      console.log("savedPosts",res.data);
      // Assume response structure is similar to posts/reels
      const savedData = res.data?.data?.results || [];
      // Reuse processMediaData to transform
      const processedSaved = await processMediaData(savedData, 'image');
      setSavedPosts(processedSaved);
      // Optionally: initialize post states for saved posts
      initializePostStates(processedSaved);
    } catch (err) {
      console.log("errerrerr",err);
      
      setSavedError('Failed to load saved posts');
    } finally {
      setSavedLoading(false);
    }
  };

  // Fetch saved posts when switching to Saved tab
  useEffect(() => {
    if (activeTab === 'saved' && savedPosts.length === 0 && !savedLoading) {
      fetchSavedPosts();
    }
  }, [activeTab]);

  // Use correct posts for the current tab
  const filteredPosts = activeTab === 'saved' ? savedPosts : posts.filter(post => {
    if (activeTab === 'posts') return post.type === 'image';
    if (activeTab === 'reels') return post.type === 'reel';
    return true;
  });

  const renderPostItem = ({ item, index }: { item: any, index: number }) => {
    const isReel = item.type === 'reel';
    const shouldShowVideoControls = isReel && activeTab === 'reels';
    const videoState = videoStates[item.id] || { isPlaying: false, isMuted: true };
    
    return (
      <TouchableOpacity
        style={styles.postItem}
        onPress={() => {
          setSelectedIndex(index);
          setFullscreenVisible(true);
        }}
        activeOpacity={0.9}
      >
        {/* Main media display - use compressed image for better performance */}
        {!isReel ? (
          <Image 
            source={{ uri: item.compressedUri || item.uri }} 
            style={styles.postImage} 
          />
        ) : (
          <View style={styles.videoContainer}>
            <Video 
              ref={(ref) => handleVideoRef(ref, item.id)}
              source={{ uri: item.uri }} 
              style={styles.postImage} 
              muted={videoState.isMuted}
              repeat 
              resizeMode="cover" 
              paused={!videoState.isPlaying || shouldPauseAllVideos}
              onLoad={() => setVideoLoading(false)}
              onError={() => setVideoLoading(false)}
            />
            
            {/* Video controls overlay - only show when on reels tab */}
            {shouldShowVideoControls && (
              <View style={styles.videoControls}>
                {/* <TouchableOpacity 
                  style={styles.videoControlButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    togglePlayPause(item.id);
                  }}
                >
                  <Ionicons 
                    name={videoState.isPlaying ? "pause" : "play"} 
                    size={20} 
                    color="#fff" 
                  />
                </TouchableOpacity> */}
                
                {/* <TouchableOpacity 
                  style={styles.videoControlButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    toggleMute(item.id);
                  }}
                >
                  <Ionicons 
                    name={videoState.isMuted ? "volume-mute" : "volume-high"} 
                    size={20} 
                    color="#fff" 
                  />
                </TouchableOpacity> */}
              </View>
            )}
          </View>
        )}

        {/* Multiple media indicator */}
        {item.mediaCount && item.mediaCount > 1 && (
          <View style={styles.multipleMediaIndicator}>
            <Ionicons name="copy-outline" size={16} color="#fff" />
            <Text style={styles.multipleMediaText}>{item.mediaCount}</Text>
          </View>
        )}

        {/* Top-right options icon */}
        {/* <TouchableOpacity
          style={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}
          onPress={() => handleOptions(item)}
        >
          <Ionicons name="ellipsis-vertical" size={20} color="#fff" />
        </TouchableOpacity> */}

        {/* Like/comment counts overlay */}
        {/* <View style={styles.postOverlay}>
          <View style={styles.postStat}>
            <Ionicons name="heart" size={14} color="#fff" />
            <Text style={styles.postStatText}>{item.likes}</Text>
          </View>
          <View style={styles.postStat}>
            <Ionicons name="chatbubble" size={14} color="#fff" />
            <Text style={styles.postStatText}>{item.comments}</Text>
          </View>
          <View style={styles.postStat}>
            <TouchableOpacity onPress={() => handleShare(item)}>
              <Ionicons name="paper-plane-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View> */}
      </TouchableOpacity>
    );
  };

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{profile.postsCount}</Text>
        <Text style={styles.statLabel}>Posts</Text>
      </View>
      <TouchableOpacity
        style={styles.statItem}
        onPress={() => navigation.navigate('FollowersFollowingScreen', {
          type: 'followers',
          userId: '1',
          username: profile.username,
        })}
      >
        <Text style={styles.statNumber}>{profile.followersCount}</Text>
        <Text style={styles.statLabel}>Followers</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.statItem}
        onPress={() => navigation.navigate('FollowersFollowingScreen', {
          type: 'following',
          userId: '1',
          username: profile.username,
        })}
      >
        <Text style={styles.statNumber}>{profile.followingCount}</Text>
        <Text style={styles.statLabel}>Following</Text>
      </TouchableOpacity>
    </View>
  );

  const renderProfileHeader = () => (
    <View style={styles.profileHeader}>
      <Image source={{ uri: profile.profileImage }} style={styles.profileImage} />
      {renderStats()}
    </View>
  );

  const renderBio = () => (
    <View style={styles.bioContainer}>
      <Text style={styles.username}>@{profile.username}</Text>
      <Text style={styles.fullName}>{profile.fullName}</Text>
      <Text style={styles.bioText}>{profile.bio}</Text>
    </View>
  );

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      <TouchableOpacity
        style={[styles.tabButton, activeTab === 'posts' && styles.activeTab]}
        onPress={() => setActiveTab('posts')}
      >
        <Ionicons name="grid-outline" size={24} color={activeTab === 'posts' ? '#000' : '#888'} />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tabButton, activeTab === 'reels' && styles.activeTab]}
        onPress={() => setActiveTab('reels')}
      >
        <Ionicons name="play-outline" size={24} color={activeTab === 'reels' ? '#000' : '#888'} />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tabButton, activeTab === 'saved' && styles.activeTab]}
        onPress={() => setActiveTab('saved')}
      >
        <Ionicons name="bookmark-outline" size={24} color={activeTab === 'saved' ? '#000' : '#888'} />
      </TouchableOpacity>
    </View>
  );

  const renderFullscreenItem = ({ item, index }: { item: any, index: number }) => {
    const windowHeight = Dimensions.get('window').height;
    const windowWidth = Dimensions.get('window').width;
    const videoState = videoStates[item.id] || { isPlaying: false, isMuted: true };
    const isCurrentVideo = currentFullscreenIndex === index;
    const isReel = item.type === 'reel';
    const postState = postStates[item.id] || { isLiked: false, likesCount: item.likes, likeLoading: false };
    // Mock liked by data for demo
    const likedBy = 'rutvik_d_jagatiya3721';
    const likedByOthers = true;
    const pageIndicator = item.mediaCount && item.mediaCount > 1 ? `${index + 1}/${item.mediaCount}` : null;

    return (
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        {/* Top bar */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 40, paddingBottom: 10, paddingHorizontal: 10, backgroundColor: '#111', justifyContent: 'space-between' }}>
          {/* <TouchableOpacity onPress={() => setFullscreenVisible(false)}>
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity> */}
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>Posts</Text>
          {/* <TouchableOpacity onPress={() => handleOptions(item)}>
            <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
          </TouchableOpacity> */}
        </View>

        {/* User info */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingBottom: 8 }}>
          <Image source={{ uri: profile.profileImage }} style={{ width: 36, height: 36, borderRadius: 18, marginRight: 10 }} />
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>{profile.username}</Text>
        </View>

        {/* Main media */}
        <View style={{ width: windowWidth, height: windowWidth, alignSelf: 'center', backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
          {item.type === 'image' ? (
            <Image
              source={{ uri: item.uri }}
              style={{ width: windowWidth, height: windowWidth, resizeMode: 'cover', backgroundColor: '#000' }}
            />
          ) : (
            <View style={{ width: windowWidth, height: windowWidth }}>
              {videoLoading && (
                <ActivityIndicator 
                  size="large" 
                  color="#fff" 
                  style={{ position: 'absolute', alignSelf: 'center', top: '45%' }} 
                />
              )}
              <Video
                ref={(ref) => handleVideoRef(ref, item.id)}
                source={{ uri: item.uri }}
                style={{ width: '100%', height: '100%', backgroundColor: '#000' }}
                muted={videoState.isMuted}
                repeat
                resizeMode="cover"
                paused={!videoState.isPlaying || !isCurrentVideo}
                onLoadStart={() => setVideoLoading(true)}
                onLoad={() => setVideoLoading(false)}
                onError={() => setVideoLoading(false)}
              />
              {/* Video controls overlay */}
              {isReel && (
                <View style={styles.fullscreenVideoControls}>
                  <View style={styles.fullscreenControlRow}>
                    <TouchableOpacity 
                      style={styles.fullscreenControlButton}
                      onPress={() => togglePlayPause(item.id)}
                    >
                      <Ionicons 
                        name={videoState.isPlaying ? "pause" : "play"} 
                        size={30} 
                        color="#fff" 
                      />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.fullscreenControlButton}
                      onPress={() => toggleMute(item.id)}
                    >
                      <Ionicons 
                        name={videoState.isMuted ? "volume-mute" : "volume-high"} 
                        size={30} 
                        color="#fff" 
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          )}
          {/* Page indicator */}
          {pageIndicator && (
            <View style={{ position: 'absolute', bottom: 10, right: 16, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2 }}>
              <Text style={{ color: '#fff', fontSize: 13 }}>{pageIndicator}</Text>
            </View>
          )}
        </View>

        {/* Like/comment counts row (interactive) */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, marginTop: 12, marginBottom: 2 }}>
          <TouchableOpacity onPress={() => handleLike(item)} disabled={postState.likeLoading} style={{ flexDirection: 'row', alignItems: 'center' }}>
            {postState.likeLoading ? (
              <ActivityIndicator size={20} color="#FF3B30" />
            ) : (
              <Ionicons name={postState.isLiked ? 'heart' : 'heart-outline'} size={22} color={postState.isLiked ? '#FF3B30' : '#fff'} />
            )}
            <Text style={{ color: '#fff', fontSize: 15, marginLeft: 6, marginRight: 18 }}>{postState.likesCount || item.likes}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleComment(item)} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="chatbubble-outline" size={20} color="#fff" />
            <Text style={{ color: '#fff', fontSize: 15, marginLeft: 6 }}>{item.comments}</Text>
          </TouchableOpacity>
        </View>

        {/* Username, caption, emojis */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, marginBottom: 2, flexWrap: 'wrap' }}>
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }}>{profile.username}</Text>
          {item.caption ? <Text style={{ color: '#fff', fontSize: 14, marginLeft: 6 }}>{item.caption}</Text> : null}
        </View>

        {/* Date */}
        {item.createdAt && (
          <Text style={{ color: '#aaa', fontSize: 13, paddingHorizontal: 14, marginTop: 2 }}>
            {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Text>
        )}
      </View>
    );
  };

  // Initialize post states when posts are loaded
  const initializePostStates = (mediaItems: Post[]) => {
    const newPostStates: { [key: string]: { isLiked: boolean; likesCount: number; likeLoading: boolean } } = {};
    mediaItems.forEach(item => {
      newPostStates[item.id] = {
        isLiked: item.isLiked || false,
        likesCount: item.likes,
        likeLoading: false
      };
    });
    setPostStates(newPostStates);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Fullscreen Modal */}
      <Modal
        visible={fullscreenVisible}
        animationType="slide"
        onRequestClose={() => setFullscreenVisible(false)}
        transparent={false}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
          <TouchableOpacity
            style={{ position: 'absolute', top: 40, right: 20, zIndex: 1 }}
            onPress={() => setFullscreenVisible(false)}
          >
            <Ionicons name="close" size={30} color="#fff" />
          </TouchableOpacity>
          {filteredPosts.length === 0 ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: '#fff', fontSize: 18 }}>No posts to display</Text>
            </View>
          ) : (
            <FlatList
              ref={fullscreenFlatListRef}
              data={filteredPosts}
              renderItem={renderFullscreenItem}
              keyExtractor={item => item.id}
              pagingEnabled
              initialScrollIndex={selectedIndex}
              getItemLayout={(data, index) => (
                { length: Dimensions.get('window').height, offset: Dimensions.get('window').height * index, index }
              )}
              showsVerticalScrollIndicator={false}
              viewabilityConfig={viewabilityConfig}
              onViewableItemsChanged={onViewableItemsChanged}
              initialNumToRender={3}
              windowSize={5}
            />
          )}
        </SafeAreaView>
      </Modal>
      {/* Main Profile Content */}
      <ScrollView>
        {renderProfileHeader()}
        {renderBio()}
        
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton}>
            <Ionicons name="share-outline" size={20} color="#000" />
          </TouchableOpacity>
        </View>

        {renderTabBar()}

        <FlatList
          data={filteredPosts}
          renderItem={renderPostItem}
          keyExtractor={item => item.id}
          numColumns={NUM_COLUMNS}
          scrollEnabled={false}
          contentContainerStyle={styles.postsGrid}
        />
      </ScrollView>

      <Modal
        visible={optionsVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setOptionsVisible(false)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }}
          activeOpacity={1}
          onPressOut={() => setOptionsVisible(false)}
        >
          <View style={{ backgroundColor: '#fff', borderRadius: 10, padding: 20, minWidth: 180 }}>
            <TouchableOpacity onPress={handleEdit} style={{ paddingVertical: 10 }}>
              <Text style={{ fontSize: 16 }}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={{ paddingVertical: 10, flexDirection: 'row', alignItems: 'center' }}>
              {deleteLoading ? <ActivityIndicator size={18} color="#E74C3C" style={{ marginRight: 8 }} /> : null}
              <Text style={{ fontSize: 16, color: '#E74C3C' }}>Delete</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 20,
  },
  statsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  bioContainer: {
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  fullName: {
    fontSize: 16,
    marginTop: 2,
  },
  bioText: {
    fontSize: 14,
    color: '#333',
    marginTop: 5,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  editButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 8,
    alignItems: 'center',
    marginRight: 10,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  shareButton: {
    width: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#000',
  },
  postsGrid: {
    padding: 1,
  },
  postItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    margin: 0.5,
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  multipleMediaIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 3,
  },
  multipleMediaText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  reelIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: 4,
  },
  postOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 5,
  },
  postStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postStatText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 4,
  },
  videoContainer: {
    position: 'relative',
  },
  videoControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  videoControlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenVideoControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  fullscreenControlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  fullscreenControlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  fullscreenProfileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  fullscreenUsername: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  fullscreenPostActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
  fullscreenActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  fullscreenActionButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenLikesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 10,
  },
  fullscreenLikesText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  fullscreenCaptionContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  fullscreenCaptionUsername: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#fff',
    marginRight: 5,
  },
  fullscreenCaptionText: {
    fontSize: 14,
    color: '#fff',
    flex: 1,
  },
  fullscreenCommentsButton: {
    padding: 10,
  },
  fullscreenCommentsText: {
    fontSize: 14,
    color: '#ccc',
  },
  fullscreenDateText: {
    fontSize: 12,
    color: '#999',
    paddingHorizontal: 10,
  },
});

export default ProfileScreen;