//  navigation.navigate('PostDetails', { images: selectedImages });
// MediaPickerScreen
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  FlatList,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Platform,
  Alert,
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { CreatePostStackParamList } from '../../Navigation/types';
import { CommonActions } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;

// ---- Config options ----
const ALLOW_VIDEO = true;              // allow user to select videos
const ENFORCE_SQUARE = true;           // enforce crop to square for images
const ENABLE_FILTER_SCREEN = true;     // navigate to "Filter" after Next
const SINGLE_SELECT_ONLY = false;      // set to true if you want only one at a time

export default function MediaPickerScreen() {
  const [galleryMedia, setGalleryMedia] = useState<{ uri: string, type: string }[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<{ uri: string, type: string }[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigation = useNavigation<NativeStackNavigationProp<CreatePostStackParamList>>();
  const flatListRef = useRef<FlatList>(null);

  const handleClose = () => {
    navigation.navigate('UploadOptions');
  };

  useEffect(() => {
    openGallery();
  }, []);

  // ----- Open Gallery Picker -----
  const openGallery = async () => {
    try {
      const pickerOptions: any = {
        multiple: !SINGLE_SELECT_ONLY,
        mediaType: ALLOW_VIDEO ? 'any' : 'photo',
        cropping: ENFORCE_SQUARE,
        cropperCircleOverlay: false,
        compressImageQuality: 0.9,
      };
      // If single select, disable multiple and cropping for video
      if (SINGLE_SELECT_ONLY) pickerOptions.multiple = false;
      if (!ALLOW_VIDEO) pickerOptions.mediaType = 'photo';

      const results = await ImagePicker.openPicker(pickerOptions);

      // If user picked only one, wrap in array
      const mediaArray = Array.isArray(results) ? results : [results];

      // For each, get uri and type (photo/video)
      const formatted = mediaArray.map((item: any) => ({
        uri: Platform.OS === 'ios' ? item.sourceURL || item.path : item.path,
        type: item.mime && item.mime.startsWith('video') ? 'video' : 'photo',
      }));

      setGalleryMedia(formatted);
      setSelectedMedia(formatted.length ? [formatted[0]] : []);
      setCurrentIndex(0);
    } catch (error: any) {
      if (error.code === 'E_PICKER_CANCELLED') {
        // If picker is cancelled, go back to upload options
        navigation.navigate('UploadOptions');
      } else {
        // Log other errors
        console.error('Image picker error:', error);
      }
      setGalleryMedia([]); // Clear media on error
      setSelectedMedia([]);
      setCurrentIndex(0);
    }
  };

  // ---- Select/deselect media ----
  const toggleSelectMedia = (media: { uri: string; type: string }) => {
    if (selectedMedia.find((m) => m.uri === media.uri)) {
      // Remove from selected
      setSelectedMedia((prev) => prev.filter((m) => m.uri !== media.uri));
    } else {
      // Add to selected
      setSelectedMedia((prev) =>
        SINGLE_SELECT_ONLY ? [media] : [...prev, media]
      );
    }
  };

  // ---- Delete selected media ----
  const handleDeleteSelected = (uri: string) => {
    Alert.alert(
      'Delete Image',
      'Are you sure you want to remove this image?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setSelectedMedia((prev) => prev.filter((m) => m.uri !== uri));
            setGalleryMedia((prev) => prev.filter((m) => m.uri !== uri));
            if (currentIndex >= selectedMedia.length - 1) {
              setCurrentIndex(Math.max(0, selectedMedia.length - 2));
            }
          },
        },
      ]
    );
  };

  // ---- Swipe preview logic ----
  const handleScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
    setCurrentIndex(index);
  };

  // ---- Next button logic ----
  const handleNext = () => {
    if (!selectedMedia.length) return;

    if (ENABLE_FILTER_SCREEN) {
      // Pass to filter screen
      navigation.navigate('MediaFilter', { media: selectedMedia[0] });
    } else {
      // Navigate to main tab after successful selection
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            {
              name: 'MainTab',
              state: {
                routes: [{ name: 'HomeTab' }],
              },
            },
          ],
        })
      );
    }
  };

  // ---- Thumbnail press logic ----
  const handlePreviewPress = (index: number) => {
    setCurrentIndex(index);
    flatListRef.current?.scrollToIndex({ index, animated: true });
  };

  console.log('Navigation state:', navigation.getState());
  console.log('Current route:', navigation.getCurrentRoute());

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Icon name="close" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Media</Text>
        <TouchableOpacity 
          onPress={handleNext}
          disabled={!selectedMedia.length}
          style={[styles.nextButton, !selectedMedia.length && styles.nextButtonDisabled]}
        >
          <Text style={[styles.nextButtonText, !selectedMedia.length && styles.nextButtonTextDisabled]}>
            Next
          </Text>
        </TouchableOpacity>
      </View>

      {/* Gallery (refresh) button */}
      <TouchableOpacity style={styles.galleryButton} onPress={openGallery}>
        <Icon name="images-outline" size={26} color="#fff" />
      </TouchableOpacity>

      {/* Selected Media Preview Carousel */}
      <FlatList
        ref={flatListRef}
        data={galleryMedia}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        keyExtractor={(item, index) => item.uri + index}
        renderItem={({ item, index }) => (
          <View style={styles.carousel}>
            {item.type === 'video' ? (
              <View style={styles.videoStub}>
                <Icon name="videocam" size={40} color="#fff" />
                <Text style={{ color: '#fff' }}>Video</Text>
              </View>
            ) : (
              <Image source={{ uri: item.uri }} style={styles.previewImage} />
            )}
            <Text style={styles.indexText}>{index + 1}/{galleryMedia.length}</Text>
            
            {/* Delete button for selected media */}
            {selectedMedia.find(m => m.uri === item.uri) && (
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => handleDeleteSelected(item.uri)}
              >
                <Icon name="trash-outline" size={24} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        )}
        style={{ flexGrow: 0 }}
      />

      {/* Selected Thumbnails */}
      <FlatList
        data={galleryMedia}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.selectedThumbnails}
        keyExtractor={(item, index) => item.uri + index}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            onPress={() => handlePreviewPress(index)}
            style={styles.thumbnailContainer}
          >
            <Image
              source={{ uri: item.uri }}
              style={[
                styles.thumbnail,
                currentIndex === index && styles.activeThumbnail,
              ]}
            />
            {selectedMedia.find((m) => m.uri === item.uri) && (
              <View style={styles.selectedCheck}>
                <Icon name="checkmark-circle" size={24} color="#0095f6" />
              </View>
            )}
          </TouchableOpacity>
        )}
      />

      <FlatList
        ref={flatListRef}
        data={galleryMedia}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        onMomentumScrollEnd={handleScroll}
        keyExtractor={(item) => item.uri}
        renderItem={({ item, index }) => (
          <View style={styles.mediaContainer}>
            <Image
              source={{ uri: item.uri }}
              style={styles.media}
              resizeMode="contain"
            />
            {selectedMedia.some(media => media.uri === item.uri) && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteSelected(item.uri)}
              >
                <Icon name="trash-outline" size={24} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        )}
        contentContainerStyle={styles.mediaList}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#000' 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  galleryButton: {
    position: 'absolute',
    top: 45,
    left: 18,
    zIndex: 3,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 24,
    padding: 4,
  },
  carousel: { 
    backgroundColor: '#000',
    width: screenWidth,
    position: 'relative',
  },
  previewImage: {
    width: screenWidth,
    height: screenWidth * 1.2,
    resizeMode: 'contain',
    alignSelf: 'center',
    backgroundColor: '#000',
  },
  indexText: {
    position: 'absolute',
    top: 20,
    left: 24,
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  deleteButton: {
    position: 'absolute',
    top: 20,
    right: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  selectedThumbnails: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    backgroundColor: '#000',
    paddingHorizontal: 12,
  },
  thumbnailContainer: {
    marginRight: 8,
    position: 'relative',
  },
  thumbnail: {
    width: 44,
    height: 44,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#666',
    opacity: 0.75,
  },
  activeThumbnail: {
    borderColor: '#3897f0',
    opacity: 1,
  },
  selectedCheck: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#000',
    borderRadius: 12,
  },
  nextButton: {
    padding: 8,
    backgroundColor: '#0095F6',
    borderRadius: 5,
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  nextButtonDisabled: {
    backgroundColor: '#ccc',
  },
  nextButtonTextDisabled: {
    color: '#666',
  },
  videoStub: {
    width: screenWidth,
    height: screenWidth * 1.2,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaContainer: {
    width: screenWidth,
    height: screenWidth * 1.2,
    position: 'relative',
  },
  media: {
    width: screenWidth,
    height: screenWidth * 1.2,
    resizeMode: 'contain',
    alignSelf: 'center',
    backgroundColor: '#000',
  },
  mediaList: {
    alignItems: 'center',
  },
});
