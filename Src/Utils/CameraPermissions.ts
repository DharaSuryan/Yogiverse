import { Platform, Alert, Linking } from 'react-native';
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';

export interface PermissionResult {
  camera: boolean;
  microphone: boolean;
  allGranted: boolean;
}

// Check and request camera and microphone permissions for iOS
export const requestCameraAndMicrophonePermissions = async (): Promise<PermissionResult> => {
  if (Platform.OS !== 'ios') {
    return { camera: true, microphone: true, allGranted: true };
  }

  try {
    console.log('=== REQUESTING CAMERA AND MICROPHONE PERMISSIONS ===');
    
    // Check current permissions first
    const cameraStatus = await check(PERMISSIONS.IOS.CAMERA);
    const microphoneStatus = await check(PERMISSIONS.IOS.MICROPHONE);
    
    console.log('Current camera permission:', cameraStatus);
    console.log('Current microphone permission:', microphoneStatus);
    
    // Request permissions if not granted
    let cameraGranted = cameraStatus === RESULTS.GRANTED;
    let microphoneGranted = microphoneStatus === RESULTS.GRANTED;
    
    if (!cameraGranted) {
      console.log('Requesting camera permission...');
      const cameraResult = await request(PERMISSIONS.IOS.CAMERA);
      cameraGranted = cameraResult === RESULTS.GRANTED;
      console.log('Camera permission result:', cameraResult);
    }
    
    if (!microphoneGranted) {
      console.log('Requesting microphone permission...');
      const microphoneResult = await request(PERMISSIONS.IOS.MICROPHONE);
      microphoneGranted = microphoneResult === RESULTS.GRANTED;
      console.log('Microphone permission result:', microphoneResult);
    }
    
    const allGranted = cameraGranted && microphoneGranted;
    
    console.log('Final permissions:', { camera: cameraGranted, microphone: microphoneGranted, allGranted });
    
    return {
      camera: cameraGranted,
      microphone: microphoneGranted,
      allGranted
    };
    
  } catch (error) {
    console.error('Error requesting permissions:', error);
    return { camera: false, microphone: false, allGranted: false };
  }
};

// Show permission denied alert with settings option
export const showPermissionDeniedAlert = (missingPermissions: string[]) => {
  const permissionText = missingPermissions.join(' and ');
  
  Alert.alert(
    'Permission Required',
    `Please enable ${permissionText} access in your device settings to create reels.`,
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Open Settings',
        onPress: () => {
          if (Platform.OS === 'ios') {
            Linking.openURL('app-settings:');
          } else {
            Linking.openSettings();
          }
        },
      },
    ]
  );
};

// Check if permissions are granted without requesting
export const checkCameraAndMicrophonePermissions = async (): Promise<PermissionResult> => {
  if (Platform.OS !== 'ios') {
    return { camera: true, microphone: true, allGranted: true };
  }

  try {
    const cameraStatus = await check(PERMISSIONS.IOS.CAMERA);
    const microphoneStatus = await check(PERMISSIONS.IOS.MICROPHONE);
    
    const cameraGranted = cameraStatus === RESULTS.GRANTED;
    const microphoneGranted = microphoneStatus === RESULTS.GRANTED;
    const allGranted = cameraGranted && microphoneGranted;
    
    console.log('Permission check result:', { camera: cameraGranted, microphone: microphoneGranted, allGranted });
    
    return {
      camera: cameraGranted,
      microphone: microphoneGranted,
      allGranted
    };
    
  } catch (error) {
    console.error('Error checking permissions:', error);
    return { camera: false, microphone: false, allGranted: false };
  }
};

// Handle permission request with proper error handling
export const handleCameraPermissions = async (): Promise<boolean> => {
  try {
    const permissions = await requestCameraAndMicrophonePermissions();
    
    if (permissions.allGranted) {
      console.log('All permissions granted successfully');
      return true;
    } else {
      const missingPermissions = [];
      if (!permissions.camera) missingPermissions.push('camera');
      if (!permissions.microphone) missingPermissions.push('microphone');
      
      showPermissionDeniedAlert(missingPermissions);
      return false;
    }
  } catch (error) {
    console.error('Error handling camera permissions:', error);
    showPermissionDeniedAlert(['camera', 'microphone']);
    return false;
  }
};

