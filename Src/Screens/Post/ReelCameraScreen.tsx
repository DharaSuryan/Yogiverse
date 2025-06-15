import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  SafeAreaView,
  Platform,
  Alert,
} from 'react-native';
import { Camera } from 'react-native-camera';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CreatePostStackParamList } from '../../Navigation/types';
import Icon from 'react-native-vector-icons/Ionicons';
import ImagePicker from 'react-native-image-crop-picker';

type ReelCameraScreenNavigationProp = NativeStackNavigationProp<CreatePostStackParamList, 'ReelCamera'>;

const ReelCameraScreen = () => {
  const navigation = useNavigation<ReelCameraScreenNavigationProp>();
  const cameraRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const startRecording = async () => {
    if (cameraRef.current) {
      try {
        setIsRecording(true);
        const data = await cameraRef.current.recordAsync({
          maxDuration: 60, // Maximum 60 seconds
          quality: '720p',
        });
        navigation.navigate('ReelPreview', { uri: data.uri });
      } catch (error) {
        console.error('Error recording:', error);
      }
    }
  };

  const stopRecording = () => {
    if (cameraRef.current) {
      cameraRef.current.stopRecording();
      setIsRecording(false);
    }
  };

  const handleGalleryPick = () => {
    ImagePicker.openPicker({
      mediaType: 'video',
      maxDuration: 60,
    }).then(media => {
      navigation.navigate('ReelPreview', {
        media: { uri: media.path, type: 'video' }
      });
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={Camera.Constants.Type.back}
        captureAudio={true}
      >
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
        </View>
      </Camera>
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
    flex: 1,
    backgroundColor: 'transparent',
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
    justifyContent: 'flex-end',
    paddingBottom: 30,
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
});

export default ReelCameraScreen; 