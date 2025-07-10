import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Dimensions,
  Alert,
  Platform,
  Switch,
} from 'react-native';
import * as ImagePicker from 'react-native-image-picker';
import { postStories } from '../../Api/Api';
import LocationPicker, { LocationOption } from '../../Components/LocationPicker';
import { useNavigation } from '@react-navigation/native';
import MediaEditModal from './MediaEditModal';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const StoryUploadScreen = () => {
  const navigation = useNavigation();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showInputModal, setShowInputModal] = useState(false);
  const [caption, setCaption] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<LocationOption | null>(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [processedImage, setProcessedImage] = useState<string | null>(null);

  // Step 1: Pick image on mount
  React.useEffect(() => {
    ImagePicker.launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: 1,
      },
      (response) => {
        if (response.didCancel || !response.assets || response.assets.length === 0) {
          navigation.goBack();
          return;
        }
        const asset = response.assets[0];
        if (asset.uri) {
          setSelectedImage(asset.uri);
          setShowEditModal(true); // Open filter modal first
        }
      }
    );
  }, []);

  // Step 2: Tap to open input modal
  const handleImageTap = () => {
    setShowEditModal(true);
  };

  // Step 3: Handle story upload
  const handleNext = async () => {
    const imageToUpload = processedImage || selectedImage;
    if (!imageToUpload) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('caption', caption);
      formData.append('is_highlighted', isHighlighted ? 'true' : 'false');
      formData.append('media_metadata', JSON.stringify([{ is_video: false }]));
      formData.append('media_file', {
        uri:  imageToUpload,
        type: 'image/jpeg',
        name: 'story.jpg',
      });
      if (selectedLocation) {
        formData.append('location', selectedLocation.display_name);
      } else {
        formData.append('location', '');
      }
      await postStories({ formData });
      Alert.alert('Success', 'Your story has been uploaded!');
      navigation.goBack();
    } catch (e) {
      if (e && typeof e === 'object') {
        console.log('erororo (full error):', JSON.stringify(e, Object.getOwnPropertyNames(e), 2));
      } else {
        console.log('erororo:', e);
      }
      Alert.alert('Error', 'Failed to upload story.');
    } finally {
      setUploading(false);
    }
  };

  if (!selectedImage) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.imageContainer} activeOpacity={0.95} onPress={() => setShowEditModal(true)}>
        <Image source={{ uri: processedImage || selectedImage }} style={styles.image} resizeMode="cover" />
      </TouchableOpacity>
      {/* Input Modal for Caption and Address */}
      <Modal visible={showInputModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.inputModal}>
            <Text style={[styles.inputLabel, { color: '#bea063' }]}>Add a caption...</Text>
            <TextInput
              style={[styles.captionInput, { borderColor: '#bea063', color: '#bea063' }]}
              placeholder="Write a caption..."
              placeholderTextColor="#bea063"
              value={caption}
              onChangeText={setCaption}
              multiline
            />
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 16, marginRight: 10, color: '#bea063' }}>Highlight this story?</Text>
              <Switch
                value={isHighlighted}
                onValueChange={setIsHighlighted}
                trackColor={{ false: '#ccc', true: '#bea063' }}
                thumbColor={isHighlighted ? '#bea063' : '#fff'}
              />
            </View>
            <TouchableOpacity
              style={[styles.locationButton, { borderColor: '#bea063' }]}
              onPress={() => setShowLocationPicker(true)}
            >
              <Text style={{ color: '#bea063' }}>{selectedLocation ? selectedLocation.display_name : 'Select Location'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNext}
              disabled={uploading}
            >
              <Text style={styles.nextButtonText}>{uploading ? 'Uploading...' : 'Next'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowInputModal(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* Location Picker Modal */}
        <Modal visible={showLocationPicker} animationType="slide" onRequestClose={() => setShowLocationPicker(false)}>
          <LocationPicker
            value={selectedLocation}
            onChange={location => {
              setSelectedLocation(location);
              setShowLocationPicker(false);
            }}
          />
        </Modal>
      </Modal>
      {/* Pinch/Filter Edit Modal */}
      <Modal visible={showEditModal} animationType="slide" transparent={false} onRequestClose={() => setShowEditModal(false)}>
        <MediaEditModal
          uri={processedImage || selectedImage}
          onApply={({ uri }) => {
            setProcessedImage(uri);
            setShowEditModal(false);
            setShowInputModal(true); // Open caption/location modal after filter
          }}
          onCancel={() => {
            setShowEditModal(false);
            setShowInputModal(true); // Open caption/location modal after cancel
          }}
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    flex: 1,
    width: screenWidth,
    height: screenHeight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: screenWidth,
    height: screenHeight,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputModal: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'stretch',
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#222',
  },
  captionInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    minHeight: 60,
    marginBottom: 16,
    color: '#222',
  },
  locationButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  nextButton: {
    backgroundColor: '#bea063',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  cancelButton: {
    alignItems: 'center',
    padding: 10,
  },
  cancelButtonText: {
    color: '#888',
    fontSize: 16,
  },
});

export default StoryUploadScreen; 