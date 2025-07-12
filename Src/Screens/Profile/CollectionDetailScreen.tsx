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
} from 'react-native';
import { useNavigation, useRoute, RouteProp, useFocusEffect, CommonActions } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
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

export default function CollectionDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<{ params: CollectionDetailScreenRouteProp['params'] }>>();
  const { collectionId, collectionName, postToSave } = route.params;

  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savingPost, setSavingPost] = useState(false);
  const [deletingCollection, setDeletingCollection] = useState(false);

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

      // Flexible data handling
      if (response.data?.data?.results) {
        setPosts(response.data.data.results);
      } else if (response.data?.results) {
        setPosts(response.data.results);
      } else if (Array.isArray(response.data)) {
        setPosts(response.data);
      } else {
        setPosts([]);
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

  // Filter valid posts for FlatList to avoid index errors
  const validPosts = posts.filter(item => item && item.item_data && item.item_data.id);

  const renderGridItem = ({ item }: { item: any }) => {
    if (!item?.item_data) return null;
    const post = item.item_data;
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
          {validPosts.length} {validPosts.length === 1 ? 'post' : 'posts'}
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
              <Text style={{fontSize: 24, color: '#FF3B30'}}>{'🗑️'}</Text>
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
            <Text style={{fontSize: 24, color: '#FF3B30'}}>{'🗑️'}</Text>
          )}
        </TouchableOpacity>
      </View>
      {renderHeader()}
      {validPosts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={{fontSize: 80, color: '#ccc'}}>{'🔖'}</Text>
          <Text style={styles.emptyTitle}>No Posts Yet</Text>
          <Text style={styles.emptySubtitle}>
            Posts you save to this collection will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={validPosts}
          numColumns={3}
          keyExtractor={item => item.item_data.id.toString()}
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
