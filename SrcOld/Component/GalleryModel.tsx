import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  Dimensions,
} from 'react-native';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import { Asset, launchCamera } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';
const { width } = Dimensions.get('window');
const numColumns = 3;
const tileSize = width / numColumns;

const GalleryModal = ({ visible, onClose, onSelectImage , navigation}:any) => {
 const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    requestPermission();
  }, []);

  const requestPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const permission = 
          Platform.Version >= 33
            ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
            : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

        const granted = await PermissionsAndroid.request(permission, {
          title: 'Gallery Access Permission',
          message: 'App needs access to your gallery to select images.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        });

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          fetchPhotos();
        } else {
          console.log('Permission denied');
        }
      } catch (err) {
        console.warn('Permission error:', err);
      }
    } else {
      fetchPhotos();
    }
  };

  const fetchPhotos = async () => {
    try {
      const { edges } = await CameraRoll.getPhotos({
        first: 30,
        assetType: 'Photos',
      });
      
      const photoData = edges.map(edge => ({
        uri: edge.node.image.uri,
        id: edge.node.image.uri
      }));
      
      setPhotos(photoData);
    } catch (error) {
      console.log('Error fetching photos:', error);
    }
  };

  const handleCameraPress = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'App needs camera access to take pictures.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        launchCamera(
          {
            mediaType: 'photo',
            quality: 1,
          },
          (response) => {
            if (response.didCancel) {
              console.log('User cancelled camera');
            } else if (response.error) {
              console.log('Camera Error:', response.error);
            } else if (response.assets && response.assets[0]) {
              setSelectedPhoto(response.assets[0].uri);
            }
          },
        );
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const renderItem = ({ item, index }) => {
    if (index === 0) {
      return (
        <TouchableOpacity 
          style={[styles.photoTile, styles.cameraTile]}
          onPress={handleCameraPress}
        >
          <Icon name="camera" size={28} color="#fff" />
        </TouchableOpacity>
      );
    }
    
    return (
      <TouchableOpacity
        onPress={() => setSelectedPhoto(item.uri)}
        style={styles.photoTile}
      >
        <Image
          source={{ uri: item.uri }}
          style={[
            styles.photo,
            selectedPhoto === item.uri && styles.selectedPhoto,
          ]}
        />
      </TouchableOpacity>
    );
  };

  const handleDone = () => {
    if (selectedPhoto) {
      // Handle the selected photo here
      console.log('Selected photo:', selectedPhoto);
    }
    navigation.goBack();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity>
            <Text style={styles.headerText}>Recents ▼</Text>
          </TouchableOpacity>
          <Text style={styles.headerText}>Add to Story</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Grid */}
       <FlatList
        data={[{}, ...photos]}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        numColumns={numColumns}
        style={styles.grid}
        removeClippedSubviews={true}
        maxToRenderPerBatch={12}
        windowSize={21}
        initialNumToRender={12}
        getItemLayout={(data, index) => ({
          length: tileSize,
          offset: tileSize * Math.floor(index / numColumns),
          index,
        })}
      />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: {
    height: 60,
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  headerText: {
    color: '#fff',
    fontSize: 16,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cameraTile: {
    width: '33.33%',
    aspectRatio: 1,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageTile: {
    width: '33.33%',
    aspectRatio: 1,
  },
  image: {
    flex: 1,
    resizeMode: 'cover',
  },
   photoTile: {
    width: tileSize,
    height: tileSize,
    padding: 1,
  }, grid: {
    flex: 1,
  },
});

export default GalleryModal;
