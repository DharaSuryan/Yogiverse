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
}) => {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likesCount, setLikesCount] = useState(likes);
  const [likeLoading, setLikeLoading] = useState(false);
  const [showFallbackAvatar, setShowFallbackAvatar] = useState(false);
  const [showFallbackPostImage, setShowFallbackPostImage] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const navigations = useNavigation<NativeStackNavigationProp<RootStackParamList>>();


  const getMediaUri = (item: any) => {
    if (item.media_file) return item.media_file.startsWith('http') ? item.media_file : `http://192.168.1.160:9001${item.media_file}`;
    if (item.file) return item.file.startsWith('http') ? item.file : `http://192.168.1.160:9001${item.file}`;
    return null;
  };
console.log("id.....", item?.profile?.id , id);

  const handleLike = async () => {
    const authToken = await AsyncStorage.getItem('accessToken');
      const headers = {
        'Accept': 'application/json',
        'Authorization': `Bearer ${authToken}`
      };
    if (likeLoading) return;
    setLikeLoading(true);
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
    try {
      console.log("contentType .....",contentType,id);
      
      let like = await axios.post('https://pashuahar.com/like-toggle/', {
        content_type: contentType == "reel" ? "reel" : "post",
        object_id: item?.profile?.id ? item?.profile?.id : id,
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
    // Navigate to CommentScreen with correct params
    navigations.navigate('CommentScreen', {
      content_type: contentType === 'reel' ? 'reel' : 'post',
      object_id: item?.profile?.id ? item?.profile?.id : id,
    });
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
          <>
            {/* @ts-ignore */}
            <Icon name="ellipsis-vertical" size={20} color="#000" />
          </>
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
                    <Icon name="play-circle" size={48} color="#fff" />
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
            <ActivityIndicator size={20} color="#FF3B30" />
          ) : (
            <>
              {/* @ts-ignore */}
              <Icon
                name={isLiked ? 'heart' : 'heart-outline'}
                size={28}
                color={isLiked ? '#FF3B30' : '#000'}
              />
            </>
          )}
        </TouchableOpacity>
        {allowComments && (
          <TouchableOpacity style={styles.actionButton} onPress={handleComment}>
            <>
              {/* @ts-ignore */}
              <Icon name="chatbubble-outline" size={24} color="#000" />
            </>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          <>
            {/* @ts-ignore */}
            <Icon name="paper-plane-outline" size={24} color="#000" />
          </>
        </TouchableOpacity>
      </View>

      {/* Options Modal */}
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
});

export default Post; 