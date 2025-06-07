import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
  TextInput,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../Navigation/types';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Story } from '../../Types';

type StoryViewerProps = {
  navigation: NativeStackNavigationProp<HomeStackParamList, 'StoryViewer'>;
  route: {
    params: {
      stories: Story[];
      initialIndex: number;
    };
  };
};

const { width, height } = Dimensions.get('window');
const STORY_DURATION = 5000; // 5 seconds per story

const StoryViewer: React.FC<StoryViewerProps> = ({ navigation, route }) => {
  const { stories, initialIndex } = route.params;
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPaused, setIsPaused] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const currentStory = stories[currentIndex];

  useEffect(() => {
    if (!isPaused) {
      progressAnim.setValue(0);
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: STORY_DURATION,
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished && !isPaused) {
          if (currentIndex < stories.length - 1) {
            setCurrentIndex(currentIndex + 1);
          } else {
            navigation.goBack();
          }
        }
      });
    }
  }, [currentIndex, isPaused]);

  const handlePress = () => {
    setIsPaused(!isPaused);
  };

  const handleLongPress = () => {
    setIsPaused(true);
  };

  const handleRelease = () => {
    setIsPaused(false);
  };

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      navigation.goBack();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const renderProgressBars = () => {
    return (
      <View style={styles.progressContainer}>
        {stories.map((_, index) => (
          <View key={index} style={styles.progressBarContainer}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  width: index === currentIndex
                    ? progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      })
                    : index < currentIndex
                    ? '100%'
                    : '0%',
                },
              ]}
            />
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderProgressBars()}
      
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image
            source={{ uri: currentStory.userProfilePicture }}
            style={styles.userAvatar}
          />
          <Text style={styles.username}>{currentStory.username}</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.storyContainer}
        onPress={handlePress}
        onLongPress={handleLongPress}
        onPressOut={handleRelease}
        activeOpacity={1}>
        <Image source={{ uri: currentStory.mediaUrl }} style={styles.storyImage} />
      </TouchableOpacity>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlButton, styles.leftControl]}
          onPress={handlePrevious}>
          <View style={styles.touchArea} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.controlButton, styles.rightControl]}
          onPress={handleNext}>
          <View style={styles.touchArea} />
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <TextInput
          style={styles.messageInput}
          placeholder="Send message"
          placeholderTextColor="#fff"
        />
        <TouchableOpacity style={styles.sendButton}>
          <Ionicons name="paper-plane" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
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
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  username: {
    color: '#fff',
    fontWeight: '600',
  },
  storyContainer: {
    flex: 1,
  },
  storyImage: {
    width: width,
    height: height,
    resizeMode: 'cover',
  },
  controls: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
  },
  controlButton: {
    flex: 1,
    height: '100%',
  },
  leftControl: {
    left: 0,
  },
  rightControl: {
    right: 0,
  },
  touchArea: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  messageInput: {
    flex: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 15,
    color: '#fff',
    marginRight: 10,
  },
  sendButton: {
    padding: 5,
  },
});

export default StoryViewer; 