import { useEffect, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import CameraRoll, { PhotoIdentifier  } from '@react-native-camera-roll/camera-roll';

type UseGalleryPickerReturn = {
  galleryImages?: string[];
  galleryModalVisible?: boolean;
  openGallery?: () => void;
  closeGallery?: () => void;
};

const useGalleryPicker = (): UseGalleryPickerReturn => {
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryModalVisible, setGalleryModalVisible] = useState<boolean>(false);

  const requestPermissionAndFetch = async () => {
    try {
      if (Platform.OS === 'android') {
        const permission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES ||
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
        );

        if (permission !== PermissionsAndroid.RESULTS.GRANTED) return;
      }

     const photos = await (CameraRoll as any).getPhotos({ first: 30, assetType: 'Photos' });
      const uris = photos.edges.map((edge: PhotoIdentifier) => edge.node.image.uri);
      setGalleryImages(uris);
    } catch (error) {
      console.log('Error fetching images:', error);
    }
  };

  useEffect(() => {
    if (galleryModalVisible) {
      requestPermissionAndFetch();
    }
  }, [galleryModalVisible]);

  const openGallery = () => setGalleryModalVisible(true);
  const closeGallery = () => setGalleryModalVisible(false);

  return {
    galleryImages,
    galleryModalVisible,
    openGallery,
    closeGallery,
  };
};

export default useGalleryPicker;
