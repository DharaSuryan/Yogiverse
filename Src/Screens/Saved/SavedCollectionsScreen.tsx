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
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { navigate } from '../../Component/Route';

interface Collection {
  id: number;
  name: string;
  created_at: string;
  post_count?: number;
  cover_image?: string;
}

interface SavedPost {
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

interface SectionData {
  title: string;
  data: (Collection | SavedPost)[];
}

export default function SavedCollectionsScreen({navigation}:any) {
  // const navigation = useNavigation();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const authToken = await AsyncStorage.getItem('accessToken');
      console.log('SavedCollectionsScreen - Auth token:', authToken ? 'Present' : 'Missing');
      
      const headers = {
        'Accept': 'application/json',
        'Authorization': `Bearer ${authToken}`
      };
      
      console.log('SavedCollectionsScreen - Fetching collections from: https://pashuahar.com/collections/');
      const response = await axios.get('https://pashuahar.com/collections/', { headers });
      console.log('SavedCollectionsScreen - API response status:', response.status);
      console.log('SavedCollectionsScreen - API response data:', JSON.stringify(response.data, null, 2));
      
      if (response.data?.data?.results) {
        console.log('SavedCollectionsScreen - Found collections:', response.data.data.results.length);
        setCollections(response.data.data.results);
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        console.log('SavedCollectionsScreen - Found collections (data array):', response.data.data.length);
        setCollections(response.data.data);
      } else if (response.data?.results) {
        console.log('SavedCollectionsScreen - Found collections (direct results):', response.data.results.length);
        setCollections(response.data.results);
      } else if (Array.isArray(response.data)) {
        console.log('SavedCollectionsScreen - Found collections (array):', response.data.length);
        setCollections(response.data);
      } else {
        console.log('SavedCollectionsScreen - No collections found in response');
        setCollections([]);
      }
    } catch (error: any) {
      console.error('SavedCollectionsScreen - Error fetching collections:', error);
      console.error('SavedCollectionsScreen - Error response:', error.response?.data);
      console.error('SavedCollectionsScreen - Error status:', error.response?.status);
      setCollections([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedPosts = async (collectionId: number) => {
    setPostsLoading(true);
    try {
      const authToken = await AsyncStorage.getItem('accessToken');
      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      };
      
      const payload = {
        item: collectionId
      };
      
      console.log('Fetching saved posts for collection:', collectionId);
      console.log('Payload:', payload);
      
      const response = await axios.post('https://pashuahar.com/collections/', payload, { headers });
      console.log('Saved posts response:', response.data);
      
      if (response.data?.data?.results) {
        setSavedPosts(response.data.data.results);
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        setSavedPosts(response.data.data);
      } else if (response.data?.results) {
        setSavedPosts(response.data.results);
      } else if (Array.isArray(response.data)) {
        setSavedPosts(response.data);
      } else {
        setSavedPosts([]);
      }
    } catch (error: any) {
      console.error('Error fetching saved posts:', error);
      console.error('Error response:', error.response?.data);
      setSavedPosts([]);
    } finally {
      setPostsLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchCollections();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCollections();
    setRefreshing(false);
  };

  const handleCreateCollection = () => {
    navigate('CreateCollectionScreen');
  };

  const handleCollectionPress = async (collection: Collection) => {
    setSelectedCollection(collection);
    await fetchSavedPosts(collection.id);
  };

  const handleCollectionDetail = (collection: Collection) => {
    // Navigate to collection detail screen
    navigation.navigate('CollectionDetailScreen', { 
      collectionId: collection.id.toString(),
      collectionName: collection.name
    });
  };

  const renderCollectionItem = ({ item }: { item: Collection }) => (
    <TouchableOpacity 
      style={styles.collectionItem} 
      onPress={() => handleCollectionPress(item)}
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
            <Icon name="bookmark-outline" size={30} color="#999" />
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
      <TouchableOpacity 
        style={styles.detailButton}
        onPress={() => handleCollectionDetail(item)}
      >
        <Icon name="chevron-forward" size={20} color="#666" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderSavedPostItem = ({ item }: { item: SavedPost }) => (
    <TouchableOpacity 
      style={styles.savedPostItem}
      onPress={() => {
        // Navigate to post detail
        navigation.navigate('PostDetails', { postId: item.data.id });
      }}
    >
      <View style={styles.postInfo}>
        <Text style={styles.postUsername}>{item.profile.username}</Text>
        <Text style={styles.postCaption} numberOfLines={2}>
          {item.data.caption || 'No caption'}
        </Text>
        <Text style={styles.postDate}>
          {new Date(item.data.created_at).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.postImageContainer}>
        {item.data.media && item.data.media.length > 0 && (
          <Image 
            source={{ uri: item.data.media[0].media_file || item.data.media[0].file }} 
            style={styles.postImage}
            resizeMode="cover"
          />
        )}
      </View>
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section }: { section: SectionData }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="bookmark-outline" size={80} color="#ccc" />
      <Text style={styles.emptyTitle}>No Collections Yet</Text>
      <Text style={styles.emptySubtitle}>
        You don't have any collections yet. Please create one first.
      </Text>
      <TouchableOpacity 
        style={styles.createButton} 
        onPress={handleCreateCollection}
      >
        <Text style={styles.createButtonText}>Create Collection</Text>
      </TouchableOpacity>
    </View>
  );

  const getSectionData = (): SectionData[] => {
    const sections: SectionData[] = [];
    
    // Collections section
    if (collections.length > 0) {
      sections.push({
        title: 'Collections',
        data: collections
      });
    }
    
    // Saved posts section (if a collection is selected)
    if (selectedCollection && savedPosts.length > 0) {
      sections.push({
        title: `Saved Posts - ${selectedCollection.name}`,
        data: savedPosts
      });
    }
    
    return sections;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>

            <Icon name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Saved</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#bea063" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved</Text>
        <TouchableOpacity onPress={handleCreateCollection}>
          <Icon name="add" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {collections.length === 0 ? (
        renderEmptyState()
      ) : (
        <SectionList
          sections={getSectionData()}
          renderItem={({ item, section }) => {
            if (section.title === 'Collections') {
              return renderCollectionItem({ item: item as Collection });
            } else {
              return renderSavedPostItem({ item: item as SavedPost });
            }
          }}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={(item, index) => index.toString()}
          refreshing={refreshing}
          onRefresh={onRefresh}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          stickySectionHeadersEnabled={false}
        />
      )}

      {postsLoading && (
        <View style={styles.postsLoadingOverlay}>
          <ActivityIndicator size="large" color="#bea063" />
          <Text style={styles.loadingText}>Loading saved posts...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 15,
  },
  sectionHeader: {
    backgroundColor: '#f8f8f8',
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  collectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  collectionImageContainer: {
    width: 60,
    height: 60,
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
  detailButton: {
    padding: 5,
  },
  savedPostItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  postInfo: {
    flex: 1,
    marginRight: 15,
  },
  postUsername: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  postCaption: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  postDate: {
    fontSize: 12,
    color: '#999',
  },
  postImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  createButton: {
    backgroundColor: '#bea063',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  postsLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
}); 