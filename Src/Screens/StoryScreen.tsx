import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Video from 'react-native-video';

const { width, height } = Dimensions.get('window');

const StoryScreen = () => {
  const navigation = useNavigation();
  const [stories, setStories] = useState<any[]>([
    // Dummy stories data
    {
      id: '1',
      user: {
        id: 'user1',
        username: 'user_one',
        profilePicture: 'https://i.pravatar.cc/100?img=1',
      },
      media: [
        { id: 'media1', type: 'image', uri: 'https://picsum.photos/id/237/800/1200', duration: 5000 },
        { id: 'media2', type: 'video', uri: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4', duration: 15000 },
      ],
    },
    {
      id: '2',
      user: {
        id: 'user2',
        username: 'user_two',
        profilePicture: 'https://i.pravatar.cc/100?img=2',
      },
      media: [
        { id: 'media3', type: 'image', uri: 'https://picsum.photos/id/238/800/1200', duration: 5000 },
      ],
    },
  ]);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const videoRef = useRef<any>(null);
  const [mediaProgress, setMediaProgress] = useState(0);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    startMediaProgress();
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [currentStoryIndex, currentMediaIndex]);

  const startMediaProgress = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
    const currentMedia = stories[currentStoryIndex].media[currentMediaIndex];
    const duration = currentMedia.duration;

    setMediaProgress(0);
    progressInterval.current = setInterval(() => {
      setMediaProgress(prev => {
        const newProgress = prev + (1000 / duration) * 100;
        if (newProgress >= 100) {
          clearInterval(progressInterval.current!); // Ensure interval is cleared
          handleNextMedia();
          return 100;
        }
        return newProgress;
      });
    }, 1000);
  };

  const handleNextMedia = () => {
    const currentStory = stories[currentStoryIndex];
    if (currentMediaIndex < currentStory.media.length - 1) {
      setCurrentMediaIndex(prev => prev + 1);
    } else {
      handleNextStory();
    }
  };

  const handlePreviousMedia = () => {
    if (currentMediaIndex > 0) {
      setCurrentMediaIndex(prev => prev - 1);
    } else {
      // Optionally go to previous story or do nothing if first media of first story
      navigation.goBack(); // Or handle going back to stories list
    }
  };

  const handleNextStory = () => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
      setCurrentMediaIndex(0);
    } else {
      navigation.goBack(); // All stories viewed
    }
  };

  const handleClose = () => {
    navigation.goBack();
  };

  const currentStory = stories[currentStoryIndex];
  const currentMedia = currentStory.media[currentMediaIndex];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Icon name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <Image source={{ uri: currentStory.user.profilePicture }} style={styles.profilePicture} />
        <Text style={styles.username}>{currentStory.user.username}</Text>
      </View>

      <View style={styles.mediaContainer}>
        {currentMedia.type === 'image' ? (
          <Image source={{ uri: currentMedia.uri }} style={styles.media} resizeMode="contain" />
        ) : (
          <Video
            ref={videoRef}
            source={{ uri: currentMedia.uri }}
            style={styles.media}
            resizeMode="contain"
            paused={mediaProgress >= 100} // Pause when progress is done or next media
            onLoad={() => setMediaProgress(0)} // Reset progress for video
          />
        )}
        <TouchableOpacity style={styles.leftTap} onPress={handlePreviousMedia} />
        <TouchableOpacity style={styles.rightTap} onPress={handleNextMedia} />
      </View>

      <View style={styles.progressBarContainer}>
        {currentStory.media.map((_: any, index: number) => (
          <View
            key={index}
            style={[
              styles.progressBar,
              index < currentMediaIndex && styles.progressBarFilled,
              index === currentMediaIndex && { width: `${mediaProgress}%` },
            ]}
          />
        ))}
      </View>
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
    alignItems: 'center',
    padding: 10,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  closeButton: {
    marginRight: 10,
  },
  profilePicture: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  username: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  mediaContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  media: {
    width: width,
    height: height,
  },
  leftTap: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '50%',
  },
  rightTap: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '50%',
  },
  progressBarContainer: {
    flexDirection: 'row',
    position: 'absolute',
    top: 50,
    left: 10,
    right: 10,
    zIndex: 1,
  },
  progressBar: {
    height: 3,
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 2,
    borderRadius: 5,
  },
  progressBarFilled: {
    backgroundColor: '#fff',
  },
});

export default StoryScreen; 