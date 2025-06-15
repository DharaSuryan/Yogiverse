import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

const StoryViewer = ({ route, navigation }) => {
  const { storyId } = route.params;
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(new Animated.Value(0));

  // Sample stories data
  const stories = [
    {
      id: '1',
      user: {
        username: 'yoga_master',
        image: 'https://picsum.photos/400',
      },
      media: [
        { type: 'image', url: 'https://picsum.photos/500' },
        { type: 'image', url: 'https://picsum.photos/501' },
        { type: 'image', url: 'https://picsum.photos/502' },
      ],
    },
  ];

  const currentStory = stories.find(story => story.id === storyId);

  useEffect(() => {
    startStoryProgress();
  }, [currentStoryIndex]);

  const startStoryProgress = () => {
    setProgress(new Animated.Value(0));
    Animated.timing(progress, {
      toValue: 1,
      duration: 5000,
      useNativeDriver: false,
    }).start(() => {
      if (currentStoryIndex < currentStory.media.length - 1) {
        setCurrentStoryIndex(prev => prev + 1);
      } else {
        navigation.goBack();
      }
    });
  };

  const handlePress = (side) => {
    if (side === 'left') {
      if (currentStoryIndex > 0) {
        setCurrentStoryIndex(prev => prev - 1);
      } else {
        navigation.goBack();
      }
    } else {
      if (currentStoryIndex < currentStory.media.length - 1) {
        setCurrentStoryIndex(prev => prev + 1);
      } else {
        navigation.goBack();
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        {currentStory.media.map((_, index) => (
          <View key={index} style={styles.progressBarContainer}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  width: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
                index === currentStoryIndex && styles.activeProgressBar,
              ]}
            />
          </View>
        ))}
      </View>

      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image source={{ uri: currentStory.user.image }} style={styles.userImage} />
          <Text style={styles.username}>{currentStory.user.username}</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="close" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <TouchableOpacity
          style={styles.leftPress}
          onPress={() => handlePress('left')}
        />
        <Image
          source={{ uri: currentStory.media[currentStoryIndex].url }}
          style={styles.storyImage}
        />
        <TouchableOpacity
          style={styles.rightPress}
          onPress={() => handlePress('right')}
        />
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
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 2,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#fff',
  },
  activeProgressBar: {
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
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
  userImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  username: {
    color: '#fff',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  leftPress: {
    flex: 1,
  },
  rightPress: {
    flex: 1,
  },
  storyImage: {
    width: width,
    height: height,
    resizeMode: 'contain',
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

export default StoryViewer; 