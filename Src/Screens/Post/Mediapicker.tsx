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
  ActivityIndicator,
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { CreatePostStackParamList } from '../../Navigation/types';
import { CommonActions } from '@react-navigation/native';
import * as ImagePickerRN from 'react-native-image-picker';
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import { launchImageLibrary, Asset } from 'react-native-image-picker';

const screenWidth = Dimensions.get('window').width;

// ---- Config options ----
const ALLOW_VIDEO = true;              // allow user to select videos
const ENFORCE_SQUARE = true;           // enforce crop to square for images
const ENABLE_FILTER_SCREEN = true;     // navigate to "Filter" after Next
const SINGLE_SELECT_ONLY = false;      // set to true if you want only one at a time

type MediaPickerScreenRouteProp = RouteProp<CreatePostStackParamList, 'MediaPicker'>;
type MediaPickerScreenNavigationProp = NativeStackNavigationProp<CreatePostStackParamList, 'MediaPicker'>;

// Define the type for media items
interface MediaItem {
  uri: string;
  type: 'image' | 'video';
}

const MediaPicker = () => {
  const navigation = useNavigation<MediaPickerScreenNavigationProp>();
  const route = useRoute<MediaPickerScreenRouteProp>();
  const { type, maxSelection = type === 'post' ? 10 : 1 } = route.params;
  const [galleryMedia, setGalleryMedia] = useState<MediaItem[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasPermission, setHasPermission] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const [loading, setLoading] = useState(false);
  const [navigating, setNavigating] = useState(false);

  const isPost = type === 'post';
  const isReel = type === 'reel';
  const isStory = type === 'story';

  const handleClose = () => {
    navigation.navigate('UploadOptions');
  };

  const requestPermission = async () => {
    try {
      if (Platform.OS === 'ios') {
        const result = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
        setHasPermission(result === RESULTS.GRANTED);
      } else {
        const result = await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
        setHasPermission(result === RESULTS.GRANTED);
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
    }
  };

  useEffect(() => {
    requestPermission();
    openGallery();
  }, []);

  // ----- Open Gallery Picker -----
  const openGallery = async () => {
    try {
      let pickerOptions: any = {
        multiple: route.params?.type === 'post', // multi-select for post
        mediaType: route.params?.type === 'reel' ? 'video' : 'any',
        cropping: route.params?.type === 'story',
        cropperCircleOverlay: false,
        compressImageQuality: 0.9,
        width: route.params?.type === 'story' ? 1080 : undefined,
        height: route.params?.type === 'story' ? 1920 : undefined,
      };

      const results = await ImagePicker.openPicker(pickerOptions);
      const mediaArray = Array.isArray(results) ? results : [results];

      const formatted = mediaArray.map((item: any) => ({
        uri: Platform.OS === 'ios' ? item.sourceURL || item.path : item.path,
        type: item.mime && item.mime.startsWith('video') ? 'video' : 'photo',
      }));

      setGalleryMedia(formatted);
      setSelectedMedia(formatted.length ? [formatted[0]] : []);
      setCurrentIndex(0);
    } catch (error: any) {
      if (error.code === 'E_PICKER_CANCELLED') {
        navigation.navigate('UploadOptions');
      } else {
        console.error('Image picker error:', error);
      }
      setGalleryMedia([]);
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

    if (route.params?.type === 'story') {
      navigation.navigate('StoryPreview', { 
        uri: selectedMedia[0].uri,
        type: selectedMedia[0].type
      });
    } else if (route.params?.type === 'post') {
      navigation.navigate('MediaFilter', { media: selectedMedia[0] });
    } else {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'MainTab' }],
        })
      );
    }
  };

  // ---- Thumbnail press logic ----
  const handlePreviewPress = (index: number) => {
    setCurrentIndex(index);
    flatListRef.current?.scrollToIndex({ index, animated: true });
  };

  const handleImagePicker = () => {
    const options = {
      mediaType: 'mixed' as const,
      selectionLimit: 10,
      includeExtra: true,
    };

    ImagePickerRN.launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        return;
      }

      if (response.errorCode) {
        console.error('ImagePicker Error: ', response.errorMessage);
        return;
      }

      if (response.assets) {
        const newMedia = response.assets.map(asset => ({
          uri: asset.uri || '',
          type: asset.type === 'video' ? 'video' : 'photo',
        }));
        setSelectedMedia(newMedia);
      }
    });
  };

  const handleMediaSelect = async () => {
    if (navigating) return;
    setNavigating(true);
    try {
      const result = await launchImageLibrary({
        mediaType: isPost ? 'mixed' : 'video',
        selectionLimit: isPost ? 10 : 1,
        quality: 1,
      });
      if (result.assets && result.assets.length > 0) {
        const formatted: MediaItem[] = result.assets.map((a: Asset) => ({
          uri: a.uri || '',
          type: a.type && a.type.startsWith('video') ? 'video' : 'image',
        })).filter(m => m.uri);
        setGalleryMedia(formatted);
        if (isPost || isReel) {
          setSelectedMedia([]); // Start with no selection
        } else if (isStory) {
          navigation.navigate('StoryPreview', {
            uri: formatted[0].uri,
            type: formatted[0].type,
          });
        }
      }
    } finally {
      setTimeout(() => setNavigating(false), 500);
    }
  };

  const handleMediaPress = (item: MediaItem) => {
    if (isPost) {
      const isSelected = selectedMedia.some(m => m.uri === item.uri);
      if (isSelected) {
        setSelectedMedia(selectedMedia.filter(m => m.uri !== item.uri));
      } else {
        setSelectedMedia([...selectedMedia, item]);
      }
    } else if (isReel) {
      setSelectedMedia([item]);
    } else if (isStory) {
      navigation.navigate('StoryPreview', {
        uri: item.uri,
        type: item.type,
      });
    }
  };

  const handleAdd = () => {
    if (navigating || selectedMedia.length === 0) return;
    setNavigating(true);
    if (isPost) {
      navigation.navigate('PostPreview', { images: selectedMedia.map(m => m.uri) });
    } else if (isReel) {
      navigation.navigate('ReelPreview', { uri: selectedMedia[0].uri });
    }
    setTimeout(() => setNavigating(false), 500);
  };

  const renderItem = ({ item }: { item: MediaItem }) => (
    <TouchableOpacity
      style={styles.mediaItem}
      onPress={() => handleMediaPress(item)}
    >
      <Image source={{ uri: item.uri }} style={styles.mediaThumbnail} />
      {item.type === 'video' && (
        <View style={styles.videoIndicator}>
          <Icon name="play" size={20} color="#FFFFFF" />
        </View>
      )}
      {isPost && selectedMedia.some(m => m.uri === item.uri) && (
        <View style={styles.selectedIndicator}>
          <Icon name="checkmark-circle" size={24} color="#0095F6" />
        </View>
      )}
    </TouchableOpacity>
  );

  const handleNavigate = (target, params) => {
    if (navigating) return;
    setNavigating(true);
    navigation.navigate(target, params);
    setTimeout(() => setNavigating(false), 500);
  };

  const renderPost = ({ item }) => (
    <TouchableOpacity
      style={styles.postContainer}
      onPress={() => navigation.navigate('ProfilePostDetailScreen', { post: item })}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.image }} style={styles.postImage} />
      {item.type === 'reel' && (
        <View style={styles.reelIndicator}>
          <Icon name="play" size={20} color="#fff" />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Icon name="close" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {route.params?.type === 'story' ? 'New Story' : 'Select Media'}
        </Text>
        {isPost ? (
          <TouchableOpacity 
            onPress={handleNext}
            disabled={selectedMedia.length === 0}
            style={[styles.nextButton, selectedMedia.length === 0 && styles.nextButtonDisabled]}
          >
            <Text style={[styles.nextButtonText, selectedMedia.length === 0 && styles.nextButtonTextDisabled]}>
              Next ({selectedMedia.length})
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleMediaSelect} style={styles.selectButton}>
            <Text style={styles.selectButtonText}>Select</Text>
          </TouchableOpacity>
        )}
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
        keyExtractor={item => item.id?.toString() || item.uri || String(Math.random())}
        renderItem={({ item, index }) => (
          <View style={styles.carousel}>
            {item.type === 'video' ? (
              <View style={styles.videoStub}>
                <Icon name="videocam" size={40} color="#fff" />
              </View>
            ) : (
              <Image source={{ uri: item.uri }} style={styles.preview} />
            )}
          </View>
        )}
      />

      {/* Selected Thumbnails */}
      <View style={styles.thumbnailContainer}>
        {galleryMedia.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.thumbnail,
              currentIndex === index && styles.selectedThumbnail,
            ]}
            onPress={() => handlePreviewPress(index)}
          >
            {item.type === 'video' ? (
              <View style={styles.videoThumbnail}>
                <Icon name="videocam" size={16} color="#fff" />
              </View>
            ) : (
              <Image source={{ uri: item.uri }} style={styles.thumbnailImage} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        ref={flatListRef}
        data={galleryMedia}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        onMomentumScrollEnd={handleScroll}
        keyExtractor={item => item.id?.toString() || item.uri || String(Math.random())}
        renderItem={renderItem}
        contentContainerStyle={styles.mediaList}
      />

      {selectedMedia.length === 0 && (
        <View style={styles.emptyContainer}>
          <Icon name="images-outline" size={64} color="#bea063" />
          <Text style={styles.emptyText}>Select photos and videos</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={handleImagePicker}
          >
            <Text style={styles.selectButtonText}>Select from Gallery</Text>
          </TouchableOpacity>
        </View>
      )}

      {(isPost || isReel) && selectedMedia.length > 0 && (
        <TouchableOpacity onPress={handleAdd} style={styles.addButton}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      )}

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0095F6" />
        </View>
      )}
    </SafeAreaView>
  );
};

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
    backgroundColor: '#000',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  closeButton: {
    padding: 8,
  },
  galleryButton: {
    position: 'absolute',
    top: 80,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0095f6',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  carousel: {
    width: screenWidth,
    height: screenWidth,
    backgroundColor: '#000',
  },
  preview: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  videoStub: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  thumbnailContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#000',
  },
  thumbnail: {
    width: 60,
    height: 60,
    marginRight: 10,
    borderRadius: 4,
    overflow: 'hidden',
  },
  selectedThumbnail: {
    borderWidth: 2,
    borderColor: '#0095f6',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  videoThumbnail: {
    flex: 1,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButton: {
    padding: 8,
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    color: '#0095f6',
    fontWeight: '600',
  },
  nextButtonTextDisabled: {
    color: '#666',
  },
  mediaList: {
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    marginBottom: 20,
  },
  selectButton: {
    backgroundColor: '#bea063',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    position: 'absolute',
    top: 20,
    right: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaItem: {
    width: screenWidth / 3 - 4,
    height: screenWidth / 3 - 4,
    margin: 2,
    position: 'relative',
  },
  mediaThumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  videoIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    padding: 4,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
  },
  previewImage: {
    width: 80,
    height: 80,
    marginHorizontal: 8,
    borderRadius: 8,
  },
  addButton: {
    backgroundColor: '#0095F6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  postContainer: {
    width: screenWidth / 3,
    height: screenWidth / 3,
    margin: 2,
    position: 'relative',
  },
  postImage: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  reelIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    padding: 4,
  },
});

export default MediaPicker;
