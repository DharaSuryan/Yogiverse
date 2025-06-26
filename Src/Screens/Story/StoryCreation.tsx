import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
  PermissionsAndroid,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'react-native-image-picker';
import { postStories } from '../../Api/Api';
import { Asset, ImageLibraryOptions } from 'react-native-image-picker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
const StoryCreation = ({ navigation }: { navigation: NavigationProp }) => {
  const [media, setMedia] = useState<Asset | null>(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [isHighlighted] = useState(false);
  const [location] = useState('India');

  const handleSelectMedia = () => {
    const options: ImageLibraryOptions = {
      mediaType: 'mixed' as const,
      quality: 1,
      includeBase64: false,
    };
    ImagePicker.launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        return;
      }
      if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
        return;
      }
      if (response.assets && response.assets[0]) {
        setMedia(response.assets[0]);
      }
    });
  };

  const handleOpenCamera = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'App needs camera access to take pictures.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert('Permission Denied', 'Camera permission is required to take photos.');
        return;
      }
    }
    const options: ImageLibraryOptions = {
      mediaType: 'photo' as const,
      quality: 1,
      includeBase64: false,
    };
    ImagePicker.launchCamera(options, (response) => {
      if (response.didCancel) {
        return;
      }
      if (response.errorCode) {
        Alert.alert('Camera Error', response.errorMessage || 'Unknown error');
        return;
      }
      if (response.assets && response.assets[0]) {
        setMedia(response.assets[0]);
      }
    });
  };

  const handleCaptionChange = async (text: string) => {
    setCaption(text);
    if (media && text.trim().length > 0) {
      setUploading(true);
      try {
        const isVideo = media.type && media.type.startsWith('video');
        const formData = new FormData();
        formData.append('media_file', {
          uri: media.uri || '',
          type: isVideo ? 'video/mp4' : 'image/jpeg',
          name: isVideo ? 'story.mp4' : 'story.jpg',
        } as any);
        formData.append('caption', text);
        formData.append('is_highlighted', isHighlighted ? 'true' : 'false');
        formData.append('location', location);
        formData.append('media[0].is_video', isVideo ? 'true' : 'false');
        await postStories({ formData });
        Alert.alert('Success', 'Your story has been uploaded!');
        navigation.goBack();
      } catch (e) {
        Alert.alert('Error', 'Failed to upload story.');
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="close" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Story</Text>
      </View>
      <ScrollView style={styles.content}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 16 }}>
          <TouchableOpacity
            style={[styles.actionButton, uploading && styles.shareButtonDisabled]}
            onPress={handleOpenCamera}
            disabled={uploading}
          >
            <Icon name="camera" size={24} color="#0095f6" />
            <Text style={styles.actionButtonText}>Open Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, uploading && styles.shareButtonDisabled]}
            onPress={handleSelectMedia}
            disabled={uploading}
          >
            <Icon name="images" size={24} color="#0095f6" />
            <Text style={styles.actionButtonText}>Upload from Gallery</Text>
          </TouchableOpacity>
        </View>
        {media ? (
          <Image source={{ uri: media.uri || '' }} style={styles.mediaPreview} />
        ) : (
          <View style={styles.mediaPlaceholder}>
            <Icon name="add-circle-outline" size={48} color="#666" />
            <Text style={styles.mediaPlaceholderText}>
              Select photo or video
            </Text>
          </View>
        )}
        <View style={styles.captionContainer}>
          <TextInput
            style={styles.captionInput}
            placeholder="Write a caption..."
            value={caption}
            onChangeText={handleCaptionChange}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    ...Platform.select({
      ios: {
        paddingTop: 50,
      },
      android: {
        paddingTop: 16,
      },
    }),
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  mediaPlaceholder: {
    height: 400,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
  },
  mediaPlaceholderText: {
    marginTop: 8,
    color: '#666',
  },
  mediaPreview: {
    width: '100%',
    height: 400,
    resizeMode: 'cover',
  },
  captionContainer: {
    padding: 16,
  },
  captionInput: {
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  shareButtonContainer: {
    backgroundColor: '#0095f6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  shareButtonDisabled: {
    opacity: 0.5,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 5,
  },
  actionButtonText: {
    color: '#0095f6',
    fontWeight: '600',
    fontSize: 15,
    marginLeft: 8,
  },
});

export default StoryCreation; 