import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Video from 'react-native-video';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Story } from '../../Types';

const { width, height } = Dimensions.get('window');
const STORY_DURATION = 5000; // 5 seconds per media

interface StoryWithMedia extends Story {
  media?: { uri: string; type: string }[];
}

interface StoryViewerScreenProps {
  route: {
    params: {
      story: StoryWithMedia;
    };
  };
  navigation: any;
}

const StoryViewerScreen: React.FC<StoryViewerScreenProps> = ({ route, navigation }) => {
  const { story } = route.params as { story: StoryWithMedia };
  const media = story.media ?? (story.mediaUrl ? [{ uri: story.mediaUrl, type: story.type }] : []);
  const [mediaIndex, setMediaIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const progressInterval = useRef<NodeJS.Timeout>();

  useEffect(() => {
    startProgress();
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [mediaIndex]);

  const startProgress = () => {
    setProgress(0);
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
    progressInterval.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 1) {
          clearInterval(progressInterval.current);
          handleNextMedia();
          return 0;
        }
        return prev + 0.01;
      });
    }, STORY_DURATION / 100);
  };

  const handleNextMedia = () => {
    if (mediaIndex < media.length - 1) {
      setMediaIndex(mediaIndex + 1);
    } else {
      navigation.goBack();
    }
  };

  const handlePrevMedia = () => {
    if (mediaIndex > 0) {
      setMediaIndex(mediaIndex - 1);
    }
  };

  const renderMedia = () => {
    const item = media[mediaIndex];
    if (!item) return null;
    if (item.type && item.type.startsWith('video')) {
      return (
        <Video
          source={{ uri: item.uri }}
          style={{ width, height }}
          resizeMode="cover"
          controls
          paused={false}
          onEnd={handleNextMedia}
        />
      );
    }
    return (
      <Image
        source={{ uri: item.uri }}
        style={{ width, height }}
        resizeMode="cover"
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* Progress Bars */}
      <View style={styles.progressContainer}>
        {media.map((_: any, idx: number) => (
          <View key={idx} style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${idx < mediaIndex ? 100 : idx === mediaIndex ? progress * 100 : 0}%`,
                  backgroundColor: '#fff',
                },
              ]}
            />
          </View>
        ))}
      </View>
      {/* Media */}
      <TouchableOpacity
        style={styles.storyContainer}
        activeOpacity={1}
        onPress={handleNextMedia}
        onLongPress={handlePrevMedia}
      >
        {renderMedia()}
        {/* User Info */}
        <View style={styles.userInfo}>
          <Image source={{ uri: story.userProfilePicture }} style={styles.profilePicture} />
          <Text style={styles.username}>{story.username}</Text>
          {story.createdAt && (
            <Text style={styles.timestamp}>
              {new Date(story.createdAt).toLocaleTimeString()}
            </Text>
          )}
        </View>
        {/* Location */}
        {story.location && (
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={16} color="#fff" />
            <Text style={styles.locationText}>{story.location}</Text>
          </View>
        )}
      </TouchableOpacity>
      {/* Close Button */}
      <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
        <Ionicons name="close" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  progressContainer: {
    flexDirection: 'row',
    padding: 10,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  progressBarContainer: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 2,
    borderRadius: 1,
  },
  progressBar: {
    height: '100%',
    borderRadius: 1,
  },
  storyContainer: {
    flex: 1,
  },
  userInfo: {
    position: 'absolute',
    top: 50,
    left: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePicture: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  username: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 10,
    fontSize: 16,
  },
  timestamp: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 12,
  },
  locationContainer: {
    position: 'absolute',
    bottom: 30,
    left: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 14,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
  },
});

export default StoryViewerScreen; 