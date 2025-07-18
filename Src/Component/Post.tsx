import React, {useState} from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
  FlatList,
  Modal,
  SectionList,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../Navigation/types';

const Ionicons = require('react-native-vector-icons/Ionicons').default;
import Video from 'react-native-video';
import OptionsBottomSheet from '../Components/OptionsBottomSheet';

interface Collection {
  id: number;
  name: string;
  created_at: string;
  post_count?: number; // Optional since it's not in the API response
  cover_image?: string; // Optional since it's not in the API response
}

interface SectionData {
  title: string;
  data: Collection[];
}

interface PostProps {
  id: string;
  username: string;
  media: Array<{ media_file?: string; is_video?: boolean; file?: string; }>;
  caption: string;
  likes: number;
  userAvatar: string;
  isLiked: boolean;
  contentType: string;
  navigation: any;
  allowComments?: boolean;
  commentCount?: number;
  hideLikeCount?: boolean;
  location?: string;
  createdAt?: string;
  profile?: any;
  item?: any;
  onDelete?: (id: string) => void;
  isdrmoDetails?: boolean;
  is_collection?: boolean;
  collection_id?: number | null;
  type?: string;
  hideActions?: boolean;
  hideAllDetails?: boolean;
  hideHeaderAndControls?: boolean;
  showVideoControlsInActionsRow?: boolean;
  onPlayPausePress?: () => void;
  onMuteUnmutePress?: () => void;
  isPlaying?: boolean;
  isMuted?: boolean;
  onRemovedFromCollection?: () => void;
  onOptions?: () => void;
}

const fallbackAvatar = require('../Assets/yoga.jpg');
const fallbackPostImage = require('../Assets/yoga.jpg');

function formatTimeAgo(dateString: string) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffM = Math.floor(diffMs / (1000 * 60));
  const diffH = Math.floor(diffMs / (1000 * 60 * 60));
  const diffD = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffMo = Math.floor(diffD / 30);
  if (diffMo >= 1) {
    // Show as '27 Apr'
    return date.toLocaleString('en-US', { day: '2-digit', month: 'short' });
  } else if (diffD >= 1) {
    return diffD === 1 ? '1 day ago' : `${diffD} days ago`;
  } else if (diffH >= 1) {
    return diffH === 1 ? '1 hour ago' : `${diffH} hours ago`;
  } else if (diffM >= 1) {
    return diffM === 1 ? '1 min ago' : `${diffM} mins ago`;
  } else {
    return 'just now';
  }
}

const Post: React.FC<PostProps> = (props) => {
  const {
    id,
    username,
    media = [],
    caption,
    likes,
    userAvatar,
    isLiked: initialIsLiked,
    contentType,
    navigation,
    allowComments = true,
    commentCount = 0,
    hideLikeCount = false,
    location = '',
    createdAt = '',
    profile = {},
    item,
    onDelete,
    isdrmoDetails = false,
    is_collection,
    collection_id,
    type,
    hideActions = false,
    hideAllDetails = false,
    hideHeaderAndControls = false,
    showVideoControlsInActionsRow = false,
    onPlayPausePress,
    onMuteUnmutePress,
    isPlaying,
    isMuted,
    onRemovedFromCollection,
    onOptions,
  } = props;
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likesCount, setLikesCount] = useState(likes);
  const [likeLoading, setLikeLoading] = useState(false);
  const [showFallbackAvatar, setShowFallbackAvatar] = useState(false);
  const [showFallbackPostImage, setShowFallbackPostImage] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [videoStates, setVideoStates] = useState<{ [index: number]: { paused: boolean; muted: boolean } }>({});
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [saveLoading, setSaveLoading] = useState(false);
  const [collectionsLoading, setCollectionsLoading] = useState(false);
  const [savingToCollectionId, setSavingToCollectionId] = useState<number | null>(null);
  const navigations = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [showFullCaption, setShowFullCaption] = useState(false);
  // Add state for save (collection) loading
  const [saveCollectionLoading, setSaveCollectionLoading] = useState(false);

  const getMediaUri = (item: any) => {
    if (item.media_file) return item.media_file.startsWith('http') ? item.media_file : `http://192.168.1.160:9001${item.media_file}`;
    if (item.file) return item.file.startsWith('http') ? item.file : `http://192.168.1.160:9001${item.file}`;
    return null;
  };
