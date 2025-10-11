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
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import Video from 'react-native-video';
import Slider from '@react-native-community/slider';
import { CreatePostStackParamList } from '../../Navigation/types';

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
  const videoRef = useRef<Video>(null);

  const [paused, setPaused] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [isTrimming, setIsTrimming] = useState(false);
  const [isAddingText, setIsAddingText] = useState(false);
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [selectedOverlay, setSelectedOverlay] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const [textColor, setTextColor] = useState('#FFFFFF');

  // Always start paused when entering the screen
  useEffect(() => {
    setPaused(false);
  }, []);

  const colors = [
    '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', 
    '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#008080'
  ];

  useEffect(() => {
    if (duration > 0) {
      setTrimEnd(duration);
    }
  }, [duration]);

  const handlePlayPause = () => {
    setPaused(!paused);
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

  const handleSave = () => {
    Alert.alert(
      'Save Reel',
      `Video will be trimmed from ${trimStart.toFixed(1)}s to ${trimEnd.toFixed(1)}s`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Save',
          onPress: () => {
            // Implement video trimming and saving logic here
            navigation.goBack();
          },
        },
      ]
    );
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Reel</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveButton}>Save</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.videoContainer}>
        <Video
          ref={videoRef}
          source={{ uri: media.uri }}
          style={styles.video}
          resizeMode="cover"
          paused={paused}
          muted={true}
          onProgress={handleProgress}
          onLoad={handleDuration}
          repeat={true}
        />
        {renderTextOverlays()}
        <View style={styles.controls}>
          <TouchableOpacity onPress={handlePlayPause} style={styles.playButton}>
            <Icon name={paused ? 'play' : 'pause'} size={30} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.toolsContainer}>
        {/* <TouchableOpacity 
          style={[styles.toolButton, isAddingText && styles.activeToolButton]} 
          onPress={handleAddText}
        >
          <Icon name="text" size={24} color={isAddingText ? '#fff' : '#bea063'} />
          <Text style={{ color: isAddingText ? '#fff' : '#bea063', fontWeight: '600', fontSize: 12 }}>Text</Text>
        </TouchableOpacity> */}
        <TouchableOpacity 
          style={[styles.toolButton, isTrimming && styles.activeToolButton]} 
          onPress={() => setIsTrimming(!isTrimming)}
        >
          <Icon name="cut" size={24} color={isTrimming ? '#fff' : '#bea063'} />
          <Text style={{ color: isTrimming ? '#fff' : '#bea063', fontWeight: '600', fontSize: 12 }}>Trim</Text>
        </TouchableOpacity>
      </View>

      {/* {isAddingText && (
        <View style={styles.textEditorContainer}>
          <TextInput
            style={styles.textInput}
            value={textInput}
            onChangeText={setTextInput}
            placeholder="Add text..."
            placeholderTextColor="#fff"
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
      )} */}

{isTrimming && (
  <ScrollView contentContainerStyle={{
    padding: 16,
  paddingBottom: 40,
  }}>
    <View style={styles.trimContainer}>
      <Text style={styles.trimTitle}>Trim Video</Text>
      <View style={styles.timeLabels}>
        <Text style={styles.timeLabel}>{trimStart.toFixed(1)}s</Text>
        <Text style={styles.timeLabel}>{trimEnd.toFixed(1)}s</Text>
      </View>
      <Slider
        style={styles.trimSlider}
        minimumValue={0}
        maximumValue={duration}
        value={currentTime}
        onValueChange={(value) => videoRef.current?.seek(value)}
        minimumTrackTintColor="#bea063"
        maximumTrackTintColor="#666"
        thumbTintColor="#bea063"
      />
      <View style={styles.trimControls}>
        <View style={styles.trimControl}>
          <Text style={styles.trimLabel}>Start</Text>
          <Slider
            style={styles.trimRangeSlider}
            minimumValue={0}
            maximumValue={duration}
            value={trimStart}
            onValueChange={handleTrimStartChange}
            minimumTrackTintColor="#bea063"
            maximumTrackTintColor="#666"
            thumbTintColor="#bea063"
          />
        </View>
        <View style={styles.trimControl}>
          <Text style={styles.trimLabel}>End</Text>
          <Slider
            style={styles.trimRangeSlider}
            minimumValue={0}
            maximumValue={duration}
            value={trimEnd}
            onValueChange={handleTrimEndChange}
            minimumTrackTintColor="#bea063"
            maximumTrackTintColor="#666"
            thumbTintColor="#bea063"
          />
        </View>
      </View>
    </View>
  </ScrollView>
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
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
  },
  headerTitle: {
    color: '#bea063',
    fontSize: 18,
    fontWeight: '600',
  },
  saveButton: {
    color: '#bea063',
    fontSize: 16,
    fontWeight: '600',
  },
  videoContainer: {
    width: width,
    height: height * 0.5,
    backgroundColor: '#fff',
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
    backgroundColor: '#bea063',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    backgroundColor: '#fff',
  },
  toolButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#bea063',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeToolButton: {
    backgroundColor: '#bea063',
  },
  textEditorContainer: {
    padding: 15,
    backgroundColor: '#fff',
  },
  textInput: {
    backgroundColor: '#fff',
    color: '#222',
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
    borderColor: '#bea063',
  },
  selectedColorButton: {
    borderColor: '#bea063',
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
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#bea063',
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
    color: '#bea063',
  },
  trimContainer: {
    padding: 20,
    backgroundColor: '#fff',
  },
  trimTitle: {
    color: '#bea063',
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
    color: '#bea063',
    fontSize: 12,
  },
  trimSlider: {
    width: '100%',
    height: 40,
  },
  trimControls: {
    marginTop: 20,
  },
  trimControl: {
    marginBottom: 15,
  },
  trimLabel: {
    color: '#bea063',
    fontSize: 14,
    marginBottom: 5,
  },
  trimRangeSlider: {
    width: '100%',
    height: 40,
  },
  timingControls: {
    padding: 15,
    backgroundColor: '#fff',
  },
  timingTitle: {
    color: '#bea063',
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
    color: '#bea063',
    fontSize: 12,
    marginBottom: 5,
  },
  timingTextInput: {
    backgroundColor: '#fff',
    color: '#222',
    padding: 8,
    borderRadius: 4,
    textAlign: 'center',
  },
});

export default ReelEditorScreen; 