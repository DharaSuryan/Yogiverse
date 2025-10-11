import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, FlatList, Dimensions, SectionList, ActivityIndicator } from 'react-native';
const Ionicons = require('react-native-vector-icons/Ionicons').default;
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SearchStackParamList } from '../../Navigation/types';
import Post from "../../Component/Post"
import { navigate } from '../../Component/Route';
import { SafeAreaView } from 'react-native-safe-area-context';
import MasonryList from '@react-native-seoul/masonry-list';
import { BackHandler } from 'react-native';

// Group `related` into rows of 2
const chunkArray = (arr: any[], size: number): any[][] => {
  const result: any[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
};

const TrendingDetailScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<SearchStackParamList>>();
  const route = useRoute<RouteProp<SearchStackParamList, 'TrendingDetailScreen'>>();
  const [post, setPost] = useState<any>(route.params.post);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for real-time updates
  const [postLikesData, setPostLikesData] = useState<{[postId: string]: any[]}>({});
  const [postCommentsData, setPostCommentsData] = useState<{[postId: string]: any[]}>({});
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Get current user ID
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const parsed = JSON.parse(userData);
          console.log("parsed ....",parsed);
          
          setCurrentUserId(parsed.id?.toString() || null);
        }
      } catch (e) {
        setCurrentUserId(null);
      }
    };
    fetchUserId();
  }, []);

  // Fetch likes for a post
  const fetchPostLikes = async (contentType: string, objectId: string) => {
    console.log(`[TrendingDetailScreen] Fetching likes for post ${objectId} (${contentType})`);
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
        console.log(`[TrendingDetailScreen] Received ${response.data.data.length} likes for post ${objectId}`);
        setPostLikesData(prev => ({
          ...prev,
          [objectId]: response.data.data
        }));
      } else {
        console.log(`[TrendingDetailScreen] No likes data for post ${objectId}`);
        setPostLikesData(prev => ({
          ...prev,
          [objectId]: []
        }));
      }
    } catch (error) {
      console.error(`[TrendingDetailScreen] Error fetching post likes for ${objectId}:`, error);
      setPostLikesData(prev => ({
        ...prev,
        [objectId]: []
      }));
    }
  };

  // Fetch comments for a post
  const fetchPostComments = async (contentType: string, objectId: string) => {
    console.log(`[TrendingDetailScreen] Fetching comments for post ${objectId} (${contentType})`);
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
        console.log(`[TrendingDetailScreen] Received ${response.data.data.length} comments for post ${objectId}`);
        setPostCommentsData(prev => ({
          ...prev,
          [objectId]: response.data.data
        }));
      } else {
        console.log(`[TrendingDetailScreen] No comments data for post ${objectId}`);
        setPostCommentsData(prev => ({
          ...prev,
          [objectId]: []
        }));
      }
    } catch (error) {
      console.error(`[TrendingDetailScreen] Error fetching post comments for ${objectId}:`, error);
      setPostCommentsData(prev => ({
        ...prev,
        [objectId]: []
      }));
    }
  };

  // Add a new comment to postCommentsData
  const addCommentToPost = (postId: string, newComment: any) => {
    console.log(`[TrendingDetailScreen] Adding comment to post ${postId}:`, newComment);
    
    setPostCommentsData(prev => {
      const updatedData = {
        ...prev,
        [postId]: [...(prev[postId] || []), newComment]
      };
      console.log(`[TrendingDetailScreen] Updated postCommentsData for ${postId}:`, updatedData[postId]);
      return updatedData;
    });
  };

  // Remove a comment from postCommentsData
  const removeCommentFromPost = (postId: string, commentId: string) => {
    console.log(`[TrendingDetailScreen] Removing comment ${commentId} from post ${postId}`);
    
    setPostCommentsData(prev => {
      const updatedData = {
        ...prev,
        [postId]: (prev[postId] || []).filter(comment => comment.id !== parseInt(commentId))
      };
      console.log(`[TrendingDetailScreen] Updated postCommentsData for ${postId}:`, updatedData[postId]);
      return updatedData;
    });
  };

  // Fetch likes and comments for the main post when component mounts
  useEffect(() => {
    if (post?.id && currentUserId) {
      const contentType = post.type === 'reel' ? 'reel' : 'post';
      fetchPostLikes(contentType, post.id);
      fetchPostComments(contentType, post.id);
    }
  }, [post?.id, currentUserId]);

  // When likes arrive, compute if current user liked and update local post state
  useEffect(() => {
    if (!post?.id) return;
    const likesForPost = postLikesData[post.id];
    if (!likesForPost) return;
    const likedByCurrentUser = likesForPost.some((l: any) => String(l.user_id) === String(currentUserId || ''));
    setPost((prev: any) => ({
      ...prev,
      is_liked: likedByCurrentUser,
      like_count: Array.isArray(likesForPost) ? likesForPost.length : prev?.like_count,
    }));
  }, [postLikesData[post.id], currentUserId]);

  useEffect(() => {
    const fetchRelated = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get('https://pashuahar.com/related-content/', {
          params: {
            type: 'post',
            id: post.id,
          },
        });
        setRelated(res.data?.data || []);
        // console.log("related ....",res.data?.data);
        
      } catch (e) {
        setError('Failed to fetch related content.');
        setRelated([]);
      }
      setLoading(false);
    };
    fetchRelated();
  }, [post.id]);
  const sections = [
    {
      title: 'Related',
      data: chunkArray(related, 2), // each item is an array of 2 posts
    },
  ];
