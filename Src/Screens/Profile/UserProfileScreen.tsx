// same imports as before
import React, {useEffect, useState, useRef} from 'react';
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
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Video from 'react-native-video';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../Navigation/types';
import axios from 'axios';
import Post from '../../Component/Post';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Video as VideoCompressor} from 'react-native-compressor';

const {width, height} = Dimensions.get('window');
const numColumns = 3;
const tileSize = width / numColumns;

type UserProfileNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type UserProfileRouteProp = RouteProp<RootStackParamList, 'UserProfile'>;

export const UserProfileScreen = async () => {
  const navigation = useNavigation<UserProfileNavigationProp>();
  const route = useRoute<UserProfileRouteProp>();
  const {userId} = route.params;

  const [activeTab, setActiveTab] = useState<'posts' | 'reels' | 'saved'>(
    'posts',
  );
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [reels, setReels] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [expandedCaptions, setExpandedCaptions] = useState<
    Record<number, boolean>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVideoPaused, setIsVideoPaused] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isFollowed, setIsFollowed] = useState(false);
  const [followStatus, setFollowStatus] = useState('');
  const [followLoading, setFollowLoading] = useState(false);
  const [videoStates, setVideoStates] = useState<{
    [id: string]: {isPlaying: boolean; isMuted: boolean};
  }>({});
  const [videoLoading, setVideoLoading] = useState<{[id: string]: boolean}>({});

  const onViewableItemsChanged = useRef(({viewableItems}: any) => {
    if (viewableItems && viewableItems.length > 0) {
      setCurrentMediaIndex(viewableItems[0].index || 0);
    }
  }).current;

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    console.log('userId', userId);

    if (userId) {
      fetchUserProfileData();
    }
  }, [userId]);
  const authToken = await AsyncStorage.getItem('accessToken');
  const headers = {
    Accept: 'application/json',
    Authorization: `Bearer ${authToken}`,
  };

  const fetchUserProfileData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `https://pashuahar.com/user_profile/${userId}/`,
        {headers},
      );
      const data = response.data?.data;
      console.log('data.....', response.data?.data?.reels, 'userId', userId);

      setProfile(data);
      setPosts(data?.posts || []);
      setReels(data?.reels || []);
      setIsFollowed(data?.is_followed_by);
      setFollowStatus(data?.follow_status);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  // Filter out posts/reels with no valid media_file or video_file
  const hasValidMedia = (item: any) => {
    if (item.type === 'reel') {
      return !!item.video_file;
    }
    const media = item.media?.[0];
    return media && media.media_file;
  };

  const filteredContent = (
    activeTab === 'posts'
      ? posts
      : activeTab === 'reels'
      ? reels
      : posts.filter(p => p.is_saved)
  ).filter(hasValidMedia);

  const handleItemPress = (index: number) => {
    setSelectedIndex(index);
  };

  const toggleCaption = (index: number) => {
    setExpandedCaptions(prev => ({...prev, [index]: !prev[index]}));
  };

  const handleVideoRef = (ref: any, id: string) => {
    // Optionally store refs if you want to control videos programmatically
  };

  const handlePlayPause = (id: string) => {
    setVideoStates(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        isPlaying: !prev[id]?.isPlaying,
        isMuted: prev[id]?.isMuted ?? true,
      },
    }));
  };

  const handleMuteUnmute = (id: string) => {
    setVideoStates(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        isMuted: !prev[id]?.isMuted,
        isPlaying: prev[id]?.isPlaying ?? true,
      },
    }));
  };

  const renderContentItem = ({item, index}: any) => {
    const isReel = item.type === 'reel';
    const isVideo = isReel || item.media?.[0]?.media_file?.endsWith('.mp4');
    const imageUri =
      item.compressedUri ||
      item.uri ||
      item.media?.[0]?.media_file ||
      item.media?.[0]?.url;
    const videoUri = item.video_file || item.uri;

    return (
      <TouchableOpacity
        style={styles.postContainer}
        activeOpacity={0.8}
        onPress={() => handleItemPress(index)}>
        {!isVideo ? (
          <Image source={{uri: imageUri}} style={styles.postImage} />
        ) : (
          <View style={styles.videoContainer}>
            <Video
              source={{uri: videoUri}}
              style={styles.postImage}
              muted
              repeat
              resizeMode="cover"
              paused={true} // Always paused in grid
            />
          </View>
        )}
        {/* Overlay play icon for reels in grid */}
        {isReel && (
          <View style={styles.reelIndicator}>
            <Icon name="play" size={16} color="#fff" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // New component for full-screen reel item with compression logic
  type FullScreenReelItemProps = {
    item: any;
    index: number;
    profile: any;
    navigation: any;
    expandedCaptions: Record<number, boolean>;
    toggleCaption: (index: number) => void;
    onViewableItemsChanged: any;
  };

  // Memoized component for full-screen reel item with local video state
  const FullScreenReelItem = React.memo(
    ({
      item,
      index,
      profile,
      navigation,
      expandedCaptions,
      toggleCaption,
      onViewableItemsChanged,
    }: FullScreenReelItemProps) => {
      const isReel = item.type === 'reel';
      const [compressedUri, setCompressedUri] = React.useState<string | null>(
        null,
      );
      const [isVideoPaused, setIsVideoPaused] = React.useState(false); // auto-play by default
      const [isVideoMuted, setIsVideoMuted] = React.useState(true);
      const [activeMediaIndex, setActiveMediaIndex] = React.useState(0);

      React.useEffect(() => {
        let isMounted = true;
        if (isReel && item.video_file) {
          (async () => {
            try {
              const result = await VideoCompressor.compress(item.video_file, {
                compressionMethod: 'auto',
              });
              if (isMounted) setCompressedUri(result);
            } catch (e) {
              if (isMounted) setCompressedUri(item.video_file); // fallback to original
            }
          })();
        }
        return () => {
          isMounted = false;
        };
      }, [item.video_file]);

      // Use the same image URI logic as in the grid, but remove fallback
      const imageUri =
        item.compressedUri ||
        item.uri ||
        item.media?.[0]?.media_file ||
        item.media?.[0]?.url;

      const mediaList = isReel
        ? [{media_file: compressedUri || item.video_file}]
        : item?.media || [];
      const caption = item.caption || '';
      const isExpanded = expandedCaptions[index];
      const shouldTruncate = caption.length > 50 && !isExpanded;
      const displayedCaption = shouldTruncate
        ? `${caption.substring(0, 100)}...`
        : caption;

      // Dots indicator for carousel
      const renderDots = () => (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            marginTop: 8,
          }}>
          {mediaList.map((_: any, idx: number) => (
            <View
              key={idx}
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: idx === activeMediaIndex ? '#fff' : '#888',
                marginHorizontal: 3,
              }}
            />
          ))}
        </View>
      );

      return (
        <View style={styles.fullItemContainer}>
          {/* Header */}
          <View style={styles.headerOverlay}>
            <Image
              source={{
                uri:
                  item.profile?.profile_picture ||
                  profile?.profile?.profile_picture ||
                  'https://picsum.photos/100',
              }}
              style={styles.userAvatar}
            />
            <Text style={styles.usernameOverlay}>
              @{item.profile?.username || profile?.profile?.username}
            </Text>
          </View>

          {/* Media Carousel (top 60% of screen) */}
          <View style={{width: '100%', height: height * 0.6}}>
            <FlatList
              data={mediaList}
              horizontal
              pagingEnabled
              keyExtractor={(_, idx) => idx.toString()}
              renderItem={({item: mediaItem}) => {
                const isVideo =
                  isReel || mediaItem.media_file?.endsWith('.mp4');
                const uri = isVideo
                  ? mediaItem.media_file || mediaItem.url
                  : imageUri;
                if (!uri) {
                  return null;
                }
                return isVideo ? (
                  <View
                    style={{width, height: height * 0.6, position: 'relative'}}>
                    <Video
                      source={{uri}}
                      style={styles.fullMedia}
                      resizeMode="cover"
                      repeat
                      paused={isVideoPaused}
                      muted={isVideoMuted}
                    />
                    {/* Play/Pause Button */}
                    <TouchableOpacity
                      style={styles.playPauseOverlay}
                      onPress={() => setIsVideoPaused(prev => !prev)}>
                      <Icon
                        name={
                          isVideoPaused
                            ? 'play-circle-outline'
                            : 'pause-circle-outline'
                        }
                        size={48}
                        color="#fff"
                      />
                    </TouchableOpacity>
                    {/* Mute/Unmute Button */}
                    <TouchableOpacity
                      style={styles.muteOverlay}
                      onPress={() => setIsVideoMuted(prev => !prev)}>
                      <Icon
                        name={isVideoMuted ? 'volume-mute' : 'volume-high'}
                        size={32}
                        color="#fff"
                      />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <Image
                    source={{uri}}
                    style={styles.fullMedia}
                    resizeMode="cover"
                  />
                );
              }}
              showsHorizontalScrollIndicator={false}
              onViewableItemsChanged={({viewableItems}) => {
                if (viewableItems && viewableItems.length > 0) {
                  setActiveMediaIndex(viewableItems[0].index || 0);
                }
                if (onViewableItemsChanged)
                  onViewableItemsChanged({viewableItems});
              }}
              viewabilityConfig={{itemVisiblePercentThreshold: 50}}
            />
            {mediaList.length > 1 && renderDots()}
          </View>

          {/* Post details below media */}
          <View style={styles.scrollableContent}>
            <ScrollView
              contentContainerStyle={styles.scrollContentContainer}
              showsVerticalScrollIndicator={false}>
              <View style={styles.overlayContent}>
                <Text style={styles.caption}>{displayedCaption}</Text>
                {caption.length > 50 && (
                  <TouchableOpacity
                    onPress={() => {
                      toggleCaption(index);
                    }}>
                    <Text style={styles.readMoreText}>
                      {isExpanded ? 'Show less' : 'Read more'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>

            {/* Use common <Post> component for actions and info */}
            <Post
              id={item.id?.toString()}
              username={
                item.profile?.username || profile?.profile?.username || ''
              }
              media={mediaList}
              caption={item.caption || ''}
              likes={item.like_count || 0}
              userAvatar={
                item.profile?.profile_picture ||
                profile?.profile?.profile_picture
              }
              isLiked={item.is_liked || false}
              contentType={isReel ? 'reel' : 'post'}
              navigation={navigation}
              allowComments={item.allow_comments !== false}
              commentCount={item.comment_count || 0}
              hideLikeCount={item.hide_like_count || false}
              location={item.location || ''}
              createdAt={item.created_at || ''}
              profile={profile}
              item={item}
            />
          </View>
        </View>
      );
    },
  );

  // Update renderFullScreenItem to use the new component and restore expandedCaptions prop
  const renderFullScreenItem = ({item, index}: any) => (
    <FullScreenReelItem
      item={item}
      index={index}
      profile={profile}
      navigation={navigation}
      expandedCaptions={expandedCaptions}
      toggleCaption={toggleCaption}
      onViewableItemsChanged={onViewableItemsChanged}
    />
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator
          size="large"
          color="#000"
          style={styles.loadingContainer}
        />
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
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('MainTab', {
                  screen: 'SearchTab',
                  params: {
                    screen: 'Search',
                  },
                });
              }}>
              <Icon name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {profile?.profile?.username || 'Profile'}
            </Text>
            <Icon name="ellipsis-horizontal" size={24} color="#000" />
          </View>
          <ScrollView>
            <View style={styles.profileSection}>
              <View style={styles.profileHeader}>
                <Image
                  source={{
                    uri:
                      profile?.profile?.profile_picture ||
                      'https://picsum.photos/200',
                  }}
                  style={styles.profileImage}
                />
                <View style={styles.profileStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{posts.length}</Text>
                    <Text style={styles.statLabel}>Posts</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>
                      {profile?.followers_count || 0}
                    </Text>
                    <Text style={styles.statLabel}>Followers</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>
                      {profile?.following_count || 0}
                    </Text>
                    <Text style={styles.statLabel}>Following</Text>
                  </View>
                </View>
              </View>
              {/* Follow/Unfollow Button */}
              {userId !== profile?.profile?.id && (
                <View style={{alignItems: 'center', marginTop: 8}}>
                  <TouchableOpacity
                    style={[
                      styles.followButton,
                      isFollowed && followStatus !== 'pending'
                        ? styles.unfollowButton
                        : null,
                      followStatus === 'pending' ? styles.pendingButton : null,
                    ]}
                    disabled={followStatus === 'pending' || followLoading}
                    onPress={async () => {
                      console.log(
                        'profile?.debug_info?.profile_user_id',
                        userId,
                        isFollowed,
                      );

                      if (isFollowed) {
                        // Unfollow API call
                        try {
                          setFollowLoading(true);
                          await axios.post(
                            'https://pashuahar.com/follower/unfollow/',
                            {user_id: userId},
                            {headers},
                          );
                          setIsFollowed(false);
                          setFollowStatus('');
                          setFollowLoading(false);
                        } catch (e) {
                          setFollowLoading(false);
                          // handle error
                        }
                      } else {
                        console.log(
                          'profile?.debug_info?.profile_user_id',
                          profile?.debug_info?.profile_user_id,
                        );

                        // Follow API call
                        try {
                          setFollowLoading(true);
                          await axios.post(
                            'https://pashuahar.com/follower/follow/',
                            {
                              user_id:
                                userId || +profile?.debug_info?.profile_user_id,
                            },
                            {headers},
                          );
                          setIsFollowed(true);
                          setFollowStatus('pending'); // or '' if immediately followed
                          setFollowLoading(false);
                        } catch (e) {
                          setFollowLoading(false);
                          // handle error
                        }
                      }
                    }}>
                    {followLoading ? (
                      <ActivityIndicator
                        color={isFollowed ? '#0095f6' : '#fff'}
                        size="small"
                      />
                    ) : (
                      <Text
                        style={
                          isFollowed && followStatus !== 'pending'
                            ? styles.unfollowButtonText
                            : followStatus === 'pending'
                            ? styles.pendingButtonText
                            : styles.followButtonText
                        }>
                        {isFollowed
                          ? followStatus === 'pending'
                            ? 'Requested'
                            : 'Unfollow'
                          : 'Follow'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
              <Text style={styles.username}>{profile?.profile?.username}</Text>
              <Text style={styles.fullName}>
                {profile?.profile?.first_name} {profile?.profile?.last_name}
              </Text>
              <Text style={styles.bio}>{profile?.profile?.bio}</Text>
            </View>
            <View style={styles.tabContainer}>
              {['posts', 'reels', 'saved'].map(tab => (
                <TouchableOpacity
                  key={tab}
                  style={[styles.tab, activeTab === tab && styles.activeTab]}
                  onPress={() => setActiveTab(tab as any)}>
                  <Icon
                    name={
                      tab === 'posts'
                        ? 'grid'
                        : tab === 'reels'
                        ? 'play'
                        : 'bookmark'
                    }
                    size={24}
                    color={activeTab === tab ? '#000' : '#666'}
                  />
                </TouchableOpacity>
              ))}
            </View>
            {filteredContent.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Icon
                  name={
                    activeTab === 'reels'
                      ? 'play-circle-outline'
                      : 'image-outline'
                  }
                  size={60}
                  color="#ccc"
                />
                <Text style={styles.emptyText}>
                  {activeTab === 'reels'
                    ? 'No reels available yet.\nStart sharing your moments!'
                    : 'No posts available yet.\nStart sharing your moments!'}
                </Text>
              </View>
            ) : (
              <FlatList
                data={filteredContent}
                renderItem={renderContentItem}
                keyExtractor={item => item.data?.id?.toString()}
                numColumns={3}
                scrollEnabled={false}
                contentContainerStyle={styles.postsGrid}
              />
            )}
          </ScrollView>
        </>
      ) : (
        <FlatList
          ref={flatListRef}
          data={filteredContent}
          renderItem={renderFullScreenItem}
          keyExtractor={item =>
            item.data?.id?.toString() || Math.random().toString()
          }
          pagingEnabled
          horizontal={false}
          initialScrollIndex={selectedIndex}
          getItemLayout={(_, index) => ({
            length: height,
            offset: height * index,
            index,
          })}
          showsVerticalScrollIndicator={false}
        />
      )}
      {selectedIndex !== null && (
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => setSelectedIndex(null)}>
          <Icon name="close" size={30} color="#fff" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  loadingContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  errorText: {color: 'red', fontSize: 16, textAlign: 'center', marginTop: 20},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ddd',
  },
  headerTitle: {fontSize: 18, fontWeight: '600'},
  profileSection: {padding: 16},
  profileHeader: {flexDirection: 'row', alignItems: 'center', marginBottom: 16},
  profileImage: {width: 80, height: 80, borderRadius: 40, marginRight: 16},
  profileStats: {flex: 1, flexDirection: 'row', justifyContent: 'space-around'},
  statItem: {alignItems: 'center'},
  statNumber: {fontSize: 18, fontWeight: 'bold'},
  statLabel: {fontSize: 12, color: '#666'},
  username: {fontSize: 16, fontWeight: '600', marginBottom: 4},
  fullName: {fontSize: 14, color: '#333', marginBottom: 4},
  bio: {fontSize: 14, color: '#666', lineHeight: 20},
  tabContainer: {
    flexDirection: 'row',
    borderTopWidth: 0.5,
    borderTopColor: '#ddd',
  },
  tab: {flex: 1, alignItems: 'center', paddingVertical: 12},
  activeTab: {borderBottomWidth: 2, borderBottomColor: '#000'},
  postsGrid: {paddingBottom: 20},
  postContainer: {width: tileSize, height: tileSize, position: 'relative'},
  postImage: {width: '100%', height: '100%'},
  reelIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: 4,
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
    marginBottom: 10,
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
  playPauseOverlay: {
    position: 'absolute',
    top: '40%',
    left: '40%',
    zIndex: 10,
    opacity: 0.8,
  },
  muteOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
    opacity: 0.8,
  },
  followButton: {
    minWidth: 120,
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 24,
    backgroundColor: '#bea063',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  unfollowButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#bea063',
  },
  pendingButton: {
    backgroundColor: '#eee',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  followButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  unfollowButtonText: {
    color: '#bea063',
    fontWeight: 'bold',
    fontSize: 16,
  },
  pendingButtonText: {
    color: '#888',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 22,
  },
  videoContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
    backgroundColor: '#000',
  },
});

export default UserProfileScreen;