// console.log("id.....", item?.profile?.id , id);

  const handleLike = async () => {
    const authToken = await AsyncStorage.getItem('accessToken');
    // console.log("isdrmoDetails",isdrmoDetails);
    
      const headers = {
        'Accept': 'application/json',
        'Authorization': `Bearer ${authToken}`
      };
    if (likeLoading) return;
    setLikeLoading(true);
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
    try {
      console.log("contentType .....",item?.profile,contentType,id);
      
      let like = await axios.post('https://pashuahar.com/like-toggle/', {
        content_type: contentType == "reel" ? "reel" : "post",
        object_id:  id,
      },{headers});
      console.log("like .....",like);
      
    } catch (err) {
      console.log("error .....",err);
      
      // Revert UI if failed
      setIsLiked(isLiked);
      setLikesCount(likesCount);
      Alert.alert('Error', 'Failed to update like.');
    } finally {
      setLikeLoading(false);
    }
  };

  const handleComment = () => {
    console.log("items ......",item , contentType);
    // return
    // Navigate to CommentScreen with correct params
    navigations.navigate('CommentScreen', {
      content_type: contentType === 'reel' ? 'reel' : 'post',
      object_id:  id,
    });
  };

  const handleSave = async () => {
    setSaveModalVisible(true);
    await fetchCollections();
  };

  const fetchCollections = async () => {
    setCollectionsLoading(true);
    try {
      const authToken = await AsyncStorage.getItem('accessToken');
      console.log('Auth token:', authToken ? 'Present' : 'Missing');
      
      const headers = {
        'Accept': 'application/json',
        'Authorization': `Bearer ${authToken}`
      };
      
      console.log('Fetching collections from: https://pashuahar.com/collections/');
      const response = await axios.get('https://pashuahar.com/collections/', { headers });
      console.log('Collections API response status:', response.status);
      console.log('Collections API response data:', JSON.stringify(response.data, null, 2));
      
      if (response.data?.data?.results) {
        console.log('Found collections:', response.data.data.results.length);
        setCollections(response.data.data.results);
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        console.log('Found collections (data array):', response.data.data.length);
        setCollections(response.data.data);
      } else if (response.data?.results) {
        console.log('Found collections (direct results):', response.data.results.length);
        setCollections(response.data.results);
      } else if (Array.isArray(response.data)) {
        console.log('Found collections (array):', response.data.length);
        setCollections(response.data);
      } else {
        console.log('No collections found in response');
        setCollections([]);
      }
    } catch (error: any) {
      console.error('Error fetching collections:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      setCollections([]);
    } finally {
      setCollectionsLoading(false);
    }
  };

  const handleCollectionPress = async (collection: Collection) => {
    setSavingToCollectionId(collection.id);
    setSaveLoading(true);
    try {
      const authToken = await AsyncStorage.getItem('accessToken');
      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      };
      console.log("here comes .....", item.profile.id, id,item);
      // return
      const payload = {
        collection: collection.id,
        content_type: contentType === 'reel' ? 'reel' : 'post',
        object_id:  id,
      };
      
      console.log('Saving post to collection. Payload:', payload);
      const response = await axios.post(
        'https://pashuahar.com/collections/items/',
        payload,
        { headers }
      );
      console.log('API response from collections/items:', response && typeof response === 'object' ? JSON.stringify(response, null, 2) : response);
      
      Alert.alert('Success', 'Post saved to collection!');
      setSaveModalVisible(false);
    } catch (error: any) {
      console.error('Error saving post to collection:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save post';
      Alert.alert('Error', errorMessage);
    } finally {
      setSaveLoading(false);
      setSavingToCollectionId(null);
    }
  };

  const handleCreateCollection = () => {
    setSaveModalVisible(false);
    navigations.navigate('CreateCollectionScreen');
  };

  const sections = [
    {
      title: 'Media',
      data: media, // array of images/videos
    },
  ];
  const handleShare = () => {
    // You can implement your share logic here (e.g., Share API)
    Alert.alert('Share', 'Share functionality coming soon!');
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      // Example: https://pashuahar.com/collections/1/post/1/
      // You may need to adjust collection/post IDs as per your data
      const authToken = await AsyncStorage.getItem('accessToken');
      const headers = {
        'Accept': 'application/json',
        'Authorization': `Bearer ${authToken}`
      };
      // Assuming collectionId is available in item or profile
      const collectionId = item?.collection_id || profile?.collection_id || 1;
      const postId = id;
      await axios.delete(`https://pashuahar.com/collections/${collectionId}/post/${postId}/`, { headers });
      if (onDelete) onDelete(id);
      // await fetchCollections();

      Alert.alert('Deleted', 'Post deleted successfully.');
    } catch (err) {
      Alert.alert('Error', 'Failed to delete post.');
      // await fetchCollections();

    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEdit = async () => {
    Alert.alert('Edit', 'Edit functionality coming soon!');
  };

  const handleRemoveFromCollection = async () => {
    const collectionId = typeof props.collection_id !== 'undefined' ? props.collection_id : item?.collection_id;
    const contentTypeForApi = props.type || item?.type;
    const objectId = id;
    if (!item?.is_collection || !collectionId || !objectId) return;
    setSaveCollectionLoading(true);
    try {
      const authToken = await AsyncStorage.getItem('accessToken');
      const headers = {
        'Accept': 'application/json',
        'Authorization': `Bearer ${authToken}`
      };
      const apiContentType = contentTypeForApi === 'reel' ? 'reel' : 'post';
      const url = `https://pashuahar.com/collections/${collectionId}/${apiContentType}/${objectId}/`;
      console.log('Removing from collection:', { url, collectionId, apiContentType, objectId });
      await axios.delete(url, { headers });
      if (props.onRemovedFromCollection) {
        props.onRemovedFromCollection();
      }
      // Update local state to reflect removal
      if (item) item.is_collection = false;
      Alert.alert('Removed', 'Removed from collection');
    } catch (err) {
      Alert.alert('Error', 'Failed to remove from collection');
    } finally {
      setSaveCollectionLoading(false);
    }
  };

  const renderCollectionItem = ({ item }: { item: Collection }) => (
    <TouchableOpacity 
      style={styles.collectionItem} 
      onPress={() => handleCollectionPress(item)}
      disabled={saveLoading}
    >
      <View style={styles.collectionImageContainer}>
        {item.cover_image ? (
          <Image 
            source={{ uri: item.cover_image }} 
            style={styles.collectionImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            {React.createElement(Ionicons, { name: "bookmark-outline", size: 20, color: "#999" })}
          </View>
        )}
      </View>
      <View style={styles.collectionInfo}>
        <Text style={styles.collectionName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.collectionCount}>
          {item.post_count || 0} {(item.post_count || 0) === 1 ? 'post' : 'posts'}
        </Text>
      </View>
      {saveLoading && savingToCollectionId === item.id && (
        <View style={styles.saveLoadingOverlay}>
          <ActivityIndicator size={16} color="#bea063" />
        </View>
      )}
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section }: { section: SectionData }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
    </View>
  );

  const getSectionData = (): SectionData[] => {
    if (collections.length === 0) return [];
    
    return [{
      title: 'Choose Collection',
      data: collections
    }];
  };

  const renderMedia = () => (
    <SectionList
      horizontal
      pagingEnabled
      sections={sections}
      showsHorizontalScrollIndicator={false}
      keyExtractor={(_, idx) => idx.toString()}
      contentContainerStyle={{ flexDirection: 'row' }}
      onMomentumScrollEnd={e => {
        const index = Math.round(
          e.nativeEvent.contentOffset.x / e.nativeEvent.layoutMeasurement.width
        );
        setActiveIndex(index);
        // Auto play the new active video, pause others
        setVideoStates(prev => {
          const newStates: { [index: number]: { paused: boolean; muted: boolean } } = {};
          media.forEach((_, idx) => {
            newStates[idx] = { paused: idx !== index, muted: prev[idx]?.muted ?? true };
          });
          return newStates;
        });
      }}
      renderItem={({ item, index }) => {
        const uri = getMediaUri(item);
        const isActive = index === activeIndex;
        const videoState = videoStates[index] || { paused: !isActive, muted: true };

        if (item.is_video && uri) {
          return (
            <View style={styles.postImage}>
              <Video
                source={{ uri }}
                style={styles.postImage}
                resizeMode="cover"
                paused={showVideoControlsInActionsRow ? !isPlaying : videoState.paused}
                muted={showVideoControlsInActionsRow ? isMuted : videoState.muted}
                repeat
              />
              {/* Play/Pause and Mute/Unmute Controls */}
              {!hideHeaderAndControls && !showVideoControlsInActionsRow && (
                <View style={{ position: 'absolute', bottom: 16, right: 16, flexDirection: 'row-reverse', gap: 16 }}>
                  <TouchableOpacity
                    onPress={() => setVideoStates(prev => ({
                      ...prev,
                      [index]: { ...videoState, paused: !videoState.paused }
                    }))}
                    style={{ marginLeft: 16, backgroundColor: '#fff', borderRadius: 20, padding: 8 }}
                  >
                    <Ionicons name={videoState.paused ? 'play' : 'pause'} size={20} color="#bea063" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setVideoStates(prev => ({
                      ...prev,
                      [index]: { ...videoState, muted: !videoState.muted }
                    }))}
                    style={{ backgroundColor: '#fff', borderRadius: 20, padding: 8 }}
                  >
                    <Ionicons name={videoState.muted ? 'volume-mute' : 'volume-high'} size={20} color="#bea063" />
                  </TouchableOpacity>
                </View>
              )}
              {!isActive && (
                <View style={{ position: 'absolute', top: '45%', left: '45%' }}>
                  {React.createElement(Ionicons, { name: "play-circle", size: 48, color: "#bea063" })}
                </View>
              )}
            </View>
          );
        }
    
        return (
          <Image
            source={uri ? { uri } : fallbackPostImage}
            style={styles.postImage}
            onError={() => setShowFallbackPostImage(true)}
          />
        );
      }}
      renderSectionHeader={() => null}
    />
  );

  // If hideAllDetails is true, only render the media
  if (hideAllDetails) {
    return (
      <View style={styles.container}>
        {/* Only render media */}
        {renderMedia()}
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {!hideHeaderAndControls && (
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.userInfo}
            onPress={() => {
              const userId = profile.user || profile?.id || item?.profile?.id;
              if (userId) {
                navigation.navigate('UserProfile', { userId: userId.toString(), isFromSearch: true,isFromHome:true });
              }
            }}
            activeOpacity={0.7}
          >
            {(!userAvatar || userAvatar === 'null' || userAvatar === '' || userAvatar.includes('placeholder.com')) ? (
              <View style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: '#f5f5f5',
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 1.5,
                borderColor: '#bea063',
                overflow: 'hidden',
                marginRight: 10,
              }}>
                <Ionicons name="person-circle" size={28} color="#bea063" />
              </View>
            ) : (
              <Image
                source={showFallbackAvatar ? fallbackAvatar : { uri: userAvatar }}
                style={styles.avatar}
                onError={() => setShowFallbackAvatar(true)}
              />
            )}
            <View>
              <Text style={styles.username}>{username}</Text>
              {!!location && <Text style={styles.location}>{location}</Text>}
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={onOptions}>
            {React.createElement(Ionicons, { name: "ellipsis-vertical", size: 20, color: "#bea063" })}
          </TouchableOpacity>
        </View>
      )}

      {media.length > 0 ? (
        renderMedia()
      ) : null}
      {/* Pagination dots */}
      {media.length > 1 && (
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 4 }}>
          {media.map((_, idx) => (
            <View
              key={idx}
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: idx === activeIndex ? '#333' : '#ccc',
                marginHorizontal: 2,
              }}
            />
          ))}
        </View>
      )}

      {/* Only show actions if hideActions is false */}
      {!hideActions && (
        <View style={styles.actions}>
          {/* Like button and count */}
          {!hideLikeCount && (
            <>
              <TouchableOpacity onPress={handleLike} disabled={likeLoading}>
                {likeLoading ? (
                  <ActivityIndicator size={20} color="#bea063" />
                ) : (
                  React.createElement(Ionicons, { name: isLiked ? 'heart' : 'heart-outline', size: 26, color: isLiked ? '#bea063' : '#bea063' })
                )}
              </TouchableOpacity>
              <Text style={{ color: '#bea063', fontWeight: '600', marginLeft: 4, marginRight: 12 }}>{likesCount}</Text>
            </>
          )}

          {/* Comment button and count */}
          {!allowComments && (
            <>
              <TouchableOpacity style={styles.actionButton} onPress={handleComment}>
                {React.createElement(Ionicons, { name: "chatbubble-outline", size: 24, color: "#bea063" })}
              </TouchableOpacity>
              <Text style={{ color: '#bea063', fontWeight: '600', marginLeft: 4 }}>{commentCount}</Text>
            </>
          )}

          {/* Share button */}
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            {React.createElement(Ionicons, { name: "share-social-outline", size: 24, color: "#bea063" })}
          </TouchableOpacity>

          {/* Save icon on the right */}
          {!isdrmoDetails ? (
            item?.is_collection ? (
              <TouchableOpacity style={{position:'absolute',right:10}} onPress={handleRemoveFromCollection} disabled={saveCollectionLoading}>
                {saveCollectionLoading ? (
                  <ActivityIndicator size={20} color="#bea063" />
                ) : (
                  React.createElement(Ionicons, { name: "bookmark", size: 24, color: "#bea063" })
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={{position:'absolute',right:10}} onPress={handleSave}>
                {React.createElement(Ionicons, { name: "bookmark-outline", size: 24, color: "#bea063" })}
              </TouchableOpacity>
            )
          ) : null}
          {/* Video controls in actions row if enabled */}
          {showVideoControlsInActionsRow && (
            <>
              <TouchableOpacity style={styles.actionButton} onPress={onPlayPausePress}>
                <Ionicons name={isPlaying ? 'pause' : 'play'} size={24} color="#bea063" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={onMuteUnmutePress}>
                <Ionicons name={isMuted ? 'volume-mute' : 'volume-high'} size={24} color="#bea063" />
              </TouchableOpacity>
            </>
          )}
        </View>
      )}

      {/* Save to Collection Modal */}
      <Modal
        visible={saveModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSaveModalVisible(false)}
      >
        <View style={styles.saveModalOverlay}>
          <View style={styles.instagramSaveModalContent}>
            {/* Drag handle */}
            <View style={{ alignItems: 'center', marginTop: 8, marginBottom: 12 }}>
              <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#eee' }} />
            </View>
            {/* Saved Section */}
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 18 }}>
              <Image
                source={media[0]?.media_file ? { uri: media[0].media_file } : fallbackPostImage}
                style={{ width: 54, height: 54, borderRadius: 12, marginRight: 14, backgroundColor: '#f5f5f5' }}
                resizeMode="cover"
              />
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 17, color: '#bea063' }}>Saved</Text>
                <Text style={{ color: '#bea063', fontSize: 13, marginTop: 2 }}>Private</Text>
              </View>
              {React.createElement(Ionicons, { name: 'bookmark', size: 28, color: '#bea063' })}
            </View>
            {/* Divider */}
            <View style={{ height: 1, backgroundColor: '#eee', marginHorizontal: 20, marginBottom: 8 }} />
            {/* Collections Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 8 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#bea063' }}>Collections</Text>
              <TouchableOpacity onPress={handleCreateCollection}>
                <Text style={{ color: '#bea063', fontWeight: 'bold', fontSize: 15 }}>New collection</Text>
              </TouchableOpacity>
            </View>
            {/* Collections List */}
            {collectionsLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#bea063" />
              </View>
            ) : collections.length === 0 ? (
              <View style={styles.emptyCollectionsContainer}>
                {React.createElement(Ionicons, { name: "bookmark-outline", size: 60, color: "#ccc" })}
                <Text style={[styles.emptyCollectionsTitle, { color: '#bea063' }]}>No Collections Yet</Text>
                <Text style={[styles.emptyCollectionsSubtitle, { color: '#bea063' }]}>Create a collection to save your favorite posts</Text>
                <TouchableOpacity 
                  style={styles.createCollectionButton} 
                  onPress={handleCreateCollection}
                >
                  <Text style={styles.createCollectionButtonText}>Create Collection</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={collections}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                  <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' }}>
                    {item.cover_image ? (
                      <Image
                        source={{ uri: item.cover_image }}
                        style={{ width: 48, height: 48, borderRadius: 12, marginRight: 14, backgroundColor: '#f5f5f5' }}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={{
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        marginRight: 14,
                        backgroundColor: '#fff',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: 1,
                        borderColor: '#bea063',
                      }}>
                        {React.createElement(Ionicons, { name: 'person', size: 28, color: '#bea063' })}
                      </View>
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: 'bold', fontSize: 15, color: '#bea063' }}>{item.name}</Text>
                      <Text style={{ color: '#bea063', fontSize: 13, marginTop: 2 }}>Private</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleCollectionPress(item)} disabled={saveLoading}>
                      {saveLoading && savingToCollectionId === item.id ? (
                        <ActivityIndicator size={18} color="#bea063" />
                      ) : (
                        React.createElement(Ionicons, { name: 'add-circle-outline', size: 26, color: '#bea063' })
                      )}
                    </TouchableOpacity>
                  </View>
                )}
                style={{ maxHeight: 320 }}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Options Modal */}
      <OptionsBottomSheet
        visible={false} // This modal is now controlled by the parent
        onClose={() => {}}
        navigation={navigation}
        onReport={() => {
          navigation.navigate('ContactUs');
        }}
        onSave={() => {
          handleSave();
        }}
        onRemix={() => {
          Alert.alert('Remix', 'Remix functionality coming soon!');
        }}
        onCutout={() => {
          Alert.alert('Cutout', 'Cutout sticker functionality coming soon!');
        }}
        onFavourite={() => {
          Alert.alert('Favourites', 'Add to Favourites coming soon!');
        }}
        onUnfollow={() => {
          Alert.alert('Unfollow', 'Unfollow functionality coming soon!');
        }}
        onAbout={() => {
          Alert.alert('About', 'About this account coming soon!');
        }}
        onQRCode={() => {
          Alert.alert('QR Code', 'QR code functionality coming soon!');
        }}
        onWhy={() => {
          Alert.alert('Why', 'Why you\'re seeing this post coming soon!');
        }}
        onHide={() => {
          Alert.alert('Hide', 'Hide functionality coming soon!');
        }}
      />
     {caption &&  <View style={styles.captionContainer}>
        {/* <Text style={styles.captionUsername}>{username}</Text> */}
        <Text
          style={styles.caption}
          numberOfLines={showFullCaption ? undefined : 2}
        >
          {caption}
        </Text>
        {caption && caption.length > 80 && !showFullCaption && (
          <TouchableOpacity onPress={() => setShowFullCaption(true)}>
            <Text style={{ color: '#bea063', fontWeight: '600', marginTop: 2 }}>Read more</Text>
          </TouchableOpacity>
        )}
        {caption && caption.length > 80 && showFullCaption && (
          <TouchableOpacity onPress={() => setShowFullCaption(false)}>
            <Text style={{ color: '#bea063', fontWeight: '600', marginTop: 2 }}>Show less</Text>
          </TouchableOpacity>
        )}
      </View>}
      {allowComments && (
        <TouchableOpacity onPress={handleComment} style={{paddingHorizontal: 10, marginBottom: 5}}>
          <Text style={{color: '#bea063'}}>
            {commentCount > 0 ? `View all ${commentCount} comments` : 'Add a comment'}
          </Text>
        </TouchableOpacity>
      )}
      {!!createdAt && (
        <Text style={{
          paddingHorizontal: 16,
          color: '#bea063',
          fontSize: 15,
          marginTop: !caption ? 4 : 0,
          marginBottom: 0,
          lineHeight: 16,
        }}>
          {formatTimeAgo(createdAt)}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  username: {
    fontWeight: '600',
    fontSize: 14,
    color: '#bea063',
  },
  location: {
    fontSize: 12,
    color: '#bea063',
  },
  postImage: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').width + 120,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 2, // reduce bottom padding
    // alignSelf:'center'
  },
  actionButton: {
    marginLeft: 16,
  },
  likesContainer: {
    paddingHorizontal: 10,
    marginBottom: 5,
  },
  likes: {
    fontWeight: '600',
  },
  captionContainer: {
    paddingHorizontal: 10,
    paddingBottom: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  captionUsername: {
    fontWeight: '600',
    marginRight: 5,
    color: '#bea063',
  },
  caption: {
    flex: 1,
    color: '#bea063',
  },
  // Save Modal Styles
  saveModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  saveModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  saveModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  saveModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyCollectionsContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyCollectionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyCollectionsSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  createCollectionButton: {
    backgroundColor: '#bea063',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createCollectionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  collectionsList: {
    padding: 20,
  },
  collectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  collectionImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 15,
  },
  collectionImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  collectionInfo: {
    flex: 1,
  },
  collectionName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
  },
  collectionCount: {
    fontSize: 14,
    color: '#666',
  },
  saveLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    backgroundColor: '#f0f0f0',
    padding: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: '#fff',
  },
  optionText: {
    fontSize: 16,
    color: '#222',
    fontWeight: '400',
  },
  instagramSaveModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 0,
    paddingBottom: 0,
    maxHeight: '90%',
    width: '100%',
    alignSelf: 'flex-end',
    overflow: 'hidden',
  },
});

export default Post; 