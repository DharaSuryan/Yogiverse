import { Platform, Alert, Linking, PermissionsAndroid } from 'react-native';
import * as ImagePicker from 'react-native-image-picker';

// Camera permission handling
export const requestCameraPermission = async (): Promise<boolean> => {
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
      console.error('Android camera permission error:', err);
      Alert.alert('Permission Error', 'Failed to request camera permission');
      return false;
    }
  } else {
    // iOS permissions are handled by react-native-image-picker
    return true;
  }
};

// Photo library permission handling
export const requestPhotoLibraryPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: 'Photo Library Permission',
          message: 'App needs access to your photo library to select photos and videos.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.error('Android photo library permission error:', err);
      Alert.alert('Permission Error', 'Failed to request photo library permission');
      return false;
    }
  } else {
    // iOS permissions are handled by react-native-image-picker
    return true;
  }
};

// Check camera permissions and show appropriate alerts
export const checkCameraPermissions = async (): Promise<boolean> => {
  if (Platform.OS === 'ios') {
    // For iOS, we'll let react-native-image-picker handle the permission request
    return true;
  } else {
    // For Android, check if permission is already granted
    try {
      const granted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
      if (!granted) {
        Alert.alert(
          'Camera Permission Required',
          'This app needs camera access to take photos and videos. Please grant camera permission in Settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Open Settings', 
              onPress: () => Linking.openSettings() 
            }
          ]
        );
        return false;
      }
      return true;
    } catch (err) {
      console.error('Error checking camera permission:', err);
      return false;
    }
  }
};

// Check photo library permissions and show appropriate alerts
export const checkPhotoLibraryPermissions = async (): Promise<boolean> => {
  if (Platform.OS === 'ios') {
    // For iOS, we'll let react-native-image-picker handle the permission request
    return true;
  } else {
    // For Android, check if permission is already granted
    try {
      const granted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
      if (!granted) {
        Alert.alert(
          'Photo Library Permission Required',
          'This app needs photo library access to select photos and videos. Please grant permission in Settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Open Settings', 
              onPress: () => Linking.openSettings() 
            }
          ]
        );
        return false;
      }
      return true;
    } catch (err) {
      console.error('Error checking photo library permission:', err);
      return false;
    }
  }
};

// Handle camera launch with proper error handling
export const launchCameraWithPermission = async (
  options: ImagePicker.CameraOptions,
  callback: (response: ImagePicker.ImagePickerResponse) => void
): Promise<void> => {
  const hasPermission = await checkCameraPermissions();
  if (!hasPermission) {
    if (Platform.OS === 'ios') {
      Alert.alert(
        'Camera Permission Required',
        'Please enable camera access in Settings > Privacy & Security > Camera > Yogiverse',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Open Settings', 
            onPress: () => Linking.openSettings() 
          }
        ]
      );
    }
    return;
  }

  ImagePicker.launchCamera(options, (response) => {
    if (response.errorCode === 'permission') {
      Alert.alert(
        'Permission Denied',
        'Camera permission is required. Please enable it in Settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Open Settings', 
            onPress: () => Linking.openSettings() 
          }
        ]
      );
    } else {
      callback(response);
    }
  });
};

// Handle image library launch with proper error handling
export const launchImageLibraryWithPermission = async (
  options: ImagePicker.ImageLibraryOptions,
  callback: (response: ImagePicker.ImagePickerResponse) => void
): Promise<void> => {
  const hasPermission = await checkPhotoLibraryPermissions();
  if (!hasPermission) {
    if (Platform.OS === 'ios') {
      Alert.alert(
        'Photo Library Permission Required',
        'Please enable photo library access in Settings > Privacy & Security > Photos > Yogiverse',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Open Settings', 
            onPress: () => Linking.openSettings() 
          }
        ]
      );
    }
    return;
  }

  ImagePicker.launchImageLibrary(options, (response) => {
    if (response.errorCode === 'permission') {
      Alert.alert(
        'Permission Denied',
        'Photo library permission is required. Please enable it in Settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Open Settings', 
            onPress: () => Linking.openSettings() 
          }
        ]
      );
    } else {
      callback(response);
    }
  });
}; 