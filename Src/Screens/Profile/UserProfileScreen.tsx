import React, {useEffect, useState, useRef} from 'react';
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
  TextInput,
} from 'react-native';
const Ionicons = require('react-native-vector-icons/Ionicons').default;
import Video from 'react-native-video';
import Post from '../../Component/Post';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {useNavigation, useFocusEffect, useRoute} from '@react-navigation/native';
import {getProfile, getUserPosts, getUserReels} from '../../Api/Api';
//  import { Image as Compressor } from 'react-native-compressor';

const {width} = Dimensions.get('window');
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
  isCollection?: boolean;
  collectionName?: string;
  allMedia?: string[]; // All media files for this post
}

const UserProfileScreen = () => {
  const [activeTab, setActiveTab] = useState<'posts' | 'reels' | 'saved'>(
    'posts',
  );
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    username: '',
    fullName: '',
    bio: '',
    profileImage: 'https://picsum.photos/200',
    postsCount: 0,
    followersCount: 0,
    followingCount: 0,
    id:''
  });
  const route = useRoute<any>();
  let { userId } = route?.params || {};
  let {isFromSearch} = route?.params || {};
  console.log("isFromSearch",isFromSearch);
  

// console.log("profile s state",profile.id);

  // Real data from API
  const [data , setData] = useState('')
  const [posts, setPosts] = useState<Post[]>([]);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]); // For saved tab
  const [collections, setCollections] = useState<any[]>([]); // For collections data
  const [savedLoading, setSavedLoading] = useState(false);
  const [savedError, setSavedError] = useState<string | null>(null);

  const [fullscreenVisible, setFullscreenVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [videoLoading, setVideoLoading] = useState(false);
  const [currentFullscreenIndex, setCurrentFullscreenIndex] = useState(0);
  const [shouldPauseAllVideos, setShouldPauseAllVideos] = useState(false);
  const fullscreenFlatListRef = useRef<FlatList>(null);

  // Individual video controls state
  const [videoStates, setVideoStates] = useState<{
    [key: string]: {isPlaying: boolean; isMuted: boolean};
  }>({});
  const [videoRefs, setVideoRefs] = useState<{[key: string]: any}>({});

  // Post functionality state
  const [postStates, setPostStates] = useState<{
    [key: string]: {isLiked: boolean; likesCount: number; likeLoading: boolean};
  }>({});
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Edit functionality state
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editCaption, setEditCaption] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  // Collection creation state
  const [createCollectionModalVisible, setCreateCollectionModalVisible] =
    useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [createCollectionLoading, setCreateCollectionLoading] = useState(false);

  // Fullscreen media state
  const [postMediaIndices, setPostMediaIndices] = useState<{
    [postId: string]: number;
  }>({});

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
  const viewabilityConfig = {viewAreaCoveragePercentThreshold: 80};
  const onViewableItemsChanged = useRef(
    ({viewableItems}: {viewableItems: any}) => {
      if (viewableItems && viewableItems.length > 0) {
        const newIndex = viewableItems[0].index ?? 0;
        setCurrentFullscreenIndex(newIndex);

        // Handle video playback based on currently visible item
        if (fullscreenVisible) {
          const currentItem = filteredPosts[newIndex];
          if (currentItem && currentItem.type === 'reel') {
            // Get the current media index for this post
            const mediaItems = currentItem.allMedia || [currentItem.uri];
            const currentMediaIndex = postMediaIndices[currentItem.id] || 0;
            const videoId =
              mediaItems.length > 1
                ? `${currentItem.id}-${currentMediaIndex}`
                : currentItem.id;

            pauseAllVideosExcept(videoId);
            playCurrentVideo(videoId);
          }
        }
      }
    },
  ).current;

  useEffect(() => {
    if (fullscreenVisible && fullscreenFlatListRef.current) {
      setTimeout(() => {
        fullscreenFlatListRef.current?.scrollToIndex({
          index: selectedIndex,
          animated: false,
        });
        setCurrentFullscreenIndex(selectedIndex);
        setShouldPauseAllVideos(false);

        // Play the selected video and pause others
        const selectedItem = filteredPosts[selectedIndex];
        if (selectedItem && selectedItem.type === 'reel') {
          // Get the current media index for this post
          const mediaItems = selectedItem.allMedia || [selectedItem.uri];
          const currentMediaIndex = postMediaIndices[selectedItem.id] || 0;
          const videoId =
            mediaItems.length > 1
              ? `${selectedItem.id}-${currentMediaIndex}`
              : selectedItem.id;

          pauseAllVideosExcept(videoId);
          playCurrentVideo(videoId);
        }
      }, 0);
    }
  }, [fullscreenVisible, selectedIndex]);

  // Pause all videos when modal is closed
  useEffect(() => {
    if (!fullscreenVisible) {
      setShouldPauseAllVideos(true);
      setPostMediaIndices({}); // Reset all post media indices when closing fullscreen
      // Pause all videos when modal closes
      setVideoStates(prev => {
        const newStates = {...prev};
        Object.keys(newStates).forEach(itemId => {
          newStates[itemId] = {
            ...newStates[itemId],
            isPlaying: false,
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
    const currentState = postStates[postId] || {
      isLiked: false,
      likesCount: post.likes,
      likeLoading: false,
    };

    if (currentState.likeLoading) return;

    setPostStates(prev => ({
      ...prev,
      [postId]: {...currentState, likeLoading: true},
    }));

    try {
      const authToken = await AsyncStorage.getItem('accessToken');
      const headers = {
        Accept: 'application/json',
        Authorization: `Bearer ${authToken}`,
      };

      await axios.post(
        'https://pashuahar.com/like-toggle/',
        {
          content_type: post.type === 'reel' ? 'reel' : 'post',
          object_id: post.id,
        },
        {headers},
      );

      // Update the post state
      setPostStates(prev => ({
        ...prev,
        [postId]: {
          isLiked: !currentState.isLiked,
          likesCount: currentState.isLiked
            ? currentState.likesCount - 1
            : currentState.likesCount + 1,
          likeLoading: false,
        },
      }));

      // Also update the posts array
      setPosts(prevPosts =>
        prevPosts.map(p =>
          p.id === postId
            ? {
                ...p,
                likes: currentState.isLiked ? p.likes - 1 : p.likes + 1,
                isLiked: !currentState.isLiked,
              }
            : p,
        ),
      );
    } catch (error) {
      console.error('Error toggling like:', error);
      Alert.alert('Error', 'Failed to update like.');

      // Revert the state on error
      setPostStates(prev => ({
        ...prev,
        [postId]: {...currentState, likeLoading: false},
      }));
    }
  };

  const handleComment = (post: any) => {
    // Close fullscreen modal before navigating to comment screen
    setFullscreenVisible(false);

    // Small delay to ensure modal is closed before navigation
    setTimeout(() => {
      navigation.navigate('CommentScreen', {
        content_type: post.type === 'reel' ? 'reel' : 'post',
        object_id: post.id,
      });
    }, 100);
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
        Accept: 'application/json',
        Authorization: `Bearer ${authToken}`,
      };

      const postId = selectedPost.id;
      let deleteUrl = '';

      // Use different API endpoints based on post type
      if (selectedPost.type === 'reel') {
        deleteUrl = `https://pashuahar.com/reels/${postId}/`;
      } else {
        deleteUrl = `https://pashuahar.com/posts/${postId}/`;
      }

      await axios.delete(deleteUrl, {headers});

      // Remove from posts array
      setPosts(prevPosts => prevPosts.filter(p => p.id !== postId));

      // Also remove from saved posts if it's there
      setSavedPosts(prevSaved => prevSaved.filter(p => p.id !== postId));

      setOptionsVisible(false);
      setSelectedPost(null);
      Alert.alert(
        'Deleted',
        `${
          selectedPost.type === 'reel' ? 'Reel' : 'Post'
        } deleted successfully.`,
      );
    } catch (err) {
      console.error('Error deleting post:', err);
      Alert.alert(
        'Error',
        `Failed to delete ${selectedPost?.type === 'reel' ? 'reel' : 'post'}.`,
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEdit = () => {
    if (!selectedPost) return;

    // Set the current caption for editing
    setEditCaption(selectedPost.caption || '');
    setEditModalVisible(true);
    setOptionsVisible(false);
  };

  const handleEditSubmit = async () => {
    if (!selectedPost) return;

    setEditLoading(true);
    try {
      const authToken = await AsyncStorage.getItem('accessToken');
      const headers = {
        Accept: 'application/json',
        Authorization: `Bearer ${authToken}`,
      };

      const postId = selectedPost.id;
      let editUrl = '';

      // Use different API endpoints based on post type
      if (selectedPost.type === 'reel') {
        editUrl = `https://pashuahar.com/reels/${postId}/`;
      } else {
        editUrl = `https://pashuahar.com/posts/${postId}/`;
      }

      await axios.patch(
        editUrl,
        {
          caption: editCaption,
        },
        {headers},
      );

      // Update the post in the posts array
      setPosts(prevPosts =>
        prevPosts.map(p =>
          p.id === postId ? {...p, caption: editCaption} : p,
        ),
      );

      // Also update in saved posts if it's there
      setSavedPosts(prevSaved =>
        prevSaved.map(p =>
          p.id === postId ? {...p, caption: editCaption} : p,
        ),
      );

      setEditModalVisible(false);
      setEditCaption('');
      setSelectedPost(null);
      Alert.alert(
        'Success',
        `${
          selectedPost.type === 'reel' ? 'Reel' : 'Post'
        } updated successfully.`,
      );
    } catch (err) {
      console.error('Error updating post:', err);
      Alert.alert(
        'Error',
        `Failed to update ${selectedPost?.type === 'reel' ? 'reel' : 'post'}.`,
      );
    } finally {
      setEditLoading(false);
    }
  };

  const navigation = useNavigation<any>();

  // Video control functions
  const toggleMute = (itemId: string) => {
    setVideoStates(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        isMuted: !prev[itemId]?.isMuted,
      },
    }));
  };

  const togglePlayPause = (itemId: string) => {
    setVideoStates(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        isPlaying: !prev[itemId]?.isPlaying,
      },
    }));
  };

  const handleVideoRef = (videoRef: any, itemId: string) => {
    if (videoRef && !videoRefs[itemId]) {
      setVideoRefs(prev => ({
        ...prev,
        [itemId]: videoRef,
      }));

      // Initialize video state if not exists
      if (!videoStates[itemId]) {
        setVideoStates(prev => ({
          ...prev,
          [itemId]: {
            isPlaying: false,
            isMuted: true,
          },
        }));
      }
    }
  };

  // Initialize video states for all videos
  const initializeVideoStates = (mediaItems: Post[]) => {
    const newVideoStates: {
      [key: string]: {isPlaying: boolean; isMuted: boolean};
    } = {};
    mediaItems.forEach(item => {
      if (item.type === 'reel') {
        // Initialize for single video
        newVideoStates[item.id] = {
          isPlaying: false,
          isMuted: true,
        };

        // Initialize for multiple media items if they exist
        if (item.allMedia && item.allMedia.length > 1) {
          item.allMedia.forEach((_, index) => {
            const mediaId = `${item.id}-${index}`;
            newVideoStates[mediaId] = {
              isPlaying: false,
              isMuted: true,
            };
          });
        }
      }
    });
    setVideoStates(newVideoStates);
  };

  // Pause all videos except the current one
  const pauseAllVideosExcept = (currentItemId: string) => {
    setVideoStates(prev => {
      const newStates = {...prev};
      Object.keys(newStates).forEach(itemId => {
        if (itemId !== currentItemId) {
          newStates[itemId] = {
            ...newStates[itemId],
            isPlaying: false,
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
        isPlaying: true,
      },
    }));
  };

  const playVideo = (itemId: string) => {
    const videoRef = videoRefs[itemId];
    if (videoRef && !videoStates[itemId]?.isPlaying) {
      videoRef.seek(0);
      setVideoStates(prev => ({
        ...prev,
        [itemId]: {
          ...prev[itemId],
          isPlaying: true,
        },
      }));
    }
  };

  const pauseVideo = (itemId: string) => {
    if (videoStates[itemId]?.isPlaying) {
      setVideoStates(prev => ({
        ...prev,
        [itemId]: {
          ...prev[itemId],
          isPlaying: false,
        },
      }));
    }
  };

  // Compress image function
  // const compressImage = async (imageUri: string): Promise<string> => {
  //   try {
  //     const result = await Compressor.compress(imageUri, {
  //       quality: 0.8,
  //       maxWidth: 800,
  //       maxHeight: 800,
  //     });
  //     return result;
  //   } catch (error) {
  //     console.error('Image compression failed:', error);
  //     return imageUri; // Return original if compression fails
  //   }
  // };

  // Process media data with compression and multiple media detection
  const processMediaData = async (
    mediaData: any[],
    type: 'image' | 'reel',
  ): Promise<Post[]> => {
    const processedPosts: Post[] = [];

    for (const item of mediaData) {
      try {
        let mediaFiles: string[] = [];

        if (type === 'image') {
          // For posts, check if there are multiple media files
          if (item.media && Array.isArray(item.media)) {
            mediaFiles = item.media
              .map((media: any) => media.media_file)
              .filter(Boolean);
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
            //  compressedUri = await compressImage(mediaFiles[0]);
          }

          const post: Post = {
            id: item.id?.toString() || '',
            type: type,
            uri: mediaFiles[0], // Original URI for fullscreen
            compressedUri: mediaFiles[0], // Compressed URI for grid
            likes: item.like_count || 0,
            comments: item.comment_count || 0,
            caption: item.caption || '',
            location: item.location || '',
            createdAt: item.created_at || '',
            collection_id: item.collection_id || 1,
            mediaCount: mediaFiles.length > 1 ? mediaFiles.length : undefined,
            allMedia: mediaFiles,
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
        Accept: 'application/json',
        Authorization: `Bearer ${authToken}`,
      };
      const res = await axios.get('https://pashuahar.com/follower/followers', {
        headers,
      });
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
        Accept: 'application/json',
        Authorization: `Bearer ${authToken}`,
      };
      const res = await axios.get('https://pashuahar.com/follower/following', {
        headers,
      });
      // Assume response: { data: { count: number } }
      return res.data?.data?.count || 0;
    } catch (err) {
      return 0;
    }
  };

  // Fetch profile and posts data every time the screen comes into focus or params change
  useFocusEffect(
    React.useCallback(() => {
      fetchData();
      return () => {
        // Cleanup: flush previous data
        setProfile({
          username: '',
          fullName: '',
          bio: '',
          profileImage: 'https://picsum.photos/200',
          postsCount: 0,
          followersCount: 0,
          followingCount: 0,
          id: ''
        });
        setPosts([]);
        setSavedPosts([]);
        setCollections([]);
        setLoading(true);
      };
    }, [route?.params?.userId, route?.params?.isFromSearch])
  );

  const fetchData = async () => {
    console.log("yes called ......", userId,isFromSearch);
    
    try {
      const authToken = await AsyncStorage.getItem('accessToken');
      const headers = {
        Accept: 'application/json',
        Authorization: `Bearer ${authToken}`,
      };
      let response:any;
      if(isFromSearch && userId){
         try {
          response = await axios.get(`https://pashuahar.com/user_profile/${userId}/`,{headers});
        } catch (err) {
          console.error('Error in user_profile API:', err);
          throw err;
        }
      }
      const data = response.data?.data;
console.log("datat......" , data);

      setIsFollowing(data?.is_following);
      setFollowStatus(data?.follow_status);
      console.log("responseresponseresponse",data?.is_followed_by , data?.follow_status);
      
      // Fetch profile data
      let profileResponse;
      try {
        profileResponse = isFromSearch
          ? response?.data?.data?.profile
          : await getProfile();
      } catch (err) {
        console.error('Error in getProfile API:', err);
        throw err;
      }
      console.log('profileResponse', profileResponse.data?.data);
        setData( isFromSearch ? profileResponse : profileResponse.data?.data?.results)
      let followersCount = 0;
      let followingCount = 0;
      // Fetch followers/following counts in parallel
      if(isFromSearch) {
        followersCount = response?.data?.data?.followers_count
        followingCount = response?.data?.data?.following_count
      }
      else {
        [followersCount, followingCount] = await Promise.all([
          fetchFollowersCount(),
          fetchFollowingCount(),
        ]);
      }
      
      console.log('followersCount', followersCount);

      if (isFromSearch ? profileResponse : profileResponse.data) {
        const profileData = isFromSearch ? profileResponse : profileResponse.data.data?.profile;
        console.log("profileDataprofileData",profileData);

        setProfile({
          username: profileData.username || 'jk',
          fullName:
            `${profileData.first_name || ''} ${
              profileData.last_name || ''
            }`.trim() || 'Jay Chhaniyara',
          bio: profileData.bio || 'Its Boy Jk',
          profileImage:
            profileData.profile_picture || 'https://picsum.photos/200',
          postsCount: isFromSearch ? response?.data?.data?.post_reels_count : profileData.posts_count || 8,
          followersCount,
          followingCount,
          id:profileData.user
        });
        // setUserId()
      }

      // Fetch posts data
      let postsResponse;
      try {
        postsResponse = isFromSearch
          ? response?.data?.data
          : await getUserPosts();
      } catch (err) {
        console.error('Error in getUserPosts API:', err);
        throw err;
      }
      console.log("postsResponse",postsResponse);

      // Fetch reels data
      let reelsResponse;
      try {
        reelsResponse = isFromSearch
          ? response?.data?.data
          : await getUserReels();
      } catch (err) {
        console.error('Error in getUserReels API:', err);
        throw err;
      }
      console.log("reelsResponse",reelsResponse?.data?.data?.results);

      let allMedia: Post[] = [];
      // console.log("postsResponse.posts",postsResponse.posts);
      

      // Transform posts data with compression and multiple media detection
      // console.log("here comes postsResponse",postsResponse);
      
      if (!isFromSearch ? postsResponse?.data : postsResponse) {
        const postsData = isFromSearch ? postsResponse?.posts :  postsResponse?.data?.data?.results;
        // const postsData = postsResponse.data.data.results;
        console.log("postsDatapostsDatapostsData",postsData);
        
        const processedPosts = await processMediaData(postsData, 'image');
        allMedia = [...allMedia, ...processedPosts];
      }

      // Transform reels data with compression and multiple media detection
      if (!isFromSearch ? reelsResponse.data : reelsResponse) {
        const reelsData = isFromSearch ? reelsResponse?.reels : reelsResponse?.data?.data?.results;
        const processedReels = await processMediaData(reelsData, 'reel');
        allMedia = [...allMedia, ...processedReels];
      }

      console.log('allMedia........', allMedia);
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
        Accept: 'application/json',
        Authorization: `Bearer ${authToken}`,
      };
      const res = await axios.get('https://pashuahar.com/collections', {
        headers,
      });
      console.log('collections', res.data);

      // Store collections data
      const collectionsData = res.data?.data || [];
      setCollections(collectionsData);

      // Transform collections to show as saved items
      const processedCollections = collectionsData.map((collection: any) => ({
        id: collection.id.toString(),
        type: 'image' as const,
        uri: 'https://picsum.photos/200', // placeholder image
        compressedUri: 'https://picsum.photos/200',
        likes: 0,
        comments: 0,
        caption: collection.name,
        location: '',
        createdAt: collection.created_at,
        collection_id: collection.id,
        isCollection: true,
        collectionName: collection.name,
      }));
      setSavedPosts(processedCollections);
    } catch (err) {
      console.log('errerrerr', err);
      setSavedError('Failed to load collections');
    } finally {
      setSavedLoading(false);
    }
  };

  // Create new collection
  const createCollection = async (name: string) => {
    try {
      const authToken = await AsyncStorage.getItem('accessToken');
      const headers = {
        Accept: 'application/json',
        Authorization: `Bearer ${authToken}`,
      };
      const res = await axios.post(
        'https://pashuahar.com/collections/',
        {
          name: name,
        },
        {headers},
      );

      console.log('Created collection', res.data);

      // Refresh collections after creating
      fetchSavedPosts();

      return res.data;
    } catch (err) {
      console.error('Error creating collection:', err);
      Alert.alert('Error', 'Failed to create collection');
      throw err;
    }
  };

  // Fetch collection details
  const fetchCollectionDetails = async (collectionId: string) => {
    try {
      const authToken = await AsyncStorage.getItem('accessToken');
      const headers = {
        Accept: 'application/json',
        Authorization: `Bearer ${authToken}`,
      };
      const res = await axios.get(
        `https://pashuahar.com/collections/${collectionId}`,
        {headers},
      );
      console.log('Collection details', res.data);
      return res.data;
    } catch (err) {
      console.error('Error fetching collection details:', err);
      Alert.alert('Error', 'Failed to load collection details');
      throw err;
    }
  };

  // Fetch saved posts when switching to Saved tab
  useEffect(() => {
    if (!isFromSearch && activeTab === 'saved' && savedPosts.length === 0 && !savedLoading) {
      fetchSavedPosts();
    }
  }, [activeTab]);

  // Refresh collections when screen comes into focus (e.g., after deletion)
  useFocusEffect(
    React.useCallback(() => {
      if (activeTab === 'saved') {
        fetchSavedPosts();
      }
    }, [activeTab]),
  );

  // Reset fullscreen modal state when returning from comment screen
  useFocusEffect(
    React.useCallback(() => {
      // Reset fullscreen modal state to ensure it works properly after navigation
      if (!fullscreenVisible) {
        setSelectedIndex(0);
        setCurrentFullscreenIndex(0);
        setShouldPauseAllVideos(false);
      }
    }, []),
  );

  // Use correct posts for the current tab
  const filteredPosts =
    activeTab === 'saved'
      ? savedPosts
      : posts.filter(post => {
          if (activeTab === 'posts') return post.type === 'image';
          if (activeTab === 'reels') return post.type === 'reel';
          return true;
        });

  const renderPostItem = ({item, index}: {item: any; index: number}) => {
    const isReel = item.type === 'reel';
    const isCollection = item.isCollection;
    const shouldShowVideoControls = isReel && activeTab === 'reels';
    const videoState = videoStates[item.id] || {
      isPlaying: false,
      isMuted: true,
    };

    return (
      <TouchableOpacity
        style={styles.postItem}
        onPress={() => {
          if (isCollection) {
            // Navigate to collection details
            navigation.navigate('CollectionDetailScreen', {
              collectionId: item.collection_id,
              collectionName: item.collectionName,
            });
          } else {
            setSelectedIndex(index);
            setFullscreenVisible(true);
          }
        }}
        activeOpacity={0.9}>
        {/* Main media display - use compressed image for better performance */}
        {!isReel ? (
          <Image
            source={{uri: item.compressedUri || item.uri}}
            style={styles.postImage}
          />
        ) : (
          <View style={styles.videoContainer}>
            <Video
              ref={ref => handleVideoRef(ref, item.id)}
              source={{uri: item.uri}}
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
                <TouchableOpacity
                  style={styles.videoControlButton}
                  onPress={e => {
                    e.stopPropagation();
                    togglePlayPause(item.id);
                  }}>
                  <Ionicons
                    name={videoState.isPlaying ? 'pause' : 'play'}
                    size={20}
                    color="#fff"
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.videoControlButton}
                  onPress={e => {
                    e.stopPropagation();
                    toggleMute(item.id);
                  }}>
                  <Ionicons
                    name={videoState.isMuted ? 'volume-mute' : 'volume-high'}
                    size={20}
                    color="#fff"
                  />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Collection indicator */}
        {isCollection && (
          <View style={styles.collectionIndicator}>
            <Ionicons name="folder-outline" size={16} color="#fff" />
            <Text style={styles.collectionText}>{item.collectionName}</Text>
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
       {isFromSearch ? null : <TouchableOpacity
          style={{position: 'absolute', top: 8, right: 8, zIndex: 2}}
          onPress={e => {
            e.stopPropagation();
            handleOptions(item);
          }}>
          <Ionicons name="ellipsis-vertical" size={20} color="#fff" />
        </TouchableOpacity>}

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
        onPress={() =>
          isFromSearch ? null :
          navigation.navigate('FollowersFollowingScreen', {
            type: 'followers',
            userId: '1',
            username: profile.username,
          })
        }>
        <Text style={styles.statNumber}>{profile.followersCount}</Text>
        <Text style={styles.statLabel}>Followers</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.statItem}
        onPress={() =>
          isFromSearch ? null :
          navigation.navigate('FollowersFollowingScreen', {
            type: 'following',
            userId: '1',
            username: profile.username,
          })
        }>
        <Text style={styles.statNumber}>{profile.followingCount}</Text>
        <Text style={styles.statLabel}>Following</Text>
      </TouchableOpacity>
    </View>
  );

  const renderProfileHeader = () => (
    <View style={styles.profileHeader}>
      <Image source={{uri: profile.profileImage}} style={styles.profileImage} />
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
        onPress={() => setActiveTab('posts')}>
        <Ionicons
          name="grid-outline"
          size={24}
          color={activeTab === 'posts' ? '#000' : '#888'}
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tabButton, activeTab === 'reels' && styles.activeTab]}
        onPress={() => setActiveTab('reels')}>
        <Ionicons
          name="play-outline"
          size={24}
          color={activeTab === 'reels' ? '#000' : '#888'}
        />
      </TouchableOpacity>
      {isFromSearch ? null : <TouchableOpacity
        style={[styles.tabButton, activeTab === 'saved' && styles.activeTab]}
        onPress={() => setActiveTab('saved')}>
        <Ionicons
          name="bookmark-outline"
          size={24}
          color={activeTab === 'saved' ? '#000' : '#888'}
        />
      </TouchableOpacity>}
    </View>
  );

  const renderFullscreenItem = ({item, index}: {item: any; index: number}) => {
    const windowHeight = Dimensions.get('window').height;
    const windowWidth = Dimensions.get('window').width;
    const isCurrentVideo = currentFullscreenIndex === index;
    const isReel = item.type === 'reel';
    const postState = postStates[item.id] || {
      isLiked: false,
      likesCount: item.likes,
      likeLoading: false,
    };

    // Get all media items for this post
    const mediaItems = item.allMedia || [item.uri];
    const currentMediaIndexForPost = postMediaIndices[item.id] || 0;
    const currentMedia = mediaItems[currentMediaIndexForPost];
    const isVideo =
      currentMedia &&
      (currentMedia.includes('.mp4') ||
        currentMedia.includes('.mov') ||
        currentMedia.includes('.avi'));

    // Get the correct video state for the current media item
    const videoId =
      mediaItems.length > 1
        ? `${item.id}-${currentMediaIndexForPost}`
        : item.id;
    const videoState = videoStates[videoId] || {
      isPlaying: false,
      isMuted: true,
    };

    return (
      <View style={{flex: 1, backgroundColor: '#000'}}>
        {/* Top bar */}
        {/* <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 40, paddingBottom: 10, paddingHorizontal: 10, backgroundColor: '#111', justifyContent: 'space-between' }}>
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>Posts</Text>
        </View> */}
       
        {/* User info */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 14,
            paddingBottom: 8,
            justifyContent: 'space-between',
          }}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Image
              source={{uri: profile.profileImage}}
              style={{width: 36, height: 36, borderRadius: 18, marginRight: 10}}
            />
            <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 15}}>
              {profile.username}
            </Text>
          </View>

          {/* Options button for fullscreen */}
         {isFromSearch ? null : <TouchableOpacity
            onPress={() => handleOptions(item)}
            style={{padding: 8}}>
            <Ionicons name="ellipsis-vertical" size={20} color="#fff" />
          </TouchableOpacity>}
        </View>

        {/* Main media with horizontal scroll for multiple items */}
        <View
          style={{
            width: windowWidth,
            height: windowHeight * 0.5,
            alignSelf: 'center',
            backgroundColor: '#000',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          {mediaItems.length > 1 ? (
            <FlatList
              data={mediaItems}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={event => {
                const newIndex = Math.round(
                  event.nativeEvent.contentOffset.x / windowWidth,
                );
                setPostMediaIndices(prev => ({
                  ...prev,
                  [item.id]: newIndex,
                }));
              }}
              renderItem={({item: mediaItem, index: mediaIndex}) => (
                <View style={{width: windowWidth, height: windowHeight * 0.5}}>
                  {isVideo ? (
                    <View
                      style={{width: windowWidth, height: windowHeight * 0.5}}>
                      {videoLoading && (
                        <ActivityIndicator
                          size="large"
                          color="#fff"
                          style={{
                            position: 'absolute',
                            alignSelf: 'center',
                            top: '45%',
                          }}
                        />
                      )}
                      <Video
                        ref={ref =>
                          handleVideoRef(ref, `${item.id}-${mediaIndex}`)
                        }
                        source={{uri: mediaItem}}
                        style={{
                          width: '100%',
                          height: '100%',
                          backgroundColor: '#000',
                        }}
                        muted={
                          videoStates[`${item.id}-${mediaIndex}`]?.isMuted ||
                          true
                        }
                        repeat
                        resizeMode="cover"
                        paused={
                          !videoStates[`${item.id}-${mediaIndex}`]?.isPlaying ||
                          !isCurrentVideo
                        }
                        onLoadStart={() => setVideoLoading(true)}
                        onLoad={() => setVideoLoading(false)}
                        onError={() => setVideoLoading(false)}
                      />

                      {/* Video controls for fullscreen */}
                      <View style={styles.fullscreenVideoControls}>
                        <TouchableOpacity
                          style={styles.fullscreenControlButton}
                          onPress={() =>
                            togglePlayPause(`${item.id}-${mediaIndex}`)
                          }>
                          <Ionicons
                            name={
                              videoStates[`${item.id}-${mediaIndex}`]?.isPlaying
                                ? 'pause'
                                : 'play'
                            }
                            size={24}
                            color="#fff"
                          />
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.fullscreenControlButton}
                          onPress={() =>
                            toggleMute(`${item.id}-${mediaIndex}`)
                          }>
                          <Ionicons
                            name={
                              videoStates[`${item.id}-${mediaIndex}`]?.isMuted
                                ? 'volume-mute'
                                : 'volume-high'
                            }
                            size={24}
                            color="#fff"
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <Image
                      source={{uri: mediaItem}}
                      style={{
                        width: windowWidth,
                        height: windowHeight * 0.5,
                        resizeMode: 'cover',
                        backgroundColor: '#000',
                      }}
                    />
                  )}
                </View>
              )}
              keyExtractor={(mediaItem, mediaIndex) =>
                `${item.id}-${mediaIndex}`
              }
            />
          ) : // Single media item
          isVideo ? (
            <View style={{width: windowWidth, height: windowHeight * 0.5}}>
              {videoLoading && (
                <ActivityIndicator
                  size="large"
                  color="#fff"
                  style={{
                    position: 'absolute',
                    alignSelf: 'center',
                    top: '45%',
                  }}
                />
              )}
              <Video
                ref={ref => handleVideoRef(ref, item.id)}
                source={{uri: currentMedia}}
                style={{width: '100%', height: '100%', backgroundColor: '#000'}}
                muted={videoState.isMuted}
                repeat
                resizeMode="cover"
                paused={!videoState.isPlaying || !isCurrentVideo}
                onLoadStart={() => setVideoLoading(true)}
                onLoad={() => setVideoLoading(false)}
                onError={() => setVideoLoading(false)}
              />

              {/* Video controls for fullscreen single video */}
              <View style={styles.fullscreenVideoControls}>
                <TouchableOpacity
                  style={styles.fullscreenControlButton}
                  onPress={() => togglePlayPause(item.id)}>
                  <Ionicons
                    name={videoState.isPlaying ? 'pause' : 'play'}
                    size={24}
                    color="#fff"
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.fullscreenControlButton}
                  onPress={() => toggleMute(item.id)}>
                  <Ionicons
                    name={videoState.isMuted ? 'volume-mute' : 'volume-high'}
                    size={24}
                    color="#fff"
                  />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <Image
              source={{uri: currentMedia}}
              style={{
                width: windowWidth,
                height: windowHeight * 0.5,
                resizeMode: 'cover',
                backgroundColor: '#000',
              }}
            />
          )}

          {/* Media indicator dots for multiple items */}
          {mediaItems.length > 1 && (
            <View
              style={{
                position: 'absolute',
                bottom: 20,
                left: 0,
                right: 0,
                flexDirection: 'row',
                justifyContent: 'center',
              }}>
              {mediaItems.map((_: string, dotIndex: number) => (
                <View
                  key={dotIndex}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor:
                      dotIndex === currentMediaIndexForPost
                        ? '#fff'
                        : 'rgba(255,255,255,0.5)',
                    marginHorizontal: 4,
                  }}
                />
              ))}
            </View>
          )}
        </View>

        {/* Like/comment counts row (interactive) */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 14,
            marginTop: 12,
            marginBottom: 2,
          }}>
          <TouchableOpacity
            onPress={() => handleLike(item)}
            disabled={postState.likeLoading}
            style={{flexDirection: 'row', alignItems: 'center'}}>
            {postState.likeLoading ? (
              <ActivityIndicator size={20} color="#bea063" />
            ) : (
              <Ionicons
                name={postState.isLiked ? 'heart' : 'heart-outline'}
                size={22}
                color={postState.isLiked ? '#bea063' : '#bea063'}
              />
            )}
            <Text
              style={{
                color: '#fff',
                fontSize: 15,
                marginLeft: 6,
                marginRight: 18,
              }}>
              {postState.likesCount || item.likes}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleComment(item)}
            style={{flexDirection: 'row', alignItems: 'center'}}>
            <Ionicons name="chatbubble-outline" size={20} color="#fff" />
            <Text style={{color: '#fff', fontSize: 15, marginLeft: 6}}>
              {item.comments}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Username, caption, emojis */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 14,
            marginBottom: 2,
            flexWrap: 'wrap',
          }}>
          <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 14}}>
            {profile.username}
          </Text>
          {item.caption ? (
            <Text style={{color: '#fff', fontSize: 14, marginLeft: 6}}>
              {item.caption}
            </Text>
          ) : null}
        </View>

        {/* Date */}
        {item.createdAt && (
          <Text
            style={{
              color: '#aaa',
              fontSize: 13,
              paddingHorizontal: 14,
              marginTop: 2,
            }}>
            {new Date(item.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        )}
      </View>
    );
  };

  // Initialize post states when posts are loaded
  const initializePostStates = (mediaItems: Post[]) => {
    const newPostStates: {
      [key: string]: {
        isLiked: boolean;
        likesCount: number;
        likeLoading: boolean;
      };
    } = {};
    mediaItems.forEach(item => {
      newPostStates[item.id] = {
        isLiked: item.isLiked || false,
        likesCount: item.likes,
        likeLoading: false,
      };
    });
    setPostStates(newPostStates);
  };

  const [isFollowing, setIsFollowing] = useState(false);
  const [followStatus, setFollowStatus] = useState('');
  const [followLoading, setFollowLoading] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
       {/* <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.navigate('Menu')}>
        <Ionicons name="menu-outline" size={24} color="#bea063" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{profile?.username}</Text>
      <View style={{width: 24}} />
    </View> */}
      {/* Fullscreen Modal */}
      <Modal
        visible={fullscreenVisible}
        animationType="slide"
        onRequestClose={() => setFullscreenVisible(false)}
        transparent={false}>
        <SafeAreaView style={{flex: 1, backgroundColor: '#000'}}>
          <TouchableOpacity
            style={{position: 'absolute', top: 40, right: 20, zIndex: 1}}
            onPress={() => setFullscreenVisible(false)}>
            <Ionicons name="close" size={30} color="#fff" />
          </TouchableOpacity>
          {filteredPosts.length === 0 ? (
            <View
              style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
              <Text style={{color: '#fff', fontSize: 18}}>
                No posts to display
              </Text>
            </View>
          ) : (
            <FlatList
              ref={fullscreenFlatListRef}
              data={filteredPosts}
              renderItem={renderFullscreenItem}
              keyExtractor={item => item.id}
              pagingEnabled
              initialScrollIndex={selectedIndex}
              getItemLayout={(data, index) => {
                const mediaHeight = Dimensions.get('window').height * 0.5;
                const contentHeight = 150; // Approximate height for user info, likes, comments, caption
                const totalItemHeight = mediaHeight + contentHeight;
                return {
                  length: totalItemHeight,
                  offset: totalItemHeight * index,
                  index,
                };
              }}
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
        {loading && (
          <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 100,
            backgroundColor: 'rgba(255,255,255,0.8)',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <ActivityIndicator size="large" color="#bea063" />
          </View>
        )}
        {renderProfileHeader()}
        {renderBio()}
        {
          console.log("uesr ......", userId , profile.id)
          
        }
        {userId && (
          <View style={{ alignItems: 'center', marginTop: 8 }}>
            <TouchableOpacity
              style={[
                styles.followButton,
                isFollowing && followStatus !== 'pending' ? styles.unfollowButton : null,
                followStatus === 'pending' ? styles.pendingButton : null,
              ]}
              disabled={followStatus === 'pending' || followLoading}
              onPress={async () => {
                try {
                  setFollowLoading(true);
                  const authToken = await AsyncStorage.getItem('accessToken');
                  const headers = {
                    Accept: 'application/json',
                    Authorization: `Bearer ${authToken}`,
                  };
                  if (isFollowing && followStatus !== 'pending') {
                    // Unfollow
                    const res = await axios.post(
                      'https://pashuahar.com/follower/unfollow/',
                      { user_id: userId || profile.id },
                      { headers }
                    );
                    console.log('Unfollow API response:', res.data);
                    if (res.data && (res.data.status || res.data.success)) {
                      await fetchData(); // Refresh profile data after unfollow
                      // Alert.alert('Unfollowed successfully');
                    } else {
                      // Alert.alert('Unfollow failed', res.data?.message || 'Unknown error');
                    }
                  } else if (!isFollowing && followStatus !== 'pending') {
                    // Follow
                    const res = await axios.post(
                      'https://pashuahar.com/follower/follow/',
                      { user_id: userId || profile.id },
                      { headers }
                    );
                    console.log('Follow API response:', res.data);
                    if (res.data && (res.data.status || res.data.success)) {
                      await fetchData(); // Refresh profile data after follow
                      // Alert.alert('Follow request sent');
                    } else {
                      // Alert.alert('Follow failed', res.data?.message || 'Unknown error');
                    }
                  }
                } catch (e: any) {
                  console.log('Follow/Unfollow API error:', e?.response?.data || e.message);
                  // Alert.alert('Error', e?.response?.data?.message || e.message || 'Unknown error');
                } finally {
                  setFollowLoading(false);
                }
              }}
            >
              {followLoading ? (
                <ActivityIndicator color={isFollowing ? '#0095f6' : '#fff'} size="small" />
              ) : (
                <Text style={
                  isFollowing && followStatus !== 'pending'
                    ? styles.unfollowButtonText
                    : followStatus === 'pending'
                      ? styles.pendingButtonText
                      : styles.followButtonText
                }>
                  {isFollowing
                    ? followStatus === 'pending'
                      ? 'Requested'
                      : 'Unfollow'
                    : 'Follow'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
        {isFromSearch ? null : <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('EditProfile',{data : data})}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton}>
            <Ionicons name="share-outline" size={20} color="#000" />
          </TouchableOpacity>
        </View>}

        {renderTabBar()}

        {activeTab === 'saved' && savedLoading ? (
          <View style={styles.emptyStateContainer}>
            <ActivityIndicator size="large" color="#666" />
            <Text style={styles.emptyStateText}>Loading collections...</Text>
          </View>
        ) : activeTab === 'saved' && savedError ? (
          <View style={styles.emptyStateContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#666" />
            <Text style={styles.emptyStateText}>{savedError}</Text>
          </View>
        ) : activeTab === 'saved' && filteredPosts.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Ionicons name="bookmark-outline" size={48} color="#666" />
            <Text style={styles.emptyStateText}>No collections yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Create your first collection to save posts
            </Text>
            <TouchableOpacity
              style={styles.createCollectionButton}
              onPress={() => setCreateCollectionModalVisible(true)}>
              <Text style={styles.createCollectionButtonText}>
                Create Collection
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filteredPosts}
            renderItem={renderPostItem}
            keyExtractor={item => item.id}
            numColumns={NUM_COLUMNS}
            scrollEnabled={false}
            contentContainerStyle={styles.postsGrid}
          />
        )}

        {/* Create Collection Button for Saved Tab */}
        {activeTab === 'saved' && filteredPosts.length > 0 && (
          <TouchableOpacity
            style={styles.floatingCreateButton}
            onPress={() => setCreateCollectionModalVisible(true)}>
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </ScrollView>

      <Modal
        visible={optionsVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setOptionsVisible(false)}>
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.3)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          activeOpacity={1}
          onPressOut={() => setOptionsVisible(false)}>
          {isFromSearch ? null : <View
            style={{
              backgroundColor: '#fff',
              borderRadius: 10,
              padding: 20,
              minWidth: 180,
            }}>
            <TouchableOpacity
              onPress={handleEdit}
              style={{paddingVertical: 10}}>
              <Text style={{fontSize: 16}}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDelete}
              style={{
                paddingVertical: 10,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              {deleteLoading ? (
                <ActivityIndicator
                  size={18}
                  color="#bea063"
                  style={{marginRight: 8}}
                />
              ) : null}
              <Text style={{fontSize: 16, color: '#E74C3C'}}>Delete</Text>
            </TouchableOpacity>
          </View>}
        </TouchableOpacity>
      </Modal>

      {/* Create Collection Modal */}
      <Modal
        visible={createCollectionModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCreateCollectionModalVisible(false)}>
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.3)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          activeOpacity={1}
          onPressOut={() => setCreateCollectionModalVisible(false)}>
          <View
            style={{
              backgroundColor: '#fff',
              borderRadius: 10,
              padding: 20,
              minWidth: 300,
            }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                marginBottom: 20,
                textAlign: 'center',
              }}>
              Create New Collection
            </Text>

            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#ddd',
                borderRadius: 5,
                padding: 12,
                marginBottom: 20,
                fontSize: 16,
              }}
              placeholder="Collection name"
              value={newCollectionName}
              onChangeText={setNewCollectionName}
              autoFocus
            />

            <View
              style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  padding: 12,
                  marginRight: 10,
                  borderWidth: 1,
                  borderColor: '#ddd',
                  borderRadius: 5,
                  alignItems: 'center',
                }}
                onPress={() => {
                  setCreateCollectionModalVisible(false);
                  setNewCollectionName('');
                }}>
                <Text style={{fontSize: 16}}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
                  padding: 12,
                  backgroundColor: '#000',
                  borderRadius: 5,
                  alignItems: 'center',
                }}
                onPress={async () => {
                  if (newCollectionName.trim()) {
                    setCreateCollectionLoading(true);
                    try {
                      await createCollection(newCollectionName.trim());
                      setCreateCollectionModalVisible(false);
                      setNewCollectionName('');
                    } catch (error) {
                      // Error already handled in createCollection function
                    } finally {
                      setCreateCollectionLoading(false);
                    }
                  } else {
                    Alert.alert('Error', 'Please enter a collection name');
                  }
                }}
                disabled={createCollectionLoading}>
                {createCollectionLoading ? (
                  <ActivityIndicator size={20} color="#fff" />
                ) : (
                  <Text style={{fontSize: 16, color: '#fff'}}>Create</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Edit Post/Reel Modal */}
      <Modal
        visible={editModalVisible && !isFromSearch}
        transparent
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}>
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.3)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          activeOpacity={1}
          onPressOut={() => setEditModalVisible(false)}>
          <View
            style={{
              backgroundColor: '#fff',
              borderRadius: 10,
              padding: 20,
              minWidth: 300,
            }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                marginBottom: 20,
                textAlign: 'center',
              }}>
              Edit {selectedPost?.type === 'reel' ? 'Reel' : 'Post'}
            </Text>

            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#ddd',
                borderRadius: 5,
                padding: 12,
                marginBottom: 20,
                fontSize: 16,
                minHeight: 100,
                textAlignVertical: 'top',
              }}
              placeholder="Enter caption..."
              value={editCaption}
              onChangeText={setEditCaption}
              multiline
              autoFocus
            />

            <View
              style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  padding: 12,
                  marginRight: 10,
                  borderWidth: 1,
                  borderColor: '#ddd',
                  borderRadius: 5,
                  alignItems: 'center',
                }}
                onPress={() => {
                  setEditModalVisible(false);
                  setEditCaption('');
                  setSelectedPost(null);
                }}>
                <Text style={{fontSize: 16}}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
                  padding: 12,
                  backgroundColor: '#000',
                  borderRadius: 5,
                  alignItems: 'center',
                }}
                onPress={handleEditSubmit}
                disabled={editLoading}>
                {editLoading ? (
                  <ActivityIndicator size={20} color="#fff" />
                ) : (
                  <Text style={{fontSize: 16, color: '#fff'}}>Update</Text>
                )}
              </TouchableOpacity>
            </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#bea063',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#bea063',
    textAlign: 'center',
    flex: 1,
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
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    color: '#666',
    fontSize: 18,
    marginTop: 10,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    color: '#999',
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
  },
  collectionIndicator: {
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
  collectionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  createCollectionButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    alignItems: 'center',
  },
  createCollectionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  floatingCreateButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  followButton: {
    minWidth: 140,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#bea063',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 4,
  },
  unfollowButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#bea063',
  },
  pendingButton: {
    backgroundColor: '#eee',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  followButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  unfollowButtonText: {
    color: '#bea063',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  pendingButtonText: {
    color: '#888',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
});

export default UserProfileScreen;
