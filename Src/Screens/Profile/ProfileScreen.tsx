import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Dimensions,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../Navigation/types';
const { width } = Dimensions.get('window');
const numColumns = 3;
const tileSize = width / numColumns;
type ProfileNavigationProp = NativeStackNavigationProp<ProfileStackParamList>;

const ProfileScreen = () => {
  const [activeTab, setActiveTab] = useState('posts');
  const [likedPosts, setLikedPosts] = useState({});
  const [savedPosts, setSavedPosts] = useState({});
const navigation = useNavigation<ProfileNavigationProp>();
  // Dummy user data
  const user = {
    id: '1',
    username: 'yoga_master',
    fullName: 'Yoga Master',
    bio: 'Yoga Instructor | Wellness Coach\nLiving mindfully 🌿\nJoin my classes!',
    followers: 1234,
    following: 567,
    posts: 89,
    profileImage: 'https://picsum.photos/200',
    isVerified: true,
  };

  // Dummy highlights data
  const highlights = [
    { id: '1', title: 'Yoga', image: 'https://picsum.photos/300' },
    { id: '2', title: 'Meditation', image: 'https://picsum.photos/301' },
    { id: '3', title: 'Classes', image: 'https://picsum.photos/302' },
    { id: '4', title: 'Retreats', image: 'https://picsum.photos/303' },
    { id: '5', title: 'Tips', image: 'https://picsum.photos/304' },
  ];

  // Dummy posts data
  const posts = [
    { 
      id: '1', 
      image: 'https://picsum.photos/500', 
      type: 'image', 
      likes: 123, 
      comments: 45,
      caption: 'Morning yoga session 🌅',
      timestamp: '2h'
    },
    { 
      id: '2', 
      image: 'https://picsum.photos/501', 
      type: 'reel', 
      likes: 456, 
      comments: 78,
      caption: 'New meditation technique',
      timestamp: '3h'
    },
    { 
      id: '3', 
      image: 'https://picsum.photos/502', 
      type: 'image', 
      likes: 789, 
      comments: 123,
      caption: 'Sunset yoga flow',
      timestamp: '5h'
    },
    { 
      id: '4', 
      image: 'https://picsum.photos/503', 
      type: 'reel', 
      likes: 234, 
      comments: 56,
      caption: 'Yoga for beginners',
      timestamp: '1d'
    },
    { 
      id: '5', 
      image: 'https://picsum.photos/504', 
      type: 'image', 
      likes: 567, 
      comments: 89,
      caption: 'Peaceful morning',
      timestamp: '2d'
    },
    { 
      id: '6', 
      image: 'https://picsum.photos/505', 
      type: 'image', 
      likes: 890, 
      comments: 234,
      caption: 'Mindful living',
      timestamp: '3d'
    },
  ];

  const handleLike = (postId) => {
    setLikedPosts(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleSave = (postId) => {
    setSavedPosts(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const renderHighlight = ({ item }) => (
    <TouchableOpacity 
      style={styles.highlightContainer}
      onPress={() => navigation.navigate('HighlightViewer', { highlightId: item.id })}
    >
      <View style={styles.highlightImageContainer}>
        <Image source={{ uri: item.image }} style={styles.highlightImage} />
      </View>
      <Text style={styles.highlightTitle} numberOfLines={1}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  const renderPost = ({ item }) => (
    <TouchableOpacity 
      style={styles.postContainer}
      onPress={() => navigation.navigate('PostDetails', { postId: item.id })}
    >
      <Image source={{ uri: item.image }} style={styles.postImage} />
      {item.type === 'reel' && (
        <View style={styles.reelIndicator}>
          <Icon name="play" size={20} color="#fff" />
        </View>
      )}
      <View style={styles.postOverlay}>
        <View style={styles.postStats}>
          <View style={styles.stat}>
            <Icon name="heart" size={20} color="#fff" />
            <Text style={styles.statText}>{item.likes}</Text>
          </View>
          <View style={styles.stat}>
            <Icon name="chatbubble" size={20} color="#fff" />
            <Text style={styles.statText}>{item.comments}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.navigate('Menu')}>
          <Icon name="menu-outline" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{user.username}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('StoryCreation')}>
          <Icon name="add-circle-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView>
        <View style={styles.profileSection}>
          <View style={styles.profileHeader}>
            <Image source={{ uri: user.profileImage }} style={styles.profileImage} />
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{user.posts}</Text>
                <Text style={styles.statLabel}>Posts</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{user.followers}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{user.following}</Text>
                <Text style={styles.statLabel}>Following</Text>
              </View>
            </View>
          </View>

          <View style={styles.bioSection}>
            <Text style={styles.fullName}>
              {user.fullName}
              {user.isVerified && (
                <Icon name="checkmark-circle" size={16} color="#0095f6" style={styles.verifiedIcon} />
              )}
            </Text>
            <Text style={styles.bio}>{user.bio}</Text>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareButton}>
              <Icon name="share-outline" size={20} color="#000" />
            </TouchableOpacity>
          </View>

          {/* Highlights */}
          <View style={styles.highlightsContainer}>
            <FlatList
              data={highlights}
              renderItem={renderHighlight}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          </View>
        </View>

        <View style={styles.tabBar}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'posts' && styles.activeTab]}
            onPress={() => setActiveTab('posts')}
          >
            <Icon name="grid-outline" size={24} color={activeTab === 'posts' ? '#000' : '#666'} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'reels' && styles.activeTab]}
            onPress={() => setActiveTab('reels')}
          >
            <Icon name="play-outline" size={24} color={activeTab === 'reels' ? '#000' : '#666'} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'tagged' && styles.activeTab]}
            onPress={() => setActiveTab('tagged')}
          >
            <Icon name="bookmark-outline" size={24} color={activeTab === 'tagged' ? '#000' : '#666'} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={item => item.id}
          numColumns={numColumns}
          scrollEnabled={false}
        />
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    ...Platform.select({
      ios: {
        paddingTop: 50,
      },
      android: {
        paddingTop: 16,
      },
    }),
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileSection: {
    padding: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  statsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  bioSection: {
    marginBottom: 16,
  },
  fullName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  verifiedIcon: {
    marginLeft: 4,
  },
  bio: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  editButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  shareButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
  },
  highlightsContainer: {
    marginBottom: 16,
  },
  highlightContainer: {
    marginRight: 12,
    alignItems: 'center',
  },
  highlightImageContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 2,
    marginBottom: 4,
  },
  highlightImage: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  highlightTitle: {
    fontSize: 12,
    color: '#333',
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#000',
  },
  postContainer: {
    width: tileSize,
    height: tileSize,
    padding: 1,
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  reelIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: 4,
  },
  postOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  postStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    color: '#fff',
    marginLeft: 4,
    fontSize: 12,
  },
});

export default ProfileScreen;