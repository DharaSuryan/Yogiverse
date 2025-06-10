
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
  StatusBar,
  Platform,
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

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
  const navigation = useNavigation();
  const flatListRef = useRef<FlatList>(null);

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
    } catch (error) {
      setGalleryMedia([]);
      setSelectedMedia([]);
      setCurrentIndex(0);
    }
  };

  // ---- Select/deselect media ----
  const toggleSelectMedia = (media: { uri: string; type: string }) => {
    if (selectedMedia.find((m) => m.uri === media.uri)) {
      setSelectedMedia((prev) => prev.filter((m) => m.uri !== media.uri));
    } else {
      setSelectedMedia((prev) =>
        SINGLE_SELECT_ONLY ? [media] : [...prev, media]
      );
    }
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
      navigation.navigate('MediaFilterScreen', { media: selectedMedia });
    } else {
      // Pass to post details (caption/location)
      navigation.navigate('PostDetails', { media: selectedMedia });
    }
  };

  // ---- Thumbnail press logic ----
  const handlePreviewPress = (index: number) => {
    setCurrentIndex(index);
    flatListRef.current?.scrollToIndex({ index, animated: true });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Gallery (refresh) button */}
      <TouchableOpacity style={styles.galleryButton} onPress={openGallery}>
        <Icon name="images-outline" size={26} color="#fff" />
      </TouchableOpacity>

      {/* Close button */}
      <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
        <Icon name="close" size={26} color="#fff" />
      </TouchableOpacity>

      {/* Selected Media Preview Carousel */}
      {selectedMedia.length > 0 && (
        <View>
          <FlatList
            ref={flatListRef}
            data={selectedMedia}
            horizontal
            pagingEnabled
            keyExtractor={(item, index) => item.uri + index}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) =>
              item.type === 'video' ? (
                <View style={styles.previewImage}>
                  <Icon name="videocam" size={32} color="#fff" style={{ alignSelf: 'center', marginTop: '50%' }} />
                  <Text style={{ color: '#fff', alignSelf: 'center' }}>Video</Text>
                </View>
              ) : (
                <Image source={{ uri: item.uri }} style={styles.previewImage} />
              )
            }
            onScroll={handleScroll}
            style={styles.carousel}
          />
          {/* Image index */}
          <Text style={styles.indexText}>
            {currentIndex + 1} / {selectedMedia.length}
          </Text>
        </View>
      )}

      {/* Thumbnails (for selected media) */}
      {selectedMedia.length > 1 && (
        <View style={styles.selectedThumbnails}>
          {selectedMedia.map((img, idx) => (
            <TouchableOpacity key={img.uri} onPress={() => handlePreviewPress(idx)}>
              {img.type === 'video' ? (
                <View style={[styles.thumbnail, { backgroundColor: '#111', justifyContent: 'center', alignItems: 'center' }]}>
                  <Icon name="videocam" size={20} color="#fff" />
                </View>
              ) : (
                <Image
                  source={{ uri: img.uri }}
                  style={[
                    styles.thumbnail,
                    currentIndex === idx && styles.activeThumbnail,
                  ]}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Media Grid */}
      <FlatList
        data={galleryMedia}
        numColumns={3}
        keyExtractor={(item, index) => item.uri + index}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => toggleSelectMedia(item)}>
            {item.type === 'video' ? (
              <View style={[styles.gridImage, { backgroundColor: '#1a1a1a', justifyContent: 'center', alignItems: 'center' }]}>
                <Icon name="videocam" size={28} color="#aaa" />
              </View>
            ) : (
              <Image
                source={{ uri: item.uri }}
                style={[
                  styles.gridImage,
                  selectedMedia.find((m) => m.uri === item.uri) && styles.selectedBorder,
                ]}
              />
            )}
            {selectedMedia.find((m) => m.uri === item.uri) && (
              <View style={styles.selectedCheck}>
                <Icon name="checkmark-circle" size={28} color="#3897f0" />
              </View>
            )}
          </TouchableOpacity>
        )}
        style={styles.gridList}
      />

      {/* Next button */}
      {selectedMedia.length > 0 && (
        <TouchableOpacity style={styles.postButton} onPress={handleNext}>
          <Text style={styles.postText}>Next ({selectedMedia.length})</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  galleryButton: {
    position: 'absolute',
    top: 45,
    left: 18,
    zIndex: 3,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 24,
    padding: 4,
  },
  closeButton: {
    position: 'absolute',
    top: 45,
    right: 18,
    zIndex: 3,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 24,
    padding: 4,
  },
  carousel: { backgroundColor: '#000' },
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
  selectedThumbnails: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    backgroundColor: '#000',
    paddingHorizontal: 12,
  },
  thumbnail: {
    width: 44,
    height: 44,
    marginRight: 8,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#666',
    opacity: 0.75,
  },
  activeThumbnail: {
    borderColor: '#3897f0',
    opacity: 1,
  },
  gridList: {
    flex: 1,
  },
  gridImage: {
    width: screenWidth / 3,
    height: screenWidth / 2.6,
    borderWidth: 0.5,
    borderColor: '#222',
    marginBottom: 2,
  },
  selectedBorder: {
    borderColor: '#3897f0',
    borderWidth: 2,
  },
  selectedCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 16,
  },
  postButton: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    backgroundColor: '#3897f0',
    paddingHorizontal: 26,
    paddingVertical: 13,
    borderRadius: 25,
    zIndex: 2,
  },
  postText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
