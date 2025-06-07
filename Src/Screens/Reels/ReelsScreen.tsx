import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  Image,
  FlatList,
  SafeAreaView,
  ViewToken,
} from 'react-native';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

interface User {
  username: string;
  avatar: string;
  isFollowing: boolean;
}

interface Reel {
  id: string;
  video: string;
  user: User;
  description: string;
  likes: number;
  comments: number;
  shares: number;
  music: string;
}

// Mock data for reels
const REELS_DATA: Reel[] = [
  {
    id: '1',
    video: 'https://example.com/reel1.mp4', // Replace with actual video URL
    user: {
      username: 'yogimaster',
      avatar: 'https://picsum.photos/100/100',
      isFollowing: false,
    },
    description: 'Morning yoga flow 🧘‍♀️ #yoga #wellness #mindfulness',
    likes: 1234,
    comments: 89,
    shares: 45,
    music: 'Original Audio - yogimaster',
  },
  {
    id: '2',
    video: 'https://example.com/reel2.mp4', // Replace with actual video URL
    user: {
      username: 'yogalife',
      avatar: 'https://picsum.photos/100/101',
      isFollowing: true,
    },
    description: 'Advanced poses tutorial 💪 #yogachallenge #flexibility',
    likes: 2345,
    comments: 123,
    shares: 67,
    music: 'Peaceful Morning - Meditation Music',
  },
];

interface LikedState {
  [key: string]: boolean;
}

const ReelsScreen: React.FC = () => {
  const [activeReel, setActiveReel] = useState(0);
  const [muted, setMuted] = useState(false);
  const [liked, setLiked] = useState<LikedState>({});
  const flatListRef = useRef<FlatList>(null);

  const renderReel = ({ item, index }: { item: Reel; index: number }) => {
    const isLiked = liked[item.id] || false;

    const handleLike = () => {
      setLiked(prev => ({
        ...prev,
        [item.id]: !prev[item.id],
      }));
    };

    return (
      <View style={styles.reelContainer}>
        <Video
          source={{ uri: item.video }}
          style={styles.video}
          resizeMode="cover"
          repeat
          muted={muted}
          paused={activeReel !== index}
        />

        {/* Gradient overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.5)']}
          style={styles.gradient}
        />

        {/* Right sidebar */}
        <View style={styles.sidebar}>
          <TouchableOpacity onPress={handleLike}>
            <Icon
              name={isLiked ? 'heart' : 'heart-outline'}
              size={28}
              color={isLiked ? '#FF4B4B' : '#fff'}
            />
            <Text style={styles.sidebarText}>{item.likes}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sidebarIcon}>
            <Icon name="chatbubble-outline" size={28} color="#fff" />
            <Text style={styles.sidebarText}>{item.comments}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sidebarIcon}>
            <Icon name="paper-plane-outline" size={28} color="#fff" />
            <Text style={styles.sidebarText}>{item.shares}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sidebarIcon}>
            <Icon name="ellipsis-vertical" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Bottom info section */}
        <View style={styles.bottomSection}>
          <View style={styles.userInfo}>
            <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
            <Text style={styles.username}>{item.user.username}</Text>
            {!item.user.isFollowing && (
              <TouchableOpacity style={styles.followButton}>
                <Text style={styles.followText}>Follow</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.description}>{item.description}</Text>

          <View style={styles.musicSection}>
            <Icon name="musical-notes" size={16} color="#fff" />
            <Text style={styles.musicText}>{item.music}</Text>
          </View>
        </View>

        {/* Sound toggle */}
        <TouchableOpacity
          style={styles.soundToggle}
          onPress={() => setMuted(!muted)}>
          <Icon
            name={muted ? 'volume-mute' : 'volume-high'}
            size={24}
            color="#fff"
          />
        </TouchableOpacity>
      </View>
    );
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems[0]) {
      setActiveReel(viewableItems[0].index || 0);
    }
  }).current;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reels</Text>
        <TouchableOpacity>
          <Icon name="camera-outline" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={REELS_DATA}
        renderItem={renderReel}
        keyExtractor={item => item.id}
        pagingEnabled
        snapToInterval={height}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50,
        }}
        onViewableItemsChanged={onViewableItemsChanged}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  reelContainer: {
    width: width,
    height: height,
  },
  video: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  sidebar: {
    position: 'absolute',
    right: 8,
    bottom: 100,
    alignItems: 'center',
  },
  sidebarIcon: {
    alignItems: 'center',
    marginVertical: 8,
  },
  sidebarText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  username: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 12,
  },
  followButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 4,
  },
  followText: {
    color: '#000',
    fontWeight: '600',
  },
  description: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 12,
  },
  musicSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  musicText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 8,
  },
  soundToggle: {
    position: 'absolute',
    right: 16,
    top: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 20,
  },
});

export default ReelsScreen; 