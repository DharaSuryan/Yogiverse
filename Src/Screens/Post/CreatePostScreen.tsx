import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  TextInput,
  ScrollView,
  FlatList,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import { PostApi } from '../../Api/PostApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Navigation/types';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'react-native-image-picker';

// Workaround for Ionicons TypeScript issue
const Icon = require('react-native-vector-icons/Ionicons').default;

type CreatePostScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CreatePost'>;

// Types
interface MediaItem {
  uri: string;
  type: string;
  name: string;
}

interface PostFormData {
  media: MediaItem[];
  caption: string;
  allowComments: boolean;
  hideLikeCount: boolean;
}

interface ReelFormData extends PostFormData {
  duration: number;
}

interface StoryFormData extends PostFormData {
  isTemporary: boolean;
}

const CreatePostScreen: React.FC = () => {
  const navigation = useNavigation<CreatePostScreenNavigationProp>();
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [mediaMeta, setMediaMeta] = useState({ type: '', name: '' });
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedType, setSelectedType] = useState<'post' | 'reel' | 'story'>('post');
  const [navigated, setNavigated] = useState(false);
  const [allowComments, setAllowComments] = useState(true);
  const [hideLikeCount, setHideLikeCount] = useState(false);
  const [duration, setDuration] = useState<number>(30);

  useEffect(() => {
    handleImagePicker();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleImagePicker = () => {
    ImagePicker.launchImageLibrary({
      mediaType: 'mixed',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    }, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        Alert.alert('Error', response.errorMessage);
      } else if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        setSelectedMedia(asset.uri ?? null);
        setMediaMeta({
          type: asset.type || 'image/jpeg',
          name: asset.fileName || 'post.jpg',
        });
      }
    });
  };

  const handleCamera = () => {
    ImagePicker.launchCamera({
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    }, (response) => {
      if (response.didCancel) {
        console.log('User cancelled camera');
      } else if (response.errorCode) {
        Alert.alert('Error', response.errorMessage);
      } else if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        setSelectedMedia(asset.uri ?? null);
        setMediaMeta({
          type: asset.type || 'image/jpeg',
          name: asset.fileName || 'post.jpg',
        });
      }
    });
  };

  const handleDurationChange = (value: string) => {
    const num = parseInt(value);
    if (!isNaN(num)) {
      setDuration(num);
    }
  };

  const handleToggleComments = () => {
    setAllowComments(!allowComments);
  };

  const handleToggleLikeCount = () => {
    setHideLikeCount(!hideLikeCount);
  };

  const handleSubmit = async () => {
    if (!selectedMedia || !caption.trim()) return;
    setUploading(true);
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const formData = new FormData();
      
      // Add common fields
      formData.append('allow_comments', allowComments.toString());
      formData.append('hide_like_count', hideLikeCount.toString());

      // Add media files
      if (selectedMedia) {
        formData.append('media_file', {
          uri: selectedMedia,
          type: mediaMeta.type,
          name: mediaMeta.name,
        });
      }

      // Add specific fields based on post type
      switch (selectedType) {
        case 'post':
          formData.append('media_metadata[0]', JSON.stringify({
            is_video: mediaMeta.type?.includes('video') || false,
          }));
          break;
        case 'reel':
          formData.append('is_draft', 'false');
          formData.append('duration', duration.toString());
          break;
        case 'story':
          formData.append('hide_like_count', hideLikeCount.toString());
          break;
      }

      // Submit to appropriate endpoint
      let response;
      switch (selectedType) {
        case 'post':
          response = await PostApi.createPost(formData);
          break;
        case 'reel':
          response = await PostApi.createReel(formData);
          break;
        case 'story':
          response = await PostApi.createStory(formData);
          break;
      }

      navigation.goBack();
    } catch (error) {
      console.error('Post submission error:', error);
      Alert.alert('Error', 'Failed to upload post.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="close" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>
          {selectedType === 'post' ? 'Create Post' : 
           selectedType === 'reel' ? 'Create Reel' : 'Create Story'}
        </Text>
        <TouchableOpacity
          onPress={handleSubmit}
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
          <Image source={{ uri: selectedMedia }} style={styles.previewImage} />
        ) : (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderText}>Select an image or video to create your post</Text>
          </View>
        )}

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={handleImagePicker}>
            <Ionicons name="images" size={24} color="#000" />
            <Text style={styles.optionText}>Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionButton}
            onPress={handleCamera}>
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

        <View style={styles.settingsContainer}>
          <View style={styles.settingRow}>
            <Text style={styles.settingText}>Allow Comments</Text>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                allowComments && styles.toggleButtonActive
              ]}
              onPress={handleToggleComments}
            >
              <Icon 
                name={allowComments ? 'checkmark' : 'close'} 
                size={20} 
                color={allowComments ? '#fff' : '#000'}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingText}>Hide Like Count</Text>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                hideLikeCount && styles.toggleButtonActive
              ]}
              onPress={handleToggleLikeCount}
            >
              <Icon 
                name={hideLikeCount ? 'checkmark' : 'close'} 
                size={20} 
                color={hideLikeCount ? '#fff' : '#000'}
              />
            </TouchableOpacity>
          </View>

          {selectedType === 'reel' && (
            <View style={styles.settingRow}>
              <Text style={styles.settingText}>Duration (seconds)</Text>
              <TextInput
                style={styles.durationInput}
                value={duration.toString()}
                onChangeText={handleDurationChange}
                keyboardType="numeric"
              />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
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
  title: {
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
  settingsContainer: {
    marginBottom: 20,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingText: {
    fontSize: 16,
  },
  toggleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#0095f6',
    borderColor: '#0095f6',
  },
  durationInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    width: 100,
    textAlign: 'center',
  },
});

export default CreatePostScreen; 