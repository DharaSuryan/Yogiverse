import React, { useState } from 'react';
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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import { PostApi } from '../../Api/PostApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Navigation/types';

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
  const [caption, setCaption] = useState('');
  const [mediaFiles, setMediaFiles] = useState<MediaItem[]>([]);
  const [selectedType, setSelectedType] = useState<'post' | 'reel' | 'story'>('post');
  const [navigated, setNavigated] = useState(false);
  const [allowComments, setAllowComments] = useState(true);
  const [hideLikeCount, setHideLikeCount] = useState(false);
  const [duration, setDuration] = useState<number>(30);

  const handleMediaSelect = async () => {
    if (navigated) return;
    setNavigated(true);
    try {
      const result = await launchImageLibrary({
        mediaType: 'mixed',
        selectionLimit: selectedType === 'reel' ? 1 : 10,
        quality: 1,
      });
      if (result.assets && result.assets.length > 0) {
        const selectedFiles = result.assets.map((asset, index) => ({
          uri: asset.uri || '',
          type: asset.type || 'image/jpeg',
          name: `media_${index}.${asset.type?.split('/')[1] || 'jpg'}`,
        }));
        setMediaFiles([...mediaFiles, ...selectedFiles]);
      }
    } finally {
      setNavigated(false);
    }
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
      if (mediaFiles.length > 0) {
        const file = mediaFiles[0];
        formData.append('media_file', {
          uri: file.uri,
          type: file.type,
          name: file.name,
        });
      }

      // Add specific fields based on post type
      switch (selectedType) {
        case 'post':
          mediaFiles.forEach((_, index) => {
            formData.append(`media_metadata[${index}]`, JSON.stringify({
              is_video: mediaFiles[index].type?.includes('video') || false,
            }));
          });
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
      // Handle error (show alert to user)
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
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.postTypeContainer}>
          <TouchableOpacity
            style={[styles.postTypeButton, selectedType === 'post' && styles.postTypeSelected]}
            onPress={() => setSelectedType('post')}
          >
            <Text style={[styles.postTypeText, selectedType === 'post' && styles.postTypeSelectedText]}>Post</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.postTypeButton, selectedType === 'reel' && styles.postTypeSelected]}
            onPress={() => setSelectedType('reel')}
          >
            <Text style={[styles.postTypeText, selectedType === 'reel' && styles.postTypeSelectedText]}>Reel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.postTypeButton, selectedType === 'story' && styles.postTypeSelected]}
            onPress={() => setSelectedType('story')}
          >
            <Text style={[styles.postTypeText, selectedType === 'story' && styles.postTypeSelectedText]}>Story</Text>
          </TouchableOpacity>
        </View>

        {mediaFiles.length > 0 && (
          <FlatList
            data={mediaFiles}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item.uri }}
                style={styles.mediaPreview}
              />
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        )}

        <TouchableOpacity 
          style={styles.uploadButton}
          onPress={handleMediaSelect}
        >
          <Icon name="add-circle-outline" size={50} color="#0095f6" />
          <Text style={styles.uploadText}>
            {selectedType === 'reel' ? 'Add Video' : 'Add Media'}
          </Text>
        </TouchableOpacity>

        <View style={styles.captionContainer}>
          <TextInput
            style={styles.captionInput}
            placeholder="Write a caption..."
            value={caption}
            onChangeText={setCaption}
            multiline
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

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>
            {selectedType === 'post' ? 'Create Post' : selectedType === 'reel' ? 'Create Reel' : 'Create Story'}
          </Text>
        </TouchableOpacity>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  postTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  postTypeButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  postTypeSelected: {
    backgroundColor: '#0095f6',
    borderColor: '#0095f6',
  },
  postTypeText: {
    fontSize: 16,
    color: '#000',
  },
  postTypeSelectedText: {
    color: '#fff',
  },
  mediaPreview: {
    width: 100,
    height: 100,
    marginRight: 8,
    borderRadius: 8,
  },
  uploadButton: {
    alignItems: 'center',
    marginBottom: 20,
  },
  uploadText: {
    marginTop: 8,
    color: '#0095f6',
    fontSize: 16,
  },
  captionContainer: {
    marginBottom: 20,
  },
  captionInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
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
  submitButton: {
    backgroundColor: '#0095f6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CreatePostScreen; 