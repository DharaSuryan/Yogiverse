import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  FlatList, 
  Dimensions, 
  StyleSheet, 
  Modal,
  Animated,
  Platform
} from 'react-native';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';

const { width, height } = Dimensions.get('window');

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('posts');
  const [muted, setMuted] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [fullViewVisible, setFullViewVisible] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const videoRefs = useRef({});
  const flatListRef = useRef(null);

  // Sample data - replace with your actual data
  const route = useRoute<any>();

  const userId = route.params.userId
  console.log("usre id ....", userId);
 const [posts,setPosts] = useState([])
  const[profileData,setProfile] = useState([])
  const[reels,setReels] = useState([])
  useEffect(() => {
    fetchUserProfileData()
  },[])
  const fetchUserProfileData = async () => {
    try {
      const response = await axios.get(`https://pashuahar.com/user_profile/${userId}`);
      const data = response.data?.data;
      console.log("data.....",data);
      setProfile(data);
      setPosts(data?.posts || []);
      setReels(data?.reels || []);
    } catch (err) {
      console.error('Fetch error:', err);
      // setError('Failed to fetch profile');
    } finally {
      // setLoading(false);
    }
  };

  const stats = {
    posts: posts.length,
    followers: 1200,
    following: 500
  };
  const openFullView = (item) => {
    setSelectedItem(item);
    setFullViewVisible(true);
  };

  const closeFullView = () => {
    setFullViewVisible(false);
    setSelectedItem(null);
  };

  const renderPostItem = ({ item, index }) => (
    <TouchableOpacity 
      style={styles.gridItem}
      onPress={() => openFullView({ ...item, index })}
    >
      {item.media.length === 1 ? (
        <Image 
          source={{ uri: item.media[0].media_file }}
          style={styles.gridImage}
        />
      ) : (
        <View style={styles.multiMediaContainer}>
          <Image 
            source={{ uri: item.media[0].media_file }}
            style={styles.gridImage}
          />
          <Icon 
            name="copy-outline" 
            size={20} 
            color="white" 
            style={styles.multiMediaIcon}
          />
        </View>
      )}
    </TouchableOpacity>
  );

  const renderReelItem = ({ item, index }) => (
    <TouchableOpacity 
      style={[styles.gridItem, { height: width / 3 * 1.5 }]}
      onPress={() => openFullView({ ...item, index })}
    >
      <Video
        ref={(ref) => (videoRefs.current[item.id] = ref)}
        source={{ uri: item.video_file }}
        style={styles.gridImage}
        resizeMode="cover"
        repeat
        paused={true}
        muted={muted}
      />
      <View style={styles.reelInfo}>
        <Icon name="play" size={14} color="white" />
        <Text style={styles.reelInfoText}>{item.like_count}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderFullViewItem = ({ item }) => {
    if (item.type === 'reel') {
      return (
        <View style={styles.fullViewItem}>
          <Video
            source={{ uri: item.video_file }}
            style={styles.fullViewMedia}
            resizeMode="contain"
            repeat
            paused={!fullViewVisible}
            muted={muted}
          />
        </View>
      );
    } else {
      return (
        <View style={styles.fullViewItem}>
          <Image 
            source={{ uri: item.media[0].media_file }}
            style={styles.fullViewMedia}
            resizeMode="contain"
          />
        </View>
      );
    }
  };

  const toggleMute = () => {
    setMuted(!muted);
  };

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: true }
  );

  return (
    <View style={styles.container}>
      {/* Profile Header */}
      <Animated.View style={[styles.profileHeader, {
        transform: [{
          translateY: scrollY.interpolate({
            inputRange: [0, 100],
            outputRange: [0, -100],
            extrapolate: 'clamp'
          })
        }],
        opacity: scrollY.interpolate({
          inputRange: [0, 50],
          outputRange: [1, 0],
          extrapolate: 'clamp'
        })
      }]}>
        <View style={styles.profileTop}>
          <Image 
            source={{ uri: profileData.profile_picture }}
            style={styles.profilePic}
          />
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.posts}</Text>
              <Text>Posts</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.followers}</Text>
              <Text>Followers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.following}</Text>
              <Text>Following</Text>
            </View>
          </View>
        </View>

        <View style={styles.profileInfo}>
          <Text style={styles.username}>{profileData.username}</Text>
          {profileData.bio && <Text style={styles.bio}>{profileData.bio}</Text>}
        </View>
      </Animated.View>

      {/* Profile Tabs */}
      <Animated.View style={[styles.tabsContainer, {
        transform: [{
          translateY: scrollY.interpolate({
            inputRange: [0, 100],
            outputRange: [0, -100],
            extrapolate: 'clamp'
          })
        }]
      }]}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'posts' && styles.activeTab]}
          onPress={() => setActiveTab('posts')}
        >
          <Icon name="grid-outline" size={24} color={activeTab === 'posts' ? 'black' : 'gray'} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'reels' && styles.activeTab]}
          onPress={() => setActiveTab('reels')}
        >
          <Icon name="film-outline" size={24} color={activeTab === 'reels' ? 'black' : 'gray'} />
        </TouchableOpacity>
      </Animated.View>

      {/* Content */}
      <FlatList
        ref={flatListRef}
        data={activeTab === 'posts' ? posts : reels}
        renderItem={activeTab === 'posts' ? renderPostItem : renderReelItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: 220 }}
      />

      {/* Full View Modal */}
      <Modal
        visible={fullViewVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeFullView}
      >
        <View style={styles.fullViewContainer}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={closeFullView}
          >
            <Icon name="close" size={30} color="white" />
          </TouchableOpacity>

          <FlatList
            data={activeTab === 'posts' ? posts : reels}
            renderItem={renderFullViewItem}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            pagingEnabled
            initialScrollIndex={selectedItem?.index || 0}
            getItemLayout={(data, index) => ({
              length: width,
              offset: width * index,
              index
            })}
            showsHorizontalScrollIndicator={false}
          />

          {/* Bottom Info Section */}
          <View style={styles.fullViewInfo}>
            <View style={styles.fullViewActions}>
              <TouchableOpacity style={styles.fullViewAction}>
                <Icon name="heart-outline" size={28} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.fullViewAction}>
                <Icon name="chatbubble-outline" size={28} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.fullViewAction}>
                <Icon name="paper-plane-outline" size={28} color="white" />
              </TouchableOpacity>
              {selectedItem?.type === 'reel' && (
                <TouchableOpacity style={styles.fullViewAction} onPress={toggleMute}>
                  <Icon 
                    name={muted ? "volume-mute-outline" : "volume-high-outline"} 
                    size={28} 
                    color="white" 
                  />
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.fullViewCaption}>
              <Text style={styles.fullViewUsername}>{selectedItem?.profile.username}</Text> {selectedItem?.caption}
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  profileHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'white',
    padding: 15,
    paddingTop: Platform.OS === 'ios' ? 50 : 15,
  },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePic: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  statsContainer: {
    flex: 1,
    marginLeft: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  profileInfo: {
    marginTop: 10,
  },
  username: {
    fontWeight: 'bold',
  },
  bio: {
    marginTop: 5,
  },
  tabsContainer: {
    position: 'absolute',
    top: 180,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    padding: 15,
  },
  activeTab: {
    borderBottomWidth: 1,
    borderBottomColor: 'black',
  },
  gridItem: {
    width: width / 3,
    height: width / 3,
    margin: 1,
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  multiMediaContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  multiMediaIcon: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
  reelInfo: {
    position: 'absolute',
    bottom: 5,
    left: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  reelInfoText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 5,
  },
  fullViewContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 15,
    zIndex: 20,
  },
  fullViewItem: {
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullViewMedia: {
    width: '100%',
    height: '100%',
  },
  fullViewInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  fullViewActions: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  fullViewAction: {
    marginRight: 20,
  },
  fullViewCaption: {
    color: 'white',
    fontSize: 16,
  },
  fullViewUsername: {
    fontWeight: 'bold',
    marginRight: 10,
  },
});

export default ProfileScreen;