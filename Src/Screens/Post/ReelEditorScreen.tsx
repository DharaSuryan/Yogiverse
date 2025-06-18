import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  TextInput,
  Alert,
  Platform,
  PanResponder,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import Video, { VideoRef } from 'react-native-video';
import Slider from '@react-native-community/slider';
import { CreatePostStackParamList } from '../../Navigation/types';
import { Video as ExpoVideo, ResizeMode } from 'expo-av';
import { MaterialIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

const { width, height } = Dimensions.get('window');

type ReelEditorScreenRouteProp = RouteProp<CreatePostStackParamList, 'ReelEditor'>;
type ReelEditorScreenNavigationProp = NativeStackNavigationProp<CreatePostStackParamList, 'ReelEditor'>;

interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  startTime: number;
  endTime: number;
  color: string;
}

const ReelEditorScreen: React.FC = () => {
  const navigation = useNavigation<ReelEditorScreenNavigationProp>();
  const route = useRoute<ReelEditorScreenRouteProp>();
  const { media } = route.params;
  const videoRef = useRef<VideoRef>(null);
  const [status, setStatus] = useState<any>({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<'trim' | 'filter' | 'text' | 'music' | null>(null);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(1);
  const [duration, setDuration] = useState(0);
  const [paused, setPaused] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [isTrimming, setIsTrimming] = useState(false);
  const [isAddingText, setIsAddingText] = useState(false);
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [selectedOverlay, setSelectedOverlay] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const [textColor, setTextColor] = useState('#FFFFFF');

  const colors = [
    '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', 
    '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#008080'
  ];

  useEffect(() => {
    if (status.durationMillis) {
      setDuration(status.durationMillis);
      setTrimEnd(status.durationMillis);
    }
  }, [status.durationMillis]);

  const handlePlayPause = async () => {
    if (videoRef.current) {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleProgress = (data: { currentTime: number }) => {
    setCurrentTime(data.currentTime);
    if (data.currentTime >= trimEnd) {
      videoRef.current?.seek(trimStart);
    }
  };

  const handleDuration = (data: { duration: number }) => {
    setDuration(data.duration);
  };

  const handleAddText = () => {
    setIsAddingText(true);
    setTextInput('');
    setSelectedOverlay(null);
  };

  const handleSaveText = () => {
    if (textInput.trim()) {
      const newOverlay: TextOverlay = {
        id: Date.now().toString(),
        text: textInput,
        x: width / 2,
        y: height / 2,
        startTime: currentTime,
        endTime: Math.min(currentTime + 3, duration), // Default 3 seconds duration
        color: textColor,
      };
      setTextOverlays([...textOverlays, newOverlay]);
      setTextInput('');
      setIsAddingText(false);
    }
  };

  const handleUpdateTextTiming = (id: string, startTime: number, endTime: number) => {
    setTextOverlays(overlays =>
      overlays.map(overlay =>
        overlay.id === id
          ? { ...overlay, startTime, endTime }
          : overlay
      )
    );
  };

  const handleTrimStartChange = (value: number) => {
    if (value < trimEnd) {
      setTrimStart(value);
      videoRef.current?.seek(value);
    }
  };

  const handleTrimEndChange = (value: number) => {
    if (value > trimStart) {
      setTrimEnd(value);
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      // Here you would implement the actual video editing logic
      // For now, we'll just simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Show success message
      Alert.alert(
        'Success',
        'Reel edited successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.navigate('ReelPreview', {
                videoUri: media.uri,
                isEdited: true
              });
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save edited reel');
    } finally {
      setIsLoading(false);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt, gestureState) => {
        const { locationX, locationY } = evt.nativeEvent;
        const touchedOverlay = textOverlays.find(overlay => {
          const textWidth = overlay.text.length * 15; // Approximate text width
          const textHeight = 30; // Approximate text height
          return (
            locationX >= overlay.x - textWidth / 2 &&
            locationX <= overlay.x + textWidth / 2 &&
            locationY >= overlay.y - textHeight / 2 &&
            locationY <= overlay.y + textHeight / 2
          );
        });
        if (touchedOverlay) {
          setSelectedOverlay(touchedOverlay.id);
          setPaused(true);
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        if (selectedOverlay) {
          setTextOverlays(overlays =>
            overlays.map(overlay =>
              overlay.id === selectedOverlay
                ? {
                    ...overlay,
                    x: overlay.x + gestureState.dx,
                    y: overlay.y + gestureState.dy,
                  }
                : overlay
            )
          );
        }
      },
      onPanResponderRelease: () => {
        setSelectedOverlay(null);
      },
    })
  ).current;

  const renderTextOverlays = () => {
    return textOverlays.map(overlay => {
      if (currentTime >= overlay.startTime && currentTime <= overlay.endTime) {
        return (
          <Text
            key={overlay.id}
            style={[
              styles.textOverlay,
              {
                color: overlay.color,
                left: overlay.x,
                top: overlay.y,
                transform: [{ translateX: -50 }, { translateY: -15 }],
              },
            ]}
            {...panResponder.panHandlers}
          >
            {overlay.text}
          </Text>
        );
      }
      return null;
    });
  };

  const renderTrimControls = () => {
    if (selectedOption !== 'trim') return null;
    
    return (
      <View style={styles.trimControls}>
        <Text style={styles.trimLabel}>Trim Video</Text>
        <View style={styles.sliderContainer}>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={duration}
            value={trimStart}
            onValueChange={handleTrimStartChange}
            minimumTrackTintColor="#1DA1F2"
            maximumTrackTintColor="#E1E8ED"
          />
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={duration}
            value={trimEnd}
            onValueChange={handleTrimEndChange}
            minimumTrackTintColor="#1DA1F2"
            maximumTrackTintColor="#E1E8ED"
          />
        </View>
        <View style={styles.trimTimeContainer}>
          <Text style={styles.trimTime}>{formatTime(trimStart)}</Text>
          <Text style={styles.trimTime}>{formatTime(trimEnd)}</Text>
        </View>
      </View>
    );
  };

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const renderEditOptions = () => {
    return (
      <View style={styles.editOptions}>
        <TouchableOpacity
          style={[styles.editOption, selectedOption === 'trim' && styles.selectedOption]}
          onPress={() => setSelectedOption(selectedOption === 'trim' ? null : 'trim')}
        >
          <MaterialIcons name="content-cut" size={24} color={selectedOption === 'trim' ? '#1DA1F2' : '#fff'} />
          <Text style={[styles.optionText, selectedOption === 'trim' && styles.selectedOptionText]}>Trim</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.editOption, selectedOption === 'filter' && styles.selectedOption]}
          onPress={() => setSelectedOption(selectedOption === 'filter' ? null : 'filter')}
        >
          <MaterialIcons name="filter" size={24} color={selectedOption === 'filter' ? '#1DA1F2' : '#fff'} />
          <Text style={[styles.optionText, selectedOption === 'filter' && styles.selectedOptionText]}>Filter</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.editOption, selectedOption === 'text' && styles.selectedOption]}
          onPress={() => setSelectedOption(selectedOption === 'text' ? null : 'text')}
        >
          <MaterialIcons name="text-fields" size={24} color={selectedOption === 'text' ? '#1DA1F2' : '#fff'} />
          <Text style={[styles.optionText, selectedOption === 'text' && styles.selectedOptionText]}>Text</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.editOption, selectedOption === 'music' && styles.selectedOption]}
          onPress={() => setSelectedOption(selectedOption === 'music' ? null : 'music')}
        >
          <MaterialIcons name="music-note" size={24} color={selectedOption === 'music' ? '#1DA1F2' : '#fff'} />
          <Text style={[styles.optionText, selectedOption === 'music' && styles.selectedOptionText]}>Music</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Reel</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#1DA1F2" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.videoContainer}>
        <ExpoVideo
          ref={videoRef}
          source={{ uri: media.uri }}
          style={styles.video}
          resizeMode={ResizeMode.COVER}
          isLooping
          onPlaybackStatusUpdate={setStatus}
        />
        {renderTextOverlays()}
        <View style={styles.controls}>
          <TouchableOpacity onPress={handlePlayPause} style={styles.playButton}>
            <MaterialIcons
              name={isPlaying ? 'pause' : 'play-arrow'}
              size={40}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      </View>

      {renderEditOptions()}
      {renderTrimControls()}

      <View style={styles.progressBar}>
        <View style={[styles.progress, { width: `${(status.positionMillis || 0) / (status.durationMillis || 1) * 100}%` }]} />
      </View>

      <View style={styles.toolsContainer}>
        <TouchableOpacity 
          style={[styles.toolButton, isAddingText && styles.activeToolButton]} 
          onPress={handleAddText}
        >
          <Icon name="text" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.toolButton, isTrimming && styles.activeToolButton]} 
          onPress={() => setIsTrimming(!isTrimming)}
        >
          <Icon name="cut" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {isAddingText && (
        <View style={styles.textEditorContainer}>
          <TextInput
            style={styles.textInput}
            value={textInput}
            onChangeText={setTextInput}
            placeholder="Add text..."
            placeholderTextColor="#666"
            multiline
          />
          <View style={styles.colorPicker}>
            {colors.map(color => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorButton,
                  { backgroundColor: color },
                  textColor === color && styles.selectedColorButton,
                ]}
                onPress={() => setTextColor(color)}
              />
            ))}
          </View>
          <View style={styles.textEditorButtons}>
            <TouchableOpacity 
              style={styles.textEditorButton} 
              onPress={() => setIsAddingText(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.textEditorButton, styles.saveTextButton]} 
              onPress={handleSaveText}
            >
              <Text style={styles.buttonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {selectedOverlay && (
        <View style={styles.timingControls}>
          <Text style={styles.timingTitle}>Text Timing</Text>
          <View style={styles.timingInputs}>
            <View style={styles.timingInput}>
              <Text style={styles.timingLabel}>Start (s)</Text>
              <TextInput
                style={styles.timingTextInput}
                keyboardType="numeric"
                value={textOverlays.find(o => o.id === selectedOverlay)?.startTime.toFixed(1)}
                onChangeText={(value) => {
                  const startTime = parseFloat(value);
                  if (!isNaN(startTime)) {
                    handleUpdateTextTiming(
                      selectedOverlay,
                      startTime,
                      textOverlays.find(o => o.id === selectedOverlay)?.endTime || 0
                    );
                  }
                }}
              />
            </View>
            <View style={styles.timingInput}>
              <Text style={styles.timingLabel}>End (s)</Text>
              <TextInput
                style={styles.timingTextInput}
                keyboardType="numeric"
                value={textOverlays.find(o => o.id === selectedOverlay)?.endTime.toFixed(1)}
                onChangeText={(value) => {
                  const endTime = parseFloat(value);
                  if (!isNaN(endTime)) {
                    handleUpdateTextTiming(
                      selectedOverlay,
                      textOverlays.find(o => o.id === selectedOverlay)?.startTime || 0,
                      endTime
                    );
                  }
                }}
              />
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  saveButton: {
    color: '#bea063',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#1DA1F2',
    fontSize: 16,
    fontWeight: '600',
  },
  videoContainer: {
    width: width,
    height: height * 0.5,
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  controls: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    backgroundColor: '#111',
  },
  toolButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeToolButton: {
    backgroundColor: '#bea063',
  },
  textEditorContainer: {
    padding: 15,
    backgroundColor: '#111',
  },
  textInput: {
    backgroundColor: '#222',
    color: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  colorPicker: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  colorButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#333',
  },
  selectedColorButton: {
    borderColor: '#fff',
  },
  textEditorButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  textEditorButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 8,
    backgroundColor: '#333',
    alignItems: 'center',
  },
  saveTextButton: {
    backgroundColor: '#bea063',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  textOverlay: {
    position: 'absolute',
    fontSize: 24,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  trimContainer: {
    padding: 20,
    backgroundColor: '#111',
  },
  trimTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  timeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  timeLabel: {
    color: '#fff',
    fontSize: 12,
  },
  trimSlider: {
    width: '100%',
    height: 40,
  },
  trimControls: {
    padding: 16,
    backgroundColor: '#1a1a1a',
  },
  trimLabel: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
  },
  sliderContainer: {
    marginVertical: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  trimTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  trimTime: {
    color: '#fff',
    fontSize: 12,
  },
  editOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  editOption: {
    alignItems: 'center',
    padding: 8,
  },
  selectedOption: {
    borderBottomWidth: 2,
    borderBottomColor: '#1DA1F2',
  },
  optionText: {
    color: '#fff',
    marginTop: 4,
    fontSize: 12,
  },
  selectedOptionText: {
    color: '#1DA1F2',
  },
  progressBar: {
    height: 2,
    backgroundColor: '#333',
    width: '100%',
  },
  progress: {
    height: '100%',
    backgroundColor: '#1DA1F2',
  },
  timingControls: {
    padding: 15,
    backgroundColor: '#111',
  },
  timingTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  timingInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timingInput: {
    flex: 1,
    marginHorizontal: 5,
  },
  timingLabel: {
    color: '#fff',
    fontSize: 12,
    marginBottom: 5,
  },
  timingTextInput: {
    backgroundColor: '#222',
    color: '#fff',
    padding: 8,
    borderRadius: 4,
    textAlign: 'center',
  },
});

export default ReelEditorScreen; 