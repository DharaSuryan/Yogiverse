import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { Story } from '../../Types';
import { markStoryAsViewed } from '../../Store/slices/storySlice';

const { width, height } = Dimensions.get('window');
const STORY_DURATION = 5000; // 5 seconds per story

interface StoryViewerScreenProps {
  route: {
    params: {
      stories: Story[];
      initialIndex: number;
    };
  };
  navigation: any;
}

const StoryViewerScreen: React.FC<StoryViewerScreenProps> = ({ route, navigation }) => {
  const { stories, initialIndex } = route.params;
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const dispatch = useDispatch();
  const progressInterval = useRef<NodeJS.Timeout>();
  const touchStartTime = useRef<number>(0);
  const touchStartX = useRef<number>(0);

  const currentStory = stories[currentIndex];

  useEffect(() => {
    startProgress();
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [currentIndex]);

  const startProgress = () => {
    setProgress(0);
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }

    progressInterval.current = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 1) {
          clearInterval(progressInterval.current);
          handleNext();
          return 0;
        }
        return prevProgress + 0.01;
      });
    }, STORY_DURATION / 100);
  };

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
      dispatch(markStoryAsViewed(currentStory.id));
    } else {
      navigation.goBack();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleTouchStart = (event: any) => {
    touchStartTime.current = Date.now();
    touchStartX.current = event.nativeEvent.locationX;
  };

  const handleTouchEnd = (event: any) => {
    const touchEndTime = Date.now();
    const touchEndX = event.nativeEvent.locationX;
    const touchDuration = touchEndTime - touchStartTime.current;
    const touchDistance = touchEndX - touchStartX.current;

    if (touchDuration < 200) {
      if (touchDistance > 50) {
        handlePrevious();
      } else if (touchDistance < -50) {
        handleNext();
      }
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      
      {/* Progress Bars */}
      <View style={styles.progressContainer}>
        {stories.map((_, index) => (
          <View key={index} style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${index === currentIndex ? progress * 100 : index < currentIndex ? 100 : 0}%`,
                  backgroundColor: index === currentIndex ? '#fff' : '#fff',
                },
              ]}
            />
          </View>
        ))}
      </View>

      {/* Story Content */}
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handleTouchStart}
        onPressOut={handleTouchEnd}
        style={styles.storyContainer}
      >
        <Image source={{ uri: currentStory.imageUrl }} style={styles.storyImage} />
        
        {/* User Info */}
        <View style={styles.userInfo}>
          <Image source={{ uri: currentStory.user.profilePicture }} style={styles.profilePicture} />
          <Text style={styles.username}>{currentStory.user.username}</Text>
          <Text style={styles.timestamp}>
            {new Date(currentStory.createdAt).toLocaleTimeString()}
          </Text>
        </View>

        {/* Location */}
        {currentStory.location && (
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={16} color="#fff" />
            <Text style={styles.locationText}>{currentStory.location}</Text>
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
  storyImage: {
    width,
    height,
    resizeMode: 'cover',
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
    borderWidth: 2,
    borderColor: '#fff',
  },
  username: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  timestamp: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 10,
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
    fontSize: 14,
    marginLeft: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 15,
    padding: 5,
  },
});

export default StoryViewerScreen; 