const handleBack = () => {
  // if (navigation.canGoBack()) {
  //   navigation.goBack();
  // } else {
    (navigation as any).navigate('MainTab', { screen: 'SearchTab' });
  // }
};

  // Hardware back press handling
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        handleBack();
        return true;
      };
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [])
  );
  // Prepare props for <Post />
  const profile = post.profile || {};
  let userAvatar = '';
  // if (profile?.profile_picture) {
  //   userAvatar = profile.profile_picture?.startsWith('http')
  //     ? profile?.profile_picture
  //     : `http://192.168.1.160:9001${profile.profile_picture}`;
  // }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBack}
        >
          <Ionicons name="arrow-back" size={24} color="#bea063" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Main Post */}
        <Post
          id={post?.id?.toString()}
          username={profile.username || ''}
          media={post.media || []}
          caption={post.caption || ''}
          likes={post.like_count || 0}
          userAvatar={userAvatar}
          isLiked={!!post.is_liked}
          contentType={post.type || 'post'}
          navigation={navigation}
          allowComments={post.allow_comments != true}
          commentCount={post.comment_count || 0}
          hideLikeCount={post.hide_like_count || false}
          location={post.location || ''}
          createdAt={post.created_at || ''}
          profile={profile}
          item={post}
          iSfromTrendings={false}
          onActionComplete={(updated) => {
            if (!updated) return;
            setPost((prev: any) => ({
              ...prev,
              ...updated,
              ...(updated.data ? { data: { ...(prev?.data || {}), ...updated.data } } : {}),
              is_liked: typeof updated.is_like !== 'undefined' ? updated.is_like : prev?.is_liked,
              like_count: typeof updated.data?.like_count !== 'undefined' ? updated.data.like_count : prev?.like_count,
            }));
          }}
          onCommentAdded={(newComment) => {
            addCommentToPost(post.id, newComment);
          }}
          onCommentDeleted={(commentId) => {
            removeCommentFromPost(post.id, commentId);
          }}
        />

        {/* Related Content */}
        <Text style={styles.relatedTitle}>More to explore</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#bea063" style={styles.loadingText} />
        ) : error ? (
          <Text style={styles.loadingText}>{error}</Text>
        ) : (
          <MasonryList
            data={related}
            keyExtractor={(item: any, index: any) => `${item.id}-${index}`}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.relatedListContainer}
            renderItem={({ item }: any) => {
              let mediaUrl = '';
              if (Array.isArray(item.media) && item.media.length > 0) {
                mediaUrl = item.media[0]?.media_file || '';
              }

              const randomHeight = Math.floor(Math.random() * 120) + 200;
              const screenWidth = Dimensions.get('window').width;
              const columnWidth = screenWidth / 2 - 16;

              return (
                <TouchableOpacity
                  style={styles.relatedItem}
                  onPress={() =>
                    navigation.push('TrendingDetailScreen', { post: item })
                  }
                  activeOpacity={0.9}
                >
                  {mediaUrl ? (
                    <Image
                      source={{ uri: mediaUrl }}
                      style={[styles.relatedImage, { height: randomHeight, width: columnWidth }]}
                      resizeMode="cover"
                    />
                  ) : (
                    <Image
                      style={[styles.placeholderImage, { height: randomHeight, width: columnWidth, backgroundColor: '#ccc' }]}
                    />
                  )}
                </TouchableOpacity>
              );
            }}
          />
        )}
      </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#bea063',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  relatedTitle: {
    fontWeight: '600',
    fontSize: 16,
    margin: 16,
    color: '#333',
  },
  loadingText: {
    textAlign: 'center',
    color: '#666',
    marginVertical: 20,
  },
  relatedListContainer: {
    paddingBottom: 30,
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  relatedItem: {
    margin: 8,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  relatedImage: {
    borderRadius: 12,
  },
  placeholderImage: {
    borderRadius: 12,
  },
  emptySpace: {
    flex: 1,
    marginHorizontal: 4,
  },
});

export default TrendingDetailScreen; 