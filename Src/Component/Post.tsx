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
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Video from 'react-native-video';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
}) => {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likesCount, setLikesCount] = useState(likes);
  const [likeLoading, setLikeLoading] = useState(false);
  const [showFallbackAvatar, setShowFallbackAvatar] = useState(false);
  const [showFallbackPostImage, setShowFallbackPostImage] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const getMediaUri = (item: any) => {
    if (item.media_file) return item.media_file.startsWith('http') ? item.media_file : `https://pashuahar.com/${item.media_file}`;
    if (item.file) return item.file.startsWith('http') ? item.file : `https://pashuahar.com/${item.file}`;
    return null;
  };
console.log("id.....",id,contentType);

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
      let like = await axios.post('https://pashuahar.com/like-toggle/', {
        content_type: contentType,
        object_id: id,
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
    navigation.navigate('CommentScreen', {
      content_type: contentType,
      object_id: id,
    });
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
        <TouchableOpacity>
          <Ionicons name="ellipsis-vertical" size={20} color="#bea063" />
        </TouchableOpacity>
      </View>

      {media.length > 0 ? (
        <FlatList
          data={media}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, idx) => idx.toString()}
          onMomentumScrollEnd={e => {
            const index = Math.round(e.nativeEvent.contentOffset.x / e.nativeEvent.layoutMeasurement.width);
            setActiveIndex(index);
          }}
          renderItem={({ item, index }) => {
            const uri = getMediaUri(item);
            if (item.is_video && uri) {
              const isActive = index === activeIndex;
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
                      <Ionicons name="play-circle" size={48} color="#bea063" />
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
        />
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
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={28}
              color={isLiked ? '#bea063' : '#bea063'}
            />
          )}
        </TouchableOpacity>
        {allowComments && (
          <TouchableOpacity style={styles.actionButton} onPress={handleComment}>
            <Ionicons name="chatbubble-outline" size={24} color="#bea063" />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="paper-plane-outline" size={24} color="#bea063" />
        </TouchableOpacity>
      </View>

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
    padding: 10,
    alignItems: 'center',
  },
  actionButton: {
    marginLeft: 15,
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