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
  TextInput
} from 'react-native';
import Video from 'react-native-video';
import Post from '../../Component/Post';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {
  useFocusEffect,
  useRoute
} from '@react-navigation/native';
import { getProfile, getUserPosts, getUserReels } from '../../Api/Api';
import LocationPicker, { LocationOption } from '../../Components/LocationPicker';
import InstagramCommentModal from '../Comment/InstagramCommentModal';
const Ionicons = require('react-native-vector-icons/Ionicons').default;
// import {getAccounts, switchAccount} from '../../Utils/accountManager';
//  import { Image as Compressor } from 'react-native-compressor';

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
  isCollection?: boolean;
  collectionName?: string;
  allMedia?: string[]; // All media files for this post
  allow_comments?: boolean;
  hide_like_count?: boolean;
}

const ProfileScreen = ({ navigation }: any) => {
  // const navigation = useNavigation<any>();

  const [activeTab, setActiveTab] = useState<'draft' | 'posts' | 'reels' | 'saved' | 'tagged'>('draft');
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    username: '',
    fullName: '',
    bio: '',
    profileImage: 'https://picsum.photos/200',
    postsCount: 0,
    followersCount: 0,
    followingCount: 0,
    id: '',
    location: '',
  });
  const route = useRoute<any>();
  let { userId } = route?.params || {};
  let { isFromSearch } = route?.params || {};
  console.log('isFromSearch', isFromSearch);

  // console.log("profile s state",profile.id);

  // Real data from API
  const [data, setData] = useState('');
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
    [key: string]: { isPlaying: boolean; isMuted: boolean };
  }>({});
  const [videoRefs, setVideoRefs] = useState<{ [key: string]: any }>({});

  // Post functionality state
  const [postStates, setPostStates] = useState<{
    [key: string]: { isLiked: boolean; likesCount: number; likeLoading: boolean };
  }>({});
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [postLoading, setPostLoading] = useState(false);

  // Edit functionality state
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editCaption, setEditCaption] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editLocation, setEditLocation] = useState<LocationOption | null>(null);
  const [feedPosts, setFeedPosts] = useState([]);
  const [feedLoading, setFeedLoading] = useState(false);
  // console.log("feedPosts ..",feedPosts);

  // Collection creation state
  const [createCollectionModalVisible, setCreateCollectionModalVisible] =
    useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [createCollectionLoading, setCreateCollectionLoading] = useState(false);
  const [profileOptionsModalVisible, setProfileOptionsModalVisible] =
    useState(false);

  // console.log("data profile",data);

  const feedPostCount = feedPosts.length;

  // Fullscreen media state
  const [postMediaIndices, setPostMediaIndices] = useState<{
    [postId: string]: number;
  }>({});
  const imageSource = require('../../Assets/userProfile.png');
  // post feed
  const getPostReelFeed = async () => {
    const authToken = await AsyncStorage.getItem('accessToken');
    const headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${authToken}`,
    };
    // You may need params: see API docs
    return axios.get('https://pashuahar.com/post_reel_feed/', { headers });
  };

  useEffect(() => {
    fetchPostReelFeed();
  }, []);

  const fetchPostReelFeed = async () => {
    setFeedLoading(true);
    try {
      const res = await getPostReelFeed();
      // Check response shape, assuming: { data: { results: [...] } }
      // console.log("res ,,,res",res);


      setFeedPosts(res.data.data || []);
    } catch (err) {
      console.log('Failed to fetch feed:', err);
      setFeedPosts([]);
    } finally {
      setFeedLoading(false);
    }
  };



  // FlatList viewability config for reels autoplay
  const viewabilityConfig = { viewAreaCoveragePercentThreshold: 80 };
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: any }) => {
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

            // Pause all videos except the current one
            pauseAllVideosExcept(videoId);
            // Play only the current video
            playCurrentVideo(videoId);
          } else {
            // If not a reel, pause all videos
            pauseAllVideosExcept("");
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
        const newStates = { ...prev };
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
      [postId]: { ...currentState, likeLoading: true },
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
        { headers },
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
        [postId]: { ...currentState, likeLoading: false },
      }));
    }
  };

  const handleComment = (post: any) => {
    // Don't close fullscreen modal, just show comment modal on top
    setSelectedCommentPost(post);
    setIsCommentModalVisible(true);
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

      await axios.delete(deleteUrl, { headers });

      // Remove from posts array
      setPosts(prevPosts => prevPosts.filter(p => p.id !== postId));

      // Also remove from saved posts if it's there
      setSavedPosts(prevSaved => prevSaved.filter(p => p.id !== postId));

      setOptionsVisible(false);
      setSelectedPost(null);
      Alert.alert(
        'Deleted',
        `${selectedPost.type === 'reel' ? 'Reel' : 'Post'
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
    setEditLocation(
      selectedPost.location
        ? { display_name: selectedPost.location, lat: '', lon: '' }
        : null,
    );
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
          location: editLocation ? editLocation.display_name : '',
        },
        { headers },
      );

      // Update the post in the posts array
      setPosts(prevPosts =>
        prevPosts.map(p =>
          p.id === postId ? { ...p, caption: editCaption } : p,
        ),
      );

      // Also update in saved posts if it's there
      setSavedPosts(prevSaved =>
        prevSaved.map(p =>
          p.id === postId ? { ...p, caption: editCaption } : p,
        ),
      );

      // Update profile location in state
      setProfile(prev => ({
        ...prev,
        location: editLocation ? editLocation.display_name : '',
      }));

      setEditModalVisible(false);
      setEditCaption('');
      setSelectedPost(null);
      Alert.alert(
        'Success',
        `${selectedPost.type === 'reel' ? 'Reel' : 'Post'
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



  // Video control functions


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
      [key: string]: { isPlaying: boolean; isMuted: boolean };
    } = {};
    mediaItems.forEach(item => {
      if (item.type === 'reel') {
        // In grid, videos are always paused; in fullscreen, we control playback
        newVideoStates[item.id] = {
          isPlaying: false, // grid: always paused; fullscreen: set to true when shown
          isMuted: true,
        };
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
      const newStates = { ...prev };
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
            allow_comments: item.allow_comments,
            hide_like_count: item.hide_like_count,
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
          id: '',
          location: '',
        });
        setPosts([]);
        setSavedPosts([]);
        setCollections([]);
        setLoading(true);
      };
    }, [route?.params?.userId, route?.params?.isFromSearch]),
  );

  const fetchData = async () => {
    try {
      let response: any;
      if (isFromSearch && userId) {
        setLoading(true); // Show loader only for user_profile fetch
        response = await axios.get(
          `https://pashuahar.com/user_profile/${userId}`,
        );
      }
      // console.log(
      //   'responseresponseresponse',
      //   isFromSearch,
      //   response?.data?.data?.profile,
      // );

      // Fetch profile data
      // const profileResponse = isFromSearch
      //   ? response?.data?.data?.profile
      //   : await getProfile();
      // // console.log('profileResponse', profileResponse.data?.data);
      // setData(
      //   isFromSearch ? profileResponse : profileResponse.data?.data?.results,
      // );
      const profileResponse = await getProfile();
      // console.log("profileResponse",profileResponse?.data?.data?.vendor_profile?.main_categories);

      setData(profileResponse?.data?.data);
      let followersCount = 0;
      let followingCount = 0;
      // Fetch followers/following counts in parallel
      if (isFromSearch) {
        followersCount = response?.data?.data?.followers_count;
        followingCount = response?.data?.data?.following_count;
      } else {
        [followersCount, followingCount] = await Promise.all([
          fetchFollowersCount(),
          fetchFollowingCount(),
        ]);
      }

      setRole(profileResponse?.data?.role);
      setVendorProfile(profileResponse?.data?.data?.vendor_profile || null);

      if (isFromSearch ? profileResponse : profileResponse.data) {
        const profileData = isFromSearch
          ? profileResponse
          : profileResponse?.data?.data?.profile;
        // console.log("profileDataprofileData",profileData);

        setProfile({
          username: profileData?.username || '',
          fullName:
            `${profileData?.first_name || ''} ${profileData?.last_name || ''
              }`.trim() || '',
          bio: profileData?.bio || '',
          profileImage:
            profileData?.profile_picture || 'https://picsum.photos/200',
          postsCount: isFromSearch
            ? response?.data?.data?.post_reels_count
            : profileData?.posts_count || 8,
          followersCount,
          followingCount,
          id: profileData?.user || '',
          location: '',
        });
        // setUserId()
      }

      // Fetch posts data
      const postsResponse = isFromSearch
        ? response?.data?.data
        : await getUserPosts();
      // console.log('postsResponse', postsResponse?.data?.data?.results);

      // Fetch reels data
      const reelsResponse = isFromSearch
        ? response?.data?.data
        : await getUserReels();
      // console.log("reelsResponse",reelsResponse?.data?.data?.results);

      let allMedia: Post[] = [];
      // console.log("postsResponse.posts",postsResponse.posts);

      // Transform posts data with compression and multiple media detection
      // console.log("here comes postsResponse",postsResponse);

      if (!isFromSearch ? postsResponse?.data : postsResponse) {
        const postsData = isFromSearch
          ? postsResponse?.posts
          : postsResponse?.data?.data?.results;
        // const postsData = postsResponse.data.data.results;
        // console.log("postsDatapostsDatapostsData",postsData);

        if (postsData && Array.isArray(postsData)) {
          const processedPosts = await processMediaData(postsData, 'image');
          allMedia = [...allMedia, ...processedPosts];
        }
      }

      // Transform reels data with compression and multiple media detection
      if (!isFromSearch ? reelsResponse?.data : reelsResponse) {
        const reelsData = isFromSearch
          ? reelsResponse?.reels
          : reelsResponse?.data?.data?.results;
        if (reelsData && Array.isArray(reelsData)) {
          const processedReels = await processMediaData(reelsData, 'reel');
          allMedia = [...allMedia, ...processedReels];
        }
      }

      // console.log('allMedia........', allMedia);
      setPosts(allMedia);

      // Initialize video states for all reels
      initializeVideoStates(allMedia);

      // Initialize post states when posts are loaded
      initializePostStates(allMedia);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Set default values to prevent crashes
      setProfile({
        username: '',
        fullName: '',
        bio: '',
        profileImage: 'https://picsum.photos/200',
        postsCount: 0,
        followersCount: 0,
        followingCount: 0,
        id: '',
        location: '',
      });
      setVendorProfile(null);
      setPosts([]);
      setLoading(false); // Hide loader on error as well
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
        { headers },
      );

      // console.log('Created collection', res.data);

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

  // Fetch saved posts when switching to Saved tab
  useEffect(() => {
    if (
      !isFromSearch &&
      activeTab === 'saved' &&
      savedPosts.length === 0 &&
      !savedLoading
    ) {
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

  // Draft posts state
  const [draftPosts, setDraftPosts] = useState<Post[]>([]);
  const [draftLoading, setDraftLoading] = useState(false);
  const [draftError, setDraftError] = useState<string | null>(null);

  // Fetch draft posts from API
  const fetchDraftPosts = async () => {
    setDraftLoading(true);
    setDraftError(null);
    try {
      const authToken = await AsyncStorage.getItem('accessToken');
      const headers = {
        Accept: 'application/json',
        Authorization: `Bearer ${authToken}`,
      };
      const res = await axios.get('https://pashuahar.com/is_draft/', { headers });
      // console.log("Draft posts response:", res.data);

      // Use your response shape directly
      const draftData = res.data?.data || [];
      const processedDrafts: Post[] = draftData.map((item: any) => {
        let mediaFiles: string[] = [];
        if (item.type === 'reel' && item.video_file) {
          mediaFiles = [item.video_file];
        } else if (item.media && Array.isArray(item.media)) {
          mediaFiles = item.media.map((media: any) => media.media_file).filter(Boolean);
        }
        return {
          id: item.id?.toString(),
          type: item.type === 'reel' ? 'reel' : 'image',
          uri: mediaFiles[0] || '',
          compressedUri: mediaFiles[0] || '',
          likes: item.like_count || 0,
          comments: item.comment_count || 0,
          caption: item.caption || '',
          location: item.location || '',
          createdAt: item.created_at || '',
          collection_id: item.collection_id || 1,
          mediaCount: mediaFiles.length > 1 ? mediaFiles.length : undefined,
          allMedia: mediaFiles,
          allow_comments: item.allow_comments,
          hide_like_count: item.hide_like_count,
        };
      });
      setDraftPosts(processedDrafts);
    } catch (err) {
      setDraftError('Failed to load drafts');
      setDraftPosts([]);
    } finally {
      setDraftLoading(false);
    }
  };

  // Fetch drafts when switching to draft tab
  useEffect(() => {
    if (activeTab === 'draft') {
      fetchDraftPosts();
    }
  }, [activeTab]);

  // Tagged posts state
  const [taggedPosts, setTaggedPosts] = useState<Post[]>([]);
  const [taggedLoading, setTaggedLoading] = useState(false);
  const [taggedError, setTaggedError] = useState<string | null>(null);

  // Fetch tagged posts from API
  const fetchTaggedPosts = async () => {
    setTaggedLoading(true);
    setTaggedError(null);
    try {
      const authToken = await AsyncStorage.getItem('accessToken');
      const headers = {
        Accept: 'application/json',
        Authorization: `Bearer ${authToken}`,
      };
      const res = await axios.get('https://pashuahar.com/mentioned_user/', { headers });
      const taggedData = res.data?.data || [];
      // Attach profile data to each post
      const processedTagged = await processMediaData(taggedData, 'image');
      // Attach profile info from API to each tagged post
      processedTagged.forEach((post, idx) => {
        post.mentionedProfile = taggedData[idx]?.profile || null;
      });
      setTaggedPosts(processedTagged);
    } catch (err) {
      setTaggedError('Failed to load tagged posts');
      setTaggedPosts([]);
    } finally {
      setTaggedLoading(false);
    }
  };

  // Fetch tagged posts when switching to tagged tab
  useEffect(() => {
    if (activeTab === 'tagged' && taggedPosts.length === 0 && !taggedLoading) {
      fetchTaggedPosts();
    }
  }, [activeTab]);

  // Use correct posts for the current tab
  const filteredPosts =
    activeTab === 'saved'
      ? savedPosts
      : activeTab === 'draft'
        ? draftPosts
        : activeTab === 'tagged'
          ? taggedPosts
          : activeTab === 'posts'
            ? posts // Show both posts and reels
            : activeTab === 'reels'
              ? posts.filter(post => post.type === 'reel')
              : posts;

  const renderPostItem = ({ item, index }: { item: any; index: number }) => {
    console.log("renderPostItem item", item);

    const isReel = item.type === 'reel';
    const isCollection = item.isCollection;

    return (
      <TouchableOpacity
        style={styles.postItem}
        onPress={() => {
          if (isCollection) {
            // Navigate to collection details
            console.log("Profilr screen click --------> ");
            navigation.navigate('CollectionDetailScreen', {
              collectionId: item.collection_id,
              collectionName: item.collectionName,
            });
          } else {
            // Ensure index matches filteredPosts
            const filteredIndex = filteredPosts.findIndex(p => p.id === item.id);
            setSelectedIndex(filteredIndex !== -1 ? filteredIndex : index);
            setFullscreenVisible(true);
          }
        }}
        activeOpacity={0.9}>
        {/* Main media display - use compressed image for better performance */}
        {isCollection ? (
          <Image
            source={
              profile.profileImage && profile.profileImage !== '' && profile.profileImage !== null && profile.profileImage !== undefined
                ? { uri: profile.profileImage }
                : imageSource
            }
            style={styles.postImage}
            resizeMode="cover"
          />
        ) : !isReel ? (
          <Image
            source={{ uri: item.compressedUri || item.uri }}
            style={styles.postImage}
          />
        ) : (
          <View style={styles.videoContainer}>
            <Video
              ref={ref => handleVideoRef(ref, item.id)}
              source={{ uri: item.uri }}
              style={styles.postImage}
              muted={true} // always muted in grid
              repeat
              resizeMode="cover"
              paused={true} // always paused in grid
              onLoad={() => setVideoLoading(false)}

              onError={(error: any) => {
                console.log("Video error:", error);
                Alert.alert('Error', 'Failed to load video');
                setVideoLoading(false)
              }}
            />
            {/* Video controls overlay removed for grid layout */}
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
            {/* <Text style={styles.multipleMediaText}>{item.mediaCount}</Text> */}
          </View>
        )}

        {/* Top-right options icon */}
        {
          console.log("activeTab", activeTab)

        }
        {isFromSearch || activeTab == 'tagged' ? null : (
          <TouchableOpacity
            style={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}
            onPress={e => {
              e.stopPropagation();
              setSelectedPost(item);
              setOptionsVisible(true);
            }}>
            <Ionicons name="ellipsis-vertical" size={20} color="#fff" />
          </TouchableOpacity>
        )}

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
        <Text style={[styles.statNumber, { color: '#bea063' }]}>
          {feedPostCount}
        </Text>
        <Text style={[styles.statLabel, { color: '#bea063' }]}>Posts</Text>
      </View>
      <TouchableOpacity
        style={styles.statItem}
        onPress={() =>
          isFromSearch
            ? null
            : navigation.navigate('FollowersFollowingScreen', {
              type: 'followers',
              userId: '1',
              username: profile.username,
            })
        }>
        <Text style={[styles.statNumber, { color: '#bea063' }]}>
          {profile.followersCount}
        </Text>
        <Text style={[styles.statLabel, { color: '#bea063' }]}>Followers</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.statItem}
        onPress={() =>
          isFromSearch
            ? null
            : navigation.navigate('FollowersFollowingScreen', {
              type: 'following',
              userId: '1',
              username: profile.username,
            })
        }>
        <Text style={[styles.statNumber, { color: '#bea063' }]}>
          {profile.followingCount}
        </Text>
        <Text style={[styles.statLabel, { color: '#bea063' }]}>Following</Text>
      </TouchableOpacity>
    </View>
  );

  // const renderProfileHeader = () => (
  //   <View style={styles.profileHeader}>
  //     <Image source={{uri: profile.profileImage}} style={styles.profileImage} />
  //     {renderStats()}
  //   </View>
  // );

  const renderProfileHeader = () => {
    const showDefaultImage =
      !profile.profileImage ||
      profile.profileImage === '' ||
      profile.profileImage === null ||
      profile.profileImage === undefined;
    return (
      <View style={styles.profileHeader}>
        <Image
          source={
            showDefaultImage
              ? imageSource // your local asset
              : { uri: profile.profileImage }
          }
          style={styles.profileImage}
        />{' '}
        {renderStats()}
      </View>
    );
  };

  const renderBio = () => {
    console.log('renderBio vendorProfile:', vendorProfile);
    return (
      <View style={styles.bioContainer}>
        <Text style={[styles.username, { color: '#bea063' }]}>@{profile.username}</Text>
        <Text style={[styles.fullName, { color: '#bea063' }]}>{profile.fullName}</Text>
        {/* Debug: show raw vendorProfile data */}
        {/* <Text style={{color: 'red', fontSize: 12}}>DEBUG: {JSON.stringify(vendorProfile)}</Text> */}
        {/* Main Categories */}
        {vendorProfile && Array.isArray(vendorProfile?.main_categories) && vendorProfile?.main_categories.length > 0 && (
          <>
            {/* <Text style={{ color: '#bea063', fontWeight: 'bold', marginTop: 8, marginBottom: 2 }}>Main Categories</Text> */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4 }}>
              {vendorProfile?.main_categories.map((cat: { id: number, name: string }) => (
                <View key={cat.id} style={{
                  backgroundColor: '#fffbe6',
                  borderColor: '#bea063',
                  borderWidth: 1,
                  borderRadius: 16,
                  paddingHorizontal: 12,
                  paddingVertical: 5,
                  marginRight: 8,
                  marginBottom: 8,
                }}>
                  <Text style={{ color: '#bea063', fontSize: 14, fontWeight: '500' }}>{cat.name}</Text>
                </View>
              ))}
            </View>
          </>
        )}
        {/* Sub Categories */}
        {vendorProfile && Array.isArray(vendorProfile?.subcategories) && vendorProfile?.subcategories.length > 0 && (
          <>
            <Text style={{ color: '#bea063', fontWeight: 'bold', marginTop: 4, marginBottom: 2 }}>Sub Categories</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4 }}>
              {vendorProfile?.subcategories.map((cat: { id: number, name: string }) => (
                <View key={cat.id} style={{
                  backgroundColor: '#fff5e0',
                  borderColor: '#bea063',
                  borderWidth: 1,
                  borderRadius: 16,
                  paddingHorizontal: 12,
                  paddingVertical: 5,
                  marginRight: 8,
                  marginBottom: 8,
                }}>
                  <Text style={{ color: '#bea063', fontSize: 14, fontWeight: '500' }}>{cat.name}</Text>
                </View>
              ))}
            </View>
          </>
        )}
        : null
      </View>
    );
  };

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      <TouchableOpacity
        style={[styles.tabButton, activeTab === 'draft' && styles.activeTab]}
        onPress={() => setActiveTab('draft')}>
        <Ionicons
          name="document-outline"
          size={24}
          color={activeTab === 'draft' ? '#bea063' : '#888'}
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tabButton, activeTab === 'posts' && styles.activeTab]}
        onPress={() => setActiveTab('posts')}>
        <Ionicons
          name="grid-outline"
          size={24}
          color={activeTab === 'posts' ? '#bea063' : '#888'}
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tabButton, activeTab === 'reels' && styles.activeTab]}
        onPress={() => setActiveTab('reels')}>
        <Ionicons
          name="play-outline"
          size={24}
          color={activeTab === 'reels' ? '#bea063' : '#888'}
        />
      </TouchableOpacity>
      {isFromSearch ? null : (
        <>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'saved' && styles.activeTab]}
            onPress={() => setActiveTab('saved')}>
            <Ionicons
              name="bookmark-outline"
              size={24}
              color={activeTab === 'saved' ? '#bea063' : '#888'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'tagged' && styles.activeTab]}
            onPress={() => setActiveTab('tagged')}>
            <Ionicons
              name="pricetag-outline"
              size={24}
              color={activeTab === 'tagged' ? '#bea063' : '#888'}
            />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
  const renderFullscreenItem = ({ item, index }: { item: any, index: number }) => {
    const windowWidth = Dimensions.get('window').width;
    const postState = postStates[item.id] || {
      isLiked: false,
      likesCount: item.likes,
      likeLoading: false,
    };
    const mediaItems = item.allMedia || [item.uri];
    const currentMediaIndexForPost = postMediaIndices[item.id] || 0;
    const currentMedia = mediaItems[currentMediaIndexForPost];
    const isVideo =
      currentMedia &&
      (currentMedia.includes('.mp4') ||
        currentMedia.includes('.mov') ||
        currentMedia.includes('.avi'));
    const videoId =
      mediaItems.length > 1
        ? `${item.id}-${currentMediaIndexForPost}`
        : item.id;
    const videoState = fullscreenVideoStates[videoId] || { paused: true, muted: true };

    // Use mentioned user's profile if in tagged tab and available
    let displayProfile = profile;
    if (activeTab === 'tagged' && item.mentionedProfile) {
      displayProfile = {
        username: item.mentionedProfile.username || '',
        fullName: `${item.mentionedProfile.first_name || ''} ${item.mentionedProfile.last_name || ''}`.trim(),
        bio: item.mentionedProfile.bio || '',
        profileImage: item.mentionedProfile.profile_picture,
        postsCount: 0,
        followersCount: 0,
        followingCount: 0,
        id: item.mentionedProfile.user || '',
        location: '',
      };
    }
    console.log("displayProfile.profileImage", displayProfile.profileImage);


    return (
      <View style={{ backgroundColor: '#fff', width: windowWidth }}>
        {/* Header: Profile, location, options */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingTop: 8, paddingBottom: 4 }}>
          {displayProfile.profileImage ?
            <Image source={{ uri: displayProfile.profileImage }} style={{ width: 32, height: 32, borderRadius: 16, marginRight: 8 }} /> :
            <View style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor: '#f5f5f5',
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 1.5,
              borderColor: '#bea063',
              overflow: 'hidden',
              marginRight: 10,
            }}>
              <Ionicons name="person-circle" size={38} color="#bea063" />
            </View>
          }
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#bea063', fontWeight: 'bold', fontSize: 15 }}>{displayProfile.username}</Text>
            {item.location ? (
              <Text style={{ color: '#bea063', fontSize: 12 }}>{item.location}</Text>
            ) : null}
          </View>
          {(isFromSearch || activeTab === 'tagged') ? null : (
            <TouchableOpacity onPress={() => {
              setSelectedPost(item);
              setOptionsVisible(true);
            }} style={{ padding: 2 }}>
              <Ionicons name="ellipsis-vertical" size={20} color="#bea063" />
            </TouchableOpacity>
          )}
        </View>
        {/* Date under header, left-aligned */}

        {/* Main media - dynamic height, no aspect ratio */}
        <View style={{ width: '100%', backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
          {isVideo ? (
            <>
              <Video
                ref={ref => handleVideoRef(ref, videoId)}
                source={{ uri: currentMedia }}
                style={{ width: '100%', height: undefined, aspectRatio: 1, backgroundColor: '#fff' }}
                muted={videoState.muted}
                repeat
                resizeMode="contain"
                paused={videoState.paused}
                onLoadStart={() => setVideoLoading(true)}
                onLoad={() => setVideoLoading(false)}
                onError={(error: any) => {
                  console.log("Video error:", error);
                  Alert.alert('Error', 'Failed to load video');


                  setVideoLoading(false)
                }}
              />
              {videoLoading && (
                <ActivityIndicator
                  size="large"
                  color="#bea063"
                  style={{ position: 'absolute', top: '45%', left: '45%' }}
                />
              )}
              {/* Video controls */}
              <View style={{
                position: 'absolute',
                bottom: 24,
                right: 24,
                flexDirection: 'row-reverse',
                gap: 16,
              }}>
                <TouchableOpacity
                  onPress={() => setFullscreenVideoStates(prev => ({
                    ...prev,
                    [videoId]: { ...videoState, paused: !videoState.paused }
                  }))}
                  style={{ marginLeft: 16, backgroundColor: '#fff', borderRadius: 20, padding: 8, elevation: 2 }}
                >
                  <Ionicons name={videoState.paused ? 'play' : 'pause'} size={24} color="#bea063" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setFullscreenVideoStates(prev => ({
                    ...prev,
                    [videoId]: { ...videoState, muted: !videoState.muted }
                  }))}
                  style={{ backgroundColor: '#fff', borderRadius: 20, padding: 8, elevation: 2 }}
                >
                  <Ionicons name={videoState.muted ? 'volume-mute' : 'volume-high'} size={24} color="#bea063" />
                </TouchableOpacity>
              </View>
              {/* Overlay play icon if paused */}
              {videoState.paused && !videoLoading && (
                <View style={{ position: 'absolute', top: '45%', left: '45%' }}>
                  <Ionicons name="play-circle" size={48} color="#bea063" />
                </View>
              )}
            </>
          ) : (
            <Image
              source={{ uri: currentMedia }}
              style={{ width: '100%', height: undefined, aspectRatio: 1, resizeMode: 'contain', backgroundColor: '#fff' }}
            />
          )}
        </View>
        {/* Action row: like, comment, share, play/pause, mute/unmute, bookmark */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 10 }}>
          {/* Like button and count */}
          <TouchableOpacity onPress={() => handleLike(item)} disabled={postState.likeLoading} style={{ marginRight: 5 }}>
            {postState.likeLoading ? (
              <ActivityIndicator size={20} color="#bea063" />
            ) : (
              <Ionicons name={postState.isLiked ? 'heart' : 'heart-outline'} size={26} color="#bea063" />
            )}
          </TouchableOpacity>
          {item.hide_like_count === false && postState.likesCount > 0 && (
            <Text style={{ color: '#bea063', fontWeight: '600', fontSize: 13, marginRight: 5, marginBottom: 1 }}>
              {postState.likesCount}
              {/* {postState.likesCount === 1 ? 'like' : 'likes'} */}
            </Text>
          )}
          {/* Comment button and count */}
          {item.allow_comments !== false && (
            <>
              <TouchableOpacity onPress={() => handleComment(item)} style={{ marginLeft: 8 }}>
                <Ionicons name="chatbubble-outline" size={22} color="#bea063" />
              </TouchableOpacity>
              <Text style={{ color: '#bea063', fontWeight: '600', marginLeft: 5 }}>
                {item.comments}
              </Text>
            </>
          )}
          {/* Share button */}
          <TouchableOpacity onPress={() => handleShare(item)} style={{ marginLeft: 10 }}>
            <Ionicons name="share-social-outline" size={24} color="#bea063" />
          </TouchableOpacity>
        </View>
        {/* Likes row */}

        {/* Caption row */}
        {item.createdAt && (
          <Text style={{ color: '#bea063', fontSize: 13, marginLeft: 16, marginBottom: 2 }}>
            {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </Text>
        )}
        {item.caption && (
          <Text style={{ color: '#fff', fontSize: 13, paddingHorizontal: 10, marginBottom: 1 }}>
            <Text style={{ fontWeight: 'bold', color: 'gray' }}>{profile.username} </Text>
            {item.caption}
          </Text>
        )}
      </View>
    );
  };

  // Add state for video controls in fullscreen
  const [fullscreenVideoStates, setFullscreenVideoStates] = useState<{ [key: string]: { paused: boolean; muted: boolean } }>({});

  // Fullscreen Modal for video playback
  <Modal
    visible={fullscreenVisible}
    animationType="slide"
    onRequestClose={() => setFullscreenVisible(false)}
    transparent={false}
  >
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 20,
        paddingBottom: 10,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
      }}>
        <TouchableOpacity
          onPress={() => setFullscreenVisible(false)}
          style={{ padding: 6, marginRight: 10 }}>
          <Ionicons name="arrow-back" size={26} color="#bea063" />
        </TouchableOpacity>
        <Text style={{ color: '#bea063', fontWeight: 'bold', fontSize: 18 }}>
          Posts
        </Text>
      </View>
      {filteredPosts.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 18 }}>
            No posts to display
          </Text>
        </View>
      ) : (
        <FlatList
          ref={fullscreenFlatListRef}
          data={filteredPosts}
          renderItem={renderFullscreenItem}
          keyExtractor={item => item.id}
          initialScrollIndex={selectedIndex}
          getItemLayout={(data, index) => ({
            length: Dimensions.get('window').height,
            offset: Dimensions.get('window').height * index,
            index,
          })}
          showsVerticalScrollIndicator={false}
          viewabilityConfig={viewabilityConfig}
          onViewableItemsChanged={onViewableItemsChanged}
          removeClippedSubviews={true} // Only render visible items
          initialNumToRender={3} // Only render 3 items at a time
          maxToRenderPerBatch={3}
          windowSize={5}
          contentContainerStyle={{ backgroundColor: '#fff' }}
        />
      )}
    </SafeAreaView>
  </Modal>



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

  // Highlights state and fetch
  const [highlights, setHighlights] = useState<any[]>([]);
  const [highlightsLoading, setHighlightsLoading] = useState(false);
  const [createHighlightModalVisible, setCreateHighlightModalVisible] =
    useState(false);
  const [newHighlightTitle, setNewHighlightTitle] = useState('');
  const [createHighlightLoading, setCreateHighlightLoading] = useState(false);
  const [createHighlightError, setCreateHighlightError] = useState<
    string | null
  >(null);

  // Fetch highlights from correct endpoint
  const fetchHighlights = async () => {
    setHighlightsLoading(true);
    try {
      const authToken = await AsyncStorage.getItem('accessToken');
      const headers = {
        Accept: 'application/json',
        Authorization: `Bearer ${authToken}`,
      };
      const res = await axios.get('https://pashuahar.com/highlights/', {
        headers,
      });
      setHighlights(res.data || []);
    } catch (err) {
      setHighlights([]);
    } finally {
      setHighlightsLoading(false);
    }
  };

  useEffect(() => {
    fetchHighlights();
  }, []);

  // Create highlight API call
  const createHighlight = async () => {
    if (!newHighlightTitle.trim()) {
      setCreateHighlightError('Title is required');
      return;
    }
    setCreateHighlightLoading(true);
    setCreateHighlightError(null);
    try {
      const authToken = await AsyncStorage.getItem('accessToken');
      const headers = {
        Accept: 'application/json',
        Authorization: `Bearer ${authToken}`,
      };
      const res = await axios.post(
        'https://pashuahar.com/highlights/',
        {
          title: newHighlightTitle,
        },
        { headers },
      );

      // console.log('Created collection', res.data);

      // Refresh collections after creating
      fetchHighlights();

      return res.data;
    } catch (err) {
      setCreateHighlightError('Failed to create highlight');
    } finally {
      setCreateHighlightLoading(false);
    }
  };

  // Render highlight item
  const renderHighlightItem = ({ item }: { item: any }) => {
    if (item.isNew) {
      // + New button
      return (
        <View style={{ alignItems: 'center', marginRight: 16 }}>
          <TouchableOpacity
            style={{
              width: 70,
              height: 70,
              borderRadius: 35,
              borderWidth: 2,
              borderColor: '#bea063',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#fff',
            }}
            onPress={() => setCreateHighlightModalVisible(true)}>
            <Ionicons name="add" size={36} color="#bea063" />
          </TouchableOpacity>
          <Text style={{ color: '#bea063', marginTop: 6, fontSize: 13 }}>
            New
          </Text>
        </View>
      );
    }
    // Highlight cover
    const cover =
      item.cover_image ||
      (item.stories && item.stories[0]?.media_file) ||
      'https://via.placeholder.com/100x100/222/fff?text=H';
    return (
      <View style={{ alignItems: 'center', marginRight: 16 }}>
        <TouchableOpacity
          style={{
            width: 70,
            height: 70,
            borderRadius: 35,
            borderWidth: 2,
            borderColor: '#bea063',
            overflow: 'hidden',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#fff',
          }}
          onPress={() => openHighlightViewer(item.id, item.title)}>
          <Image
            source={{ uri: cover }}
            style={{ width: 66, height: 66, borderRadius: 33 }}
          />
        </TouchableOpacity>
        <Text
          style={{ color: '#bea063', marginTop: 6, fontSize: 13, maxWidth: 80 }}
          numberOfLines={1}>
          {item.title || 'Highlights'}
        </Text>
      </View>
    );
  };

  // Highlight viewer state
  const [highlightViewerVisible, setHighlightViewerVisible] = useState(false);
  const [highlightStories, setHighlightStories] = useState<any[]>([]);
  const [highlightTitle, setHighlightTitle] = useState('');
  const [highlightLoading, setHighlightLoading] = useState(false);
  // In highlight viewer state, add highlightId
  const [highlightId, setHighlightId] = useState<number | null>(null);

  // Add state for highlight loading overlay
  const [highlightLoadingOverlay, setHighlightLoadingOverlay] = useState(false);

  // In openHighlightViewer, set highlightId
  const openHighlightViewer = async (
    highlightIdParam: number,
    title: string,
  ) => {
    setHighlightLoadingOverlay(true);
    setHighlightLoading(true);
    setHighlightId(highlightIdParam);
    try {
      const authToken = await AsyncStorage.getItem('accessToken');
      const headers = {
        Accept: 'application/json',
        Authorization: `Bearer ${authToken}`,
      };
      const res = await axios.get(
        `https://pashuahar.com/highlights/${highlightIdParam}`,
        { headers },
      );
      setHighlightStories(res.data.stories || []);
      setHighlightTitle(title);
      setHighlightViewerVisible(true);
    } catch (err) {
      Alert.alert('Error', 'Failed to load highlight stories');
    } finally {
      setHighlightLoading(false);
      setHighlightLoadingOverlay(false);
    }
  };

  // Edit highlight state
  const [editHighlightModalVisible, setEditHighlightModalVisible] =
    useState(false);
  const [editHighlightTitle, setEditHighlightTitle] = useState('');
  const [editHighlightId, setEditHighlightId] = useState<number | null>(null);
  const [editHighlightStories, setEditHighlightStories] = useState<any[]>([]);
  const [editHighlightCoverId, setEditHighlightCoverId] = useState<
    number | null
  >(null);
  const [editHighlightLoading, setEditHighlightLoading] = useState(false);
  const [editHighlightError, setEditHighlightError] = useState<string | null>(
    null,
  );

  // In openEditHighlight, use highlightId from state
  const openEditHighlight = () => {
    setEditHighlightId(highlightId);
    setEditHighlightTitle(highlightTitle);
    setEditHighlightStories(highlightStories);
    setEditHighlightCoverId(highlightStories[0]?.id || null);
    setEditHighlightModalVisible(true);
  };

  // Save highlight edits
  const saveEditHighlight = async () => {
    if (!editHighlightId) return;
    setEditHighlightLoading(true);
    setEditHighlightError(null);
    try {
      const authToken = await AsyncStorage.getItem('accessToken');
      const headers = {
        Accept: 'application/json',
        Authorization: `Bearer ${authToken}`,
      };
      // Send as plain JSON, not FormData
      const payload: any = {};
      if (editHighlightTitle) payload.title = editHighlightTitle;
      // if (editHighlightCoverId) payload.cover_story = editHighlightCoverId;
      // if (editHighlightStories.length > 0) payload.story_ids = editHighlightStories.map(s => s.id).join(',');
      // console.log(
      //   '[saveEditHighlight] PATCH /highlights/' + editHighlightId + '/',
      // );
      // console.log('[saveEditHighlight] Payload:', payload);
      let response = await axios.patch(
        `https://pashuahar.com/highlights/${editHighlightId}/`,
        payload,
        { headers },
      );
      console.log('[saveEditHighlight] Response:', response?.data);
      setEditHighlightModalVisible(false);
      setHighlightViewerVisible(false);
      await fetchHighlights();
      // if (editHighlightId) await openHighlightViewer(editHighlightId, editHighlightTitle); // Ensure this stays commented out
    } catch (err) {
      // console.log('[saveEditHighlight] Error:', err);
      setEditHighlightError('Failed to update highlight');
    } finally {
      setEditHighlightLoading(false);
    }
  };

  // Delete highlight
  const deleteHighlight = async () => {
    if (!highlightId) return;
    Alert.alert(
      'Delete Highlight',
      'Are you sure you want to delete this highlight?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const authToken = await AsyncStorage.getItem('accessToken');
              const headers = {
                Accept: 'application/json',
                Authorization: `Bearer ${authToken}`,
              };
              await axios.delete(
                `https://pashuahar.com/highlights/${highlightId}/`,
                { headers },
              );
              setHighlightViewerVisible(false);
              await fetchHighlights();
            } catch (err) {
              Alert.alert('Error', 'Failed to delete highlight');
            }
          },
        },
      ],
    );
  };

  // Add state for story selection modal
  const [storySelectModalVisible, setStorySelectModalVisible] = useState(false);
  const [allUserStories, setAllUserStories] = useState<any[]>([]);
  const [selectedStoryIds, setSelectedStoryIds] = useState<number[]>([]);
  const [storySelectLoading, setStorySelectLoading] = useState(false);
  const [storySelectError, setStorySelectError] = useState<string | null>(null);
  const [accountsModalVisible, setAccountsModalVisible] = useState(false);
  const [accountsList, setAccountsList] = useState<any[]>([]);
  // Open story selection modal after highlight click
  useEffect(() => {
    // Whenever modal opens, load users
    if (accountsModalVisible) {
      getAccounts().then(setAccountsList).catch(error => {
        console.error('Error loading accounts:', error);
        setAccountsList([]);
      });
    }
  }, [accountsModalVisible]);
  // Save selected stories to highlight
  const saveStoriesToHighlight = async (highlightId: number) => {
    if (!selectedStoryIds.length) return;
    setStorySelectLoading(true);
    setStorySelectError(null);
    try {
      const authToken = await AsyncStorage.getItem('accessToken');
      const headers = {
        Accept: 'application/json',
        Authorization: `Bearer ${authToken}`,
      };
      const payload = { story_ids: selectedStoryIds.join(',') };
      console.log(
        '[saveStoriesToHighlight] PATCH /highlights/' + highlightId + '/',
      );
      console.log('[saveStoriesToHighlight] Payload:', payload);
      const response = await axios.patch(
        `https://pashuahar.com/highlights/${highlightId}/`,
        payload,
        { headers },
      );
      console.log('[saveStoriesToHighlight] Response:', response?.data);
      setStorySelectModalVisible(false);
      await fetchHighlights();
      if (highlightId) await openHighlightViewer(highlightId, highlightTitle);
    } catch (err) {
      setStorySelectError('Failed to update highlight');
      console.log('[saveStoriesToHighlight] Error:', err);
    } finally {
      setStorySelectLoading(false);
    }
  };

  // In the ProfileScreen component, add these functions:
  const handleToggleComments = async () => {
    if (!selectedPost) return;
    try {
      const authToken = await AsyncStorage.getItem('accessToken');
      const headers = {
        Accept: 'application/json',
        Authorization: `Bearer ${authToken}`,
      };
      const newValue = !selectedPost.allow_comments;
      await axios.patch(
        `https://pashuahar.com/posts/${selectedPost.id}/`,
        { allow_comments: newValue },
        { headers },
      );
      setPosts(prevPosts =>
        prevPosts.map(p =>
          p.id === selectedPost.id ? { ...p, allow_comments: newValue } : p,
        ),
      );
      setSelectedPost((prev: any) =>
        prev ? { ...prev, allow_comments: newValue } : prev,
      );
      Alert.alert(
        'Success',
        `Comments have been turned ${newValue ? 'on' : 'off'}.`,
      );
    } catch (err) {
      Alert.alert('Error', 'Failed to update comments setting.');
    }
  };

  const handleToggleLikeCount = async () => {
    if (!selectedPost) return;
    try {
      const authToken = await AsyncStorage.getItem('accessToken');
      const headers = {
        Accept: 'application/json',
        Authorization: `Bearer ${authToken}`,
      };
      const newValue = !selectedPost.hide_like_count;
      await axios.patch(
        `https://pashuahar.com/posts/${selectedPost.id}/`,
        { hide_like_count: newValue },
        { headers },
      );
      setPosts(prevPosts =>
        prevPosts.map(p =>
          p.id === selectedPost.id ? { ...p, hide_like_count: newValue } : p,
        ),
      );
      setSelectedPost((prev: any) =>
        prev ? { ...prev, hide_like_count: newValue } : prev,
      );
      Alert.alert(
        'Success',
        `Like count will now be ${newValue ? 'hidden' : 'shown'}.`,
      );
    } catch (err) {
      Alert.alert('Error', 'Failed to update like count setting.');
    }
  };

  const [highlightStoryIndex, setHighlightStoryIndex] = useState(0);

  // Add state for removing story loader
  const [removingStoryId, setRemovingStoryId] = useState<number | null>(null);

  // Add function to remove a story from highlight
  const removeStoryFromHighlight = async (storyId: number) => {
    if (!highlightId) return;
    setRemovingStoryId(storyId);
    try {
      const authToken = await AsyncStorage.getItem('accessToken');
      const headers = {
        Accept: 'application/json',
        Authorization: `Bearer ${authToken}`,
      };
      await axios.post(
        `https://pashuahar.com/highlights/${highlightId}/remove-story/`,
        { story_id: storyId },
        { headers },
      );
      // Remove the story from the local state
      setHighlightStories(prev => prev.filter(story => story.id !== storyId));
    } catch (err) {
      Alert.alert('Error', 'Failed to remove story from highlight');
    } finally {
      setRemovingStoryId(null);
    }
  };

  const [role, setRole] = useState<string | null>(null);
  const [vendorProfile, setVendorProfile] = useState<any>(null);

  const renderVendorCategories = () => {
    if (role !== 'vendor' || !vendorProfile) return null;

    const mainCategories = vendorProfile?.main_categories || [];
    const subCategories = vendorProfile?.subcategories || [];

    // Only show if there is at least one main or sub category
    if (mainCategories.length === 0 && subCategories.length === 0) return null;

    return (
      <View style={{ paddingHorizontal: 20, marginBottom: 10 }}>
        {mainCategories.length > 0 && (
          <>
            <Text style={{ fontWeight: 'bold', color: '#bea063', fontSize: 16, marginBottom: 4 }}>
              Main Categories
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
              {mainCategories.map((cat: any, idx: number) => (
                <View key={idx} style={{ backgroundColor: '#fff5e0', borderColor: '#bea063', borderWidth: 1, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 4, marginRight: 8, marginBottom: 8 }}>
                  <Text style={{ color: '#bea063', fontSize: 14 }}>
                    {cat.name || cat.category_name || cat.id}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}
        {subCategories.length > 0 && (
          <>
            <Text style={{ fontWeight: 'bold', color: '#bea063', fontSize: 16, marginBottom: 4 }}>
              Sub Categories
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {subCategories.map((cat: any, idx: number) => (
                <View key={idx} style={{ backgroundColor: '#fff5e0', borderColor: '#bea063', borderWidth: 1, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 4, marginRight: 8, marginBottom: 8 }}>
                  <Text style={{ color: '#bea063', fontSize: 14 }}>
                    {cat.name || cat.id}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}
      </View>
    );
  };

  // Add this function to ProfileScreen if not present
  const handleShare = () => {
    Alert.alert('Share', 'Share functionality coming soon!');
  };

  const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);
  const [selectedCommentPost, setSelectedCommentPost] = useState<any>(null);

  // Add these functions above your return statement, with correct spelling and logic:

  const handleDeleteDraft = async () => {
    if (!selectedPost) return;
    setDeleteLoading(true);
    try {
      const authToken = await AsyncStorage.getItem('accessToken');
      const headers = {
        Accept: 'application/json',
        Authorization: `Bearer ${authToken}`,
      };
      await axios.delete(`https://pashuahar.com/posts/${selectedPost.id}/`, { headers });
      setDraftPosts(prev => prev.filter(p => p.id !== selectedPost.id));
      setOptionsVisible(false);
      setSelectedPost(null);
      Alert.alert('Deleted', 'Draft deleted successfully.');
    } catch (err) {
      Alert.alert('Error', 'Failed to delete draft.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handlePostDraft = async () => {
    if (!selectedPost) return;
    setPostLoading(true);
    try {
      const authToken = await AsyncStorage.getItem('accessToken');
      const headers = {
        Accept: 'application/json',
        Authorization: `Bearer ${authToken}`,
      };
      console.log("selectedPostselectedPost", selectedPost);

      await axios.patch(
        `https://pashuahar.com/posts/${selectedPost.id}/`,
        { is_draft: false },
        { headers }
      );
      setDraftPosts(prev => prev.filter(p => p.id !== selectedPost.id));
      setOptionsVisible(false);
      setSelectedPost(null);
      Alert.alert('Posted', 'Draft published successfully.');
    } catch (err) {
      Alert.alert('Error', 'Failed to publish draft.');
    } finally {
      setPostLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setProfileOptionsModalVisible(true)}>
          <Text style={styles.headerTitle}>{profile?.username}</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('UploadOptions');
              /* Add your plus icon action here */
            }}>
            <Ionicons name="add" size={28} color="#bea063" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Menu', { data: data })}>
            <Ionicons
              name="menu-outline"
              size={24}
              color="#bea063"
              style={{ marginRight: 18 }}
            />
          </TouchableOpacity>
        </View>
      </View>
      {/* Fullscreen Modal */}
      <Modal
        visible={fullscreenVisible}
        animationType="slide"
        onRequestClose={() => setFullscreenVisible(false)}
        transparent={false}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingTop: 20,
            paddingBottom: 10,
            paddingHorizontal: 10,
            backgroundColor: '#fff',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
          }}>
            <TouchableOpacity
              onPress={() => setFullscreenVisible(false)}
              style={{ padding: 6, marginRight: 10 }}>
              <Ionicons name="arrow-back" size={26} color="#bea063" />
            </TouchableOpacity>
            <Text style={{ color: '#bea063', fontWeight: 'bold', fontSize: 18 }}>
              Posts
            </Text>
          </View>
          {filteredPosts.length === 0 ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: '#fff', fontSize: 18 }}>
                No posts to display
              </Text>
            </View>
          ) : (
            <FlatList
              ref={fullscreenFlatListRef}
              data={filteredPosts}
              renderItem={renderFullscreenItem}
              keyExtractor={item => item.id}
              initialScrollIndex={selectedIndex}
              getItemLayout={(data, index) => ({
                length: Dimensions.get('window').height,
                offset: Dimensions.get('window').height * index,
                index,
              })}
              showsVerticalScrollIndicator={false}
              viewabilityConfig={viewabilityConfig}
              onViewableItemsChanged={onViewableItemsChanged}
              removeClippedSubviews={true} // Only render visible items
              initialNumToRender={3} // Only render 3 items at a time
              maxToRenderPerBatch={3}
              windowSize={5}
              contentContainerStyle={{ backgroundColor: '#fff' }}
            />
          )}
        </SafeAreaView>
      </Modal>
      {/* Main Profile Content */}
      <ScrollView>
        {loading && (
          <View
            style={{
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
        {renderVendorCategories()}
        {renderProfileHeader()}
        {renderBio()}
        {renderVendorCategories()}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('EditProfile', { data: data })}>
            <Text style={[styles.editButtonText, { color: '#fff' }]}>
              Edit Profile
            </Text>
          </TouchableOpacity>
          {/* <TouchableOpacity style={styles.shareButton}>
            <Ionicons name="share-outline" size={20} color="#000" />
          </TouchableOpacity> */}
        </View>

        {/* Highlights row moved here */}
        {highlightsLoading ? (
          <View
            style={{
              marginVertical: 12,
              marginLeft: 12,
              alignItems: 'center',
              height: 90,
              justifyContent: 'center',
            }}>
            <ActivityIndicator size="small" color="#bea063" />
          </View>
        ) : (
          <FlatList
            data={[{ isNew: true }, ...highlights]}
            renderItem={
              renderHighlightItem as ({ item }: { item: any }) => JSX.Element
            }
            keyExtractor={item => (item.id ? item.id.toString() : 'new')}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginVertical: 12, marginLeft: 12 }}
            contentContainerStyle={{ alignItems: 'center' }}
          />
        )}

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
        ) : activeTab === 'draft' && draftLoading ? (
          <View style={styles.emptyStateContainer}>
            <ActivityIndicator size="large" color="#bea063" />
            <Text style={styles.emptyStateText}>Loading drafts...</Text>
          </View>
        ) : activeTab === 'draft' && draftError ? (
          <View style={styles.emptyStateContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#666" />
            <Text style={styles.emptyStateText}>{draftError}</Text>
          </View>
        ) : activeTab === 'draft' && filteredPosts.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Ionicons name="document-outline" size={48} color="#666" />
            <Text style={styles.emptyStateText}>No drafts found</Text>
            <Text style={styles.emptyStateSubtext}>
              You have not saved any drafts yet.
            </Text>

          </View>
        ) : activeTab === 'tagged' && taggedLoading ? (
          <View style={styles.emptyStateContainer}>
            <ActivityIndicator size="large" color="#bea063" />
            <Text style={styles.emptyStateText}>Loading tagged posts...</Text>
          </View>
        ) : activeTab === 'tagged' && taggedError ? (
          <View style={styles.emptyStateContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#666" />
            <Text style={styles.emptyStateText}>{taggedError}</Text>
          </View>
        ) : activeTab === 'tagged' && filteredPosts.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Ionicons name="pricetag-outline" size={48} color="#666" />
            <Text style={styles.emptyStateText}>No tagged posts yet</Text>
          </View>
        ) : (
          <FlatList
            initialNumToRender={10}
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
          {isFromSearch ? null : (
            <View
              style={{
                backgroundColor: '#fff',
                borderRadius: 10,
                padding: 20,
                minWidth: 180,
              }}>
              {activeTab === 'draft' ? (
                <>
                  <TouchableOpacity
                    onPress={handlePostDraft}
                    style={{ paddingVertical: 10, flexDirection: 'row', alignItems: 'center' }}
                    disabled={postLoading}
                  >
                    {postLoading ? (
                      <ActivityIndicator size={18} color="#bea063" style={{ marginRight: 8 }} />
                    ) : (
                      <Ionicons name="cloud-upload-outline" size={20} color="#bea063" style={{ marginRight: 8 }} />
                    )}
                    <Text style={{ fontSize: 16, color: '#bea063' }}>Post</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleDeleteDraft}
                    style={{ paddingVertical: 10, flexDirection: 'row', alignItems: 'center' }}
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? (
                      <ActivityIndicator size={18} color="#E74C3C" style={{ marginRight: 8 }} />
                    ) : (
                      <Ionicons name="trash" size={20} color="#E74C3C" style={{ marginRight: 8 }} />
                    )}
                    <Text style={{ fontSize: 16, color: 'black' }}>Delete</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    onPress={handleEdit}
                    style={{ paddingVertical: 10 }}>
                    <Text style={{ fontSize: 16 }}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleDelete}
                    style={{
                      paddingVertical: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <Text style={{ fontSize: 16, color: 'black' }}>Delete</Text>
                  </TouchableOpacity>
                  {/* Toggle Comments Button */}
                  <TouchableOpacity
                    onPress={handleToggleComments}
                    style={{ paddingVertical: 10 }}>
                    <Text style={{ fontSize: 16 }}>
                      {selectedPost?.allow_comments
                        ? 'Turn Off Comments'
                        : 'Turn On Comments'}
                    </Text>
                  </TouchableOpacity>
                  {/* Toggle Like Count Button */}
                  <TouchableOpacity
                    onPress={handleToggleLikeCount}
                    style={{ paddingVertical: 10 }}>
                    <Text style={{ fontSize: 16 }}>
                      {selectedPost?.hide_like_count
                        ? 'Show Like Count'
                        : 'Hide Like Count'}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
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
                color: '#bea063',
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
              style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  padding: 12,
                  marginRight: 10,
                  borderWidth: 1,
                  borderColor: '#bea063',
                  borderRadius: 5,
                  alignItems: 'center',
                  backgroundColor: '#fff',
                }}
                onPress={() => {
                  setCreateCollectionModalVisible(false);
                  setNewCollectionName('');
                }}>
                <Text style={{ fontSize: 16, color: '#bea063', fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
                  padding: 12,
                  backgroundColor: '#bea063',
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
                  <Text style={styles.createCollectionButtonText}>
                    Create Collection
                  </Text>
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
            backgroundColor: '#fff',
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
                marginBottom: 16,
                textAlign: 'center',
                color: '#bea063',
              }}>
              Edit {selectedPost?.type === 'reel' ? 'Reel' : 'Post'}
            </Text>

            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#ddd',
                borderRadius: 5,
                padding: 12,
                marginBottom: 8,
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
            <LocationPicker
              value={editLocation}
              onChange={setEditLocation}
              style={{ marginBottom: 8 }}
              isFromUserProfile={true}
            />

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                gap: 4,
              }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  padding: 12,
                  borderWidth: 1,
                  borderColor: '#bea063',
                  borderRadius: 5,
                  alignItems: 'center',
                  backgroundColor: '#fff',
                }}
                onPress={() => {
                  setEditModalVisible(false);
                  setEditCaption('');
                  setEditLocation(null);
                  setSelectedPost(null);
                }}>
                <Text
                  style={{
                    color: '#bea063',
                    fontWeight: '600',
                    flexWrap: 'wrap',
                    width: '100%',
                  }}
                  numberOfLines={2}
                  ellipsizeMode="tail">
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
                  padding: 12,
                  backgroundColor: '#bea063',
                  borderRadius: 5,
                  alignItems: 'center',
                }}
                onPress={handleEditSubmit}
                disabled={editLoading}>
                {editLoading ? (
                  <ActivityIndicator size={20} color="#fff" />
                ) : (
                  <Text
                    style={{ fontSize: 16, color: '#fff', fontWeight: '600' }}>
                    Update
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
      {/* Add account */}
      <Modal
        visible={accountsModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAccountsModalVisible(false)}>
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.3)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          activeOpacity={1}
          onPressOut={() => setAccountsModalVisible(false)}>
          <View
            style={{
              backgroundColor: '#fff',
              borderRadius: 14,
              padding: 22,
              minWidth: 280,
              maxHeight: 400,
            }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                marginBottom: 18,
                color: '#bea063',
                textAlign: 'center',
              }}>
              Switch Account
            </Text>
            {accountsList.map(acc => (
              <TouchableOpacity
                key={acc.userId}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 14,
                }}
                onPress={async () => {
                  try {
                    await switchAccount(acc.userId);
                    setAccountsModalVisible(false);
                    // Reload app state or navigate accordingly
                    // You might want to call a global refresh function here
                  } catch (error) {
                    console.error('Error switching account:', error);
                    Alert.alert('Error', 'Failed to switch account');
                  }
                }}>
                <Image
                  source={{ uri: acc.avatarUrl || 'https://picsum.photos/60' }}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    marginRight: 10,
                  }}
                />
                <Text style={{ fontSize: 16, color: '#333' }}>
                  {acc.username}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={{ marginTop: 12 }}
              onPress={() => {
                setAccountsModalVisible(false);
                // Navigate to Login/Add Account Screen
                navigation.navigate('Login');
              }}>
              <Text style={{ color: '#bea063', textAlign: 'center' }}>
                Add Account
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={createHighlightModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCreateHighlightModalVisible(false)}>
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.3)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          activeOpacity={1}
          onPressOut={() => setCreateHighlightModalVisible(false)}>
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
                color: '#bea063',
              }}>
              Create New Highlight
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#ddd',
                borderRadius: 5,
                padding: 12,
                marginBottom: 12,
                fontSize: 16,
              }}
              placeholder="Highlight title"
              value={newHighlightTitle}
              onChangeText={setNewHighlightTitle}
              autoFocus
            />
            {createHighlightError && (
              <Text style={{ color: 'red', marginBottom: 8 }}>
                {createHighlightError}
              </Text>
            )}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                gap: 8,
              }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  padding: 12,
                  borderWidth: 1,
                  borderColor: '#bea063',
                  borderRadius: 5,
                  alignItems: 'center',
                  backgroundColor: '#fff',
                }}
                onPress={() => {
                  setCreateHighlightModalVisible(false);
                  setNewHighlightTitle('');
                }}>
                <Text style={{ color: '#bea063', fontWeight: '600' }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  padding: 12,
                  backgroundColor: '#bea063',
                  borderRadius: 5,
                  alignItems: 'center',
                }}
                onPress={createHighlight}
                disabled={createHighlightLoading}>
                {createHighlightLoading ? (
                  <ActivityIndicator size={20} color="#fff" />
                ) : (
                  <Text style={styles.createCollectionButtonText}>
                    Create
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
      {/* Highlight Viewer Modal */}
      <Modal
        visible={highlightViewerVisible}
        animationType="slide"
        onRequestClose={() => setHighlightViewerVisible(false)}
        transparent={false}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 16,
            }}>
            <Text style={{ color: '#bea063', fontSize: 18, fontWeight: 'bold' }}>
              {highlightTitle}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity
                onPress={openEditHighlight}
                style={{ marginRight: 16 }}>
                <Ionicons name="create-outline" size={24} color="#bea063" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={deleteHighlight}
                style={{ marginRight: 16 }}
                accessibilityLabel="Delete Highlight">
                <View
                  style={{
                    backgroundColor: '#E74C3C',
                    borderRadius: 20,
                    padding: 6,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Ionicons name="trash" size={26} color="#fff" />
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setHighlightViewerVisible(false)}>
                <Ionicons name="close" size={28} color="#bea063" />
              </TouchableOpacity>
            </View>
          </View>
          {highlightLoading ? (
            <View
              style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#bea063" />
            </View>
          ) : highlightStories.length === 0 ? (
            <View
              style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Ionicons
                name="image-outline"
                size={64}
                color="#bea063"
                style={{ marginBottom: 16 }}
              />
              <Text
                style={{
                  color: '#bea063',
                  fontSize: 18,
                  fontWeight: 'bold',
                  marginBottom: 8,
                }}>
                No Stories
              </Text>
              <Text
                style={{
                  color: '#bea063',
                  fontSize: 15,
                  textAlign: 'center',
                  maxWidth: 250,
                }}>
                There are no stories in this highlight yet.
              </Text>
            </View>
          ) : (
            <>
              <FlatList
                data={highlightStories}
                horizontal
                pagingEnabled
                keyExtractor={item => item.id?.toString()}
                renderItem={({ item }) => (
                  <View
                    style={{
                      width: Dimensions.get('window').width,
                      flex: 1,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    {/* Remove button */}
                    <TouchableOpacity
                      style={{
                        position: 'absolute',
                        top: 20,
                        right: 20,
                        zIndex: 2,
                        backgroundColor: '#fff',
                        borderRadius: 20,
                        padding: 6,
                        elevation: 2,
                      }}
                      onPress={() => removeStoryFromHighlight(item.id)}
                      disabled={removingStoryId === item.id}
                      accessibilityLabel="Remove Story from Highlight">
                      {removingStoryId === item.id ? (
                        <ActivityIndicator size={18} color="#bea063" />
                      ) : (
                        <Ionicons
                          name="trash-outline"
                          size={22}
                          color="#E74C3C"
                        />
                      )}
                    </TouchableOpacity>
                    {/* Story content */}
                    {item.is_video ? (
                      <Video
                        source={{ uri: item.media_file }}
                        style={{
                          width: '100%',
                          height: 400,
                          backgroundColor: '#eee',
                        }}
                        onError={e => console.error('Video error:', e)}
                        resizeMode="contain"
                        controls
                      />
                    ) : (
                      <Image
                        source={{ uri: item.media_file }}
                        style={{
                          width: '100%',
                          height: 400,
                          resizeMode: 'contain',
                          backgroundColor: '#eee',
                        }}
                      />
                    )}
                    {item.caption ? (
                      <Text
                        style={{
                          color: '#bea063',
                          fontSize: 16,
                          marginTop: 12,
                          textAlign: 'center',
                        }}>
                        {item.caption}
                      </Text>
                    ) : null}
                  </View>
                )}
              />
              {/* Navigation dots for highlight stories */}
              {highlightStories.length > 1 && (
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 16,
                  }}>
                  {highlightStories.map((_, idx) => (
                    <View
                      key={idx}
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 5,
                        backgroundColor:
                          highlightStoryIndex === idx ? '#bea063' : '#ddd',
                        marginHorizontal: 4,
                      }}
                    />
                  ))}
                </View>
              )}
            </>
          )}
        </SafeAreaView>
      </Modal>
      {/* Edit Highlight Modal */}
      <Modal
        visible={editHighlightModalVisible}
        animationType="slide"
        onRequestClose={() => setEditHighlightModalVisible(false)}
        transparent={false}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 16,
            }}>
            <Text style={{ color: '#bea063', fontSize: 18, fontWeight: 'bold' }}>
              Edit Highlight
            </Text>
            <TouchableOpacity
              onPress={() => setEditHighlightModalVisible(false)}>
              <Ionicons name="close" size={28} color="#bea063" />
            </TouchableOpacity>
          </View>
          <View style={{ padding: 16 }}>
            <Text style={{ color: '#bea063', fontSize: 16, marginBottom: 8 }}>
              Title
            </Text>
            <TextInput
              value={editHighlightTitle}
              onChangeText={setEditHighlightTitle}
              style={{
                borderWidth: 1,
                borderColor: '#bea063',
                borderRadius: 8,
                padding: 10,
                marginBottom: 16,
                color: '#bea063',
              }}
              placeholder="Highlight Title"
              placeholderTextColor="#bea063"
            />
            <Text style={{ color: '#bea063', fontSize: 16, marginBottom: 8 }}>
              Select Cover Story
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 16 }}>
              {editHighlightStories.map(story => (
                <TouchableOpacity
                  key={story.id}
                  onPress={() => setEditHighlightCoverId(story.id)}
                  style={{
                    marginRight: 12,
                    borderWidth: 2,
                    borderColor:
                      editHighlightCoverId === story.id
                        ? '#bea063'
                        : 'transparent',
                    borderRadius: 8,
                  }}>
                  {story.is_video ? (
                    <Video
                      source={{ uri: story.media_file }}
                      style={{ width: 80, height: 120, borderRadius: 8 }}
                      resizeMode="cover"
                      onError={e => console.error('Video error:', e)}
                    />
                  ) : (
                    <Image
                      source={{ uri: story.media_file }}
                      style={{ width: 80, height: 120, borderRadius: 8 }}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            {editHighlightError && (
              <Text style={{ color: 'red', marginBottom: 8 }}>
                {editHighlightError}
              </Text>
            )}
            <TouchableOpacity
              style={{
                backgroundColor: '#bea063',
                borderRadius: 8,
                padding: 16,
                alignItems: 'center',
                marginTop: 8,
              }}
              onPress={saveEditHighlight}
              disabled={editHighlightLoading}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
                {editHighlightLoading ? 'Saving...' : 'Save Changes'}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
      {/* Story Selection Modal */}
      <Modal
        visible={storySelectModalVisible}
        animationType="slide"
        onRequestClose={() => setStorySelectModalVisible(false)}
        transparent={false}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 16,
            }}>
            <Text style={{ color: '#bea063', fontSize: 18, fontWeight: 'bold' }}>
              Add Stories to Highlight
            </Text>
            <TouchableOpacity onPress={() => setStorySelectModalVisible(false)}>
              <Ionicons name="close" size={28} color="#bea063" />
            </TouchableOpacity>
          </View>
          {storySelectLoading ? (
            <View
              style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#bea063" />
            </View>
          ) : storySelectError ? (
            <Text style={{ color: 'red', textAlign: 'center', marginTop: 20 }}>
              {storySelectError}
            </Text>
          ) : (
            <FlatList
              data={allUserStories}
              keyExtractor={item => item.id?.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: '#eee',
                  }}
                  onPress={() => {
                    setSelectedStoryIds(ids =>
                      ids.includes(item.id)
                        ? ids.filter(id => id !== item.id)
                        : [...ids, item.id],
                    );
                  }}>
                  {item.media_file &&
                    item.media_file.toLowerCase().endsWith('.mp4') ? (
                    <Video
                      source={{ uri: item.media_file }}
                      style={{
                        width: 60,
                        height: 90,
                        borderRadius: 8,
                        marginRight: 12,
                      }}
                      onError={e => console.error('Video error:', e)}
                      resizeMode="cover"
                    />
                  ) : (
                    <Image
                      source={{ uri: item.media_file }}
                      style={{
                        width: 60,
                        height: 90,
                        borderRadius: 8,
                        marginRight: 12,
                      }}
                    />
                  )}
                  <Text style={{ flex: 1 }}>{item.caption || 'No Caption'}</Text>
                  <Ionicons
                    name={
                      selectedStoryIds.includes(item.id)
                        ? 'checkbox'
                        : 'square-outline'
                    }
                    size={28}
                    color={
                      selectedStoryIds.includes(item.id) ? '#bea063' : '#ccc'
                    }
                  />
                </TouchableOpacity>
              )}
            />
          )}
          <TouchableOpacity
            style={{
              backgroundColor: '#bea063',
              borderRadius: 8,
              padding: 16,
              alignItems: 'center',
              margin: 16,
            }}
            onPress={() => {
              if (highlightId !== null) saveStoriesToHighlight(highlightId);
            }}
            disabled={
              storySelectLoading ||
              !selectedStoryIds.length ||
              highlightId === null
            }>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
              {storySelectLoading ? 'Saving...' : 'Add Selected Stories'}
            </Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
      {/* Highlight loading overlay */}
      {highlightLoadingOverlay && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            backgroundColor: '#fff',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <ActivityIndicator size="large" color="#bea063" />
        </View>
      )}
      console.log("selectedCommentPost",selectedCommentPost);

      {selectedCommentPost && (
        <InstagramCommentModal
          visible={isCommentModalVisible}
          onClose={() => {
            setIsCommentModalVisible(false);
            setSelectedCommentPost(null);
          }}
          postId={selectedCommentPost.id}
          mediaUrl={
            selectedCommentPost.media?.[0]?.media_file ||
            selectedCommentPost.uri ||
            selectedCommentPost.video_file
          }
          username={selectedCommentPost.username || profile.username}
          userAvatar={selectedCommentPost.userAvatar || profile.profileImage}
          content_type={selectedCommentPost.type === 'reel' ? 'reel' : 'post'}
          caption={selectedCommentPost.caption}
        />
      )}
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
    borderWidth: 0,
    // borderColor: '#bea063',
    borderRadius: 5,
    padding: 8,
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: '#bea063',
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
    borderTopColor: '#bea063',
    borderBottomWidth: 1,
    borderBottomColor: '#bea063',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#bea063',
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
});

export default ProfileScreen;
