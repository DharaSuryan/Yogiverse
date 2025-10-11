import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAddDevicesAPICall } from '../Api/Api';

export const requestUserPermission = async () => {
  try {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', authStatus);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Permission request error:', error);
    return false;
  }
};

export const getFCMToken = async () => {
  try {
    const fcmToken = await messaging().getToken();
    console.log('FCM Token:', fcmToken);
    return fcmToken;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};

export const registerFCMToken = async () => {
  try {
    // Request permission first
    const hasPermission = await requestUserPermission();
    if (!hasPermission) {
      console.log('User has not granted permission');
      return;
    }

    // Get the token
    const fcmToken = await getFCMToken();
    if (!fcmToken) {
      console.log('Failed to get FCM token');
      return;
    }

    // Store token locally
    await AsyncStorage.setItem('fcmToken', fcmToken);

    // Send token to server
    const data = new FormData();
    data.append('token', fcmToken);
    data.append('device_type', Platform.OS === 'android' ? 'android' : Platform.OS === 'ios' ? 'ios' : 'web');

    const response = await onAddDevicesAPICall(data);
    console.log('FCM token registration response:', response);
    return response;
  } catch (error) {
    console.error('Error registering FCM token:', error);
  }
};

export const setupFCMListeners = () => {
  // Handle foreground messages
  const unsubscribe = messaging().onMessage(async remoteMessage => {
    console.log('Received foreground message:', remoteMessage);
    // Handle the message here
  });

  // Handle background/quit state messages
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Received background message:', remoteMessage);
    // Handle the message here
  });

  // Handle notification open
  messaging().onNotificationOpenedApp(remoteMessage => {
    console.log('Notification opened app:', remoteMessage);
    // Handle notification open here
  });

  return unsubscribe;
}; 