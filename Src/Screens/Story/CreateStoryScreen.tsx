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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../Navigation/types';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'react-native-image-picker';
import { useDispatch } from 'react-redux';
import { addStory } from '../../Store/slices/storySlice';
import { Story } from '../../Types';

const CreateStoryScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const dispatch = useDispatch();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [location, setLocation] = useState('');
  const [duration, setDuration] = useState(5); // Default 5 seconds
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [imageMeta, setImageMeta] = useState<{ type: string; name: string }>({ type: 'image/jpeg', name: 'story.jpg' });

  useEffect(() => {
    // Open gallery by default when screen mounts
    handleImagePicker();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleImagePicker = () => {
    ImagePicker.launchImageLibrary({
      mediaType: 'photo',
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
        setSelectedImage(asset.uri || null);
        setImageMeta({
          type: asset.type || 'image/jpeg',
          name: asset.fileName || 'story.jpg',
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
        // Extract uri, type, fileName for FormData
        const asset = response.assets[0];
        setSelectedImage(asset.uri || null);
        // Optionally store type and fileName in state if needed for upload
        setImageMeta({
          type: asset.type || 'image/jpeg',
          name: asset.fileName || 'story.jpg',
        });
      }
    });
  };

  const handleShare = async () => {
    if (!selectedImage || !caption.trim()) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('media_file', {
        uri: selectedImage,
        type: imageMeta.type,
        name: imageMeta.name,
      });
      formData.append('caption', caption);
      formData.append('is_highlighted', 'false');
      formData.append('location', location || '');
      formData.append('media[0].is_video', 'false');
      // Call your API here (e.g., postStories({ formData }))
      // await postStories({ formData });
      Alert.alert('Success', 'Your story has been uploaded!');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Failed to upload story.');
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
        <Text style={styles.headerTitle}>New Story</Text>
        <TouchableOpacity
          onPress={handleShare}
          disabled={!selectedImage || !caption.trim() || uploading}
          style={[
            styles.shareButton,
            (!selectedImage || !caption.trim() || uploading) && styles.shareButtonDisabled,
          ]}>
          <Text
            style={[
              styles.shareButtonText,
              (!selectedImage || !caption.trim() || uploading) && styles.shareButtonTextDisabled,
            ]}>
            {uploading ? 'Uploading...' : 'Share'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {selectedImage ? (
          <Image source={{ uri: selectedImage }} style={styles.previewImage} />
        ) : (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderText}>Select an image to create your story</Text>
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

        <View style={styles.settingsContainer}>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Duration (seconds)</Text>
            <View style={styles.durationButtons}>
              {[3, 5, 7, 10].map(sec => (
                <TouchableOpacity
                  key={sec}
                  style={[
                    styles.durationButton,
                    duration === sec && styles.durationButtonActive,
                  ]}
                  onPress={() => setDuration(sec)}>
                  <Text
                    style={[
                      styles.durationButtonText,
                      duration === sec && styles.durationButtonTextActive,
                    ]}>
                    {sec}s
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Add Location</Text>
            <TextInput
              style={styles.locationInput}
              placeholder="Enter location"
              value={location}
              onChangeText={setLocation}
            />
          </View>
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Caption</Text>
          <TextInput
            style={styles.locationInput}
            placeholder="Write a caption..."
            value={caption}
            onChangeText={setCaption}
            multiline
            editable={!uploading}
          />
        </View>
      </ScrollView>
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
  settingsContainer: {
    padding: 15,
  },
  settingItem: {
    marginBottom: 20,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  durationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  durationButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  durationButtonActive: {
    backgroundColor: '#0095f6',
    borderColor: '#0095f6',
  },
  durationButtonText: {
    color: '#000',
  },
  durationButtonTextActive: {
    color: '#fff',
  },
  locationInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
});

export default CreateStoryScreen; 