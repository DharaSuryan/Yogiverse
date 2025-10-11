import { Platform } from 'react-native';
import { check, PERMISSIONS, RESULTS } from 'react-native-permissions';

export const testPermissions = async () => {
  if (Platform.OS !== 'ios') {
    console.log('Permission test: Not iOS, skipping');
    return;
  }

  console.log('=== TESTING iOS PERMISSIONS ===');
  
  try {
    // Test camera permission
    const cameraStatus = await check(PERMISSIONS.IOS.CAMERA);
    console.log('Camera permission status:', cameraStatus);
    
    // Test microphone permission
    const microphoneStatus = await check(PERMISSIONS.IOS.MICROPHONE);
    console.log('Microphone permission status:', microphoneStatus);
    
    // Test if permissions are available
    console.log('Camera permission available:', cameraStatus !== RESULTS.UNAVAILABLE);
    console.log('Microphone permission available:', microphoneStatus !== RESULTS.UNAVAILABLE);
    
    // Check if permissions are denied
    if (cameraStatus === RESULTS.UNAVAILABLE) {
      console.log('❌ Camera permission is UNAVAILABLE - check Info.plist configuration');
    }
    
    if (microphoneStatus === RESULTS.UNAVAILABLE) {
      console.log('❌ Microphone permission is UNAVAILABLE - check Info.plist configuration');
    }
    
    if (cameraStatus === RESULTS.DENIED) {
      console.log('⚠️ Camera permission is DENIED - user needs to grant permission');
    }
    
    if (microphoneStatus === RESULTS.DENIED) {
      console.log('⚠️ Microphone permission is DENIED - user needs to grant permission');
    }
    
    if (cameraStatus === RESULTS.GRANTED && microphoneStatus === RESULTS.GRANTED) {
      console.log('✅ All permissions are GRANTED');
    }
    
  } catch (error) {
    console.error('Error testing permissions:', error);
  }
};

