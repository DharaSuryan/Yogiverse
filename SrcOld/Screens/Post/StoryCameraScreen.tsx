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
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import * as ImagePicker from 'react-native-image-picker';

const StoryCameraScreen = () => {
  const navigation = useNavigation();
  const cameraRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const devices = useCameraDevices();
  const device = devices.back;

  const requestPermissions = useCallback(async () => {
    try {
      if (Platform.OS === 'ios') {
        const cameraPermission = await request(PERMISSIONS.IOS.CAMERA);
        const microphonePermission = await request(PERMISSIONS.IOS.MICROPHONE);
        
        if (cameraPermission === RESULTS.GRANTED && microphonePermission === RESULTS.GRANTED) {
          setHasPermission(true);
        } else {
          Alert.alert(
            'Permission Required',
            'Please enable camera and microphone access in your device settings to create stories.',
            [
              {
                text: 'Cancel',
                onPress: () => navigation.goBack(),
                style: 'cancel',
              },
              {
                text: 'Open Settings',
                onPress: () => {
                  // Open device settings
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
            'Please enable camera and microphone access in your device settings to create stories.',
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

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePhoto({
          qualityPrioritization: 'quality',
          flash: 'off',
        });
        navigation.navigate('StoryPreview', { uri: `file://${photo.path}` });
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to take picture');
      }
    }
  };

  const startRecording = async () => {
    if (cameraRef.current) {
      try {
        setIsRecording(true);
        await cameraRef.current.startRecording({
          onRecordingFinished: (video) => {
            navigation.navigate('StoryPreview', { uri: `file://${video.path}` });
          },
          onRecordingError: (error) => {
            console.error('Error recording:', error);
            Alert.alert('Error', 'Failed to record video');
          },
        });
      } catch (error) {
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
      } catch (error) {
        console.error('Error stopping recording:', error);
        Alert.alert('Error', 'Failed to stop recording');
      }
    }
  };

  const handleGalleryPress = () => {
    ImagePicker.launchImageLibrary({
      mediaType: 'mixed',
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
        navigation.navigate('StoryPreview', {
          uri: selectedMedia.uri,
          type: selectedMedia.type?.includes('video') ? 'video' : 'image',
        });
      }
    });
  };

  if (!hasPermission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Icon name="camera" size={50} color="#fff" />
          <Text style={styles.permissionText}>
            Camera and microphone access is required to create stories
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
          <Text>Loading camera...</Text>
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
        photo={true}
        video={true}
      />
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="close" size={24} color="#fff" />
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
        </View>

        <TouchableOpacity
          style={styles.captureButton}
          onPress={takePicture}
        >
          <View style={styles.captureIcon} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.galleryButton}
        onPress={handleGalleryPress}
      >
        <Icon name="images" size={24} color="#fff" />
      </TouchableOpacity>
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
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#fff',
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
    backgroundColor: '#0095f6',
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
  galleryButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default StoryCameraScreen; 