import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  Alert,
  Switch,
  Modal,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'react-native-image-picker';
import Video from 'react-native-video';
import { PostApi } from '../../Api/PostApi';
import { useRoute } from '@react-navigation/native';
import { CreatePostStackParamList } from '../../Navigation/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getFCMToken } from 'Src/Utils/NotificationConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { postPosts, postStories } from '../../Api/Api';

// Helper for story API
const STORY_API_URL = 'https://pashuahar.com/stories';

// Fix props type for navigation/route
// @ts-ignore
const UploadPost = ({ navigation, route }) => {
  const isFromStory = route?.params?.isFromStory ?route?.params?.isFromStory : false;
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [mediaMeta, setMediaMeta] = useState({ type: '', name: '' });
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [showCameraOptions, setShowCameraOptions] = useState(false);

  // Open gallery on mount if isFromStory
  useEffect(() => {
    if (isFromStory) {
      handleMediaPicker('mixed');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle camera capture (photo or video)
  const handleCameraCapture = (mediaType: 'photo' | 'video') => {
    setShowCameraOptions(false);
    ImagePicker.launchCamera(
      {
        mediaType,
        includeBase64: false,
        maxHeight: 2000,
        maxWidth: 2000,
        quality: 0.8,
        videoQuality: 'medium',
        durationLimit: mediaType === 'video' ? 60 : undefined, // 60 seconds for video
      },
      (response) => {
        console.log("Camera response:", response);

        if (response.didCancel) {
          console.log('User cancelled camera');
        } else if (response.errorCode) {
          console.error('Camera error:', response.errorMessage);
          Alert.alert('Error', response.errorMessage);
        } else if (response.assets && response.assets.length > 0) {
          setSelectedMedia(response.assets[0].uri ?? null);
          setMediaMeta({
            type: response.assets[0].type || 'image/jpeg',
            name: response.assets[0].fileName || (response.assets[0].type?.startsWith('video') ? 'camera_video.mp4' : 'camera_photo.jpg'),
          });
        }
      }
    );
  };

  // Unified media picker for both gallery and camera
  const handleMediaPicker = (mediaType: 'photo' | 'video' | 'mixed', fromCamera = false) => {
    if (fromCamera) {
      setShowCameraOptions(true);
      return;
    }

    const picker = ImagePicker.launchImageLibrary;
    picker(
      {
        mediaType,
        includeBase64: false,
        maxHeight: 2000,
        maxWidth: 2000,
      },
      (response) => {
        console.log("response ----->>>",response)

        if (response.didCancel) {
          // User cancelled
        } else if (response.errorCode) {
          Alert.alert('Error', response.errorMessage);
        } else if (response.assets && response.assets.length > 0) {
          setSelectedMedia(response.assets[0].uri ?? null);
          // navigation.navigate("PostPreviewScreen",{images:response.assets[0].uri})
                setMediaMeta({
                  type: response.assets[0].type || 'image/jpeg',
                  name: response.assets[0].fileName || (response.assets[0].type?.startsWith('video') ? 'story.mp4' : 'story.jpg'),
                });
        }
      }
    );
  };

  // Share handler for both story and post
  const handleShare = async () => {
    if (!selectedMedia || !caption.trim()) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      console.log("Is From Story",isFromStory);
      if (isFromStory) {
        try {
          formData.append('caption', caption);
          formData.append('is_highlighted', isHighlighted ? 'true' : 'false');
          
          // Add media_metadata for stories (same as posts)
          const isVideo = mediaMeta.type.startsWith('video');
          formData.append('media_metadata', JSON.stringify([{ is_video: isVideo }]));
          
          formData.append('media_file', {
            uri: selectedMedia,
            type: mediaMeta.type,
            name: mediaMeta.name,
          });

          console.log('Story FormData:', JSON.stringify(formData));
          await postStories({ formData });
           Alert.alert('Success', 'Your story has been uploaded!');
           navigation.goBack();
      
        } catch (err) {
          console.log("Error",err);
          throw err;
        }
      } else {
        // Post upload logic (existing)
        
        
        try {
          formData.append('caption', caption);
          
          formData.append('is_draft', 'false');
          
          formData.append('allow_comments', 'false');
          
          formData.append('hide_like_count', 'false');
          
          const isVideo = mediaMeta.type.startsWith('video');
          
          formData.append('media_metadata', JSON.stringify([{ is_video: isVideo }]));
          formData.append('location', 'india');
          
          formData.append('media_files', {
            uri: selectedMedia,
            type: mediaMeta.type,
            name: mediaMeta.name,
          });
          console.log("forma data ----->>>",JSON.stringify(formData))
          await postPosts({ formData });
           Alert.alert('Success', 'Your Post has been uploaded!');
          navigation.goBack();
        } catch (err) {
          console.log('Error', err);
          throw err;
        }
      }
    } catch (e: any) {
      setError('Failed to upload.');
      Alert.alert('Error', 'Failed to upload.');
    } finally {
      setUploading(false);
    }
  };

  // Render media preview
  const renderMediaPreview = () => {
    if (!selectedMedia) {
      return (
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderText}>Select an image or video to create your {isFromStory ? 'story' : 'post'}</Text>
        </View>
      );
    }

    if (mediaMeta.type.startsWith('video')) {
      return (
        <View style={styles.videoContainer}>
          <Video
            source={{ uri: selectedMedia }}
            style={styles.videoPreview}
            resizeMode="cover"
            repeat
            paused={false}
            controls={true}
            onError={(error) => console.log('Video error:', error)}
            onLoad={() => console.log('Video loaded successfully')}
          />
          <View style={styles.videoOverlay}>
            <Text style={styles.videoLabel}>Video: {mediaMeta.name}</Text>
          </View>
        </View>
      );
    }

    return (
      <Image 
        source={{ uri: selectedMedia }} 
        style={styles.previewImage}
        resizeMode="cover"
        onLoad={() => console.log('Image loaded successfully')}
        onError={(error) => console.log('Image error:', error)}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          {React.createElement(Ionicons as any, { name: 'close', size: 24, color: '#000' })}
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isFromStory ? 'New Story' : 'New Post'}</Text>
        <TouchableOpacity
          onPress={handleShare}
          disabled={!selectedMedia || !caption.trim() || uploading}
          style={[
            styles.shareButton,
            (!selectedMedia || !caption.trim() || uploading) && styles.shareButtonDisabled,
          ]}>
          <Text
            style={[
              styles.shareButtonText,
              (!selectedMedia || !caption.trim() || uploading) && styles.shareButtonTextDisabled,
            ]}>
            {uploading ? 'Uploading...' : 'Share'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {renderMediaPreview()}

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => handleMediaPicker('mixed', false)}>
            {React.createElement(Ionicons as any, { name: 'images', size: 24, color: '#000' })}
            <Text style={styles.optionText}>Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => handleMediaPicker('mixed', true)}>
            {React.createElement(Ionicons as any, { name: 'camera', size: 24, color: '#000' })}
            <Text style={styles.optionText}>Camera</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.captionContainer}>
          <TextInput
            style={styles.captionInput}
            placeholder="Write a caption..."
            value={caption}
            onChangeText={setCaption}
            multiline
            editable={!uploading}
          />
        </View>
        {isFromStory && (
          <View style={{flexDirection:'row',alignItems:'center',paddingLeft:15,marginTop:10}}>
            <Text style={{fontSize:16,marginRight:10}}>Highlight this story?</Text>
            <Switch value={isHighlighted} onValueChange={setIsHighlighted} disabled={uploading} />
          </View>
        )}
      </ScrollView>

      {/* Camera Options Modal */}
      <Modal
        visible={showCameraOptions}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCameraOptions(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose Camera Option</Text>
            
            <TouchableOpacity
              style={styles.cameraOption}
              onPress={() => handleCameraCapture('photo')}
            >
              {React.createElement(Ionicons as any, { name: 'camera', size: 32, color: '#0095f6' })}
              <Text style={styles.cameraOptionText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cameraOption}
              onPress={() => handleCameraCapture('video')}
            >
              {React.createElement(Ionicons as any, { name: 'videocam', size: 32, color: '#0095f6' })}
              <Text style={styles.cameraOptionText}>Record Video</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowCameraOptions(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {error && (
        <Text style={{ color: 'red', textAlign: 'center', marginTop: 10 }}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  shareButton: {
    paddingHorizontal: 15,
  },
  shareButtonDisabled: {
    opacity: 0.5,
  },
  shareButtonText: {
    color: '#0095f6',
    fontWeight: '600',
  },
  shareButtonTextDisabled: {
    color: '#999',
  },
  content: {
    flex: 1,
  },
  previewImage: {
    width: '100%',
    height: 400,
    resizeMode: 'cover',
  },
  videoContainer: {
    width: '100%',
    height: 400,
    position: 'relative',
    backgroundColor: '#000',
  },
  videoPreview: {
    width: '100%',
    height: 400,
  },
  videoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
  },
  videoLabel: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  placeholderContainer: {
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  placeholderText: {
    color: '#666',
    fontSize: 16,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionButton: {
    alignItems: 'center',
  },
  optionText: {
    marginTop: 5,
    color: '#000',
  },
  captionContainer: {
    padding: 15,
  },
  captionInput: {
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    color: '#000',
  },
  cameraOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    width: '100%',
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  cameraOptionText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#000',
  },
  cancelButton: {
    marginTop: 10,
    padding: 10,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
});

export default UploadPost; 