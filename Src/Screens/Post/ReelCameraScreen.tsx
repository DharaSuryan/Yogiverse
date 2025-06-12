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
import { RNCamera } from 'react-native-camera';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CreatePostStackParamList } from '../../Navigation/types';
import Icon from 'react-native-vector-icons/Ionicons';
import ImagePicker from 'react-native-image-crop-picker';

type ReelCameraScreenNavigationProp = NativeStackNavigationProp<CreatePostStackParamList, 'ReelCamera'>;

const ReelCameraScreen = () => {
  const navigation = useNavigation<ReelCameraScreenNavigationProp>();
  const [isRecording, setIsRecording] = useState(false);
  const [cameraType, setCameraType] = useState<'front' | 'back'>('back');
  const [recordingTime, setRecordingTime] = useState(0);
  const cameraRef = useRef<RNCamera>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout>();

  const startRecording = async () => {
    if (cameraRef.current) {
      try {
        setIsRecording(true);
        setRecordingTime(0);
        
        // Start recording timer
        recordingTimerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);

        const data = await cameraRef.current.recordAsync({
          quality: RNCamera.Constants.VideoQuality['720p'],
          maxDuration: 60, // 60 seconds max
        });

        navigation.navigate('ReelPreview', {
          media: { uri: data.uri, type: 'video' }
        });
      } catch (error) {
        console.error('Error recording video:', error);
        Alert.alert('Error', 'Failed to record video. Please try again.');
      } finally {
        stopRecording();
      }
    }
  };

  const stopRecording = () => {
    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
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

  const toggleCamera = () => {
    setCameraType(prev => prev === 'back' ? 'front' : 'back');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <RNCamera
        ref={cameraRef}
        style={styles.camera}
        type={cameraType === 'back' ? RNCamera.Constants.Type.back : RNCamera.Constants.Type.front}
        captureAudio={true}
      >
        <View style={styles.overlay}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleGalleryPick}>
              <Icon name="images-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {isRecording && (
            <View style={styles.recordingIndicator}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingTime}>{formatTime(recordingTime)}</Text>
            </View>
          )}

          <View style={styles.controls}>
            <TouchableOpacity onPress={toggleCamera}>
              <Icon name="camera-reverse-outline" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.recordButton, isRecording && styles.recordingButton]} 
              onPress={isRecording ? stopRecording : startRecording}
            >
              <View style={styles.recordButtonInner} />
            </TouchableOpacity>
            <View style={{ width: 24 }} />
          </View>
        </View>
      </RNCamera>
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
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    paddingTop: Platform.OS === 'ios' ? 0 : 15,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 30,
  },
  recordButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingButton: {
    backgroundColor: 'rgba(255,0,0,0.3)',
  },
  recordButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ff0000',
  },
  recordingIndicator: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 70,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ff0000',
    marginRight: 8,
  },
  recordingTime: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ReelCameraScreen; 