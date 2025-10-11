import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Dimensions,
  FlatList,
  BackHandler,
  Modal, // <-- Add Modal import
} from 'react-native';
import { useNavigation, useRoute, RouteProp, useFocusEffect, CommonActions } from '@react-navigation/native';
const Ionicons = require('react-native-vector-icons/Ionicons').default;
import Video from 'react-native-video';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Post from '../../Component/Post';

interface CollectionPost {
  id: string;
  data: {
    id: string;
    caption: string;
    media: Array<{ media_file?: string; is_video?: boolean; file?: string; }>;
    created_at: string;
  };
  profile: {
    username: string;
    profile_picture?: string;
  };
}

interface CollectionDetailScreenRouteProp {
  params: {
    collectionId: string;
    collectionName: string;
    postToSave?: {
      content_type: string;
      object_id: string;
    };
  };
}

const { width, height } = Dimensions.get('window');
const NUM_COLUMNS = 3;
const ITEM_SIZE = (width - 40) / NUM_COLUMNS; // Account for container padding

// Helper to chunk array into rows of n
function chunkArray(array: any[], size: number) {
  const chunked = [];
  for (let i = 0; i < array.length; i += size) {
    chunked.push(array.slice(i, i + size));
  }
  return chunked;
}

export default function CollectionDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<{ params: CollectionDetailScreenRouteProp['params'] }>>();
  const { collectionId, collectionName, postToSave } = route.params;

  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savingPost, setSavingPost] = useState(false);
  const [deletingCollection, setDeletingCollection] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState<'all' | 'reels'>('all');

  // Fullscreen modal state
  const [fullscreenVisible, setFullscreenVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [videoStates, setVideoStates] = useState<{ [key: string]: { isPlaying: boolean; isMuted: boolean } }>({});
  const fullscreenFlatListRef = React.useRef<FlatList>(null);

  // Remove item from collection
  const [removingItemId, setRemovingItemId] = useState<string | null>(null);

  // Hardware and UI back navigation
  const handleGoBack = () => {
    navigation.navigate('MainTab', { screen: 'Profile' });
  };

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        handleGoBack();
        return true; // Prevent default back behavior
      };
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [])
  );

  const fetchCollectionPosts = async () => {
    setLoading(true);
    try {
      const authToken = await AsyncStorage.getItem('accessToken');
      const headers = {
        'Accept': 'application/json',
        'Authorization': `Bearer ${authToken}`
      };
      const apiUrl = `https://pashuahar.com/collections/${collectionId}/`;
      const response = await axios.get(apiUrl, { headers });
      console.log("reson.....", response?.data?.data?.results);
      

      // Flexible data handling
      let newPosts = [];
      if (response.data?.data?.results) {
        newPosts = response.data.data.results;
        setPosts(newPosts);
      } else if (response.data?.results) {
        newPosts = response.data.results;
        setPosts(newPosts);
      } else if (Array.isArray(response.data)) {
        newPosts = response.data;
        setPosts(newPosts);
      } else {
        setPosts([]);
      }
      // If in fullscreen and the selected post is gone, close the modal
      if (
        fullscreenVisible &&
        (selectedIndex >= newPosts.length || !newPosts[selectedIndex])
      ) {
        setFullscreenVisible(false);
      }
    } catch (error: any) {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollectionPosts();
  }, [collectionId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCollectionPosts();
    setRefreshing(false);
  };

  const handleSavePost = async () => {
    if (!postToSave) return;
    setSavingPost(true);
    try {
      const authToken = await AsyncStorage.getItem('accessToken');
      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      };
      const payload = {
        collection: parseInt(collectionId),
        content_type: postToSave.content_type,
        object_id: postToSave.object_id,
      };
      await axios.post(
        'https://pashuahar.com/collections/items/',
        payload,
        { headers }
      );
      Alert.alert('Success', 'Post saved to collection!');
      fetchCollectionPosts();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to save post';
      Alert.alert('Error', errorMessage);
    } finally {
      setSavingPost(false);
    }
  };

  const handleDeleteCollection = async () => {
    Alert.alert(
      'Delete Collection',
      `Are you sure you want to delete "${collectionName}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeletingCollection(true);
            try {
              const authToken = await AsyncStorage.getItem('accessToken');
              const headers = {
                'Accept': 'application/json',
                'Authorization': `Bearer ${authToken}`
              };
              const deleteUrl = `https://pashuahar.com/collections/${collectionId}/delete/`;
              await axios.delete(deleteUrl, { headers });
              Alert.alert('Success', 'Collection deleted successfully!');
              handleGoBack();
            } catch (error: any) {
              const errorMessage = error.response?.data?.message || 'Failed to delete collection';
              Alert.alert('Error', errorMessage);
            } finally {
              setDeletingCollection(false);
            }
          },
        },
      ]
    );
  };

  const getMediaUri = (item: any) => {
    if (item.media_file) return item.media_file.startsWith('http') ? item.media_file : `http://192.168.1.160:9001${item.media_file}`;
    if (item.file) return item.file.startsWith('http') ? item.file : `http://192.168.1.160:9001${item.file}`;
    return null;
  };

  // Filter valid posts based on active tab
  const validPosts = posts.filter(item => item && item.item_data && item.item_data.id);
  const filteredPosts = activeTab === 'reels' 
    ? validPosts.filter(item => item.item_data.type === 'reel')
    : validPosts;

  // Helper: get all valid posts for modal navigation (use filtered posts)
  const allValidPosts = filteredPosts;

  // Video control functions
  const togglePlayPause = (itemId: string) => {
    setVideoStates(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        isPlaying: !prev[itemId]?.isPlaying,
      },
    }));
  };
  const toggleMute = (itemId: string) => {
    setVideoStates(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        isMuted: !prev[itemId]?.isMuted,
      },
    }));
  };
  // Initialize video state for a video if not present
  const ensureVideoState = (itemId: string) => {
    setVideoStates(prev => {
      if (prev[itemId]) return prev;
      return {
        ...prev,
        [itemId]: { isPlaying: true, isMuted: true },
      };
    });
  };

  // Open modal on grid item press
  const handleGridItemPress = (index: number) => {
    setSelectedIndex(index);
    setFullscreenVisible(true);
    // Pre-initialize video state for the selected item if it's a video
    const item = allValidPosts[index]?.item_data;
    if (item && item.type === 'reel') {
      ensureVideoState(item.id?.toString());
    }
  };

  // Remove item from collection
  const handleRemoveItem = async (item: any) => {
    if (!item?.id) return;
    setRemovingItemId(item.id.toString());
    try {
      const authToken = await AsyncStorage.getItem('accessToken');
      const headers = {
        'Accept': 'application/json',
        'Authorization': `Bearer ${authToken}`
      };
      // API: DELETE /collections/items/{item_id}/
      await axios.delete(`https://pashuahar.com/collections/items/${item.id}/`, { headers });
      await fetchCollectionPosts(); // Refresh after removal
      // Optionally, close modal if no items left
      if (allValidPosts.length - 1 <= 0) setFullscreenVisible(false);
    } catch (err) {
      Alert.alert('Error', 'Failed to remove item from collection');
    } finally {
      setRemovingItemId(null);
    }
  };

  // Render full-screen modal item
  const renderFullscreenItem = ({ item, index }: { item: any; index: number }) => {
    if (!item?.item_data) return null;
    const post = item.item_data;
    const isReel = post.type === 'reel';
    const media = isReel
      ? post.video_file
        ? [{ media_file: post.video_file, is_video: true }]
        : []
      : post.media || [];
    const mediaFile = isReel ? media[0]?.media_file : media[0]?.media_file;
    const itemId = post.id?.toString();
    const videoState = videoStates[itemId] || { isPlaying: true, isMuted: true };
    return (
      <View style={{ width, height, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
        {/* Header - back icon on left, no close icon on right */}
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, paddingBottom: 0 }}>
          <TouchableOpacity onPress={() => setFullscreenVisible(false)} style={{ padding: 4, marginRight: 8 }}>
            <Ionicons name="arrow-back" size={28} color="#bea063" />
          </TouchableOpacity>
          <Image source={{ uri: post.profile?.profile_picture || 'https://picsum.photos/40' }} style={{ width: 32, height: 32, borderRadius: 16, marginRight: 8 }} />
          <Text style={{ color: '#bea063', fontWeight: 'bold', fontSize: 15 }}>{post.profile?.username || ''}</Text>
          <View style={{ flex: 1 }} />
        </View>
        {/* Main media - Use Post component for both posts and reels */}
        <View style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center', marginBottom: 0, paddingBottom: 0 }}>
          <Post
            id={post.id?.toString()}
            username={post.profile?.username || ''}
            media={media}
            caption={post.caption || ''}
            likes={post.like_count || 0}
            userAvatar={post.profile?.profile_picture}
            isLiked={item.is_like || false}
            contentType={post.type}
            navigation={navigation}
            allowComments={post.allow_comments != true}
            commentCount={post.comment_count || 0}
            hideLikeCount={post.hide_like_count || false}
            location={post.location || ''}
            createdAt={post.created_at || ''}
            profile={post.profile}
            item={item}
            is_collection={item.is_collection}
            collection_id={item.collection}
            type={post.type}
            hideHeaderAndControls={true}
            showVideoControlsInActionsRow={isReel && !!mediaFile}
            onPlayPausePress={() => { ensureVideoState(itemId); togglePlayPause(itemId); }}
            onMuteUnmutePress={() => { ensureVideoState(itemId); toggleMute(itemId); }}
            isPlaying={videoState.isPlaying}
            isMuted={videoState.isMuted}
            onRemovedFromCollection={fetchCollectionPosts}
          />
        </View>
      </View>
    );
  };

  // Update renderGridItem to open modal
  const renderGridItem = ({ item, index }: { item: any; index: number }) => {
    if (!item?.item_data) return null;
    const post = item.item_data;
    const isReel = post.type === 'reel';
    const media = isReel
      ? post.video_file
        ? [{ media_file: post.video_file, is_video: true }]
        : []
      : post.media || [];
    const mediaFile = isReel ? media[0]?.media_file : media[0]?.media_file;

    // Only render reels in the reels tab
    if (activeTab === 'reels' && !isReel) return null;

    // Use different style for reels
    const itemStyle = [
      styles.gridItem,
      activeTab === 'reels' && styles.reelGridItem
    ];
    const mediaStyle = [
      styles.gridMedia,
      activeTab === 'reels' && styles.reelGridMedia
    ];

    return (
      <TouchableOpacity 
        style={itemStyle}
        onPress={() => handleGridItemPress(index)}
        activeOpacity={0.9}
      >
        <View style={styles.gridItemContainer}>
          <View style={styles.mediaContainer}>
            {/* In grid: videos should always be paused and never auto-play! */}
            {isReel && mediaFile && (
              <Video
                source={{ uri: mediaFile }}
                style={mediaStyle}
                resizeMode="cover"
                muted={true}
                paused={true} // Always paused in grid!
                repeat={false} // Never repeat in grid!
              />
            )}
            {/* Reel indicator overlay */}
            {isReel && (
              <View style={styles.reelIndicator}>
                <Ionicons name="play-circle" size={20} color="#fff" />
              </View>
            )}
            {/* Multiple media indicator */}
            {media.length > 1 && (
              <View style={styles.multipleMediaIndicator}>
                <Ionicons name="copy-outline" size={14} color="#fff" />
                <Text style={styles.multipleMediaText}>{media.length}</Text>
              </View>
            )}
          </View>
          {/* Post component for functionality (hidden visually) */}
          <View style={styles.hiddenPost}>
            <Post
              id={post.id?.toString()}
              username={post.profile?.username || ''}
              media={media}
              caption={post.caption || ''}
              likes={post.like_count || 0}
              userAvatar={post.profile?.profile_picture}
              isLiked={item.is_like || false}
              contentType={post.type}
              navigation={navigation}
              allowComments={post.allow_comments != true}
              commentCount={post.comment_count || 0}
              hideLikeCount={post.hide_like_count || false}
              location={post.location || ''}
              createdAt={post.created_at || ''}
              profile={post.profile}
              item={item}
              is_collection={item.is_collection}
              collection_id={item.collection}
              type={post.type}
              hideActions={true}
              hideAllDetails={true}
              onRemovedFromCollection={fetchCollectionPosts}
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Custom render for grid rows (for Reels tab)
  function renderGridRow({ item: row, rowIndex }: { item: any[]; rowIndex: number }, renderGridItemFn: any) {
    return (
      <View style={styles.rowWrapper}>
        {row.map((item, colIndex) => (
          <View key={item.item_data.id} style={styles.gridItem}>
            {renderGridItemFn({ item, index: rowIndex * NUM_COLUMNS + colIndex })}
          </View>
        ))}
        {/* Fill empty columns if needed */}
        {row.length < NUM_COLUMNS &&
          Array(NUM_COLUMNS - row.length)
            .fill(null)
            .map((_, idx) => (
              <View key={`empty-${idx}`} style={[styles.gridItem, { backgroundColor: 'transparent', elevation: 0, shadowOpacity: 0 }]} />
            ))}
      </View>
    );
  }

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerInfo}>
        <Text style={styles.postCount}>
          {filteredPosts.length} {activeTab === 'reels' ? (filteredPosts.length === 1 ? 'reel' : 'reels') : (filteredPosts.length === 1 ? 'post' : 'posts')}
        </Text>
      </View>
      {postToSave && (
        <TouchableOpacity
          style={[styles.saveButton, savingPost && styles.saveButtonDisabled]}
          onPress={handleSavePost}
          disabled={savingPost}
        >
          {savingPost ? (
            <ActivityIndicator size={16} color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Post</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );

  // Render tab bar
  const renderTabBar = () => (
    <View style={styles.tabBar}>
      <TouchableOpacity
        style={[styles.tabButton, activeTab === 'all' && styles.activeTab]}
        onPress={() => setActiveTab('all')}
      >
        <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
          All
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tabButton, activeTab === 'reels' && styles.activeTab]}
        onPress={() => setActiveTab('reels')}
      >
        <Text style={[styles.tabText, activeTab === 'reels' && styles.activeTabText]}>
          Reels
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.navHeader}>
          <TouchableOpacity onPress={handleGoBack}>
            <Text style={{fontSize: 24, color: '#000'}}>{'←'}</Text>
          </TouchableOpacity>
          <Text style={styles.navTitle}>{collectionName}</Text>
          <TouchableOpacity
            onPress={handleDeleteCollection}
            disabled={deletingCollection}
            style={styles.deleteButton}
          >
            {deletingCollection ? (
              <ActivityIndicator size={20} color="#FF3B30" />
            ) : (
              <Ionicons name="trash" size={24} color="#FF3B30" />
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#bea063" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navHeader}>
        <TouchableOpacity onPress={handleGoBack}>
        <Ionicons name="arrow-back" size={26} color="#bea063" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>{collectionName}</Text>
        <TouchableOpacity
          onPress={handleDeleteCollection}
          disabled={deletingCollection}
          style={styles.deleteButton}
        >
          {deletingCollection ? (
            <ActivityIndicator size={20} color="#FF3B30" />
          ) : (
            <Ionicons name="trash" size={24} color="#FF3B30" />
          )}
        </TouchableOpacity>
      </View>
      {renderHeader()}
      {renderTabBar()}
      {filteredPosts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={{fontSize: 80, color: '#ccc'}}>{'🔖'}</Text>
          <Text style={styles.emptyTitle}>
            {activeTab === 'reels' ? 'No Reels Yet' : 'No Posts Yet'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {activeTab === 'reels' 
              ? 'Reels you save to this collection will appear here'
              : 'Posts you save to this collection will appear here'
            }
          </Text>
        </View>
      ) : activeTab === 'reels' && filteredPosts.length < NUM_COLUMNS ? (
        <View style={{ flexDirection: 'row', justifyContent: 'center', paddingVertical: 8 }}>
          {filteredPosts.map((item, index) => renderGridItem({ item, index }))}
        </View>
      ) : (
        <FlatList
          key={activeTab}
          data={filteredPosts}
          numColumns={NUM_COLUMNS}
          keyExtractor={item => item.item_data.id.toString()}
          renderItem={renderGridItem}
          refreshing={refreshing}
          onRefresh={onRefresh}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.postsGrid}
          columnWrapperStyle={styles.rowWrapper}
        />
      )}
      {/* Fullscreen Modal for swipe navigation */}
      <Modal
        visible={fullscreenVisible}
        animationType="slide"
        onRequestClose={() => setFullscreenVisible(false)}
        transparent={false}
      >
        <FlatList
          ref={fullscreenFlatListRef}
          data={allValidPosts}
          renderItem={renderFullscreenItem}
          keyExtractor={item => item.item_data.id.toString()}
          pagingEnabled
          initialScrollIndex={selectedIndex}
          getItemLayout={(data, index) => ({ length: height, offset: height * index, index })}
          showsVerticalScrollIndicator={false}
          style={{ flex: 1, backgroundColor: '#fff' }}
          onMomentumScrollEnd={event => {
            const newIndex = Math.round(event.nativeEvent.contentOffset.y / height);
            setSelectedIndex(newIndex);
            // Optionally, auto-play video if new item is a reel
            const item = allValidPosts[newIndex]?.item_data;
            if (item && item.type === 'reel') ensureVideoState(item.id?.toString());
          }}
        />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  navHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#bea063',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerInfo: {
    flex: 1,
  },
  collectionName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  postCount: {
    fontSize: 14,
    color: '#666',
  },
  saveButton: {
    backgroundColor: '#bea063',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  postsGrid: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  rowWrapper: {
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  gridItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    marginBottom: 8,
    margin: 2, // Add margin for all grid items
  },
  gridItemContainer: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mediaContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000', // Ensure background is black for video/image
  },
  gridMedia: {
    width: '100%',
    height: '100%',
  },
  placeholderMedia: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  reelIndicator: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10,
    padding: 5,
  },
  multipleMediaIndicator: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10,
    padding: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  multipleMediaText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  hiddenPost: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  deleteButton: {
    padding: 5,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#bea063',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#bea063',
    fontWeight: '600',
  },
  reelGridItem: {
    height: ITEM_SIZE * 1.5, // Portrait aspect ratio for reels
    margin: 4, // Add more margin for reels grid items
  },
  reelGridMedia: {
    width: '100%',
    height: '100%',
  },
});
