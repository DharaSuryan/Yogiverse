import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
  BackHandler,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { launchCamera } from 'react-native-image-picker';
import { NavigationProp, CommonActions } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { StoryStackParamList } from '../../Navigation/StoryNavigator';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 4;
const ITEM_WIDTH = width / COLUMN_COUNT;
const ITEM_HEIGHT = ITEM_WIDTH;

interface PhotoItem {
  id: string;
  uri: string;
}

interface StoryAddScreenProps {
  navigation: NativeStackNavigationProp<StoryStackParamList>;
}

const StoryAddScreen: React.FC<StoryAddScreenProps> = ({ navigation }) => {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    fetchPhotos();

    // Handle hardware back button
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleClose();
      return true;
    });

    return () => {
      // Cleanup function
      setPhotos([]);
      setSelectedPhoto(null);
      backHandler.remove();
    };
  }, []);

  const fetchPhotos = async () => {
    try {
      const { edges } = await CameraRoll.getPhotos({
        first: 40,
        assetType: 'Photos',
      });
      
      const photoData = edges.map(edge => ({
        uri: edge.node.image.uri,
        id: edge.node.image.uri,
      }));
      
      setPhotos(photoData);
      if (photoData.length > 0) {
        setSelectedPhoto(photoData[0].uri);
      }
    } catch (error) {
      console.log('Error fetching photos:', error);
      Alert.alert('Permission Required', 'Please allow access to your photos to continue.');
    }
  };

  const handleCameraPress = async () => {
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 1,
        includeBase64: false,
        saveToPhotos: true,
      });

      if (result.assets && result.assets[0]?.uri) {
        setSelectedPhoto(result.assets[0].uri);
        navigation.navigate('StoryEditor', { 
          imageUri: result.assets[0].uri 
        });
      }
    } catch (error) {
      console.log('Camera error:', error);
      Alert.alert('Error', 'Unable to access camera. Please check your permissions.');
    }
  };

  const handleNext = () => {
    if (selectedPhoto) {
      navigation.navigate('StoryEditor', { 
        imageUri: selectedPhoto 
      });
    }
  };

  const handleClose = () => {
    // Reset the navigation state and go to home
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'StoryHome' }],
      })
    );
  };

  const renderPhotoItem = ({ item, index }: { item: PhotoItem; index: number }) => {
    if (index === 0) {
      return (
        <TouchableOpacity 
          style={styles.cameraButton}
          onPress={handleCameraPress}>
          <Ionicons name="camera" size={32} color="#fff" />
          <Text style={styles.cameraText}>Camera</Text>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity 
        style={[
          styles.photoItem,
          selectedPhoto === item.uri && styles.selectedPhoto,
        ]}
        onPress={() => setSelectedPhoto(item.uri)}>
        <Image source={{ uri: item.uri }} style={styles.photo} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={handleClose}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.headerButton}
        >
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Story</Text>
        {selectedPhoto ? (
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleNext}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-forward" size={24} color="#0095F6" />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerButton} />
        )}
      </View>

      {/* Preview Section */}
      {selectedPhoto && (
        <View style={styles.previewContainer}>
          <Image source={{ uri: selectedPhoto }} style={styles.previewImage} />
        </View>
      )}

      {/* Gallery Grid */}
      <View style={styles.galleryContainer}>
        <FlatList
          data={[{ id: 'camera', uri: 'camera' }, ...photos]}
          renderItem={renderPhotoItem}
          keyExtractor={item => item.id}
          numColumns={COLUMN_COUNT}
          showsVerticalScrollIndicator={false}
          initialNumToRender={12}
          maxToRenderPerBatch={8}
          windowSize={11}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    height: 56,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  previewContainer: {
    width: width,
    height: width,
    backgroundColor: '#222',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  galleryContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  photoItem: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    padding: 1,
  },
  selectedPhoto: {
    opacity: 0.7,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  cameraButton: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 1,
  },
  cameraText: {
    color: '#fff',
    marginTop: 4,
    fontSize: 12,
  },
});

export default StoryAddScreen; 