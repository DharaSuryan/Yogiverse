import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';

export const testFirebaseSetup = async () => {
  try {
    console.log('🔥 Testing Firebase setup...');
    
    // Check if Firebase is initialized
    const isInitialized = messaging().isDeviceRegisteredForRemoteMessages;
    console.log('📱 Device registered for remote messages:', isInitialized);
    
    // Get FCM token
    const token = await messaging().getToken();
    console.log('🔑 FCM Token:', token);
    
    // Check authorization status
    const authStatus = await messaging().requestPermission();
    console.log('🔐 Authorization status:', authStatus);
    
    // Test foreground message listener
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('📨 Foreground message received:', remoteMessage);
    });
    
    console.log('✅ Firebase setup test completed successfully!');
    
    return {
      success: true,
      token,
      authStatus,
      isInitialized
    };
  } catch (error) {
    console.error('❌ Firebase setup test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const requestNotificationPermission = async () => {
  try {
    const authStatus = await messaging().requestPermission({
      alert: true,
      announcement: false,
      badge: true,
      carPlay: false,
      criticalAlert: false,
      provisional: false,
      sound: true,
    });
    
    console.log('🔐 Notification permission status:', authStatus);
    return authStatus;
  } catch (error) {
    console.error('❌ Failed to request notification permission:', error);
    return null;
  }
};















