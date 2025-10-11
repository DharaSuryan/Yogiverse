import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SectionList,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
const Ionicons = require('react-native-vector-icons/Ionicons').default;
import Video from 'react-native-video';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const { width, height } = Dimensions.get('window');

interface Story {
  id: number;
  user: number;
  profile: {
    id: number;
    bio: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_no: string;
    username: string;
    user: number;
    profile_picture: string;
    profile_link: string;
    external_links: any[];
    country: string;
    state: string;
    city: string;
  };
  media_file: string;
  caption: string;
  expires_at: string;
  is_highlighted: boolean;
  created_at: string;
  updated_at: string;
  is_seen: boolean;
  is_video: boolean;
  mentioned_users: any[];
  is_mention: boolean;
  mention_user_data: string;
}

interface HighlightData {
  id: number;
  title: string;
  cover_story: any;
  cover_image: string;
  stories: Story[];
  created_at: string;
}

const HighlightViewer = ({ route, navigation }) => {
  const { highlightId, userId } = route.params;
  const [highlightData, setHighlightData] = useState<HighlightData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const sectionListRef = useRef<SectionList>(null);

  const STORY_DURATION = 5000; // 5 seconds per story

  useEffect(() => {
    fetchHighlightData();
  }, [highlightId, userId]);

  useEffect(() => {
    if (highlightData && highlightData.stories.length > 0) {
      startProgress();
    }
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [currentStoryIndex, highlightData]);

  const fetchHighlightData = async () => {
    setLoading(true);
    setError(null);
    try {
      const authToken = await AsyncStorage.getItem('accessToken');
      const headers = {
        Accept: 'application/json',
        Authorization: `Bearer ${authToken}`,
      };
      const response = await axios.get(
        `https://pashuahar.com/highlights/${highlightId}/?user_id=${userId}`,
        { headers }
      );
      console.log('Highlight data response:', response.data);
      // If no stories or empty data, treat as no data
      if (
        !response.data ||
        !response.data.stories ||
        !Array.isArray(response.data.stories) ||
        response.data.stories.length === 0
      ) {
        setHighlightData(null);
        setError('No stories available in this highlight.');
      } else {
        setHighlightData(response.data);
      }
    } catch (err) {
      setError('Failed to load highlight stories');
      setHighlightData(null);
      Alert.alert('Error', 'Failed to load highlight stories');
    } finally {
      setLoading(false);
    }
  };

  const startProgress = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
    
    setProgress(0);
    progressInterval.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + (100 / (STORY_DURATION / 100));
      });
    }, 100);
  };

  const handleNext = () => {
    if (highlightData && currentStoryIndex < highlightData.stories.length - 1) {
      const newIndex = currentStoryIndex + 1;
      setCurrentStoryIndex(newIndex);
      setProgress(0);
      // Scroll to the next story
      sectionListRef.current?.scrollToLocation({
        sectionIndex: 0,
        itemIndex: newIndex,
        animated: true,
      });
    } else {
      navigation.goBack();
    }
  };

  const handlePrevious = () => {
    if (currentStoryIndex > 0) {
      const newIndex = currentStoryIndex - 1;
      setCurrentStoryIndex(newIndex);
      setProgress(0);
      // Scroll to the previous story
      sectionListRef.current?.scrollToLocation({
        sectionIndex: 0,
        itemIndex: newIndex,
        animated: true,
      });
    }
  };

  const handleTouchStart = (event: any) => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
  };

  const handleTouchEnd = (event: any) => {
    const touchEndX = event.nativeEvent.locationX;
    const screenWidth = width;
    
    if (touchEndX < screenWidth / 2) {
      handlePrevious();
    } else {
      handleNext();
    }
    
    startProgress();
  };

  const renderStory = ({ item, index }: { item: Story; index: number }) => {
    const isCurrentStory = index === currentStoryIndex;
    const isVideo = item.is_video || item.media_file.toLowerCase().includes('.mp4');
    // console.log("item",item.media_file);
    

    return (
      <View style={styles.storyContainer}>
        {/* Progress bars */}
        <View style={styles.progressContainer}>
          {highlightData?.stories.map((_, storyIndex) => (
            <View key={storyIndex} style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: storyIndex < currentStoryIndex 
                      ? '100%' 
                      : storyIndex === currentStoryIndex 
                        ? `${progress}%` 
                        : '0%'
                  }
                ]}
              />
            </View>
          ))}
        </View>

        {/* Header with user info */}
        <View style={styles.storyHeader}>
          <View style={styles.userInfo}>
            <Image
              source={
                item.profile.profile_picture
                  ? { uri: item.profile.profile_picture }
                  : require('../../Assets/userProfile.png')
              }
              style={styles.userAvatar}
            />
            <Text style={styles.username}>{item.profile.username}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Story content */}
        <View style={styles.storyContent}>
          {isVideo ? (
            <Video
              source={{ uri: item.media_file }}
              style={styles.storyMedia}
              resizeMode="cover"
              repeat={false}
              paused={!isCurrentStory}
              onLoadStart={() => setVideoLoading(true)}
              onLoad={() => setVideoLoading(false)}
              onError={() => setVideoLoading(false)}
              onEnd={() => handleNext()}
            />
          ) : (
            <Image
              source={{ uri: item.media_file }}
              style={styles.storyMedia}
              resizeMode="cover"
            />
          )}

          {videoLoading && (
            <ActivityIndicator
              size="large"
              color="#fff"
              style={styles.videoLoading}
            />
          )}
        </View>

        {/* Caption */}
        {item.caption && (
          <View style={styles.captionContainer}>
            <Text style={styles.captionText}>{item.caption}</Text>
          </View>
        )}
        
        {/* Mentioned Users */}
        {item.mentioned_users && item.mentioned_users.length > 0 && (
          <View style={styles.captionContainer}>
            <View style={styles.mentionsContainer}>
              <Text style={styles.mentionsLabel}>Mentioned:</Text>
              {item.mentioned_users.map((mentionedUser, index) => (
                <TouchableOpacity
                  key={mentionedUser.id}
                  onPress={() => {
                    navigation.navigate('UserProfile', {
                      userId: mentionedUser.id.toString(),
                      isFromSearch: true,
                    });
                  }}
                  style={styles.mentionItem}
                >
                  <Text style={styles.mentionUsername}>
                    @{mentionedUser.username}
                  </Text>
                  {index < item.mentioned_users.length - 1 && (
                    <Text style={styles.mentionSeparator}>, </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.emptyInner}>
          <ActivityIndicator size="large" color="#bea063" />
          <Text style={styles.loadingText}>Loading stories...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show placeholder if no data or error
  if (error || !highlightData || !highlightData.stories || highlightData.stories.length === 0) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <View style={styles.emptyInner}>
          <Ionicons name="image-outline" size={72} color="#bea063" />
          <Text style={styles.emptyTitle}>No Stories</Text>
          <Text style={styles.emptySubtitle}>There are no stories in this highlight{"\n"}yet.</Text>
        </View>
        {/* <TouchableOpacity style={styles.retryButton} onPress={fetchHighlightData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity> */}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={styles.container}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <SectionList
          ref={sectionListRef}
          sections={[{ title: '', data: highlightData.stories }]}
          renderItem={renderStory}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEnabled={true}
          getItemLayout={(data, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
          initialScrollIndex={currentStoryIndex}
          renderSectionHeader={() => null}
          onMomentumScrollEnd={(event) => {
            const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
            if (newIndex !== currentStoryIndex) {
              setCurrentStoryIndex(newIndex);
              setProgress(0);
            }
          }}
        />
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#bea063',
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyInner: {
    alignItems: 'center',
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 22,
    fontWeight: '700',
    color: '#bea063',
  },
  emptySubtitle: {
    marginTop: 8,
    fontSize: 14,
    color: '#bea063',
    textAlign: 'center',
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
  retryButton: {
    backgroundColor: '#bea063',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  storyContainer: {
    width: width,
    height: height,
    backgroundColor: '#000',
  },
  progressContainer: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 10,
    flexDirection: 'row',
    gap: 4,
  },
  progressBarContainer: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 1,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 1,
  },
  storyHeader: {
    position: 'absolute',
    top: 80,
    left: 16,
    right: 16,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  username: {
    color: '#bea063',
    fontSize: 16,
    fontWeight: '600',
  },
  storyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyMedia: {
    width: '100%',
    height: '100%',
  },
  videoLoading: {
    position: 'absolute',
  },
  captionContainer: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  captionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  // Mention styles
  mentionsContainer: {
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mentionsLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    marginRight: 4,
  },
  mentionItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mentionUsername: {
    color: '#bea063',
    fontSize: 14,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  mentionSeparator: {
    color: '#fff',
    fontSize: 14,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});

export default HighlightViewer;