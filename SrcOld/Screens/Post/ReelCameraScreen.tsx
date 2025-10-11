import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  SafeAreaView,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import * as ImagePicker from 'react-native-image-picker';
import { Camera, useCameraDevices, CameraDevice } from 'react-native-vision-camera';

const ReelCameraScreen = () => {
  const navigation = useNavigation();
  const cameraRef = useRef<Camera>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const devices = useCameraDevices();
  const device = devices.find((d: CameraDevice) => d.position === 'back');
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const requestPermissions = useCallback(async () => {
    try {
      if (Platform.OS === 'ios') {
        const cameraPermission = await request(PERMISSIONS.IOS.CAMERA);
        const microphonePermission = await request(PERMISSIONS.IOS.MICROPHONE);
        console.log("cameraPermission",cameraPermission);
        console.log("microphonePermission",microphonePermission);
        
        
        if (cameraPermission === RESULTS.GRANTED && microphonePermission === RESULTS.GRANTED) {
          setHasPermission(true);
        } else {
          Alert.alert(
            'Permission Required',
            'Please enable camera and microphone access in your device settings to create reels.',
            [
              {
                text: 'Cancel',
                onPress: () => navigation.goBack(),
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
        }
      } else {
        // Android permissions
        const cameraPermission = await request(PERMISSIONS.ANDROID.CAMERA);
        const microphonePermission = await request(PERMISSIONS.ANDROID.RECORD_AUDIO);
        
        if (cameraPermission === RESULTS.GRANTED && microphonePermission === RESULTS.GRANTED) {
          setHasPermission(true);
        } else {
          Alert.alert(
            'Permission Required',
            'Please enable camera and microphone access in your device settings to create reels.',
            [
              {
                text: 'Cancel',
                onPress: () => navigation.goBack(),
                style: 'cancel',
              },
              {
                text: 'Open Settings',
                onPress: () => {
                  Linking.openSettings();
                },
              },
            ]
          );
        }
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
      Alert.alert('Error', 'Failed to request permissions');
      navigation.goBack();
    }
  }, [navigation]);

  const checkPermissions = useCallback(async () => {
    try {
      if (Platform.OS === 'ios') {
        const cameraPermission = await check(PERMISSIONS.IOS.CAMERA);
        const microphonePermission = await check(PERMISSIONS.IOS.MICROPHONE);
        
        if (cameraPermission === RESULTS.GRANTED && microphonePermission === RESULTS.GRANTED) {
          setHasPermission(true);
        } else {
          requestPermissions();
        }
      } else {
        // Android permissions
        const cameraPermission = await check(PERMISSIONS.ANDROID.CAMERA);
        const microphonePermission = await check(PERMISSIONS.ANDROID.RECORD_AUDIO);
        
        if (cameraPermission === RESULTS.GRANTED && microphonePermission === RESULTS.GRANTED) {
          setHasPermission(true);
        } else {
          requestPermissions();
        }
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
      requestPermissions();
    }
  }, [requestPermissions]);

  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  const startRecording = async () => {
    if (cameraRef.current) {
      try {
        setIsRecording(true);
        setRecordingTime(0);
        timerRef.current = setInterval(() => {
          setRecordingTime(prev => {
            if (prev >= 14) { // 0-based, so stop at 15
              stopRecording();
              return 15;
            }
            return prev + 1;
          });
        }, 1000);
        await cameraRef.current.startRecording({
          onRecordingFinished: (video: { path: string }) => {
            if (timerRef.current) clearInterval(timerRef.current);
            setRecordingTime(0);
            navigation.navigate('ReelPreview', { uri: `file://${video.path}` });
          },
          onRecordingError: (error: any) => {
            if (timerRef.current) clearInterval(timerRef.current);
            setRecordingTime(0);
            console.error('Error recording:', error);
            Alert.alert('Error', 'Failed to record video');
          },
        });
      } catch (error) {
        if (timerRef.current) clearInterval(timerRef.current);
        setRecordingTime(0);
        console.error('Error starting recording:', error);
        Alert.alert('Error', 'Failed to start recording');
      }
    }
  };

  const stopRecording = async () => {
    if (cameraRef.current) {
      try {
        await cameraRef.current.stopRecording();
        setIsRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
        setRecordingTime(0);
      } catch (error) {
        if (timerRef.current) clearInterval(timerRef.current);
        setRecordingTime(0);
        console.error('Error stopping recording:', error);
        Alert.alert('Error', 'Failed to stop recording');
      }
    }
  };

  const handleGalleryPress = () => {
    ImagePicker.launchImageLibrary({
      mediaType: 'video',
      quality: 1,
      includeExtra: true,
    }, (response) => {
      if (response.didCancel) {
        return;
      }

      if (response.errorCode) {
        Alert.alert('Error', response.errorMessage);
        return;
      }

      if (response.assets && response.assets[0]) {
        const selectedMedia = response.assets[0];
        navigation.navigate('ReelPreview', {
          uri: selectedMedia.uri,
        });
      }
    });
  };

  if (!hasPermission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          {React.createElement(Ionicons as any, { name: 'camera', size: 50, color: '#bea063' })}
          <Text style={styles.permissionText}>
            Camera and microphone access is required to create reels
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermissions}
          >
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!device) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading camera...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        device={device}
        isActive={true}
        video={true}
      />
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          {React.createElement(Ionicons as any, { name: 'close', size: 24, color: '#fff' })}
        </TouchableOpacity>

        <View style={styles.recordingControls}>
          <TouchableOpacity
            style={[styles.recordButton, isRecording && styles.recording]}
            onPress={isRecording ? stopRecording : startRecording}
          >
            {isRecording ? (
              <View style={styles.stopIcon} />
            ) : (
              <View style={styles.recordIcon} />
            )}
          </TouchableOpacity>
          {isRecording && (
            <Text style={styles.timerText}>{recordingTime}s / 15s</Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.galleryButton}
          onPress={handleGalleryPress}
        >
          {React.createElement(Ionicons as any, { name: 'images', size: 24, color: '#fff' })}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  closeButton: {
    padding: 10,
  },
  recordingControls: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recording: {
    backgroundColor: 'rgba(255, 0, 0, 0.3)',
  },
  recordIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#fff',
  },
  stopIcon: {
    width: 30,
    height: 30,
    backgroundColor: '#fff',
  },
  galleryButton: {
    padding: 10,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#000',
  },
  permissionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
  },
  permissionButton: {
    backgroundColor: '#bea063',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    padding: 15,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
  },
  timerText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default ReelCameraScreen; 