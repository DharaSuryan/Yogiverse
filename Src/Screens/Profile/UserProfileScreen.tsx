// same imports as before
import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, Image, TouchableOpacity,
  ScrollView, FlatList, Dimensions, ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Video from 'react-native-video';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Navigation/types';
import axios from 'axios';

const { width, height } = Dimensions.get('window');
const numColumns = 3;
const tileSize = width / numColumns;

type UserProfileNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type UserProfileRouteProp = RouteProp<RootStackParamList, 'UserProfile'>;

export const UserProfileScreen = () => {
  const navigation = useNavigation<UserProfileNavigationProp>();
  const route = useRoute<UserProfileRouteProp>();
  const { userId } = route.params;

  const [activeTab, setActiveTab] = useState<'posts' | 'reels' | 'saved'>('posts');
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [reels, setReels] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [expandedCaptions, setExpandedCaptions] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    console.log("userId",userId);
    
    if(userId){
    fetchUserProfileData();
    }
  }, [userId]);

  const fetchUserProfileData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`https://pashuahar.com/user_profile/${userId}`);
      const data = response.data?.data;
      console.log("data.....",data);
      
      setProfile(data);
      setPosts(data?.posts || []);
      setReels(data?.reels || []);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const filteredContent = activeTab === 'posts'
    ? posts
    : activeTab === 'reels'
      ? reels
      : posts.filter(p => p.is_saved);

  const handleItemPress = (index: number) => {
    setSelectedIndex(index);
  };

  const toggleCaption = (index: number) => {
    setExpandedCaptions(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const renderContentItem = ({ item, index }: any) => {
    const media = item.media?.[0];
    const uri = media?.file || media?.url || 'https://picsum.photos/500';
    const isReel = item.type === 'reel';

    return (
      <TouchableOpacity
        style={styles.postContainer}
        activeOpacity={0.8}
        onPress={() => handleItemPress(index)}
      >
        {uri ? (
          <Image source={{ uri }} style={styles.postImage} />
        ) : (
          <View style={[styles.postImage, { backgroundColor: '#ccc' }]} />
        )}
        {isReel && (
          <View style={styles.reelIndicator}>
            <Icon name="play" size={16} color="#fff" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderFullScreenItem = ({ item, index }: any) => {
    const media = item.media?.[0];
    const uri = media?.file || media?.url || 'https://picsum.photos/500';
    const isReel = item.type === 'reel';
    const isExpanded = expandedCaptions[index];
    const caption = item.caption || '';
    const shouldTruncate = caption.length > 50 && !isExpanded;
    const displayedCaption = shouldTruncate ? `${caption.substring(0, 100)}...` : caption;

    return (
      <View style={styles.fullItemContainer}>
        {/* Header */}
        <View style={styles.headerOverlay}>
          <Image
            source={{ uri: profile?.profile?.profile_picture || 'https://picsum.photos/100' }}
            style={styles.userAvatar}
          />
          <Text style={styles.usernameOverlay}>@{item.user || profile?.profile?.username}</Text>
        </View>

        {/* Media Content */}
        {isReel ? (
          <Video
            source={{ uri: `http://192.168.1.160:9001${item.video_file}` }}
            style={styles.fullMedia}
            resizeMode="cover"
            repeat
            paused={false}
          />
        ) : (
          uri ? (
            <Image source={{ uri }} style={styles.fullMedia} resizeMode="cover" />
          ) : (
            <View style={[styles.fullMedia, { backgroundColor: '#000' }]} />
          )
        )}

        {/* Scrollable Content Area */}
        <View style={styles.scrollableContent}>
          <ScrollView
            contentContainerStyle={styles.scrollContentContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.overlayContent}>
              <Text style={styles.caption}>{displayedCaption}</Text>
              {caption.length > 50 && (
                <TouchableOpacity onPress={() => { toggleCaption(index) }}>
                  <Text style={{
                    color: '#888',
                    fontSize: 13,
                    marginBottom: isExpanded ? 25 : 0,
                  }}>
                    {isExpanded ? 'Show less' : 'Read more'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>

          {/* Fixed Actions Row */}
          <View style={styles.actionsRow}>
            
              <Icon name="heart-outline" size={30} color="#fff" />

            <TouchableOpacity
              onPress={() => {
                console.log("yes pres ......");
                
                const content_type = isReel ? 'reel' : 'post';
                const object_id = item.id;
                console.log("here comes ...",content_type,object_id);
                
                navigation.navigate('CommentScreen', { content_type, object_id });
              }}
            >
                          <Icon name="chatbubble-outline" size={27} color="#fff" style={{ marginLeft: 16 }} />

            </TouchableOpacity>

            {/* <Icon name="chatbubble-outline" size={24} color="#fff" style={{ marginLeft: 16 }} /> */}
            <Icon name="paper-plane-outline" size={26} color="#fff" style={{ marginLeft: 16 }} />
            <Icon name="bookmark-outline" size={28} color="#fff" style={{ marginLeft: 'auto' }} />
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#000" style={styles.loadingContainer} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {selectedIndex === null ? (
        <>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => {

navigation.navigate('MainTab', {
  screen: 'SearchTab',
  params: {
    screen: 'Search',
  },
});
            }}>
              <Icon name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{profile?.profile?.username || 'Profile'}</Text>
            <Icon name="ellipsis-horizontal" size={24} color="#000" />
          </View>
          <ScrollView>
            <View style={styles.profileSection}>
              <View style={styles.profileHeader}>
                <Image
                  source={{ uri: profile?.profile?.profile_picture || 'https://picsum.photos/200' }}
                  style={styles.profileImage}
                />
                <View style={styles.profileStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{posts.length}</Text>
                    <Text style={styles.statLabel}>Posts</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{profile?.followers_count || 0}</Text>
                    <Text style={styles.statLabel}>Followers</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{profile?.following_count || 0}</Text>
                    <Text style={styles.statLabel}>Following</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.username}>{profile?.profile?.username}</Text>
              <Text style={styles.fullName}>{profile?.profile?.first_name} {profile?.profile?.last_name}</Text>
              <Text style={styles.bio}>{profile?.profile?.bio}</Text>
            </View>
            <View style={styles.tabContainer}>
              {['posts', 'reels', 'saved'].map(tab => (
                <TouchableOpacity
                  key={tab}
                  style={[styles.tab, activeTab === tab && styles.activeTab]}
                  onPress={() => setActiveTab(tab as any)}
                >
                  <Icon
                    name={tab === 'posts' ? 'grid' : tab === 'reels' ? 'play' : 'bookmark'}
                    size={24}
                    color={activeTab === tab ? '#000' : '#666'}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <FlatList
              data={filteredContent}
              renderItem={renderContentItem}
              keyExtractor={item => item.id.toString()}
              numColumns={3}
              scrollEnabled={false}
              contentContainerStyle={styles.postsGrid}
            />
          </ScrollView>
        </>
      ) : (
        <FlatList
          ref={flatListRef}
          data={filteredContent}
          renderItem={renderFullScreenItem}
          keyExtractor={item => item.id?.toString() || Math.random().toString()}
          pagingEnabled
          horizontal={false}
          initialScrollIndex={selectedIndex}
          getItemLayout={(_, index) => ({ length: height, offset: height * index, index })}
          showsVerticalScrollIndicator={false}
        />
      )}
      {selectedIndex !== null && (
        <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedIndex(null)}>
          <Icon name="close" size={30} color="#fff" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: 'red', fontSize: 16, textAlign: 'center', marginTop: 20 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#ddd'
  },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  profileSection: { padding: 16 },
  profileHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  profileImage: { width: 80, height: 80, borderRadius: 40, marginRight: 16 },
  profileStats: { flex: 1, flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 18, fontWeight: 'bold' },
  statLabel: { fontSize: 12, color: '#666' },
  username: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  fullName: { fontSize: 14, color: '#333', marginBottom: 4 },
  bio: { fontSize: 14, color: '#666', lineHeight: 20 },
  tabContainer: { flexDirection: 'row', borderTopWidth: 0.5, borderTopColor: '#ddd' },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#000' },
  postsGrid: { paddingBottom: 20 },
  postContainer: { width: tileSize, height: tileSize, position: 'relative' },
  postImage: { width: '100%', height: '100%' },
  reelIndicator: {
    position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12, padding: 4
  },

  headerOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    alignSelf: 'flex-start',
  },
  userAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  usernameOverlay: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },

  caption: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 6,
    lineHeight: 20, // Added for better readability
  },
  readMoreText: {
    color: '#888',
    fontSize: 13,
    marginBottom:  10,
  },

  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  fullItemContainer: {
    width,
    height,
    backgroundColor: '#000',
  },
  fullMedia: {
    width: '100%',
    height: height * 0.6, // Takes 60% of screen height
  },
  scrollableContent: {
    flex: 1, // Takes remaining space
    paddingBottom: 20, // Space for actions row
  },
  scrollContentContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  overlayContent: {
    marginBottom: 10,
  },
  actionsRow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
});

export default UserProfileScreen;
