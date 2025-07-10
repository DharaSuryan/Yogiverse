import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Dimensions,
  FlatList,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const { width } = Dimensions.get('window');
const POST_SIZE = width / 3 - 2;

export default function CollectionDetailScreen({navigation}:any) {
  // const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<{ params: CollectionDetailScreenRouteProp['params'] }>>();
  const { collectionId, collectionName, postToSave } = route.params;
  
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savingPost, setSavingPost] = useState(false);
  const [deletingCollection, setDeletingCollection] = useState(false);
  const [activeCaption, setActiveCaption] = useState<string | null>(null);

  const fetchCollectionPosts = async () => {
    setLoading(true);
    try {
      const authToken = await AsyncStorage.getItem('accessToken');
      console.log('CollectionDetailScreen - Auth token:', authToken ? 'Present' : 'Missing');
      
      const headers = {
        'Accept': 'application/json',
        'Authorization': `Bearer ${authToken}`
      };
      
      const apiUrl = `https://pashuahar.com/collections/${collectionId}/`;
      console.log('CollectionDetailScreen - Fetching posts from:', apiUrl);
      
      const response = await axios.get(apiUrl, { headers });
      console.log('CollectionDetailScreen - API response status:', response.status);
      console.log('CollectionDetailScreen - API response data:', JSON.stringify(response.data, null, 2));
      
      if (response.data?.data?.results) {
        console.log('CollectionDetailScreen - Found posts:', response.data.data.results.length);
        setPosts(response.data.data.results);
      } else if (response.data?.results) {
        console.log('CollectionDetailScreen - Found posts (direct results):', response.data.results.length);
        setPosts(response.data.results);
      } else if (Array.isArray(response.data)) {
        console.log('CollectionDetailScreen - Found posts (array):', response.data.length);
        setPosts(response.data);
      } else {
        console.log('CollectionDetailScreen - No posts found in response');
        setPosts([]);
      }
    } catch (error: any) {
      console.error('CollectionDetailScreen - Error fetching collection posts:', error);
      console.error('CollectionDetailScreen - Error response:', error.response?.data);
      console.error('CollectionDetailScreen - Error status:', error.response?.status);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("collectionId",collectionId);
    
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
      
      console.log('Saving post to collection from detail screen:', payload);
      
      await axios.post(
        'https://pashuahar.com/collections/items/',
        payload,
        { headers }
      );
      
      Alert.alert('Success', 'Post saved to collection!');
      // Refresh the posts list
      fetchCollectionPosts();
    } catch (error: any) {
      console.error('Error saving post to collection:', error);
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
        {
          text: 'Cancel',
          style: 'cancel',
        },
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
              console.log('Deleting collection:', deleteUrl);
              
              await axios.delete(deleteUrl, { headers });
              
              Alert.alert('Success', 'Collection deleted successfully!');
              // Navigate back to the previous screen
              navigation.goBack();
            } catch (error: any) {
              console.error('Error deleting collection:', error);
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

  // Create grid data structure for SectionList
  const createGridData = () => {
    return [{
      title: 'Posts',
      data: posts
    }];
  };

  const renderSectionHeader = () => null;

  const renderGridItem = ({ item }: { item: any }) => {
    const post = item.item_data;
    if (!post) return <View style={styles.gridItem} />;
    const firstMedia = post.media?.[0];
    const mediaUri = firstMedia?.media_file;
    return (
      <TouchableOpacity
        style={styles.gridItem}
        onPress={() => navigation.navigate('CollectionPostDetail', { post })}
      >
        <Image
          source={mediaUri ? { uri: mediaUri } : require('../../Assets/yoga.jpg')}
          style={styles.gridImage}
          resizeMode="cover"
        />
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerInfo}>
        <Text style={styles.collectionName}>{collectionName}</Text>
        <Text style={styles.postCount}>
          {posts.length} {posts.length === 1 ? 'post' : 'posts'}
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.navHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#000" />
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
              <Icon name="trash-outline" size={24} color="#FF3B30" />
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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#000" />
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
            <Icon name="trash-outline" size={24} color="#FF3B30" />
          )}
        </TouchableOpacity>
      </View>

      {renderHeader()}

      {posts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="bookmark-outline" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>No Posts Yet</Text>
          <Text style={styles.emptySubtitle}>
            Posts you save to this collection will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          numColumns={3}
          keyExtractor={item => item?.item_data?.id?.toString() || Math.random().toString()}
          renderItem={renderGridItem}
          refreshing={refreshing}
          onRefresh={onRefresh}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.postsGrid}
        />
      )}
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
    color: '#000',
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
    padding: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    width: width / 3,
    aspectRatio: 1,
    margin: 0.5,
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  deleteButton: {
    padding: 5,
  },
}); 