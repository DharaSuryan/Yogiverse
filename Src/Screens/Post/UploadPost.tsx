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
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'react-native-image-picker';
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

  // Open gallery on mount if isFromStory
  useEffect(() => {
    if (isFromStory) {
      handleMediaPicker('mixed');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Unified media picker for both gallery and camera
  const handleMediaPicker = (mediaType: 'photo' | 'video' | 'mixed', fromCamera = false) => {
    const picker = fromCamera ? ImagePicker.launchCamera : ImagePicker.launchImageLibrary;
    picker(
      {
        mediaType,
        includeBase64: false,
        maxHeight: 2000,
        maxWidth: 2000,
      },
      (response) => {
        if (response.didCancel) {
          // User cancelled
        } else if (response.errorCode) {
          Alert.alert('Error', response.errorMessage);
        } else if (response.assets && response.assets[0]) {
          const asset = response.assets[0];
          setSelectedMedia(asset.uri ?? null);
          setMediaMeta({
            type: asset.type || 'image/jpeg',
            name: asset.fileName || (asset.type?.startsWith('video') ? 'story.mp4' : 'story.jpg'),
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
        

        console.log("Media Meta",JSON.stringify(formData));
        try {
          formData.append('caption', caption);
          console.log('caption', caption);
          formData.append('is_highlighted', isHighlighted ? 'true' : 'false');
          console.log('is_highlighted', isHighlighted ? 'true' : 'false');
          formData.append('media_file', {
            uri: selectedMedia,
            type: mediaMeta.type,
            name: mediaMeta.name,
          });
          console.log('media_file', { uri: selectedMedia, type: mediaMeta.type, name: mediaMeta.name });
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
          console.log('media_file', { uri: selectedMedia, type: mediaMeta.type, name: mediaMeta.name });
          
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="#000" />
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
        {selectedMedia ? (
          mediaMeta.type.startsWith('video') ? (
            <View style={styles.previewImage}>
              <Text style={{textAlign:'center',marginTop:180}}>Video selected: {mediaMeta.name}</Text>
            </View>
          ) : (
            <Image source={{ uri: selectedMedia }} style={styles.previewImage} />
          )
        ) : (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderText}>Select an image or video to create your {isFromStory ? 'story' : 'post'}</Text>
          </View>
        )}

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => handleMediaPicker('mixed', false)}>
            <Ionicons name="images" size={24} color="#000" />
            <Text style={styles.optionText}>Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => handleMediaPicker('mixed', true)}>
            <Ionicons name="camera" size={24} color="#000" />
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
});

export default UploadPost; 