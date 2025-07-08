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
import Icon from 'react-native-vector-icons/Ionicons';
import Video from 'react-native-video';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../Navigation/types';

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
}

const fallbackAvatar = require('../Assets/yoga.jpg');
const fallbackPostImage = require('../Assets/yoga.jpg');

const Post: React.FC<PostProps> = ({
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
}) => {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likesCount, setLikesCount] = useState(likes);
  const [likeLoading, setLikeLoading] = useState(false);
  const [showFallbackAvatar, setShowFallbackAvatar] = useState(false);
  const [showFallbackPostImage, setShowFallbackPostImage] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [saveLoading, setSaveLoading] = useState(false);
  const [collectionsLoading, setCollectionsLoading] = useState(false);
  const [savingToCollectionId, setSavingToCollectionId] = useState<number | null>(null);
  const navigations = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const getMediaUri = (item: any) => {
    if (item.media_file) return item.media_file.startsWith('http') ? item.media_file : `http://192.168.1.160:9001${item.media_file}`;
    if (item.file) return item.file.startsWith('http') ? item.file : `http://192.168.1.160:9001${item.file}`;
    return null;
  };
console.log("id.....", item?.profile?.id , id);

  const handleLike = async () => {
    const authToken = await AsyncStorage.getItem('accessToken');
    console.log("isdrmoDetails",isdrmoDetails);
    
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
        object_id: item?.profile?.id && !isdrmoDetails ? item?.profile?.id : id,
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
    return
    // Navigate to CommentScreen with correct params
    navigations.navigate('CommentScreen', {
      content_type: contentType === 'reel' ? 'reel' : 'post',
      object_id: item?.profile?.id ? item?.profile?.id : id,
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
      
      const payload = {
        collection: collection.id,
        content_type: contentType === 'reel' ? 'reel' : 'post',
        object_id: item?.profile?.id ? item?.profile?.id : id,
      };
      
      console.log('Saving post to collection:', payload);
      
      await axios.post(
        'https://pashuahar.com/collections/items/',
        payload,
        { headers }
      );
      
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

  const handleOptions = () => {
    setOptionsVisible(true);
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
      setOptionsVisible(false);
      if (onDelete) onDelete(id);
      Alert.alert('Deleted', 'Post deleted successfully.');
    } catch (err) {
      Alert.alert('Error', 'Failed to delete post.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEdit = async () => {
    setOptionsVisible(false);
    // You can navigate to an edit screen or call the edit API here
    Alert.alert('Edit', 'Edit functionality coming soon!');
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
            {React.createElement(Icon as any, { name: "bookmark-outline", size: 20, color: "#999" })}
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image
            source={showFallbackAvatar ? fallbackAvatar : { uri: userAvatar }}
            style={styles.avatar}
            onError={() => setShowFallbackAvatar(true)}
          />
          <View>
            <Text style={styles.username}>{username}</Text>
            {!!location && <Text style={styles.location}>{location}</Text>}
          </View>
        </View>
        <TouchableOpacity onPress={handleOptions}>
          {React.createElement(Icon as any, { name: "ellipsis-vertical", size: 20, color: "#000" })}
        </TouchableOpacity>
      </View>

      {media.length > 0 ? (
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
        }}
        renderItem={({ item, index }) => {
          const uri = getMediaUri(item);
          const isActive = index === activeIndex;
      
          if (item.is_video && uri) {
            return (
              <View style={styles.postImage}>
                <Video
                  source={{ uri }}
                  style={styles.postImage}
                  resizeMode="cover"
                  paused={!isActive}
                  repeat
                />
                {!isActive && (
                  <View style={{ position: 'absolute', top: '45%', left: '45%' }}>
                    {React.createElement(Icon as any, { name: "play-circle", size: 48, color: "#fff" })}
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
        // <FlatList
        //   data={media}
        //   horizontal
        //   pagingEnabled
        //   showsHorizontalScrollIndicator={false}
        //   keyExtractor={(_, idx) => idx.toString()}
        //   onMomentumScrollEnd={e => {
        //     const index = Math.round(e.nativeEvent.contentOffset.x / e.nativeEvent.layoutMeasurement.width);
        //     setActiveIndex(index);
        //   }}
        //   renderItem={({ item, index }) => {
        //     const uri = getMediaUri(item);
        //     if (item.is_video && uri) {
        //       const isActive = index === activeIndex;
        //       return (
        //         <View style={styles.postImage}>
        //           <Video
        //             source={{ uri }}
        //             style={styles.postImage}
        //             resizeMode="cover"
        //             paused={!isActive}
        //             repeat
        //           />
        //           {!isActive && (
        //             <View style={{ position: 'absolute', top: '45%', left: '45%' }}>
        //               <>
        //                 {/* @ts-ignore */}
        //                 <Icon name="play-circle" size={48} color="#fff" />
        //               </>
        //             </View>
        //           )}
        //         </View>
        //       );
        //     }
        //     return (
        //       <Image
        //         source={uri ? { uri } : fallbackPostImage}
        //         style={styles.postImage}
        //         onError={() => setShowFallbackPostImage(true)}
        //       />
        //     );
        //   }}
        // />
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

      <View style={styles.actions}>
        <TouchableOpacity onPress={handleLike} disabled={likeLoading}>
          {likeLoading ? (
            <ActivityIndicator size={20} color="#bea063" />
          ) : (
            <>
              {React.createElement(Icon as any, { name: isLiked ? 'heart' : 'heart-outline', size: 28, color: isLiked ? '#bea063' : '#bea063' })}
            </>
          )}
        </TouchableOpacity>
        {allowComments && (
          <TouchableOpacity style={styles.actionButton} onPress={handleComment}>
            {React.createElement(Icon as any, { name: "chatbubble-outline", size: 24, color: "#bea063" })}
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          {React.createElement(Icon as any, { name: "paper-plane-outline", size: 24, color: "#bea063" })}
        </TouchableOpacity>
        {/* Save icon on the right */}
        {!isdrmoDetails ? (
          <TouchableOpacity style={{position:'absolute',right:10}} onPress={handleSave}>
            {React.createElement(Icon as any, { name: "bookmark-outline", size: 24, color: "#bea063" })}
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Save to Collection Modal */}
      <Modal
        visible={saveModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSaveModalVisible(false)}
      >
        <View style={styles.saveModalOverlay}>
          <View style={styles.saveModalContent}>
            <View style={styles.saveModalHeader}>
              <Text style={styles.saveModalTitle}>Save to Collection</Text>
              <TouchableOpacity
                onPress={handleCreateCollection}
                style={{
                  position: 'absolute',
                  right: 48,
                  top: 16,
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: '#bea063',
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 2,
                  elevation: 3,
                }}
              >
                {React.createElement(Icon as any, { name: "add", size: 22, color: "#fff" })}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setSaveModalVisible(false)}>
                {React.createElement(Icon as any, { name: "close", size: 24, color: "#000" })}
              </TouchableOpacity>
            </View>
            
            {collectionsLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#bea063" />
              </View>
            ) : collections.length === 0 ? (
              <View style={styles.emptyCollectionsContainer}>
                {React.createElement(Icon as any, { name: "bookmark-outline", size: 60, color: "#ccc" })}
                <Text style={styles.emptyCollectionsTitle}>No Collections Yet</Text>
                <Text style={styles.emptyCollectionsSubtitle}>
                  Create a collection to save your favorite posts
                </Text>
                <TouchableOpacity 
                  style={styles.createCollectionButton} 
                  onPress={handleCreateCollection}
                >
                  <Text style={styles.createCollectionButtonText}>Create Collection</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <SectionList
                sections={getSectionData()}
                renderItem={renderCollectionItem}
                renderSectionHeader={renderSectionHeader}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.collectionsList}
                stickySectionHeadersEnabled={false}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Options Modal */}
      {/* <Modal
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
      </Modal> */}

      <View style={styles.likesContainer}>
        {!hideLikeCount && <Text style={styles.likes}>{likesCount} likes</Text>}
      </View>

      <View style={styles.captionContainer}>
        <Text style={styles.captionUsername}>{username}</Text>
        <Text style={styles.caption}>{caption}</Text>
      </View>
      {allowComments && (
        <TouchableOpacity onPress={handleComment} style={{paddingHorizontal: 10, marginBottom: 5}}>
          <Text style={{color: '#888'}}>
            {commentCount > 0 ? `View all ${commentCount} comments` : 'Add a comment'}
          </Text>
        </TouchableOpacity>
      )}
      {!!createdAt && (
        <Text style={{paddingHorizontal: 10, color: '#aaa', fontSize: 12}}>
          {new Date(createdAt).toLocaleString()}
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
  },
  location: {
    fontSize: 12,
    color: '#888',
  },
  postImage: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').width,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
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
  },
  caption: {
    flex: 1,
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
});

export default Post; 