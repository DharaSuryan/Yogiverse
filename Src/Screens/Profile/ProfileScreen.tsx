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
  TextInput,
  RefreshControl,
  Platform,
} from 'react-native';
import Video from 'react-native-video';
import Post from '../../Component/Post';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker';
import axios from 'axios';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { getProfile, getUserPosts, getUserReels, getFollowersCount, getFollowingCount } from '../../Api/Api';
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
  mentioned_users?: any[]; // Mentioned users data
  is_mention?: boolean; // Whether this post is a mention
  mentionedProfile?: any; // Profile of the user who mentioned
}

const ProfileScreen = ({ navigation }: any) => {
  // const navigation = useNavigation<any>();

  const [activeTab, setActiveTab] = useState<
    'draft' | 'posts' | 'reels' | 'saved' | 'tagged'
  >('posts');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Function to update posts count based on current posts array
  const updatePostsCount = (postsArray: Post[]) => {
    setProfile(prev => ({
      ...prev,
      postsCount: postsArray.length
    }));
  };
  
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
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [page, setPage] = useState(1);
  const [profileStories, setProfileStories] = useState<any[]>([]);
  const [hasActiveStories, setHasActiveStories] = useState(false);

  // Individual video controls state
  const [videoStates, setVideoStates] = useState<{
    [key: string]: { isPlaying: boolean; isMuted: boolean };
  }>({});
  const [videoRefs, setVideoRefs] = useState<{ [key: string]: any }>({});

  // Post functionality state
  const [postStates, setPostStates] = useState<{
    [key: string]: { isLiked: boolean; likesCount: number; likeLoading: boolean; showLikeCount: any };
  }>({});
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [postLoading, setPostLoading] = useState(false);

  // Add state for likes and comments - per post data
  const [postLikesData, setPostLikesData] = useState<{ [postId: string]: any[] }>({});
  const [postCommentsData, setPostCommentsData] = useState<{ [postId: string]: any[] }>({});
  const [likesLoading, setLikesLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [currentPostId, setCurrentPostId] = useState<string | null>(null);

  // Comment modal state
  const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);
  const [selectedCommentPost, setSelectedCommentPost] = useState<any>(null);

  // Edit functionality state
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editCaption, setEditCaption] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editLocation, setEditLocation] = useState<LocationOption | null>(null);
  const [editMentions, setEditMentions] = useState<any[]>([]);
  const [mentionInput, setMentionInput] = useState<string>('');
  const [mentionUsers, setMentionUsers] = useState<any[]>([]);
  const [showMentionList, setShowMentionList] = useState<boolean>(false);
  const [mentionLoading, setMentionLoading] = useState<boolean>(false);
  const [feedPosts, setFeedPosts] = useState([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  let searchResponse: any | null = null; // when isFromSearch === true
  let profileResponse: any | null = null; // getProfile()
  let followersCount = 0;
  let followingCount = 0;
  let postsResponse: any | null = null; // getUserPosts(page) or search
  let reelsResponse: any | null = null; // getUserReels() or search
  const stepErrors: string[] = [];

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
      try {
        const authToken = await AsyncStorage.getItem('accessToken');
        const headers = {
          Accept: 'application/json',
          Authorization: `Bearer ${authToken}`,
        };
        let userdata: any
        await AsyncStorage.getItem('userData').then((value) => {
          console.log("value from async storage", value);
          userdata = value ? JSON.parse(value) : {};
          // const userData = value ? JSON.parse(value) : {};


        });
        console.log("userdata", userdata);

        const storiesRes = await axios.get(`https://pashuahar.com/stories/`, {
          params: { user_id: userdata?.id },
          headers,
        });
        // console.log("here comes data....", profile.id, storiesRes);

        const storiesData = storiesRes?.data?.data || [];
        setProfileStories(storiesData);
        setHasActiveStories(Array.isArray(storiesData) && storiesData.length > 0);
      } catch (e) {
        setProfileStories([]);
        setHasActiveStories(false);
      }

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

          // Update current post ID for video controls
          if (currentItem) {
            setCurrentPostId(currentItem.id);
          }

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
            pauseAllVideosExcept('');
          }
        }
      }
    },
  ).current;

  useEffect(() => {
    if (fullscreenVisible && fullscreenFlatListRef.current) {
      // Only scroll to selected index when modal first opens
      setTimeout(() => {
        if (selectedIndex >= 0 && selectedIndex < filteredPosts.length) {
          fullscreenFlatListRef.current?.scrollToIndex({
            index: selectedIndex,
            animated: false,
          });
          setCurrentFullscreenIndex(selectedIndex);
          setShouldPauseAllVideos(false);

          // Fetch likes and comments for the initial post
          const selectedItem = filteredPosts[selectedIndex];
          if (selectedItem) {
            setCurrentPostId(selectedItem.id);
            const contentType = selectedItem.type === 'reel' ? 'reel' : 'post';
            fetchPostLikes(contentType, selectedItem.id);
            fetchPostComments(contentType, selectedItem.id);
          }
        } else {
          console.warn('Invalid selectedIndex for fullscreen:', selectedIndex, 'filteredPosts length:', filteredPosts.length);
        }

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
      }, 100);
    }
  }, [fullscreenVisible]); // Only depend on fullscreenVisible, not selectedIndex

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
    console.log("ProfileScreen handleLike - postLikesData:", postLikesData);

    // Check if postLikesData has data for this item, if not use item.isLiked as fallback
    let userHasLiked = false;
    if (postLikesData[post.id] && Array.isArray(postLikesData[post.id])) {
      userHasLiked = postLikesData[post.id].some(like => like.user_id?.toString() == profile.id?.toString());
    } else {
      // Fallback to item.isLiked if postLikesData is not available yet
      userHasLiked = post.isLiked || false;
    }

    const postId = post.id;
    const currentState = postStates[postId] || {
      isLiked: userHasLiked,
      likesCount: post.likes,
      likeLoading: false,
      showLikeCount: post.hide_like_count,
    };

    console.log(`[ProfileScreen] Like operation for post ${postId}:`, {
      currentState,
      postHideLikeCount: post.hide_like_count,
      showLikeCount: currentState.showLikeCount
    });

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
          showLikeCount: currentState.showLikeCount, // Preserve the showLikeCount value
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

      // Update postLikesData immediately for real-time updates
      setPostLikesData(prev => {
        const currentLikes = prev[postId] || [];
        const currentUserId = profile.id?.toString();

        if (currentState.isLiked) {
          // Remove like - filter out current user's like
          const updatedLikes = currentLikes.filter(like => like.user_id?.toString() !== currentUserId);
          return {
            ...prev,
            [postId]: updatedLikes
          };
        } else {
          // Add like - add current user's like
          const newLike = {
            id: Date.now(), // Temporary ID
            user_id: currentUserId,
            user_name: profile.username,
            full_name: profile.fullName,
            profile_picture: profile.profileImage
          };
          return {
            ...prev,
            [postId]: [...currentLikes, newLike]
          };
        }
      });
    } catch (error) {
      console.error('Error toggling like:', error);
      Alert.alert('Error', 'Failed to update like.');

      // Revert the state on error
      setPostStates(prev => ({
        ...prev,
        [postId]: {
          ...currentState,
          likeLoading: false,
          showLikeCount: currentState.showLikeCount, // Preserve the showLikeCount value
        },
      }));
    }
  };

  const handleComment = (post: any) => {
    // Don't close fullscreen modal, just show comment modal on top
    setSelectedCommentPost(post);
    setIsCommentModalVisible(true);

    // Fetch likes and comments data for the post
    const contentType = post.type === 'reel' ? 'reel' : 'post';
    fetchPostLikes(contentType, post.id);
    fetchPostComments(contentType, post.id);
  };

  const handleLikesModal = (post: any) => {
    setCurrentPostId(post.id);
    const contentType = post.type === 'reel' ? 'reel' : 'post';
    fetchPostLikes(contentType, post.id);
    setShowLikesModal(true);
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
      setPosts(prevPosts => {
        const filteredPosts = prevPosts.filter(p => p.id !== postId);
        // Update posts count
        updatePostsCount(filteredPosts);
        return filteredPosts;
      });

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

  // Helper function to get authenticated headers
  const getAuthHeaders = async () => {
    const authToken = await AsyncStorage.getItem('accessToken');
    
    if (!authToken) {
      throw new Error('No authentication token found');
    }
    
    return {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    };
  };

  // Helper function to handle API errors
  const handleApiError = (err: any, defaultMessage: string) => {
    console.log('API Error:', err.response?.status, err.response?.data);
    
    if (err.response?.status === 401) {
      Alert.alert(
        'Authentication Error', 
        'Your session has expired. Please login again.',
        [
          { text: 'OK', onPress: async () => {
            await AsyncStorage.removeItem('accessToken');
            // Navigate to login screen if needed
          }}
        ]
      );
    } else if (err.response?.status === 404) {
      Alert.alert('Error', 'Resource not found');
    } else if (err.code === 'ECONNABORTED') {
      Alert.alert('Error', 'Request timeout. Please check your internet connection.');
    } else if (err.message === 'No authentication token found') {
      Alert.alert('Authentication Error', 'Please login to continue');
    } else {
      Alert.alert('Error', `${defaultMessage}: ${err.message || 'Unknown error'}`);
    }
  };

  // Centralized function to close likes modal
  const closeLikesModal = () => {
    console.log('Closing likes modal');
    setShowLikesModal(false);
    setCurrentPostId(null);
  };

  // Centralized function to close edit highlight modal
  const closeEditHighlightModal = () => {
    console.log('Closing edit highlight modal');
    setEditHighlightModalVisible(false);
    setEditHighlightTitle('');
    setEditHighlightId(null);
    setEditHighlightStories([]);
    setEditHighlightCoverId(null);
    setEditHighlightCoverImage(null);
    setEditHighlightError(null);
    setEditHighlightLoading(false);
    
    // Also ensure highlight viewer is closed
    setHighlightViewerVisible(false);
    setHighlightLoading(false);
    setHighlightLoadingOverlay(false);
  };

  // Centralized function to close edit modal and reset all state
  const closeEditModal = () => {
    console.log('Closing edit modal and resetting state');
    setEditModalVisible(false);
    setEditCaption('');
    setEditLocation(null);
    setEditMentions([]);
    setMentionInput('');
    setShowMentionList(false);
    setSelectedPost(null);
    setEditLoading(false);
    
    // Force cleanup after a short delay to ensure state is reset
    setTimeout(() => {
      setEditModalVisible(false);
      setEditCaption('');
      setEditLocation(null);
      setEditMentions([]);
      setMentionInput('');
      setShowMentionList(false);
      setSelectedPost(null);
      setEditLoading(false);
    }, 100);
  };

  // Reset edit modal state when component unmounts or when activeTab changes
  useEffect(() => {
    if (!editModalVisible) {
      // Reset all edit-related state when modal is not visible
      setEditCaption('');
      setEditLocation(null);
      setEditMentions([]);
      setMentionInput('');
      setShowMentionList(false);
      setSelectedPost(null);
      setEditLoading(false);
    }
  }, [editModalVisible, activeTab]);

  // Force cleanup when component unmounts or navigation changes
  useEffect(() => {
    return () => {
      // Cleanup function - reset all edit state when component unmounts
      setEditModalVisible(false);
      setEditCaption('');
      setEditLocation(null);
      setEditMentions([]);
      setMentionInput('');
      setShowMentionList(false);
      setSelectedPost(null);
      setEditLoading(false);
    };
  }, []);

  const handleEdit = () => {
    if (!selectedPost) return;
    console.log('handleEdit - selectedPost:', selectedPost);
    console.log('handleEdit - mentioned_users:', selectedPost.mentioned_users);
    
    // Set the current caption for editing
    setEditCaption(selectedPost.caption || '');
    setEditLocation(
      selectedPost.location
        ? { display_name: selectedPost.location, lat: '', lon: '' }
        : null,
    );
    // Set existing mentions if any
    setEditMentions(selectedPost.mentioned_users || []);
    setMentionInput('');
    setShowMentionList(false);
    setEditModalVisible(true);
    setOptionsVisible(false);
  };

  // Search users for mentions
  const searchMentionUsers = async (query: string) => {
    console.log('searchMentionUsers called with query:', query);
    
    if (query.length < 2) {
      setMentionUsers([]);
      setShowMentionList(false);
      return;
    }
    
    setMentionLoading(true);
    try {
      const authToken = await AsyncStorage.getItem('accessToken');
      const headers = {
        Accept: 'application/json',
        Authorization: `Bearer ${authToken}`,
      };
      const response = await axios.get(
        `https://pashuahar.com/users/search/?query=${encodeURIComponent(query)}`,
        { headers }
      );
      console.log('searchMentionUsers response:', response.data);
      
      const users = response.data || [];
      console.log('Setting mention users:', users);
      setMentionUsers(users);
      setShowMentionList(true);
    } catch (error) {
      console.log('Error searching users:', error);
      setMentionUsers([]);
      setShowMentionList(false);
    } finally {
      setMentionLoading(false);
    }
  };

  // Add user to mentions
  const addMention = (user: any) => {
    const isAlreadyMentioned = editMentions.some(mention => mention.id === user.id);
    if (!isAlreadyMentioned) {
      setEditMentions([...editMentions, user]);
    }
    setMentionInput('');
    setShowMentionList(false);
  };

  // Remove user from mentions
  const removeMention = (userId: number) => {
    setEditMentions(editMentions.filter(mention => mention.id !== userId));
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
          mentions: editMentions.map(mention => mention.id),
        },
        { headers },
      );

      // Update the post in the posts array (caption, location, and mentions)
      setPosts(prevPosts =>
        prevPosts.map(p =>
          p.id === postId
            ? {
                ...p,
                caption: editCaption,
                location: editLocation ? editLocation.display_name : '',
                mentioned_users: editMentions,
              }
            : p,
        ),
      );

      // Also update in saved posts if it's there
      setSavedPosts(prevSaved =>
        prevSaved.map(p =>
          p.id === postId ? { 
            ...p, 
            caption: editCaption,
            location: editLocation ? editLocation.display_name : '',
            mentioned_users: editMentions,
          } : p,
        ),
      );

      // Update selectedPost with the new data
      setSelectedPost(prevSelected => 
        prevSelected && prevSelected.id === postId 
          ? {
              ...prevSelected,
              caption: editCaption,
              location: editLocation ? editLocation.display_name : '',
              mentioned_users: editMentions,
            }
          : prevSelected
      );

      // Update profile location in state and force refresh of fullscreen item
      setProfile(prev => ({
        ...prev,
        location: editLocation ? editLocation.display_name : '',
      }));
      // Also update currently open fullscreen item (if any)
      setTimeout(() => {
        const idx = selectedIndex;
        if (idx >= 0) {
          setSelectedIndex(idx); // nudge state to re-render
        }
      }, 0);

      closeEditModal();
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
            // Preserve mentioned_users data for tagged posts
            mentioned_users: item.mentioned_users || [],
            is_mention: item.is_mention || false,
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
      console.log("=== FETCHING FOLLOWERS COUNT ===");
      return await getFollowersCount();
    } catch (err) {
      console.log("error in fetchFollowersCount", err);
      return 0;
    }
  };

  const fetchFollowingCount = async () => {
    try {
      console.log("=== FETCHING FOLLOWING COUNT ===");
      return await getFollowingCount();
    } catch (err) {
      console.log("error in fetchFollowingCount", err);
      return 0;
    }
  };

  // Fetch profile and posts data every time the screen comes into focus or params change
  useEffect(() => {
    loadAllData(); // Load all data initially
    // return () => {
    // Cleanup: flush previous data
    setProfile({
      username: '',
      fullName: '',
      bio: '',
      profileImage: '',
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
    // };
  }, []);

  const fetchData = async (page: number) => {
    const TAG = '[fetchData]';
    console.log(TAG, 'called with page:', page);

    // Optional: collect errors from individual steps

    // Clear posts for initial load to ensure fresh data
    if (page === 1) {
      setPosts([]);
    }

    // show loader when opening someone else's profile via search, same as your logic
    if (isFromSearch && userId) setLoading(true);

    try {
      // 1) If coming from search, fetch the public profile payload
      fetchUserDetails(userId);
      // if (isFromSearch && userId) {
      //   try {
      //     searchResponse = await axios.get(
      //       `https://pashuahar.com/user_profile/${userId}`,
      //     );
      //   } catch (err) {
      //     stepErrors.push('user_profile');
      //     console.error(`${TAG} user_profile error:`, err);
      //   }
      // }

      // // 2) Fetch own profile (used for main data/vendor_profile even in search flow)
      // try {
      //   profileResponse = await getProfile();
      //   setData(profileResponse?.data?.data);
      //   setRole(profileResponse?.data?.role);
      //   setVendorProfile(profileResponse?.data?.data?.vendor_profile || null);
      // } catch (err) {
      //   stepErrors.push('getProfile');
      //   console.error(`${TAG} getProfile error:`, err);
      //   // fallbacks so UI doesn't crash
      //   setData(null);
      //   setRole(undefined);
      //   setVendorProfile(null);
      // }

      // // 3) Followers / Following counts (parallel if not from search)
      // try {
      //   if (isFromSearch) {
      //     followersCount = searchResponse?.data?.data?.followers_count ?? 0;
      //     followingCount = searchResponse?.data?.data?.following_count ?? 0;
      //   } else {
      //     [followersCount, followingCount] = await Promise.all([
      //       fetchFollowersCount().catch((e: any) => {
      //         stepErrors.push('fetchFollowersCount');
      //         console.error(`${TAG} fetchFollowersCount error:`, e);
      //         return 0;
      //       }),
      //       fetchFollowingCount().catch((e: any) => {
      //         stepErrors.push('fetchFollowingCount');
      //         console.error(`${TAG} fetchFollowingCount error:`, e);
      //         return 0;
      //       }),
      //     ]);
      //   }
      // } catch (err) {
      //   // This outer catch is just in case Promise.all wrapper throws (it shouldn't due to inner catches)
      //   stepErrors.push('followersFollowing');
      //   console.error(`${TAG} followers/following unexpected error:`, err);
      // }

      // // 4) Build and set the lightweight profile header
      // try {
      //   const searchProfile = searchResponse?.data?.data?.profile;
      //   const ownProfile = profileResponse?.data?.data?.profile;
      //   const profileData = isFromSearch ? searchProfile : ownProfile;

      //   if (profileData) {
      //     setProfile({
      //       username: profileData?.username || '',
      //       fullName: `${profileData?.first_name || ''} ${
      //         profileData?.last_name || ''
      //       }`.trim(),
      //       bio: profileData?.bio || '',
      //       profileImage: profileData?.profile_picture,
      //       postsCount: isFromSearch
      //         ? searchResponse?.data?.data?.post_reels_count ?? 0
      //         : profileData?.posts_count ?? 0,
      //       followersCount,
      //       followingCount,
      //       id: profileData?.user || '',
      //       location: '',
      //     });
      //   } else {
      //     // fallback if neither profile available
      //     setProfile({
      //       username: '',
      //       fullName: '',
      //       bio: '',
      //       profileImage: '',
      //       postsCount: 0,
      //       followersCount,
      //       followingCount,
      //       id: '',
      //       location: '',
      //     });
      //   }
      // } catch (err) {
      //   stepErrors.push('setProfile');
      //   console.error(`${TAG} setProfile error:`, err);
      //   setProfile({
      //     username: '',
      //     fullName: '',
      //     bio: '',
      //     profileImage: '',
      //     postsCount: 0,
      //     followersCount,
      //     followingCount,
      //     id: '',
      //     location: '',
      //   });
      // }

      // 5) Posts (paged)
      try {
        console.log('here comes page...', page, totalPages);
        if (page <= totalPages || page === 1) {
          postsResponse = isFromSearch
            ? searchResponse?.data?.data
            : await getUserPosts(page, page === 1 ? undefined : totalPages);
          // normalize useful fields
          const currentPage = isFromSearch
            ? postsResponse?.current_page ?? 1
            : postsResponse?.data?.data?.current_page ?? 1;
          const totalPage = isFromSearch
            ? postsResponse?.total_pages ?? 1
            : postsResponse?.data?.data?.total_pages ?? 1;
          console.log(
            'postsResponse?.data?.data?.current_page',
            postsResponse?.data?.data?.results,
            postsResponse?.data?.data?.total_pages,
          );

          setTotalPages(totalPage);
          setHasMorePosts(currentPage < totalPage);
        }
      } catch (err) {
        stepErrors.push('getUserPosts');
        console.error(`${TAG} getUserPosts error:`, err);
        // still allow reels to load; hasMorePosts will remain as previous
      }

      // 6) Reels (only for first page)
      if (page === 1) {
        try {
          reelsResponse = isFromSearch
            ? searchResponse?.data?.data
            : await getUserReels();
        } catch (err) {
          stepErrors.push('getUserReels');
          console.error(`${TAG} getUserReels error:`, err);
        }
      }

      // 7) Transform & merge media (posts + reels)
      try {
        let allMedia: Post[] = [];

        // posts
        const postsData = isFromSearch
          ? postsResponse?.posts
          : postsResponse?.data?.data?.results;
        if (Array.isArray(postsData) && postsData.length) {
          const processedPosts = await processMediaData(postsData, 'image');
          allMedia = allMedia.concat(processedPosts);
        }

        // reels
        const reelsData = isFromSearch
          ? reelsResponse?.reels
          : reelsResponse?.data?.data?.results;
        if (Array.isArray(reelsData) && reelsData.length) {
          const processedReels = await processMediaData(reelsData, 'reel');
          allMedia = allMedia.concat(processedReels);
        }

        // append to existing feed
        console.log('here comes allMedia', allMedia);
        console.log('page:', page, 'totalPages:', totalPages);
        console.log('postsData length:', postsData?.length, 'reelsData length:', reelsData?.length);

        if (allMedia.length) {
          // For initial load (page 1), replace all posts instead of appending
          if (page === 1) {
            setPosts(allMedia);
          } else {
            // For subsequent pages, append to existing posts
            setPosts(prev => {
              const combined = [...prev, ...allMedia];

              // remove duplicates based on `id`
              const unique = combined.filter(
                (item, index, self) =>
                  index === self.findIndex(p => p.id === item.id),
              );

              // sort by createdAt (latest → oldest)
              const sorted = unique.sort(
                (a, b) =>
                  new Date(b?.createdAt).getTime() -
                  new Date(a?.createdAt).getTime(),
              );

              return sorted;
            });
          }
          
          initializeVideoStates(allMedia);
          initializePostStates(allMedia);

          // Fetch likes data for all posts
          await fetchAllPostsLikes(allMedia);
        } else if (!postsData && !reelsData) {
          // if both absent, keep previous posts as-is
          console.log(`${TAG} no media to append on this page`);
        }
      } catch (err) {
        stepErrors.push('processMediaData');
        console.error(`${TAG} process/merge media error:`, err);
        // don't clear posts on transform errors; keep previous state
      }
    } finally {
      setLoading(false);
      if (stepErrors.length) {
        console.warn(`${TAG} completed with errors in:`, stepErrors.join(', '));
        // Optional: surface a single user-friendly message (toast/snackbar)
        // showToast(`Some data couldn't be loaded: ${stepErrors.join(", ")}`);
      }
    }
  };

  // Load all data initially (all pages)
  const loadAllData = async () => {
    setLoading(true);
    setPosts([]); // Clear existing posts
    
    try {
      let allPosts: Post[] = [];
      
      // First, get the first page to determine total pages
      const firstPageResponse = await getUserPosts(1);
      const totalPages = firstPageResponse?.data?.data?.total_pages || 1;
      
      console.log('Total pages available:', totalPages);
      
      // Show loading progress
      if (totalPages > 1) {
        console.log('Loading multiple pages...');
      }
      
      // Process first page
      const firstPagePosts = firstPageResponse?.data?.data?.results || [];
      const firstPageReels = await getUserReels();
      const firstPageReelsData = firstPageReels?.data?.data?.results || [];
      
      // Process posts from first page
      if (firstPagePosts.length > 0) {
        const processedPosts = await processMediaData(firstPagePosts, 'image');
        allPosts = allPosts.concat(processedPosts);
      }
      
      // Process reels from first page
      if (firstPageReelsData.length > 0) {
        const processedReels = await processMediaData(firstPageReelsData, 'reel');
        allPosts = allPosts.concat(processedReels);
      }
      
      // Load remaining pages if any
      for (let page = 2; page <= totalPages; page++) {
        try {
          console.log(`Loading page ${page} of ${totalPages}...`);
          const pageResponse = await getUserPosts(page);
          const pagePosts = pageResponse?.data?.data?.results || [];
          
          if (pagePosts.length > 0) {
            const processedPagePosts = await processMediaData(pagePosts, 'image');
            allPosts = allPosts.concat(processedPagePosts);
            console.log(`Loaded ${pagePosts.length} posts from page ${page}`);
          }
        } catch (error) {
          console.error(`Error loading page ${page}:`, error);
          break; // Stop loading if there's an error
        }
      }
      
      // Sort all posts by creation date
      allPosts.sort((a, b) => 
        new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime()
      );
      
      console.log('Loaded total posts:', allPosts.length);
      setPosts(allPosts);
      
      // Update posts count based on actual loaded data
      updatePostsCount(allPosts);
      
      // Initialize video states and post states
      initializeVideoStates(allPosts);
      initializePostStates(allPosts);
      
      // Fetch likes data for all posts
      await fetchAllPostsLikes(allPosts);
      
      // Set pagination state
      setPage(totalPages);
      setTotalPages(totalPages);
      setHasMorePosts(false); // All data loaded
      
    } catch (error) {
      console.error('Error loading all data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Pull to refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadAllData(); // Use loadAllData for refresh
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const fetchUserDetails = async (userId: string) => {
    try {
      profileResponse = await getProfile();
      console.log("profile ......", profileResponse?.data?.data);

      setData(profileResponse?.data?.data);
      setRole(profileResponse?.data?.role);
      setVendorProfile(profileResponse?.data?.data?.vendor_profile || null);
    } catch (err) {
      stepErrors.push('getProfile');
      console.error(`${TAG} getProfile error:`, err);
      // fallbacks so UI doesn't crash
      setData(null);
      setRole(undefined);
      setVendorProfile(null);
    }

    // 3) Followers / Following counts (parallel if not from search)
    try {
      if (isFromSearch) {
        followersCount = searchResponse?.data?.data?.followers_count ?? 0;
        followingCount = searchResponse?.data?.data?.following_count ?? 0;
      } else {
        [followersCount, followingCount] = await Promise.all([
          fetchFollowersCount().catch((e: any) => {
            stepErrors.push('fetchFollowersCount');
            console.error(`${TAG} fetchFollowersCount error:`, e);
            return 0;
          }),
          fetchFollowingCount().catch((e: any) => {
            stepErrors.push('fetchFollowingCount');
            console.error(`${TAG} fetchFollowingCount error:`, e);
            return 0;
          }),
        ]);
      }
    } catch (err) {
      // This outer catch is just in case Promise.all wrapper throws (it shouldn't due to inner catches)
      stepErrors.push('followersFollowing');
      console.error(`${TAG} followers/following unexpected error:`, err);
    }

    // 4) Build and set the lightweight profile header
    try {
      const searchProfile = searchResponse?.data?.data?.profile;
      const ownProfile = profileResponse?.data?.data?.profile;
      const profileData = isFromSearch ? searchProfile : ownProfile;

      if (profileData) {
        console.log("profileData", profileData);

        setProfile({
          username: profileData?.username || '',
          fullName: `${profileData?.first_name || ''} ${profileData?.last_name || ''
            }`.trim(),
          bio: profileData?.bio || '',
          profileImage: profileData?.profile_picture,
          postsCount: isFromSearch
            ? searchResponse?.data?.data?.post_reels_count ?? 0
            : profileData?.posts_count ?? 0,
          followersCount,
          followingCount,
          id: profileData?.user || '',
          location: '',
        });
      } else {
        // fallback if neither profile available
        setProfile({
          username: '',
          fullName: '',
          bio: '',
          profileImage: '',
          postsCount: 0,
          followersCount,
          followingCount,
          id: '',
          location: '',
        });
      }
    } catch (err) {
      stepErrors.push('setProfile');
      console.error(`${TAG} setProfile error:`, err);
      setProfile({
        username: '',
        fullName: '',
        bio: '',
        profileImage: '',
        postsCount: 0,
        followersCount,
        followingCount,
        id: '',
        location: '',
      });
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
        uri: '', // placeholder image
        compressedUri: '',
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
  const handleLoadMorePosts = () => {
    // Since we load all data initially, no need for load more
    console.log('All data already loaded, no more posts to load');
  };
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
      fetchUserDetails(userId);

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
      console.log("Draft posts response:", res.data);

      // Use your response shape directly
      const draftData = res.data?.data || [];
      const processedDrafts: Post[] = draftData.map((item: any) => {
        let mediaFiles: string[] = [];
        if (item.type === 'reel' && item.video_file) {
          mediaFiles = [item.video_file];
        } else if (item.media && Array.isArray(item.media)) {
          mediaFiles = item.media
            .map((media: any) => media.media_file)
            .filter(Boolean);
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
    // if (activeTab === 'draft') {
      fetchDraftPosts();
    // }
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
      const res = await axios.get('https://pashuahar.com/mentioned_user/', {
        headers,
      });
      const taggedData = res.data?.data || [];
      console.log("taggedData", taggedData);

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
    // console.log("renderPostItem item", item);

    const isReel = item.type === 'reel';
    const isCollection = item.isCollection;

    return (
      <TouchableOpacity
        style={styles.postItem}
        onPress={() => {
          if (isCollection) {
            // Navigate to collection details
            console.log('Profile screen click --------> ');
            navigation.navigate('CollectionDetailScreen', {
              collectionId: item.collection_id,
              collectionName: item.collectionName,
            });
          } else {
            // Ensure index matches filteredPosts
            const filteredIndex = filteredPosts.findIndex(
              p => p.id === item.id,
            );
            console.log('Grid item clicked:', {
              itemId: item.id,
              itemType: item.type,
              gridIndex: index,
              filteredIndex: filteredIndex,
              filteredPostsLength: filteredPosts.length,
              activeTab: activeTab
            });
            
            if (filteredIndex !== -1) {
              setSelectedIndex(filteredIndex);
              setFullscreenVisible(true);
            } else {
              console.warn('Could not find item in filteredPosts:', item.id);
              // Fallback: use the grid index directly if it's within bounds
              if (index >= 0 && index < filteredPosts.length) {
                setSelectedIndex(index);
                setFullscreenVisible(true);
              } else {
                // Last resort: find the first matching item
                const firstMatch = filteredPosts.findIndex(p => p.type === item.type);
                if (firstMatch !== -1) {
                  setSelectedIndex(firstMatch);
                  setFullscreenVisible(true);
                }
              }
            }
          }
        }}
        activeOpacity={0.9}>
        {/* Main media display - use compressed image for better performance */}
        {isCollection ? (
          <Image
            source={
              profile.profileImage &&
                profile.profileImage !== '' &&
                profile.profileImage !== null &&
                profile.profileImage !== undefined
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
          <View style={styles.videoContainer} pointerEvents="none">
            <Video
              ref={ref => handleVideoRef(ref, item.id)}
              source={{ uri: item.uri }}
              style={styles.postImage}
              muted={true} // always muted in grid
              repeat
              resizeMode="cover"
              paused={true} // always paused in grid
              pointerEvents="none" // Allow touch events to pass through to parent TouchableOpacity
              onLoad={() => setVideoLoading(false)}
              onError={(error: any) => {
                console.log('Video error:', error);
                Alert.alert('Error', 'Failed to load video');
                setVideoLoading(false);
              }}
            />
            {/* Video controls overlay removed for grid layout */}
          </View>
        )}

        {/* Collection indicator */}
        {isCollection && (
          <View style={styles.collectionIndicator} pointerEvents="none">
            <Ionicons name="folder-outline" size={16} color="#fff" />
            <Text style={styles.collectionText}>{item.collectionName}</Text>
          </View>
        )}

        {/* Multiple media indicator */}
        {item.mediaCount && item.mediaCount > 1 && (
          <View style={styles.multipleMediaIndicator} pointerEvents="none">
            <Ionicons name="copy-outline" size={16} color="#fff" />
            {/* <Text style={styles.multipleMediaText}>{item.mediaCount}</Text> */}
          </View>
        )}

        {/* Top-right options icon */}

       

        {/* Tag icon for tagged posts */}
        {activeTab === 'tagged' && (
          <TouchableOpacity
            style={styles.tagIconContainer}
            onPress={() => {
              if (item.mentioned_users && item.mentioned_users.length > 0) {
                // Show custom mentioned users modal
                setSelectedMentionedUsers(item.mentioned_users);
                setMentionedUsersModalVisible(true);
              }
            }}
          >
            <Ionicons name="person" size={16} color="#fff" />
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
    // const showDefaultImage =
    //   !profile.profileImage ||
    //   profile.profileImage === '' ||
    //   profile.profileImage === null ||
    //   profile.profileImage === undefined;
    // return (
    //   <View style={styles.profileHeader}>
    //     <Image
    //       source={
    //         showDefaultImage
    //           ? imageSource // your local asset
    //           : { uri: profile.profileImage }
    //       }
    //       style={styles.profileImage}
    //     />{' '}
    //     {renderStats()}
    //   </View>
    // );
    const showDefaultImage =
      !profile.profileImage ||
      profile.profileImage === '' ||
      profile.profileImage === null ||
      profile.profileImage === undefined ||
      profile.profileImage.includes('picsum.photos') ||
      profile.profileImage.includes('placeholder.com');
    const defaultAvatar = require('../../Assets/userProfile.png');

    return (
      <View style={styles.profileHeader}>
        <TouchableOpacity
          style={{ marginRight: 5 }}
          onPress={() => {
            if (hasActiveStories && profileStories.length > 0) {
              const storiesPayload = (profileStories || []).map((s: any) => ({
                id: (s.id || '').toString(),
                userId: (s.user || s.profile?.id || '').toString(),
                username: s.profile?.username || profile.username,
                userProfilePicture: s.profile?.profile_picture || profile.profileImage,
                mediaUrl: s.media_file,
                imageUrl: s.media_file,
                type: (s.media_file?.toLowerCase?.().endsWith('.mp4') ? 'video' : 'image') as 'image' | 'video',
                timestamp: s.created_at,
                duration: 5000,
                viewers: [],
                isViewed: !!s.is_seen,
                createdAt: s.created_at,
                expiresAt: s.expires_at,
                caption: s.caption || '',
                location: '',
                user: {
                  username: s.profile?.username || profile.username,
                  email: s.profile?.email || '',
                  isVerified: false,
                },
              }));
              (navigation as any).navigate('StoryViewerScreen', {
                stories: storiesPayload,
                initialIndex: 0,
                isPersonal: !isFromSearch || ((userId || profile.id)?.toString() === profile.id?.toString()),
              });
            }
          }}
          activeOpacity={0.8}>
          <View
            style={{
              width: 104, // slightly larger than image
              height: 104,
              borderRadius: 53, // half of width/height
              borderWidth: hasActiveStories ? 2 : 0,
              borderColor: hasActiveStories ? '#bea063' : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Image
              source={
                showDefaultImage
                  ? defaultAvatar
                  : { uri: profile.profileImage }
              }
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
              }}
            />
          </View>
        </TouchableOpacity>
        {renderStats()}
      </View>
    );
  };

  const renderBio = () => {
    console.log('renderBio vendorProfile:', vendorProfile);
    return (
      <View style={styles.bioContainer}>
        <Text style={[styles.username, { color: '#bea063' }]}>
          {profile?.bio}
        </Text>
        <Text style={[styles.fullName, { color: '#bea063' }]}>
          {profile?.fullName}
        </Text>
        {/* Debug: show raw vendorProfile data */}
        {/* <Text style={{color: 'red', fontSize: 12}}>DEBUG: {JSON.stringify(vendorProfile)}</Text> */}
        {/* Main Categories */}
        {vendorProfile &&
          Array.isArray(vendorProfile?.main_categories) &&
          vendorProfile?.main_categories.length > 0 && (
            <>
              {/* <Text style={{ color: '#bea063', fontWeight: 'bold', marginTop: 8, marginBottom: 2 }}>Main Categories</Text> */}
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  marginBottom: 4,
                }}>
                {vendorProfile?.main_categories.map(
                  (cat: { id: number; name: string }) => (
                    <View
                      key={cat.id}
                      style={{
                        backgroundColor: '#fffbe6',
                        borderColor: '#bea063',
                        borderWidth: 1,
                        borderRadius: 16,
                        paddingHorizontal: 12,
                        paddingVertical: 5,
                        marginRight: 8,
                        marginBottom: 8,
                      }}>
                      <Text
                        style={{
                          color: '#bea063',
                          fontSize: 14,
                          fontWeight: '500',
                        }}>
                        {cat.name}
                      </Text>
                    </View>
                  ),
                )}
              </View>
            </>
          )}
        {/* Sub Categories */}
        {vendorProfile &&
          Array.isArray(vendorProfile?.subcategories) &&
          vendorProfile?.subcategories.length > 0 && (
            <>
              <Text
                style={{
                  color: '#bea063',
                  fontWeight: 'bold',
                  marginTop: 4,
                  marginBottom: 2,
                }}>
                Sub Categories
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  marginBottom: 4,
                }}>
                {vendorProfile?.subcategories.map(
                  (cat: { id: number; name: string }) => (
                    <View
                      key={cat.id}
                      style={{
                        backgroundColor: '#fff5e0',
                        borderColor: '#bea063',
                        borderWidth: 1,
                        borderRadius: 16,
                        paddingHorizontal: 12,
                        paddingVertical: 5,
                        marginRight: 8,
                        marginBottom: 8,
                      }}>
                      <Text
                        style={{
                          color: '#bea063',
                          fontSize: 14,
                          fontWeight: '500',
                        }}>
                        {cat.name}
                      </Text>
                    </View>
                  ),
                )}
              </View>
            </>
          )}
        : null
      </View>
    );
  };

  const renderTabBar = () => (
    <View style={styles.tabBar}>

      {draftPosts?.length > 0 && <TouchableOpacity
        style={[styles.tabButton, activeTab === 'draft' && styles.activeTab]}
        onPress={() => setActiveTab('draft')}>
        <Ionicons
          name="document-outline"
          size={24}
          color={activeTab === 'draft' ? '#bea063' : '#888'}
        />
      </TouchableOpacity>}
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
            style={[
              styles.tabButton,
              activeTab === 'saved' && styles.activeTab,
            ]}
            onPress={() => setActiveTab('saved')}>
            <Ionicons
              name="bookmark-outline"
              size={24}
              color={activeTab === 'saved' ? '#bea063' : '#888'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'tagged' && styles.activeTab,
            ]}
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
  // const renderFullscreenItem = ({ item, index }: { item: any, index: number }) => {
  //   console.log("renderFullscreenItem item", item);

  //   const windowWidth = Dimensions.get('window').width;
  //   const postState = postStates[item.id] || {
  //     isLiked: false,
  //     likesCount: item.likes,
  //     likeLoading: false,
  //   };
  //   const mediaItems = item.allMedia || [item.uri];
  //   const currentMediaIndexForPost = postMediaIndices[item.id] || 0;
  //   const currentMedia = mediaItems[currentMediaIndexForPost];
  //   const isVideo =
  //     currentMedia &&
  //     (currentMedia.includes('.mp4') ||
  //       currentMedia.includes('.mov') ||
  //       currentMedia.includes('.avi'));
  //   const videoId =
  //     mediaItems.length > 1
  //       ? `${item.id}-${currentMediaIndexForPost}`
  //       : item.id;
  //   const videoState = fullscreenVideoStates[videoId] || { paused: true, muted: true };

  //   // Use mentioned user's profile if in tagged tab and available
  //   let displayProfile = profile;
  //   if (activeTab === 'tagged' && item.mentionedProfile) {
  //     displayProfile = {
  //       username: item.mentionedProfile.username || '',
  //       fullName: `${item.mentionedProfile.first_name || ''} ${item.mentionedProfile.last_name || ''}`.trim(),
  //       bio: item.mentionedProfile.bio || '',
  //       profileImage: item.mentionedProfile.profile_picture,
  //       postsCount: 0,
  //       followersCount: 0,
  //       followingCount: 0,
  //       id: item.mentionedProfile.user || '',
  //       location: '',
  //     };
  //   }
  //   console.log("displayProfile.profileImage", displayProfile.profileImage);

  //   return (
  //     <View style={{ backgroundColor: '#fff', width: windowWidth }}>
  //       {/* Header: Profile, location, options */}
  //       <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingTop: 8, paddingBottom: 4 }}>
  //         {displayProfile.profileImage ?
  //           <Image source={{ uri: displayProfile.profileImage }} style={{ width: 32, height: 32, borderRadius: 16, marginRight: 8 }} /> :
  //           <View style={{
  //             width: 42,
  //             height: 42,
  //             borderRadius: 21,
  //             backgroundColor: '#f5f5f5',
  //             justifyContent: 'center',
  //             alignItems: 'center',
  //             borderWidth: 1.5,
  //             borderColor: '#bea063',
  //             overflow: 'hidden',
  //             marginRight: 10,
  //           }}>
  //             <Ionicons name="person-circle" size={38} color="#bea063" />
  //           </View>
  //         }
  //         <View style={{ flex: 1 }}>
  //           <Text style={{ color: '#bea063', fontWeight: 'bold', fontSize: 15 }}>{displayProfile.username}</Text>
  //           {item.location ? (
  //             <Text style={{ color: '#bea063', fontSize: 12 }}>{item.location}</Text>
  //           ) : null}
  //         </View>
  //         {(isFromSearch || activeTab === 'tagged') ? null : (
  //           <TouchableOpacity onPress={() => {
  //             setSelectedPost(item);
  //             setOptionsVisible(true);
  //           }} style={{ padding: 2 }}>
  //             <Ionicons name="ellipsis-vertical" size={20} color="#bea063" />
  //           </TouchableOpacity>
  //         )}
  //       </View>

  //       {/* Date under header, left-aligned */}

  //       {/* Main media - dynamic height, no aspect ratio */}
  //       <View style={{ width: '100%', backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
  //         {isVideo ? (
  //           <>
  //             <Video
  //               ref={ref => handleVideoRef(ref, videoId)}
  //               source={{ uri: currentMedia }}
  //               style={{ width: '100%', height: undefined, aspectRatio: 1, backgroundColor: '#fff' }}
  //               muted={videoState.muted}
  //               repeat
  //               resizeMode="contain"
  //               paused={videoState.paused}
  //               onLoadStart={() => setVideoLoading(true)}
  //               onLoad={() => setVideoLoading(false)}
  //               onError={(error: any) => {
  //                 console.log("Video error:", error);
  //                 Alert.alert('Error', 'Failed to load video');

  //                 setVideoLoading(false)
  //               }}
  //             />
  //             {videoLoading && (
  //               <ActivityIndicator
  //                 size="large"
  //                 color="#bea063"
  //                 style={{ position: 'absolute', top: '45%', left: '45%' }}
  //               />
  //             )}
  //             {/* Video controls */}
  //             <View style={{
  //               position: 'absolute',
  //               bottom: 24,
  //               right: 24,
  //               flexDirection: 'row-reverse',
  //               gap: 16,
  //             }}>
  //               <TouchableOpacity
  //                 onPress={() => setFullscreenVideoStates(prev => ({
  //                   ...prev,
  //                   [videoId]: { ...videoState, paused: !videoState.paused }
  //                 }))}
  //                 style={{ marginLeft: 16, backgroundColor: '#fff', borderRadius: 20, padding: 8, elevation: 2 }}
  //               >
  //                 <Ionicons name={videoState.paused ? 'play' : 'pause'} size={24} color="#bea063" />
  //               </TouchableOpacity>
  //               <TouchableOpacity
  //                 onPress={() => setFullscreenVideoStates(prev => ({
  //                   ...prev,
  //                   [videoId]: { ...videoState, muted: !videoState.muted }
  //                 }))}
  //                 style={{ backgroundColor: '#fff', borderRadius: 20, padding: 8, elevation: 2 }}
  //               >
  //                 <Ionicons name={videoState.muted ? 'volume-mute' : 'volume-high'} size={24} color="#bea063" />
  //               </TouchableOpacity>
  //             </View>
  //             {/* Overlay play icon if paused */}
  //             {videoState.paused && !videoLoading && (
  //               <View style={{ position: 'absolute', top: '45%', left: '45%' }}>
  //                 <Ionicons name="play-circle" size={48} color="#bea063" />
  //               </View>
  //             )}
  //           </>
  //         ) : (
  //           <Image
  //             source={{ uri: currentMedia }}
  //             style={{ width: '100%', height: undefined, aspectRatio: 1, resizeMode: 'contain', backgroundColor: '#fff' }}
  //           />
  //         )}
  //       </View>
  //       {/* Action row: like, comment, share, play/pause, mute/unmute, bookmark */}
  //       <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 10 }}>
  //         {/* Like button and count */}
  //         <TouchableOpacity onPress={() => handleLike(item)} disabled={postState.likeLoading} style={{ marginRight: 5 }}>
  //           {postState.likeLoading ? (
  //             <ActivityIndicator size={20} color="#bea063" />
  //           ) : (
  //             <Ionicons name={postState.isLiked ? 'heart' : 'heart-outline'} size={26} color="#bea063" />
  //           )}
  //         </TouchableOpacity>
  //         {item.hide_like_count === false && postState.likesCount > 0 && (
  //           <Text style={{ color: '#bea063', fontWeight: '600', fontSize: 13, marginRight: 5, marginBottom: 1 }}>
  //             {postState.likesCount}
  //             {/* {postState.likesCount === 1 ? 'like' : 'likes'} */}
  //           </Text>
  //         )}
  //         {/* Comment button and count */}
  //         {item.allow_comments !== false && (
  //           <>
  //             <TouchableOpacity onPress={() => handleComment(item)} style={{ marginLeft: 8 }}>
  //               <Ionicons name="chatbubble-outline" size={22} color="#bea063" />
  //             </TouchableOpacity>
  //             <Text style={{ color: '#bea063', fontWeight: '600', marginLeft: 5 }}>
  //               {item.comments}
  //             </Text>
  //           </>
  //         )}
  //         {/* Share button */}
  //         <TouchableOpacity onPress={() => handleShare(item)} style={{ marginLeft: 10 }}>
  //           <Ionicons name="share-social-outline" size={24} color="#bea063" />
  //         </TouchableOpacity>
  //       </View>
  //       {/* Likes row */}

  //       {/* Caption row */}
  //       {item.createdAt && (
  //         <Text style={{ color: '#bea063', fontSize: 13, marginLeft: 16, marginBottom: 2 }}>
  //           {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
  //         </Text>
  //       )}
  //       {item.caption && (
  //         <Text style={{ color: '#fff', fontSize: 13, paddingHorizontal: 10, marginBottom: 1 }}>
  //           <Text style={{ fontWeight: 'bold', color: 'gray' }}>{profile.username} </Text>
  //           {item.caption}
  //         </Text>
  //       )}
  //     </View>
  //   );
  // };

  // Add state for video controls in fullscreen

  const renderFullscreenItem = ({ item, index }: { item: any; index: number }) => {
    console.log("renderFullscreenItem item", item, "index:", index);

    const windowWidth = Dimensions.get('window').width;
    const windowHeight = Dimensions.get('window').height;

    // Check if postLikesData has data for this item, if not use item.isLiked as fallback
    let userHasLiked = false;
    if (postLikesData[item.id] && Array.isArray(postLikesData[item.id])) {
      userHasLiked = postLikesData[item.id].some(like => like.user_id?.toString() == profile.id?.toString());
    } else {
      // Fallback to item.isLiked if postLikesData is not available yet
      userHasLiked = item.isLiked || false;
    }

    console.log(`[ProfileScreen] renderFullscreenItem for post ${item.id}:`, {
      postLikesData: postLikesData[item.id],
      profileId: profile.id,
      userHasLiked,
      itemIsLiked: item.isLiked
    });

    const postState = postStates[item.id] || {
      isLiked: userHasLiked,
      likesCount: item.likes,
      likeLoading: false,
      showLikeCount: item.hide_like_count,
    };

    const mediaItems = item.allMedia || [item.uri];
    const currentMediaIndexForPost = postMediaIndices[item.id] || 0;
    const currentMedia = mediaItems[currentMediaIndexForPost];
    const contentType = item.type === 'reel' ? 'reel' : 'post';

    // fetchPostLikes(contentType,item.id);
    //         fetchPostComments(contentType, item.id);

    // Use mentioned user's profile if in tagged tab and available
    let displayProfile = profile;
    if (activeTab === 'tagged' && item.mentionedProfile) {
      displayProfile = {
        username: item.mentionedProfile.username || '',
        fullName: `${item.mentionedProfile.first_name || ''} ${item.mentionedProfile.last_name || ''
          }`.trim(),
        bio: item.mentionedProfile.bio || '',
        profileImage: item.mentionedProfile.profile_picture,
        postsCount: 0,
        followersCount: 0,
        followingCount: 0,
        id: item.mentionedProfile.user || '',
        location: '',
      };
    }

    const renderMediaItem = (mediaUri: string, mediaIndex: number) => {
      const isVideo =
        mediaUri &&
        (mediaUri.includes('.mp4') ||
          mediaUri.includes('.mov') ||
          mediaUri.includes('.avi'));

      const videoId =
        mediaItems.length > 1 ? `${item.id}-${mediaIndex}` : item.id;

      const videoState = fullscreenVideoStates[videoId] || {
        paused: true,
        muted: true,
      };

      // Compute image height from intrinsic aspect ratio: height = screenWidth / (w/h)
      const screenWidth = windowWidth;
      let containerHeight = mediaHeightsByIndex[mediaIndex];
      
      // iOS-specific Instagram-like behavior
      if (Platform.OS === 'ios') {
        if (!containerHeight && mediaUri && !isVideo) {
          Image.getSize(
            mediaUri,
            (naturalWidth, naturalHeight) => {
              if (!naturalWidth || !naturalHeight) return;
              const aspect = naturalWidth / naturalHeight; // width / height
              // For iOS, limit the height to prevent full screen coverage
              const maxHeight = windowHeight * 0.8; // Max 80% of screen height
              const naturalContainerHeight = Math.min(screenWidth / aspect, maxHeight);
              setMediaHeightsByIndex(prev => (
                prev[mediaIndex] === naturalContainerHeight ? prev : { ...prev, [mediaIndex]: naturalContainerHeight }
              ));
            },
            () => {
              setMediaHeightsByIndex(prev => ({ ...prev, [mediaIndex]: Math.min(screenWidth, windowHeight * 0.6) }));
            }
          );
        }
        const resolvedHeight = containerHeight || Math.min(windowHeight * 0.6, screenWidth);
        
        return (
          <View
            style={{
              width: screenWidth,
              height: resolvedHeight,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#000',
            }}>
            {isVideo ? (
              <>
                <Video
                  ref={ref => handleVideoRef(ref, videoId)}
                  source={{ uri: mediaUri }}
                  style={{ width: '100%', height: '100%' }}
                  muted={videoState.muted}
                  repeat
                  resizeMode="cover"
                  paused={videoState.paused}
                  onLoadStart={() => setVideoLoading(true)}
                  onLoad={() => setVideoLoading(false)}
                  onError={(error: any) => {
                    console.log('Video error:', error);
                    Alert.alert('Error', 'Failed to load video');
                    setVideoLoading(false);
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
                <View
                  style={{
                    position: 'absolute',
                    bottom: 24,
                    left: 0,
                    right: 0,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingHorizontal: 20,
                  }}>
                  <TouchableOpacity
                    onPress={() => {
                      setFullscreenVideoStates(prev => ({
                        ...prev,
                        [videoId]: {
                          ...prev[videoId],
                          paused: !prev[videoId]?.paused,
                        },
                      }));
                    }}
                    style={{
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      borderRadius: 20,
                      padding: 8,
                    }}>
                    <Ionicons
                      name={videoState.paused ? 'play' : 'pause'}
                      size={24}
                      color="#fff"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setFullscreenVideoStates(prev => ({
                        ...prev,
                        [videoId]: {
                          ...prev[videoId],
                          muted: !prev[videoId]?.muted,
                        },
                      }));
                    }}
                    style={{
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      borderRadius: 20,
                      padding: 8,
                    }}>
                    <Ionicons
                      name={videoState.muted ? 'volume-mute' : 'volume-high'}
                      size={24}
                      color="#fff"
                    />
                  </TouchableOpacity>
                </View>
                {videoState.paused && !videoLoading && (
                  <View style={{ position: 'absolute', top: '45%', left: '45%' }}>
                    <Ionicons name="play-circle" size={48} color="#bea063" />
                  </View>
                )}
              </>
            ) : (
              <Image
                source={{ uri: mediaUri }}
                style={{
                  width: screenWidth,
                  height: resolvedHeight,
                  resizeMode: 'stretch',
                  backgroundColor: '#ffffff',
                }}
              />
            )}
          </View>
        );
      }

      // Android behavior (existing logic)
      if (!containerHeight && mediaUri && !isVideo) {
        Image.getSize(
          mediaUri,
          (naturalWidth, naturalHeight) => {
            if (!naturalWidth || !naturalHeight) return;
            const aspect = naturalWidth / naturalHeight; // width / height
            const naturalContainerHeight = screenWidth / aspect; // keeps full image visible
            setMediaHeightsByIndex(prev => (
              prev[mediaIndex] === naturalContainerHeight ? prev : { ...prev, [mediaIndex]: naturalContainerHeight }
            ));
          },
          () => {
            setMediaHeightsByIndex(prev => ({ ...prev, [mediaIndex]: screenWidth }));
          }
        );
      }

      const resolvedHeight = containerHeight || windowHeight * 0.6;

      return (
        <View
          style={{
            width: windowWidth,
            height: resolvedHeight,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#ffffff',
          }}>
          {isVideo ? (
            <>
              <Video
                ref={ref => handleVideoRef(ref, videoId)}
                source={{ uri: mediaUri }}
                style={{ width: '100%', height: '100%' }}
                muted={videoState.muted}
                repeat
                resizeMode="cover"
                paused={videoState.paused}
                onLoadStart={() => setVideoLoading(true)}
                onLoad={() => setVideoLoading(false)}
                onError={(error: any) => {
                  console.log('Video error:', error);
                  Alert.alert('Error', 'Failed to load video');
                  setVideoLoading(false);
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
              <View
                style={{
                  position: 'absolute',
                  bottom: 24,
                  right: 24,
                  flexDirection: 'row-reverse',
                  gap: 16,
                }}>
                <TouchableOpacity
                  onPress={() =>
                    setFullscreenVideoStates(prev => ({
                      ...prev,
                      [videoId]: { ...videoState, paused: !videoState.paused },
                    }))
                  }
                  style={{
                    marginLeft: 16,
                    backgroundColor: '#fff',
                    borderRadius: 20,
                    padding: 8,
                    elevation: 2,
                  }}>
                  <Ionicons
                    name={videoState.paused ? 'play' : 'pause'}
                    size={24}
                    color="#bea063"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    setFullscreenVideoStates(prev => ({
                      ...prev,
                      [videoId]: { ...videoState, muted: !videoState.muted },
                    }))
                  }
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: 20,
                    padding: 8,
                    elevation: 2,
                  }}>
                  <Ionicons
                    name={videoState.muted ? 'volume-mute' : 'volume-high'}
                    size={24}
                    color="#bea063"
                  />
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
              source={{ uri: mediaUri }}
              style={{
                width: screenWidth,
                height: resolvedHeight,
                resizeMode: 'cover',
                backgroundColor: '#ffffff',
              }}
            />
          )}
        </View>
      );
    };

    return (
      <View style={{
        backgroundColor: '#fff',
        width: windowWidth,
        height: windowHeight,
        flex: 1
      }}>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 10,
            paddingTop: 8,
            paddingBottom: 4,
            marginBottom: 15,
            // zIndex: 10,
            // position: 'absolute',
            // top: 0,
            // left: 0,
            // right: 0,
            // backgroundColor: 'rgba(255,255,255,0.9)',
          }}>
          {displayProfile.profileImage ? (
            <Image
              source={{ uri: displayProfile.profileImage }}
              style={{ width: 32, height: 32, borderRadius: 16, marginRight: 8 }}
            />
          ) : (
            <View
              style={{
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
          )}
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#bea063', fontWeight: 'bold', fontSize: 15 }}>
              {displayProfile.username}
            </Text>
            {item.location ? (
              <Text style={{ color: '#bea063', fontSize: 12 }}>
                {item.location}
              </Text>
            ) : null}
          </View>
          {isFromSearch || activeTab === 'tagged' ? null : (
            <TouchableOpacity
              onPress={() => {
                setSelectedPost(item);
                setOptionsVisible(true);
              }}
              style={{ padding: 2 }}>
              <Ionicons name="ellipsis-vertical" size={20} color="#bea063" />
            </TouchableOpacity>
          )}
        </View>

        {/* Main media */}
        {mediaItems.length > 1 ? (
          <View style={{ height: windowHeight * 0.6 }}>
            <FlatList
              data={mediaItems}
              keyExtractor={(uri, idx) => `${item.id}-${idx}`}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              style={{ flex: 1 }}
              onMomentumScrollEnd={e => {
                const newIndex = Math.round(
                  e.nativeEvent.contentOffset.x / windowWidth,
                );
                setPostMediaIndices(prev => ({ ...prev, [item.id]: newIndex }));
              }}
              renderItem={({ item: mediaUri, index: mediaIndex }) =>
                renderMediaItem(mediaUri, mediaIndex)
              }
            />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                marginTop: 6,
                marginBottom: 8,
              }}>
              {mediaItems.map((_, dotIndex) => (
                <View
                  key={dotIndex}
                  style={{
                    height: 6,
                    width: postMediaIndices[item.id] === dotIndex ? 8 : 6,
                    borderRadius: 4,
                    backgroundColor:
                      postMediaIndices[item.id] === dotIndex
                        ? '#bea063'
                        : '#d3d3d3',
                    marginHorizontal: 3,
                  }}
                />
              ))}
            </View>
          </View>
        ) : (
          renderMediaItem(currentMedia, 0)
        )}

        {/* Action row */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 12,
            marginTop: 8,
          }}>
          <TouchableOpacity
            onPress={() => handleLike(item)}
            disabled={postState.likeLoading}
            style={{ marginRight: 8 }}>
            {postState.likeLoading ? (
              <ActivityIndicator size={20} color="#bea063" />
            ) : (
              <Ionicons
                name={postState.isLiked ? 'heart' : 'heart-outline'}
                size={24}
                color="#bea063"
              />
            )}
          </TouchableOpacity>
          {!postState.showLikeCount && (postState.likesCount || item.likes) && (
            <Text
              style={{
                color: '#bea063',
                fontWeight: '600',
                fontSize: 14,
                marginRight: 8,
              }}>
              {postState.likesCount || item.likes}
            </Text>
          )}
          {item.allow_comments == false && (
            <>
              <TouchableOpacity
                onPress={() => handleComment(item)}
                style={{ marginLeft: 8 }}>
                <Ionicons name="chatbubble-outline" size={22} color="#bea063" />
              </TouchableOpacity>
              {(item.comments || postCommentsData[item.id]?.length) && (
                <Text
                  style={{ color: '#bea063', fontWeight: '600', marginLeft: 5 }}>
                  {postCommentsData[item.id]?.length || item.comments}
                </Text>
              )}
            </>
          )}
          <TouchableOpacity
            onPress={() => handleShare(item)}
            style={{ marginLeft: 10 }}>
            <Ionicons name="share-social-outline" size={22} color="#bea063" />
          </TouchableOpacity>
        </View>

        {/* Likes and Comments Info */}
        <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
          {/* Profile Picture and Likes Info - Same Line */}
          {postLikesData[item.id] && postLikesData[item.id].length > 0 && !postState.showLikeCount && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              {/* Profile Picture */}
              <View style={{
                width: 30,
                height: 30,
                borderRadius: 15,
                backgroundColor: '#f5f5f5',
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 1.5,
                borderColor: '#bea063',
                overflow: 'hidden',
                marginRight: 8,
              }}>
                <Ionicons name="person-circle" size={26} color="#bea063" />
              </View>

              {/* Likes Info */}
              <TouchableOpacity
                onPress={() => handleLikesModal(item)}
                style={{ flex: 1 }}>
                <Text style={{ color: '#bea063', fontSize: 14, fontWeight: '600' }}>
                  Liked by{' '}
                  <Text style={{ fontWeight: 'bold' }}>
                    {postLikesData[item.id][0]?.full_name || postLikesData[item.id][0]?.user_name}
                  </Text>
                  {postLikesData[item.id].length > 1 && (
                    <Text style={{ fontWeight: 'normal' }}>
                      {' '}and{' '}
                      <Text style={{ fontWeight: 'bold' }}>
                        {postLikesData[item.id].length - 1} others
                      </Text>
                    </Text>
                  )}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          {item.caption && (
            <Text
              numberOfLines={2}
              ellipsizeMode="tail"
              style={{
                color: '#bea063',
                fontSize: 14,
                //  paddingHorizontal: 2,
                marginBottom: 8,
                lineHeight: 18,
                fontWeight: '500',
              }}>
              {displayProfile.username} {item.caption}
            </Text>
          )}
          {/* First Comment */}
          {(() => {
            const comments = postCommentsData[item.id];
            console.log(`[ProfileScreen] Rendering comments for post ${item.id}:`, comments);
            return comments && comments.length > 0 && item.allow_comments == false && (
              <View style={{ marginBottom: 6 }}>
                <Text style={{ color: '#bea063', fontSize: 14, lineHeight: 18 }}>
                  <Text style={{ fontWeight: 'bold' }}>
                    {comments[0]?.full_name || comments[0]?.user_name}
                  </Text>
                  {' '}
                  <Text style={{ fontWeight: 'normal' }}>
                    {comments[0]?.text}
                  </Text>
                </Text>
                {comments.length > 1 && (
                  <TouchableOpacity
                    onPress={() => handleComment(item)}
                    style={{ marginTop: 4 }}>
                    <Text style={{ color: '#bea063', fontSize: 13, fontWeight: '500' }}>
                      View all {comments.length} comments
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })()}
        </View>

        {/* Date */}
        {item.createdAt && (
          <Text
            style={{
              color: '#bea063',
              fontSize: 12,
              paddingHorizontal: 16,
              marginBottom: 4,
              fontWeight: '500',
            }}>
            {new Date(item.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>
        )}

        {/* Caption */}

      </View>
    );
  };

  const [fullscreenVideoStates, setFullscreenVideoStates] = useState<{
    [key: string]: { paused: boolean; muted: boolean };
  }>({});
  const [mediaHeightsByIndex, setMediaHeightsByIndex] = useState<{ [index: number]: number }>({});


  // Fullscreen Modal for video playback
  <Modal
    visible={fullscreenVisible}
    animationType="slide"
    onRequestClose={() => setFullscreenVisible(false)}
    transparent={false}>
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View
        style={{
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
          {activeTab === 'reels' ? 'Reels' : activeTab === 'tagged' ? 'Tagged' : 'Posts'}
        </Text>
      </View>
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
          initialScrollIndex={selectedIndex >= 0 && selectedIndex < filteredPosts.length ? selectedIndex : 0}
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
  </Modal>;

  // Initialize post states when posts are loaded
  const initializePostStates = (mediaItems: Post[]) => {
    console.log("ProfileScreen initializePostStates mediaItems", mediaItems);

    const newPostStates: {
      [key: string]: {
        isLiked: boolean;
        likesCount: number;
        likeLoading: boolean;
        showLikeCount: any;
      };
    } = {};
    mediaItems.forEach(item => {
      console.log("ProfileScreen here comes data...", postLikesData[item.id]);

      // Check if postLikesData has data for this item, if not use item.isLiked as fallback
      let userHasLiked = false;
      if (postLikesData[item.id] && Array.isArray(postLikesData[item.id])) {
        userHasLiked = postLikesData[item.id].some(like => like.user_id?.toString() == profile.id?.toString());
      } else {
        // Fallback to item.isLiked if postLikesData is not available yet
        userHasLiked = item.isLiked || false;
      }

      console.log("ProfileScreen userHasLiked", userHasLiked);
      newPostStates[item.id] = {
        isLiked: userHasLiked,
        likesCount: item.likes,
        likeLoading: false,
        showLikeCount: item.hide_like_count,
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
      const headers = await getAuthHeaders();
      const res = await axios.get('https://pashuahar.com/highlights/', {
        headers,
        timeout: 10000,
      });
      setHighlights(res.data || []);
    } catch (err: any) {
      console.log('Fetch highlights error:', err);
      handleApiError(err, 'Failed to load highlights');
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
      (item.stories && item.stories[0]?.media_file)
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
          {cover ? <Image
            source={{ uri: cover }}
            style={{ width: 66, height: 66, borderRadius: 33 }}
          /> :
            <View style={{
              width: 105,
              height: 105,
              borderRadius: 45,
              borderWidth: 2,
              borderColor: '#bea063',
              backgroundColor: '#f5f5f5',
              justifyContent: 'center',
              alignItems: 'center',
              // marginBottom: 8,
              overflow: 'hidden',
            }}>
              <View style={{
                width: '100%',
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#fff',
              }}>
                <View style={{
                  width: 70,
                  height: 70,
                  borderRadius: 35,
                  borderWidth: 2,
                  borderColor: '#bea063',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#fff',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.08,
                  shadowRadius: 6,
                  elevation: 3,
                }}>
                  <View style={{
                    width: 62,
                    height: 62,
                    borderRadius: 31,
                    backgroundColor: '#fff',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                    <Text style={{
                      fontSize: 30,
                      fontWeight: '800',
                      color: '#bea063',
                    }}>
                      {((item.title || '').toString().trim().charAt(0) || profile.username?.charAt?.(0) || ' ').toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>
            </View>


          }
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
      const headers = await getAuthHeaders();
      
      console.log('Fetching highlights for ID:', highlightIdParam);
      const res = await axios.get(
        `https://pashuahar.com/highlights/${highlightIdParam}/`,
        { 
          headers,
          timeout: 10000, // 10 second timeout
        },
      );
      
      console.log('Highlights response:', res.data);
      setHighlightStories(res.data.stories || []);
      setHighlightTitle(title);
      setHighlightViewerVisible(true);
    } catch (err: any) {
      handleApiError(err, 'Failed to load highlight stories');
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
  const [editHighlightCoverImage, setEditHighlightCoverImage] = useState<string | null>(null);

  // Function to handle image selection for highlight cover
  const selectCoverImage = () => {
    const options = {
      mediaType: 'photo' as const,
      quality: 0.5, // Reduced quality for smaller file size
      maxWidth: 800, // Reduced max width
      maxHeight: 800, // Reduced max height
      includeBase64: false, // Don't include base64 to save memory
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel || response.errorMessage) {
        console.log('Image picker cancelled or error:', response.errorMessage);
        return;
      }

      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        console.log('Compressed image selected:', asset.uri);
        console.log('Image size:', asset.fileSize, 'bytes');
        setEditHighlightCoverImage(asset.uri || null);
      }
    });
  };

  // In openEditHighlight, use highlightId from state
  const openEditHighlight = () => {
    console.log('Opening edit highlight modal');
    // Close the highlight viewer modal first
    setHighlightViewerVisible(false);
    setHighlightLoading(false);
    setHighlightLoadingOverlay(false);
    
    // Set up edit modal data
    setEditHighlightId(highlightId);
    setEditHighlightTitle(highlightTitle);
    setEditHighlightStories(highlightStories);
    setEditHighlightCoverId(highlightStories[0]?.id || null);
    setEditHighlightCoverImage(null); // Reset cover image
    setEditHighlightError(null);
    
    // Open edit modal
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
      // Send as FormData to handle file upload
      const formData = new FormData();
      if (editHighlightTitle) formData.append('title', editHighlightTitle);
      if (editHighlightCoverImage) {
        formData.append('cover_image', {
          uri: editHighlightCoverImage,
          type: 'image/jpeg',
          name: 'cover_image.jpg',
        } as any);
      }
      // if (editHighlightCoverId) formData.append('cover_story', editHighlightCoverId.toString());
      // if (editHighlightStories.length > 0) formData.append('story_ids', editHighlightStories.map(s => s.id).join(','));
      // console.log(
      //   '[saveEditHighlight] PATCH /highlights/' + editHighlightId + '/',
      // );
      // console.log('[saveEditHighlight] Payload:', payload);
      let response = await axios.patch(
        `https://pashuahar.com/highlights/${editHighlightId}/`,
        formData,
        { 
          headers: {
            ...headers,
            'Content-Type': 'multipart/form-data',
          }
        },
      );
      console.log('[saveEditHighlight] Response:', response?.data);
      closeEditHighlightModal();
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
      getAccounts()
        .then(setAccountsList)
        .catch(error => {
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
      // Close the sheet after applying the change
      setOptionsVisible(false);
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
      // Immediately update per-post UI state so fullscreen reflects change
      setPostStates(prev => {
        const current = prev[selectedPost.id] || {
          isLiked: !!selectedPost.isLiked,
          likesCount: selectedPost.likes || 0,
          likeLoading: false,
          showLikeCount: selectedPost.hide_like_count,
        };
        return {
          ...prev,
          [selectedPost.id]: {
            ...current,
            showLikeCount: newValue,
          },
        };
      });
      setSelectedPost((prev: any) =>
        prev ? { ...prev, hide_like_count: newValue } : prev,
      );
      // Close the sheet after applying the change
      setOptionsVisible(false);
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
            <Text
              style={{
                fontWeight: 'bold',
                color: '#bea063',
                fontSize: 16,
                marginBottom: 4,
              }}>
              Main Categories
            </Text>
            <View
              style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
              {mainCategories.map((cat: any, idx: number) => (
                <View
                  key={idx}
                  style={{
                    backgroundColor: '#fff5e0',
                    borderColor: '#bea063',
                    borderWidth: 1,
                    borderRadius: 16,
                    paddingHorizontal: 12,
                    paddingVertical: 4,
                    marginRight: 8,
                    marginBottom: 8,
                  }}>
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
            <Text
              style={{
                fontWeight: 'bold',
                color: '#bea063',
                fontSize: 16,
                marginBottom: 4,
              }}>
              Sub Categories
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {subCategories.map((cat: any, idx: number) => (
                <View
                  key={idx}
                  style={{
                    backgroundColor: '#fff5e0',
                    borderColor: '#bea063',
                    borderWidth: 1,
                    borderRadius: 16,
                    paddingHorizontal: 12,
                    paddingVertical: 4,
                    marginRight: 8,
                    marginBottom: 8,
                  }}>
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

  // Fetch likes for a post
  const fetchPostLikes = async (contentType: string, objectId: string) => {
    console.log(`[ProfileScreen] Fetching likes for post ${objectId} (${contentType})`);
    setLikesLoading(true);
    try {
      const authToken = await AsyncStorage.getItem('accessToken');
      const headers = {
        Accept: 'application/json',
        Authorization: `Bearer ${authToken}`,
      };

      const response = await axios.get(
        `https://pashuahar.com/like/list/?content_type=${contentType}&object_id=${objectId}`,
        { headers }
      );

      if (response.data && response.data.data) {
        console.log(`[ProfileScreen] Received ${response.data.data.length} likes for post ${objectId}`);
        setPostLikesData(prev => {
          const newData = {
            ...prev,
            [objectId]: response.data.data
          };
          // Re-initialize post states for this post
          const affectedPosts = posts.filter(p => p.id === objectId);
          if (affectedPosts.length > 0) {
            initializePostStates(posts);
          }
          return newData;
        });
      } else {
        console.log(`[ProfileScreen] No likes data for post ${objectId}`);
        setPostLikesData(prev => {
          const newData = {
            ...prev,
            [objectId]: []
          };
          // Re-initialize post states for this post
          const affectedPosts = posts.filter(p => p.id === objectId);
          if (affectedPosts.length > 0) {
            initializePostStates(posts);
          }
          return newData;
        });
      }
    } catch (error) {
      console.error(`[ProfileScreen] Error fetching post likes for ${objectId}:`, error);
      setPostLikesData(prev => ({
        ...prev,
        [objectId]: []
      }));
    } finally {
      setLikesLoading(false);
    }
  };

  // Fetch comments for a post
  const fetchPostComments = async (contentType: string, objectId: string) => {
    console.log(`[ProfileScreen] Fetching comments for post ${objectId} (${contentType})`);
    setCommentsLoading(true);
    try {
      const authToken = await AsyncStorage.getItem('accessToken');
      const headers = {
        Accept: 'application/json',
        Authorization: `Bearer ${authToken}`,
      };

      const response = await axios.get(
        `https://pashuahar.com/comment/list/?content_type=${contentType}&object_id=${objectId}`,
        { headers }
      );

      if (response.data && response.data.data) {
        console.log(`[ProfileScreen] Received ${response.data.data.length} comments for post ${objectId}`);
        setPostCommentsData(prev => ({
          ...prev,
          [objectId]: response.data.data
        }));
      } else {
        console.log(`[ProfileScreen] No comments data for post ${objectId}`);
        setPostCommentsData(prev => ({
          ...prev,
          [objectId]: []
        }));
      }
    } catch (error) {
      console.error(`[ProfileScreen] Error fetching post comments for ${objectId}:`, error);
      setPostCommentsData(prev => ({
        ...prev,
        [objectId]: []
      }));
    } finally {
      setCommentsLoading(false);
    }
  };

  // Fetch likes for all posts
  const fetchAllPostsLikes = async (allMedia: Post[]) => {
    console.log(`[ProfileScreen] Fetching likes for all ${allMedia.length} posts`);
    try {
      const authToken = await AsyncStorage.getItem('accessToken');
      const headers = {
        Accept: 'application/json',
        Authorization: `Bearer ${authToken}`,
      };

      // Create promises for all posts
      const likesPromises = allMedia.map(async (post) => {
        const contentType = post.type === 'reel' ? 'reel' : 'post';
        try {
          const response = await axios.get(
            `https://pashuahar.com/like/list/?content_type=${contentType}&object_id=${post.id}`,
            { headers }
          );
          return {
            postId: post.id,
            likes: response.data?.data || []
          };
        } catch (error) {
          console.error(`[ProfileScreen] Error fetching likes for post ${post.id}:`, error);
          return {
            postId: post.id,
            likes: []
          };
        }
      });

      // Wait for all requests to complete
      const results = await Promise.all(likesPromises);

      // Update postLikesData with all results
      const newPostLikesData: { [postId: string]: any[] } = {};
      results.forEach(result => {
        newPostLikesData[result.postId] = result.likes;
      });

      setPostLikesData(newPostLikesData);
      console.log(`[ProfileScreen] Successfully fetched likes for all posts`);

      // Re-initialize post states with the new likes data
      initializePostStates(allMedia);
    } catch (error) {
      console.error(`[ProfileScreen] Error fetching all posts likes:`, error);
    }
  };

  // Add a new comment to postCommentsData
  const addCommentToPost = (postId: string, newComment: any) => {
    console.log(`[ProfileScreen] Adding comment to post ${postId}:`, newComment);

    setPostCommentsData(prev => {
      const updatedData = {
        ...prev,
        [postId]: [...(prev[postId] || []), newComment]
      };
      console.log(`[ProfileScreen] Updated postCommentsData for ${postId}:`, updatedData[postId]);
      return updatedData;
    });

    // Also update the comment count in posts array
    setPosts(prevPosts =>
      prevPosts.map(p =>
        p.id === postId
          ? { ...p, comments: (p.comments || 0) + 1 }
          : p
      )
    );
  };

  // Remove a comment from postCommentsData
  const removeCommentFromPost = (postId: string, commentId: string) => {
    console.log(`[ProfileScreen] Removing comment ${commentId} from post ${postId}`);

    setPostCommentsData(prev => {
      const updatedData = {
        ...prev,
        [postId]: (prev[postId] || []).filter(comment => comment.id !== parseInt(commentId))
      };
      console.log(`[ProfileScreen] Updated postCommentsData for ${postId}:`, updatedData[postId]);
      return updatedData;
    });

    // Also update the comment count in posts array
    setPosts(prevPosts =>
      prevPosts.map(p =>
        p.id === postId
          ? { ...p, comments: Math.max((p.comments || 0) - 1, 0) }
          : p
      )
    );
  };

  // Force refresh comments data for a specific post
  const refreshPostComments = async (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      const contentType = post.type === 'reel' ? 'reel' : 'post';
      await fetchPostComments(contentType, postId);
    }
  };

  // Mentioned users modal state
  const [mentionedUsersModalVisible, setMentionedUsersModalVisible] = useState(false);
  const [selectedMentionedUsers, setSelectedMentionedUsers] = useState<any[]>([]);

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
      if (selectedPost.type == 'reel') {
        await axios.delete(`https://pashuahar.com/reels/${selectedPost.id}/`, {
          headers,
        });
      } else {
        await axios.delete(`https://pashuahar.com/posts/${selectedPost.id}/`, {
          headers,
        });
      }

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
      console.log('selectedPostselectedPost', selectedPost?.type);
      if (selectedPost?.type == 'reel') {
        await axios.patch(
          `https://pashuahar.com/reels/${selectedPost.id}/`,
          { is_draft: false },
          { headers },
        );
      } else {
        await axios.patch(
          `https://pashuahar.com/posts/${selectedPost.id}/`,
          { is_draft: false },
          { headers },
        );
      }

      setDraftPosts(prev => prev.filter(p => p.id !== selectedPost.id));
      setOptionsVisible(false);
      setSelectedPost(null);
      // setPosts([]);
      fetchData(1);
      setActiveTab('posts');
      // getUserPosts(1)
      Alert.alert('Posted', 'Draft published successfully.');
    } catch (err) {
      console.log('eoroorooroor...', err);

      Alert.alert('Error', 'Failed to publish draft.');
    } finally {
      setPostLoading(false);
    }
  };

  // Inline edit highlight modal overlay (non-Modal) for iOS compatibility
  const renderEditHighlightModal = () => {
    if (!editHighlightModalVisible) return null;
    
    return (
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#fff',
          zIndex: 9999,
        }}>
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
            <TouchableOpacity onPress={closeEditHighlightModal}>
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
            
            {/* Upload Cover Image Section */}
            <Text style={{ color: '#bea063', fontSize: 16, marginBottom: 8, marginTop: 16 }}>
              Upload Cover Image
            </Text>
            <TouchableOpacity
              onPress={selectCoverImage}
              style={{
                borderWidth: 2,
                borderColor: '#bea063',
                borderStyle: 'dashed',
                borderRadius: 8,
                padding: 20,
                alignItems: 'center',
                marginBottom: 16,
                backgroundColor: '#f9f9f9',
              }}>
              {editHighlightCoverImage ? (
                <View style={{ alignItems: 'center' }}>
                  <Image
                    source={{ uri: editHighlightCoverImage }}
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: 8,
                      marginBottom: 8,
                    }}
                  />
                  <Text style={{ color: '#bea063', fontSize: 14 }}>
                    Tap to change image
                  </Text>
                </View>
              ) : (
                <View style={{ alignItems: 'center' }}>
                  <Ionicons name="camera" size={32} color="#bea063" />
                  <Text style={{ color: '#bea063', fontSize: 14, marginTop: 8 }}>
                    Tap to select cover image
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            
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
      </View>
    );
  };

  // Inline likes modal overlay (non-Modal) for iOS compatibility
  const renderLikesModal = () => {
    if (!showLikesModal) return null;
    
    return (
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
        }}>
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
          activeOpacity={1}
          onPress={closeLikesModal}
        />
        <View
          style={{
            backgroundColor: '#fff',
            borderRadius: 16,
            padding: 20,
            width: '90%',
            maxHeight: '70%',
            zIndex: 10000,
          }}>
          {/* Header */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
            paddingBottom: 15,
            borderBottomWidth: 1,
            borderBottomColor: '#eee',
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: '#333',
            }}>
              Liked by
            </Text>
            <TouchableOpacity
              onPress={closeLikesModal}
              style={{ padding: 5 }}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Users List */}
          <ScrollView style={{ maxHeight: 400 }}>
            {likesLoading ? (
              <ActivityIndicator size="large" color="#bea063" style={{ marginTop: 20 }} />
            ) : !currentPostId || !postLikesData[currentPostId] || postLikesData[currentPostId].length === 0 ? (
              <Text style={{ textAlign: 'center', color: '#666', marginTop: 20 }}>
                No likes yet
              </Text>
            ) : (
              postLikesData[currentPostId].map((like: any, index: number) => (
                <TouchableOpacity
                  key={like.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 12,
                    paddingHorizontal: 8,
                    borderBottomWidth: index < postLikesData[currentPostId].length - 1 ? 1 : 0,
                    borderBottomColor: '#f0f0f0',
                  }}
                  onPress={() => {
                    closeLikesModal();
                    navigation.navigate('UserProfile', {
                      userId: like.user_id.toString(),
                      isFromSearch: true,
                    });
                  }}>
                  {/* Profile Picture */}
                  <View style={{
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    borderWidth: 2,
                    borderColor: '#bea063',
                    backgroundColor: '#f5f5f5',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 12,
                  }}>
                    <Ionicons name="person" size={24} color="#bea063" />
                  </View>

                  {/* User Info */}
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: '#bea063',
                      marginBottom: 2,
                    }}>
                      {like.full_name || like.user_name}
                    </Text>
                    <Text style={{
                      fontSize: 14,
                      color: '#666',
                    }}>
                      @{like.user_name}
                    </Text>
                  </View>

                  {/* Heart Icon */}
                  <Ionicons name="heart" size={20} color="#ff6b6b" />
                </TouchableOpacity>
              ))
            )}
          </ScrollView>

          {/* Footer */}
          <View style={{
            marginTop: 20,
            paddingTop: 15,
            borderTopWidth: 1,
            borderTopColor: '#eee',
          }}>
            <TouchableOpacity
              style={{
                backgroundColor: '#bea063',
                paddingVertical: 12,
                borderRadius: 8,
                alignItems: 'center',
              }}
              onPress={closeLikesModal}>
              <Text style={{
                color: '#fff',
                fontSize: 16,
                fontWeight: '600',
              }}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // Inline bottom sheet (non-Modal) used for iOS and also inside fullscreen Modal
  const renderOptionsSheet = () => {
    console.log("here comes ...", optionsVisible);
    
    if (!optionsVisible || isFromSearch) return null;
    return (
      <View
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: 'flex-end',
          zIndex: 9999,
          elevation: 9999,
        }}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setOptionsVisible(false)}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' }}
        />
        <View
          style={{
            backgroundColor: '#fff',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            paddingBottom: 12,
            paddingTop: 8,
          }}>
          <View style={{ alignItems: 'center', paddingVertical: 6 }}>
            <View style={{ width: 44, height: 4, borderRadius: 2, backgroundColor: '#ddd' }} />
          </View>
          {activeTab === 'draft' ? (
            <>
              <TouchableOpacity
                onPress={() => {
                  setOptionsVisible(false);
                  setTimeout(() => handlePostDraft(), 0);
                }}
                style={{ paddingVertical: 14, paddingHorizontal: 20 }}>
                <Text style={{ fontSize: 16, color: '#bea063' }}>Post</Text>
              </TouchableOpacity>
              <View style={{ height: 1, backgroundColor: '#eee' }} />
              <TouchableOpacity
                onPress={() => {
                  setOptionsVisible(false);
                  setTimeout(() => handleDeleteDraft(), 0);
                }}
                style={{ paddingVertical: 14, paddingHorizontal: 20 }}>
                <Text style={{ fontSize: 16, color: '#bea063' }}>Delete</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                onPress={() => {
                  setOptionsVisible(false);
                  setTimeout(() => handleEdit(), 0);
                }}
                style={{ paddingVertical: 14, paddingHorizontal: 20 }}>
                <Text style={{ fontSize: 16, color: '#bea063' }}>Edit</Text>
              </TouchableOpacity>
              <View style={{ height: 1, backgroundColor: '#eee' }} />
              <TouchableOpacity
                onPress={() => {
                  setOptionsVisible(false);
                  setTimeout(() => handleDelete(), 0);
                }}
                style={{ paddingVertical: 14, paddingHorizontal: 20 }}>
                <Text style={{ fontSize: 16, color: '#bea063' }}>Delete</Text>
              </TouchableOpacity>
              <View style={{ height: 1, backgroundColor: '#eee' }} />
              <TouchableOpacity
                onPress={handleToggleComments}
                style={{ paddingVertical: 14, paddingHorizontal: 20 }}>
                <Text style={{ fontSize: 16, color: '#bea063' }}>
                  {!selectedPost?.allow_comments ? 'Turn Off Comments' : 'Turn On Comments'}
                </Text>
              </TouchableOpacity>
              <View style={{ height: 1, backgroundColor: '#eee' }} />
              <TouchableOpacity
                onPress={handleToggleLikeCount}
                style={{ paddingVertical: 14, paddingHorizontal: 20 }}>
                <Text style={{ fontSize: 16, color: '#bea063' }}>
                  {selectedPost?.hide_like_count ? 'Show Like Count' : 'Hide Like Count'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
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
          <TouchableOpacity
            onPress={() => navigation.navigate('Menu', { data: data })}>
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
        transparent={false}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
          <View
            style={{
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
              {activeTab === 'reels' ? 'Reels' : activeTab === 'tagged' ? 'Tagged' : 'Posts'}
            </Text>
          </View>
          {filteredPosts.length === 0 ? (
            <View
              style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
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
              initialScrollIndex={selectedIndex >= 0 && selectedIndex < filteredPosts.length ? selectedIndex : 0}
              getItemLayout={(data, index) => ({
                length: Dimensions.get('window').height,
                offset: Dimensions.get('window').height * index,
                index,
              })}
              showsVerticalScrollIndicator={false}
              pagingEnabled={true}
              snapToInterval={Dimensions.get('window').height}
              snapToAlignment="start"
              decelerationRate="fast"
              removeClippedSubviews={false}
              initialNumToRender={3}
              maxToRenderPerBatch={3}
              windowSize={5}
              scrollEventThrottle={16}
              onScroll={(event) => {
                const currentIndex = Math.round(event.nativeEvent.contentOffset.y / Dimensions.get('window').height);
                if (currentIndex !== currentFullscreenIndex) {
                  setCurrentFullscreenIndex(currentIndex);
                }
              }}
              onMomentumScrollEnd={(event) => {
                const index = Math.round(event.nativeEvent.contentOffset.y / Dimensions.get('window').height);
                setSelectedIndex(index);

                // Fetch likes and comments for the current post when scrolling stops
                const currentItem = filteredPosts[index];
                if (currentItem) {
                  setCurrentPostId(currentItem.id);
                  // Clear previous data to show loading state
                  // Clear previous data to show loading state
                  setPostLikesData(prev => ({ ...prev, [currentItem.id]: [] }));
                  setPostCommentsData(prev => ({ ...prev, [currentItem.id]: [] }));
                  const contentType = currentItem.type === 'reel' ? 'reel' : 'post';
                  fetchPostLikes(contentType, currentItem.id);
                  fetchPostComments(contentType, currentItem.id);
                }
              }}
              contentContainerStyle={{ backgroundColor: '#fff' }}
            />
          )}
          {renderOptionsSheet()}
          {renderLikesModal()}
          {renderEditHighlightModal()}
          
          {/* Edit overlay inside fullscreen modal */}
          {editModalVisible && (
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.6)',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 9999,
              }}>
              <TouchableOpacity
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                activeOpacity={1}
                onPress={closeEditModal}
              />
              <View
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 16,
                  padding: 0,
                  width: '90%',
                  maxWidth: 400,
                  maxHeight: '85%',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.25,
                  shadowRadius: 8,
                  elevation: 8,
                }}>
                {/* Header with close button */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: 20,
                    paddingVertical: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: '#f0f0f0',
                  }}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: 'bold',
                      color: '#bea063',
                    }}>
                    Edit {selectedPost?.type === 'reel' ? 'Reel' : 'Post'}
                  </Text>
                  <TouchableOpacity
                    onPress={closeEditModal}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: '#f5f5f5',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Ionicons name="close" size={20} color="#666" />
                  </TouchableOpacity>
                </View>

                {/* Content - Scrollable */}
                <ScrollView 
                  style={{ maxHeight: 300 }}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled">
                  <View style={{ padding: 20, paddingBottom: 10 }}>
                    <TextInput
                      style={{
                        borderWidth: 1,
                        borderColor: '#e0e0e0',
                        borderRadius: 8,
                        padding: 12,
                        marginBottom: 12,
                        fontSize: 16,
                        minHeight: 80,
                        textAlignVertical: 'top',
                        color: '#333',
                        backgroundColor: '#fafafa',
                      }}
                      placeholderTextColor={'#999'}
                      placeholder="Write a caption..."
                      value={editCaption}
                      onChangeText={setEditCaption}
                      multiline
                      autoFocus
                    />
                    
                    {/* Mentions Section */}
                    <View style={{ marginBottom: 12 }}>
                      <Text style={{ fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8 }}>
                        Mentions
                      </Text>
                      
                      {/* Mention Input */}
                      <TextInput
                        style={{
                          borderWidth: 1,
                          borderColor: '#e0e0e0',
                          borderRadius: 8,
                          padding: 12,
                          fontSize: 16,
                          color: '#333',
                          backgroundColor: '#fafafa',
                        }}
                        placeholderTextColor={'#999'}
                        placeholder="Search users to mention..."
                        value={mentionInput}
                        onChangeText={(text) => {
                          console.log('Mention input changed:', text);
                          setMentionInput(text);
                          if (text.length >= 2) {
                            searchMentionUsers(text);
                          } else {
                            setMentionUsers([]);
                            setShowMentionList(false);
                          }
                        }}
                      />

                      {/* Loading Indicator */}
                      {mentionLoading && (
                        <View style={{ padding: 12, alignItems: 'center' }}>
                          <ActivityIndicator size="small" color="#bea063" />
                          <Text style={{ marginTop: 4, fontSize: 14, color: '#666' }}>
                            Searching users...
                          </Text>
                        </View>
                      )}

                      {/* Mention Users List */}
                      {showMentionList && mentionUsers.length > 0 && !mentionLoading && (
                        <>
                          {/* Backdrop to close search */}
                          <TouchableOpacity
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: -20,
                              right: -20,
                              bottom: -300,
                              zIndex: 9998,
                            }}
                            activeOpacity={1}
                            onPress={() => {
                              setShowMentionList(false);
                              setMentionInput('');
                            }}
                          />
                          <View style={{
                            position: 'absolute',
                            top: 60,
                            left: 0,
                            right: 0,
                            backgroundColor: 'white',
                            borderWidth: 1,
                            borderColor: '#e0e0e0',
                            borderRadius: 8,
                            maxHeight: 200,
                            zIndex: 9999,
                            elevation: 10,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.25,
                            shadowRadius: 4,
                          }}>
                          <ScrollView>
                            {mentionUsers.map((user, index) => (
                              <TouchableOpacity
                                key={user.id}
                                style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  padding: 12,
                                  borderBottomWidth: index < mentionUsers.length - 1 ? 1 : 0,
                                  borderBottomColor: '#f0f0f0',
                                }}
                                onPress={() => addMention(user)}>
                                <Image
                                  source={{
                                    uri: user.profile_picture || 'https://via.placeholder.com/40x40?text=U'
                                  }}
                                  style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 16,
                                    marginRight: 12,
                                  }}
                                />
                                <View style={{ flex: 1 }}>
                                  <Text style={{ fontSize: 16, color: '#333', fontWeight: '500' }}>
                                    {user.first_name} {user.last_name}
                                  </Text>
                                  <Text style={{ fontSize: 14, color: '#666' }}>
                                    @{user.username}
                                  </Text>
                                </View>
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                          </View>
                        </>
                      )}

                      {/* Selected Mentions */}
                      {editMentions.length > 0 && (
                        <View style={{ marginTop: 8 }}>
                          {editMentions.map((mention) => (
                            <View
                              key={mention.id}
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: '#e3f2fd',
                                padding: 8,
                                borderRadius: 16,
                                marginRight: 8,
                                marginBottom: 4,
                                alignSelf: 'flex-start',
                              }}>
                              <Text style={{ flex: 1, fontSize: 14, color: '#333' }}>
                                {mention.first_name} {mention.last_name} (@{mention.username})
                              </Text>
                              <TouchableOpacity
                                onPress={() => removeMention(mention.id)}
                                style={{ marginLeft: 8 }}>
                                <Ionicons name="close" size={16} color="#666" />
                              </TouchableOpacity>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                    
                    <LocationPicker
                      value={editLocation}
                      onChange={setEditLocation}
                      style={{ marginBottom: 12 }}
                      isFromUserProfile={true}
                    />
                  </View>
                </ScrollView>

                {/* Fixed Footer with Buttons */}
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    gap: 12,
                    padding: 20,
                    borderTopWidth: 1,
                    borderTopColor: '#f0f0f0',
                    backgroundColor: '#fff',
                  }}>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      paddingVertical: 14,
                      paddingHorizontal: 20,
                      borderWidth: 1,
                      borderColor: '#e0e0e0',
                      borderRadius: 8,
                      alignItems: 'center',
                      backgroundColor: '#fff',
                    }}
                  onPress={closeEditModal}>
                    <Text
                      style={{
                        color: '#666',
                        fontWeight: '600',
                        fontSize: 16,
                      }}>
                      Cancel
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{
                      flex: 1,
                      paddingVertical: 14,
                      paddingHorizontal: 20,
                      backgroundColor: '#bea063',
                      borderRadius: 8,
                      alignItems: 'center',
                    }}
                    onPress={handleEditSubmit}
                    disabled={editLoading}>
                    {editLoading ? (
                      <ActivityIndicator size={20} color="#fff" />
                    ) : (
                      <Text
                        style={{ 
                          fontSize: 16, 
                          color: '#fff', 
                          fontWeight: '600' 
                        }}>
                        Update
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </SafeAreaView>
      </Modal>
      {/* Main Profile Content */}
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#bea063']} // Android
            tintColor="#bea063" // iOS
            title="Pull to refresh" // iOS
            titleColor="#bea063" // iOS
          />
        }>
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
            onEndReached={handleLoadMorePosts}
            onEndReachedThreshold={0.5}
            initialNumToRender={15}
            data={filteredPosts}
            renderItem={renderPostItem}
            keyExtractor={item => item.id}
            numColumns={NUM_COLUMNS}
            scrollEnabled={true}
            contentContainerStyle={styles.postsGrid}
            removeClippedSubviews={false}
            keyboardShouldPersistTaps="handled"
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

      {renderOptionsSheet()}
      {renderLikesModal()}
      {renderEditHighlightModal()}

      {/* Non-Modal Edit Overlay - iOS Safe */}
      {editModalVisible && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
          }}>
          <TouchableOpacity
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            activeOpacity={1}
                  onPress={closeEditModal}
          />
          <View
            style={{
              backgroundColor: '#fff',
              borderRadius: 16,
              padding: 0,
              width: '90%',
              maxWidth: 400,
              maxHeight: '85%',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 8,
              elevation: 8,
            }}>
            {/* Header with close button */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 20,
                paddingVertical: 16,
                borderBottomWidth: 1,
                borderBottomColor: '#f0f0f0',
              }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: '#bea063',
                }}>
                Edit {selectedPost?.type === 'reel' ? 'Reel' : 'Post'}
              </Text>
              <TouchableOpacity
                  onPress={closeEditModal}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: '#f5f5f5',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Ionicons name="close" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Content - Scrollable */}
            <ScrollView 
              style={{ maxHeight: 300 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled">
              <View style={{ padding: 20, paddingBottom: 10 }}>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: '#e0e0e0',
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 12,
                    fontSize: 16,
                    minHeight: 80,
                    textAlignVertical: 'top',
                    color: '#333',
                    backgroundColor: '#fafafa',
                  }}
                  placeholderTextColor={'#999'}
                  placeholder="Write a caption..."
                  value={editCaption}
                  onChangeText={setEditCaption}
                  multiline
                  autoFocus
                />
                
                {/* Mentions Section */}
                <View style={{ marginBottom: 12 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8 }}>
                    Mentions
                  </Text>
                  
                  {/* Mention Input */}
                  <TextInput
                    style={{
                      borderWidth: 1,
                      borderColor: '#e0e0e0',
                      borderRadius: 8,
                      padding: 12,
                      fontSize: 16,
                      color: '#333',
                      backgroundColor: '#fafafa',
                    }}
                    placeholderTextColor={'#999'}
                    placeholder="Search users to mention..."
                    value={mentionInput}
                    onChangeText={(text) => {
                      console.log('Mention input changed (fullscreen):', text);
                      setMentionInput(text);
                      if (text.length >= 2) {
                        searchMentionUsers(text);
                      } else {
                        setMentionUsers([]);
                        setShowMentionList(false);
                      }
                    }}
                  />

                  {/* Loading Indicator */}
                  {mentionLoading && (
                    <View style={{ padding: 12, alignItems: 'center' }}>
                      <ActivityIndicator size="small" color="#bea063" />
                      <Text style={{ marginTop: 4, fontSize: 14, color: '#666' }}>
                        Searching users...
                      </Text>
                    </View>
                  )}

                  {/* Mention Users List */}
                  {showMentionList && mentionUsers.length > 0 && !mentionLoading && (
                    <>
                      {/* Backdrop to close search */}
                      <TouchableOpacity
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: -20,
                          right: -20,
                          bottom: -300,
                          zIndex: 9998,
                        }}
                        activeOpacity={1}
                        onPress={() => {
                          setShowMentionList(false);
                          setMentionInput('');
                        }}
                      />
                      <View style={{
                        position: 'absolute',
                        top: 60,
                        left: 0,
                        right: 0,
                        backgroundColor: 'white',
                        borderWidth: 1,
                        borderColor: '#e0e0e0',
                        borderRadius: 8,
                        maxHeight: 200,
                        zIndex: 9999,
                        elevation: 10,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.25,
                        shadowRadius: 4,
                      }}>
                      <ScrollView>
                        {mentionUsers.map((user, index) => (
                          <TouchableOpacity
                            key={user.id}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              padding: 12,
                              borderBottomWidth: index < mentionUsers.length - 1 ? 1 : 0,
                              borderBottomColor: '#f0f0f0',
                            }}
                            onPress={() => addMention(user)}>
                            <Image
                              source={{
                                uri: user.profile_picture || 'https://via.placeholder.com/40x40?text=U'
                              }}
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 16,
                                marginRight: 12,
                              }}
                            />
                            <View style={{ flex: 1 }}>
                              <Text style={{ fontSize: 16, color: '#333', fontWeight: '500' }}>
                                {user.first_name} {user.last_name}
                              </Text>
                              <Text style={{ fontSize: 14, color: '#666' }}>
                                @{user.username}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                      </View>
                    </>
                  )}

                  {/* Selected Mentions */}
                  {editMentions.length > 0 && (
                    <View style={{ marginTop: 8 }}>
                      {editMentions.map((mention) => (
                        <View
                          key={mention.id}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: '#e3f2fd',
                            padding: 8,
                            borderRadius: 16,
                            marginRight: 8,
                            marginBottom: 4,
                            alignSelf: 'flex-start',
                          }}>
                          <Text style={{ flex: 1, fontSize: 14, color: '#333' }}>
                            {mention.first_name} {mention.last_name} (@{mention.username})
                          </Text>
                          <TouchableOpacity
                            onPress={() => removeMention(mention.id)}
                            style={{ marginLeft: 8 }}>
                            <Ionicons name="close" size={16} color="#666" />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
                
                <LocationPicker
                  value={editLocation}
                  onChange={setEditLocation}
                  style={{ marginBottom: 12 }}
                  isFromUserProfile={true}
                />
              </View>
            </ScrollView>

            {/* Fixed Footer with Buttons */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                gap: 12,
                padding: 20,
                borderTopWidth: 1,
                borderTopColor: '#f0f0f0',
                backgroundColor: '#fff',
              }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  paddingHorizontal: 20,
                  borderWidth: 1,
                  borderColor: '#e0e0e0',
                  borderRadius: 8,
                  alignItems: 'center',
                  backgroundColor: '#fff',
                }}
                  onPress={closeEditModal}>
                <Text
                  style={{
                    color: '#666',
                    fontWeight: '600',
                    fontSize: 16,
                  }}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  paddingHorizontal: 20,
                  backgroundColor: '#bea063',
                  borderRadius: 8,
                  alignItems: 'center',
                }}
                onPress={handleEditSubmit}
                disabled={editLoading}>
                {editLoading ? (
                  <ActivityIndicator size={20} color="#fff" />
                ) : (
                  <Text
                    style={{ 
                      fontSize: 16, 
                      color: '#fff', 
                      fontWeight: '600' 
                    }}>
                    Update
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

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
              placeholderTextColor="#000000"

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
                <Text
                  style={{ fontSize: 16, color: '#bea063', fontWeight: '600' }}>
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
                  <Text style={styles.createCollectionButtonText}>Create</Text>
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

      {selectedCommentPost && (
        <InstagramCommentModal
          visible={isCommentModalVisible}
          onClose={() => {
            setIsCommentModalVisible(false);
            // Refresh comments data when modal closes to ensure we have latest data
            if (selectedCommentPost) {
              const contentType = selectedCommentPost.type === 'reel' ? 'reel' : 'post';
              fetchPostComments(contentType, selectedCommentPost.id);
            }
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
          onCommentAdded={(newComment) => {
            addCommentToPost(selectedCommentPost.id, newComment);
          }}
          onCommentDeleted={(commentId) => {
            removeCommentFromPost(selectedCommentPost.id, commentId);
          }}
        />
      )}

      {/* Custom Mentioned Users Modal */}
      {/* <Modal
        visible={mentionedUsersModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMentionedUsersModalVisible(false)}> */}


      <Modal
        visible={mentionedUsersModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMentionedUsersModalVisible(false)}>
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          activeOpacity={1}
          onPress={() => setMentionedUsersModalVisible(false)}>
          <View
            style={{
              backgroundColor: '#fff',
              borderRadius: 16,
              padding: 20,
              width: '90%',
              maxHeight: '70%',
            }}
            onStartShouldSetResponder={() => true}>
            {/* Header */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20,
              paddingBottom: 15,
              borderBottomWidth: 1,
              borderBottomColor: '#eee',
            }}>
              <Text style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: '#333',
              }}>
                Mentioned Users
              </Text>
              <TouchableOpacity
                onPress={() => setMentionedUsersModalVisible(false)}
                style={{ padding: 5 }}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Users List */}
            <ScrollView style={{ maxHeight: 400 }}>
              {selectedMentionedUsers.map((user: any, index: number) => (
                <TouchableOpacity
                  key={user.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 12,
                    paddingHorizontal: 8,
                    borderBottomWidth: index < selectedMentionedUsers.length - 1 ? 1 : 0,
                    borderBottomColor: '#f0f0f0',
                  }}
                  onPress={() => {
                    setMentionedUsersModalVisible(false);
                    navigation.navigate('UserProfile', {
                      userId: user.id.toString(),
                      isFromSearch: true,
                    });
                  }}>
                  {/* Profile Picture */}
                  <View style={{
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    borderWidth: 2,
                    borderColor: '#bea063',
                    backgroundColor: '#f5f5f5',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 12,
                  }}>
                    <Ionicons name="person" size={24} color="#bea063" />
                  </View>

                  {/* User Info */}
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: '#bea063',
                      marginBottom: 2,
                    }}>
                      @{user.username}
                    </Text>
                    <Text style={{
                      fontSize: 14,
                      color: '#666',
                    }}>
                      Tap to view profile
                    </Text>
                  </View>

                  {/* Arrow Icon */}
                  <Ionicons name="chevron-forward" size={20} color="#ccc" />
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Footer */}
            <View style={{
              marginTop: 20,
              paddingTop: 15,
              borderTopWidth: 1,
              borderTopColor: '#eee',
            }}>
              <TouchableOpacity
                style={{
                  backgroundColor: '#bea063',
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
                onPress={() => setMentionedUsersModalVisible(false)}>
                <Text style={{
                  color: '#fff',
                  fontSize: 16,
                  fontWeight: '600',
                }}>
                  Close
                </Text>
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
  tagIconContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    padding: 4,
    zIndex: 3,
  },
});

export default ProfileScreen;
