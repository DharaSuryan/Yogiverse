import React, { useState, useEffect, useContext } from 'react';
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
  Dimensions,
  FlatList,
  AppState,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'react-native-image-picker';
import Video from 'react-native-video';

import { postPosts, postStories } from '../../Api/Api';
import LocationPicker, { LocationOption } from '../../Components/LocationPicker';
import PostPreviewScreen from './PostPreviewScreen';
import { reset } from 'Src/Component/Route';
import MediaEditModal from './MediaEditModal';

// Helper for story API
const STORY_API_URL = 'https://pashuahar.com/stories';

// VideoPauseContext for global video control
const VideoPauseContext = React.createContext({ pauseAll: false, setPauseAll: (_: boolean) => {} });

// Add camera permission request function
const requestCameraPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'App needs access to your camera to take photos and videos.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      Alert.alert('Permission error', 'Failed to request camera permission');
      return false;
    }
  }
  // On iOS, react-native-image-picker will handle it
  return true;
};

// Fix props type for navigation/route
// @ts-ignore
const UploadPost = ({ navigation, route }) => {
  const isFromStory = route?.params?.isFromStory ?route?.params?.isFromStory : false;
  const [selectedMedia, setSelectedMedia] = useState<{ uri: string; type: string; name: string }[]>([]);
  const [mediaMeta, setMediaMeta] = useState({ type: '', name: '' });
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [showCameraOptions, setShowCameraOptions] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationOption | null>(null);
  const [zoomScales, setZoomScales] = useState<{ [uri: string]: number }>({});
  const [selectedFilters, setSelectedFilters] = useState<{ [uri: string]: string }>({});
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [allowComments, setAllowComments] = useState(false);
  const [hideLikeCount, setHideLikeCount] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editImage, setEditImage] = useState<string | null>(null);
  const [editResult, setEditResult] = useState<{ uri: string } | null>(null); // { uri }
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [wizardMode, setWizardMode] = useState(false);
  const [wizardIndex, setWizardIndex] = useState(0);
  const [forcePauseVideos, setForcePauseVideos] = useState(false);
  const { setPauseAll } = useContext(VideoPauseContext);

  // Open gallery on mount if isFromStory
  useEffect(() => {
    if (isFromStory) {
      handleMediaPicker('mixed');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pause/mute all videos globally when this screen mounts
  useEffect(() => {
    setPauseAll(true);
    return () => setPauseAll(false);
  }, [setPauseAll]);

  // Update handleCameraCapture to only include durationLimit for video
  const handleCameraCapture = async (mediaType: 'photo' | 'video') => {
    setShowCameraOptions(false);

    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Camera permission is required to take photos or videos.');
      return;
    }

    // Build options object
    const options: any = {
      mediaType,
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
      videoQuality: 'medium',
    };
    if (mediaType === 'video') {
      options.durationLimit = 60; // 60 seconds for video
    }

    ImagePicker.launchCamera(
      options,
      (response) => {
        console.log("Camera response:", response);

        if (response.didCancel) {
          console.log('User cancelled camera');
        } else if (response.errorCode) {
          console.error('Camera error:', response.errorMessage);
          Alert.alert('Error', response.errorMessage);
        } else if (response.assets && response.assets.length > 0) {
          setSelectedMedia(response.assets
            .filter(asset => asset.uri)
            .map(asset => ({
              uri: asset.uri as string,
              type: asset.type || 'image/jpeg',
              name: asset.fileName || (asset.type?.startsWith('video') ? 'camera_video.mp4' : 'camera_photo.jpg'),
            }))
          );
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
        selectionLimit: 10, // allow up to 10 images
      },
      (response) => {
        if (response.didCancel) {
          // User cancelled
        } else if (response.errorCode) {
          Alert.alert('Error', response.errorMessage);
        } else if (response.assets && response.assets.length > 0) {
          const newMedia = response.assets
            .filter(asset => asset.uri)
            .map(asset => ({
              uri: asset.uri as string,
              type: asset.type || 'image/jpeg',
              name: asset.fileName || (asset.type?.startsWith('video') ? 'camera_video.mp4' : 'camera_photo.jpg'),
            }));
          setSelectedMedia(newMedia);
          if (newMedia.length > 1) {
            setWizardMode(true);
            setWizardIndex(0);
            setEditIndex(0);
            setEditImage(newMedia[0].uri);
            setShowEditModal(true);
          } else if (newMedia.length === 1) {
            setEditIndex(0);
            setEditImage(newMedia[0].uri);
            setShowEditModal(true);
          }
        }
      }
    );
  };

  // Handler for when editing is done
  const handleEditApply = (result: { uri: string }) => {
    setShowEditModal(false);
    setEditResult(result);
    setForcePauseVideos(true);
    if (editIndex !== null && editIndex >= 0 && editIndex < selectedMedia.length) {
      const updatedMedia = [...selectedMedia];
      updatedMedia[editIndex] = {
        ...updatedMedia[editIndex],
        uri: result.uri,
      };
      setSelectedMedia(updatedMedia);
      if (wizardMode) {
        if (editIndex + 1 < updatedMedia.length) {
          setTimeout(() => {
            setEditIndex(editIndex + 1);
            setEditImage(updatedMedia[editIndex + 1].uri);
            setShowEditModal(true);
            setWizardIndex(editIndex + 1);
          }, 300);
        } else {
          setWizardMode(false);
          setWizardIndex(0);
          setEditIndex(null);
        }
      } else {
        setEditIndex(null);
      }
    }
  };
  const handleEditCancel = () => {
    setShowEditModal(false);
    setEditImage(null);
    setEditIndex(null);
    setForcePauseVideos(true);
    if (wizardMode) {
      setWizardMode(false);
      setWizardIndex(0);
    }
  };

  // Share handler for both story and post
  const handleShare = async () => {
    if (!selectedMedia.length || !caption.trim()) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      console.log("Is From Story",isFromStory);
      if (isFromStory) {
        try {
          formData.append('caption', caption);
          formData.append('is_highlighted', isHighlighted ? 'true' : 'false');
          // Build media_metadata array dynamically
          const mediaMetadata = selectedMedia.map(item => ({
            is_video: item.type && item.type.startsWith('video'),
          }));
          formData.append('media_metadata', JSON.stringify(mediaMetadata));
          selectedMedia.forEach((item) => {
            formData.append('media_files', {
              uri: item.uri,
              type: item.type,
              name: item.name,
            });
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
          formData.append('is_draft', isDraft ? 'true' : 'false');
          formData.append('allow_comments', allowComments ? 'true' : 'false');
          formData.append('hide_like_count', hideLikeCount ? 'true' : 'false');
          const isVideo = mediaMeta.type.startsWith('video');
          formData.append('media_metadata', JSON.stringify(selectedMedia.map(item => ({
            is_video: item.type && item.type.startsWith('video'),
          }))));
          if (selectedLocation) {
            formData.append('location', selectedLocation.display_name);
          } else {
            formData.append('location', '');
          }
          selectedMedia.forEach((item) => {
            formData.append('media_files', {
              uri: item.uri,
              type: item.type,
              name: item.name,
            });
          });
          console.log("forma data ----->>>",JSON.stringify(formData))
          await postPosts({ formData });
           Alert.alert('Success', 'Your Post has been uploaded!');
           navigation.goBack()
          //  navigation.navigate("UploadOptions")
          // navigation.reset({
          //   index: 0,
          //   routes: [{ name: 'MainTab' }],
          // });

          // navigation.reset({
          //     index: 0,
          //     routes: [{ name: 'MainTab' }],
          //   });
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

  // Replace handleShare with navigation to PostPreviewScreen
  const handlePreview = () => {
    navigation.navigate('PostPreview', {
      media: selectedMedia,
      caption,
      location: selectedLocation,
      onPost: handleShare, // call handleShare on final post
    });
  };

  // Render media preview
  const renderMediaPreview = () => {
    if (!selectedMedia.length) {
      return (
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderText}>Select an image or video to create your {isFromStory ? 'story' : 'post'}</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={selectedMedia}
        horizontal
        keyExtractor={(item, idx) => item.uri + idx}
        renderItem={({ item, index }) => (
          <TouchableOpacity onPress={() => { setEditIndex(index); setEditImage(item.uri); setShowEditModal(true); setForcePauseVideos(false); }}>
            {item.type && item.type.startsWith('video') ? (
              <Video
                source={{ uri: item.uri }}
                style={styles.previewImage}
                paused={true} // Always paused for preview, never auto-play
                muted={true}  // Always muted for preview, never auto-play sound
                resizeMode="cover"
              />
            ) : (
              <Image
                source={{ uri: item.uri }}
                style={styles.previewImage}
                resizeMode="cover"
              />
            )}
          </TouchableOpacity>
        )}
        contentContainerStyle={{ padding: 10 }}
        showsHorizontalScrollIndicator={false}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          {React.createElement(Ionicons as any, { name: 'close', size: 24, color: '#bea063' })}
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: '#bea063' }]}>{isFromStory ? 'New Story' : 'New Post'}</Text>
        <TouchableOpacity
          onPress={handlePreview}
          disabled={!selectedMedia.length || uploading}
          style={[
            styles.shareButton,
            (!selectedMedia.length || uploading) && styles.shareButtonDisabled,
          ]}>
          <Text
            style={[
              styles.shareButtonText,
              { color: '#bea063' },
              (!selectedMedia.length || uploading) && styles.shareButtonTextDisabled,
            ]}>
            {uploading ? 'Previewing...' : 'Preview'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {renderMediaPreview()}

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => handleMediaPicker('mixed', false)}>
            {React.createElement(Ionicons as any, { name: 'images', size: 24, color: '#bea063' })}
            <Text style={[styles.optionText, { color: '#bea063' }]}>Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => handleMediaPicker('mixed', true)}>
            {React.createElement(Ionicons as any, { name: 'camera', size: 24, color: '#bea063' })}
            <Text style={[styles.optionText, { color: '#bea063' }]}>Camera</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.captionContainer}>
          <TextInput
            style={[styles.captionInput, { color: '#bea063',borderWidth:1, borderColor:'#bea063',borderRadius:10 }]}
            placeholder="Write a caption..."
            placeholderTextColor="#bea063"
            value={caption}
            onChangeText={setCaption}
            // editable={!uploading}
          />
        </View>
        <View style={{paddingHorizontal: 15, marginBottom: 10}}>
          <Text style={{fontSize: 16, marginBottom: 5, color: '#bea063'}}>Add Location</Text>
          <TouchableOpacity style={[styles.locationButton, { backgroundColor: '#fff', borderColor: '#bea063', borderWidth: 1, borderRadius: 8, padding: 10, marginTop: 10, marginBottom: 10 }]}
            onPress={() => setShowLocationPicker(true)}>
            <Text style={{ color: '#bea063' }}>{selectedLocation ? selectedLocation.display_name : 'Select Location'}</Text>
          </TouchableOpacity>
        </View>
        {isFromStory && (
          <View style={{flexDirection:'row',alignItems:'center',paddingLeft:15,marginTop:10}}>
            <Text style={{fontSize:16,marginRight:10}}>Highlight this story?</Text>
            <Switch value={isHighlighted} onValueChange={setIsHighlighted} disabled={uploading} />
          </View>
        )}
       {isFromStory ? null : <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 24 }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: '#bea063', marginBottom: 8 }}>Draft</Text>
            <Switch
              value={isDraft}
              onValueChange={setIsDraft}
              trackColor={{ false: '#ccc', true: '#bea063' }}
              thumbColor={isDraft ? '#bea063' : '#fff'}
            />
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: '#bea063', marginBottom: 8 }}>Allow Comments</Text>
            <Switch
              value={allowComments}
              onValueChange={setAllowComments}
              trackColor={{ false: '#ccc', true: '#bea063' }}
              thumbColor={allowComments ? '#bea063' : '#fff'}
            />
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: '#bea063', marginBottom: 8 }}>Hide Like Count</Text>
            <Switch
              value={hideLikeCount}
              onValueChange={setHideLikeCount}
              trackColor={{ false: '#ccc', true: '#bea063' }}
              thumbColor={hideLikeCount ? '#bea063' : '#fff'}
            />
          </View>
        </View>}
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

      <Modal visible={showLocationPicker} animationType="slide" onRequestClose={() => setShowLocationPicker(false)}>
        <LocationPicker
          value={selectedLocation}
          onChange={location => {
            setSelectedLocation(location);
            setShowLocationPicker(false);
          }}
        />
      </Modal>

      {/* Show MediaEditModal if needed */}
      {showEditModal && editImage && (
        <Modal visible={showEditModal} animationType="slide" transparent={false} onRequestClose={handleEditCancel}>
          <MediaEditModal
            uri={editImage}
            onApply={handleEditApply}
            onCancel={handleEditCancel}
          />
        </Modal>
      )}

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
  previewContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  previewImage: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').width,
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
    // padding: 5,
    marginHorizontal:10
  },
  captionInput: {
    fontSize: 16,
    minHeight: 60,
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
  locationButton: {
    padding: 10,
  },
});

export default UploadPost; 