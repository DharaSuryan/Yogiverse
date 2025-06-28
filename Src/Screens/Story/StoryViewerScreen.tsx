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
import { Story } from '../../Types/index';

const { width, height } = Dimensions.get('window');
const STORY_DURATION = 5000; // 5 seconds per media

interface StoryWithMedia extends Story {
  media?: { uri: string; type: string }[];
  caption?: string;
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
  console.log("=== STORY VIEWER DEBUG ===");
  console.log("story ------->>>", story);
  console.log("story.media ------->>>", story.media);
  console.log("story.mediaUrl ------->>>", story.mediaUrl);
  console.log("story.type ------->>>", story.type);
  console.log("story.imageUrl ------->>>", story.imageUrl);
  console.log("All story keys:", Object.keys(story));
  console.log("Story media_file field:", (story as any).media_file);
  console.log("Story media_files field:", (story as any).media_files);
  
  // Helper function to determine media type from URL
  const getMediaTypeFromUrl = (url: string): string => {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.endsWith('.mp4') || lowerUrl.endsWith('.mov') || lowerUrl.endsWith('.avi') || 
        lowerUrl.endsWith('.mkv') || lowerUrl.endsWith('.webm')) {
      return 'video/mp4';
    } else if (lowerUrl.endsWith('.png')) {
      return 'image/png';
    } else if (lowerUrl.endsWith('.jpg') || lowerUrl.endsWith('.jpeg')) {
      return 'image/jpeg';
    } else if (lowerUrl.endsWith('.gif')) {
      return 'image/gif';
    } else if (lowerUrl.endsWith('.webp')) {
      return 'image/webp';
    } else {
      return 'image/jpeg'; // Default to image
    }
  };
  
  // Handle different possible data structures
  let media: { uri: string; type: string }[] = [];
  
  if (story.media && story.media.length > 0) {
    console.log("Using story.media array");
    media = story.media;
  } else if (story.mediaUrl) {
    console.log("Using story.mediaUrl");
    // Determine media type by file extension
    const mediaType = getMediaTypeFromUrl(story.mediaUrl);
    media = [{ uri: story.mediaUrl, type: mediaType }];
  } else if (story.imageUrl) {
    console.log("Using story.imageUrl");
    // Fallback to imageUrl if mediaUrl is not available
    const mediaType = getMediaTypeFromUrl(story.imageUrl);
    media = [{ uri: story.imageUrl, type: mediaType }];
  } else if ((story as any).media_file) {
    console.log("Using story.media_file");
    // Check for media_file field (common in API responses)
    const mediaFile = (story as any).media_file;
    const mediaType = getMediaTypeFromUrl(mediaFile);
    media = [{ uri: mediaFile, type: mediaType }];
  } else if ((story as any).media_files) {
    console.log("Using story.media_files");
    // Check for media_files field
    const mediaFiles = (story as any).media_files;
    if (Array.isArray(mediaFiles)) {
      media = mediaFiles.map((file: any) => ({
        uri: typeof file === 'string' ? file : file.uri || file.url,
        type: typeof file === 'string' ? getMediaTypeFromUrl(file) : (file.type || getMediaTypeFromUrl(file.uri || file.url))
      }));
    } else if (typeof mediaFiles === 'string') {
      const mediaType = getMediaTypeFromUrl(mediaFiles);
      media = [{ uri: mediaFiles, type: mediaType }];
    }
  }
  
  console.log("Final media array ------->>>", media);
  console.log("Media array length:", media.length);
  console.log("=== END STORY VIEWER DEBUG ===");
  
  const [mediaIndex, setMediaIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const progressInterval = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (media.length > 0) {
      startProgress();
    }
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [mediaIndex, media.length]);

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

  // Check if media is video based on file extension or MIME type
  const isVideo = (mediaItem: { uri: string; type: string }) => {
    const isVideoByType = mediaItem.type.startsWith('video');
    const isVideoByExtension = mediaItem.uri.toLowerCase().endsWith('.mp4') ||
                               mediaItem.uri.toLowerCase().endsWith('.mov') ||
                               mediaItem.uri.toLowerCase().endsWith('.avi') ||
                               mediaItem.uri.toLowerCase().endsWith('.mkv') ||
                               mediaItem.uri.toLowerCase().endsWith('.webm');
    
    // Explicitly check for image extensions to ensure they're treated as images
    const isImageByExtension = mediaItem.uri.toLowerCase().endsWith('.png') ||
                               mediaItem.uri.toLowerCase().endsWith('.jpg') ||
                               mediaItem.uri.toLowerCase().endsWith('.jpeg') ||
                               mediaItem.uri.toLowerCase().endsWith('.gif') ||
                               mediaItem.uri.toLowerCase().endsWith('.bmp') ||
                               mediaItem.uri.toLowerCase().endsWith('.webp');
    
    // Use the helper function to get accurate media type
    const detectedType = getMediaTypeFromUrl(mediaItem.uri);
    const isVideoByDetectedType = detectedType.startsWith('video');
    
    console.log("Video check for:", mediaItem.uri);
    console.log("Type:", mediaItem.type, "isVideoByType:", isVideoByType);
    console.log("Extension check:", isVideoByExtension);
    console.log("Image extension check:", isImageByExtension);
    console.log("Detected type:", detectedType, "isVideoByDetectedType:", isVideoByDetectedType);
    
    // If it's explicitly an image extension, return false (not video)
    if (isImageByExtension) {
      console.log("Detected as image by extension");
      return false;
    }
    
    // Use the most accurate detection method
    return isVideoByType || isVideoByExtension || isVideoByDetectedType;
  };

  const renderMedia = () => {
    const item = media[mediaIndex];
    console.log("Rendering media item ----->>>>", item);
    
    if (!item || !item.uri) {
      console.log("No media item or URI found");
      return (
        <View style={{ width, height, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 16 }}>No media available</Text>
        </View>
      );
    }
    
    const videoCheck = isVideo(item);
    console.log("Is video:", videoCheck);
    
    if (videoCheck) {
      console.log("Rendering video with URI:", item.uri);
      return (
        <Video
          source={{ uri: item.uri }}
          style={{ width, height }}
          resizeMode="cover"
          controls
          paused={false}
          onEnd={handleNextMedia}
          onError={(error) => console.log('Video error:', error)}
          onLoad={() => console.log('Video loaded successfully')}
        />
      );
    }
    
    console.log("Rendering image with URI:", item.uri);
    return (
      <Image
        source={{ uri: item.uri }}
        style={{ width, height }}
        resizeMode="contain"
        onLoad={() => console.log('Image loaded successfully')}
        onError={(error) => console.log('Image error:', error)}
      />
    );
  };

  // Don't render if no media
  if (media.length === 0) {
    return (
      <View style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 16 }}>No media found in story</Text>
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
          {React.createElement(Ionicons as any, { name: 'close', size: 24, color: '#fff' })}
        </TouchableOpacity>
      </View>
    );
  }

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
        
        {/* Caption */}
        {story.caption && story.caption.trim() !== '' && (
          <View style={styles.captionContainer}>
            <Text style={styles.captionText}>{story.caption}</Text>
          </View>
        )}
        
        {/* Location */}
        {story.location && (
          <View style={styles.locationContainer}>
            {React.createElement(Ionicons as any, { name: 'location-outline', size: 16, color: '#fff' })}
            <Text style={styles.locationText}>{story.location}</Text>
          </View>
        )}
      </TouchableOpacity>
      {/* Close Button */}
      <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
        {React.createElement(Ionicons as any, { name: 'close', size: 24, color: '#fff' })}
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
  captionContainer: {
    position: 'absolute',
    bottom: 80,
    left: 15,
    right: 15,
    padding: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 10,
    maxHeight: 100,
  },
  captionText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 20,
    textAlign: 'center',
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