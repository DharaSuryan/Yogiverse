import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  PanResponder,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import Video from 'react-native-video';
import { CreatePostStackParamList } from '../../Navigation/types';

const { width, height } = Dimensions.get('window');

type StoryEditorScreenRouteProp = RouteProp<CreatePostStackParamList, 'StoryEditor'>;
type StoryEditorScreenNavigationProp = NativeStackNavigationProp<CreatePostStackParamList, 'StoryEditor'>;

const StoryEditorScreen: React.FC = () => {
  const navigation = useNavigation<StoryEditorScreenNavigationProp>();
  const route = useRoute<StoryEditorScreenRouteProp>();
  const { media } = route.params; // Expecting a single media item for story

  const [storyText, setStoryText] = useState('');
  const [textPosition, setTextPosition] = useState({ x: width / 2, y: height / 2 });
  const [isEditingText, setIsEditingText] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paused, setPaused] = useState(false);
  const [selectedTextColor, setSelectedTextColor] = useState('#FFFFFF'); // Default text color
  const textInputRef = useRef<TextInput>(null);

  // Define a set of colors for the palette
  const textColors = [
    '#FFFFFF', // White
    '#000000', // Black
    '#FF0000', // Red
    '#00FF00', // Green
    '#0000FF', // Blue
    '#FFFF00', // Yellow
    '#FF00FF', // Magenta
    '#00FFFF', // Cyan
    '#FFA500', // Orange
    '#800080', // Purple
    '#008080', // Teal
    '#FFC0CB', // Pink
  ];

  // PanResponder for moving the text
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setIsEditingText(false); // Stop editing when starting to drag
        setPaused(true); // Pause video when dragging text
      },
      onPanResponderMove: (evt, gestureState) => {
        setTextPosition({
          x: textPosition.x + gestureState.dx,
          y: textPosition.y + gestureState.dy,
        });
      },
      onPanResponderRelease: () => {
        // The text has been moved
        setPaused(false); // Resume video after dragging text
      },
    })
  ).current;

  const handleShareStory = () => {
    if (loading) return;

    if (!media || !media.uri) {
      Alert.alert('Error', 'No media to share.');
      return;
    }

    setLoading(true);
    setPaused(true); // Pause video during sharing

    // Simulate API upload
    setTimeout(() => {
      setLoading(false);
      setPaused(false); // Resume or reset video after sharing completes
      Alert.alert(
        'Story Shared!',
        `Your story has been successfully shared. Text: "${storyText || '(No text)'}"`,
        [
          {
            text: 'OK',
            onPress: () => navigation.popToTop(),
          },
        ],
      );
    }, 1500);
  };

  const handleTextPress = () => {
    setIsEditingText(true);
    setPaused(true); // Pause video when editing text
    setTimeout(() => {
      textInputRef.current?.focus();
    }, 50);
  };

  return (
    <SafeAreaView style={styles.container}>
      {media && media.uri && media.type === 'video' ? (
        <Video 
          source={{ uri: media.uri }} 
          style={styles.mediaBackground} 
          resizeMode="cover" 
          repeat={true}
          paused={paused}
          controls={false}
        />
      ) : media && media.uri && media.type === 'photo' ? (
        <Image source={{ uri: media.uri }} style={styles.mediaBackground} resizeMode="cover" />
      ) : (
        <View style={styles.noMediaContainer}>
          <Icon name="image-outline" size={60} color="#ccc" />
          <Text style={styles.noMediaText}>No media selected.</Text>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Story</Text>
        <TouchableOpacity onPress={handleShareStory} style={styles.shareButton} disabled={loading}>
          <Text style={[styles.shareButtonText, loading && styles.shareButtonTextDisabled]}>Share</Text>
        </TouchableOpacity>
      </View>

      {/* Text Input Overlay */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.textInputContainerWrapper}
      >
        <View 
          style={[styles.textInputOverlay, { left: textPosition.x, top: textPosition.y }]}
          {...panResponder.panHandlers}
        >
          {!isEditingText && storyText.length === 0 ? (
            <TouchableOpacity onPress={handleTextPress} style={styles.addTextPrompt}>
              <Icon name="text-outline" size={30} color="#bbb" />
              <Text style={styles.addTextPromptText}>Tap to add text</Text>
            </TouchableOpacity>
          ) : (
            <TextInput
              ref={textInputRef}
              style={[
                styles.storyTextInput,
                { color: selectedTextColor },
                storyText.length > 0 && styles.storyTextInputFilled,
              ]}
              placeholder="Type your story..."
              placeholderTextColor="#ccc"
              value={storyText}
              onChangeText={setStoryText}
              multiline
              onFocus={() => setIsEditingText(true)}
              onBlur={() => setIsEditingText(false)}
              autoFocus={isEditingText}
              selectionColor={selectedTextColor}
            />
          )}
        </View>

        {/* Color Palette */}
        {isEditingText && (
          <View style={styles.colorPaletteContainer}>
            <FlatList
              data={textColors}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[styles.colorBubble, { backgroundColor: item }, selectedTextColor === item && styles.selectedColorBubble]}
                  onPress={() => setSelectedTextColor(item)}
                />
              )}
              keyExtractor={(item) => item}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.colorPaletteContent}
            />
          </View>
        )}
      </KeyboardAvoidingView>

      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Sharing story...</Text>
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
  mediaBackground: {
    position: 'absolute',
    width: width,
    height: height,
  },
  videoOverlay: {
    position: 'absolute',
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  videoOverlayText: {
    color: '#fff',
    fontSize: 20,
    marginTop: 10,
  },
  noMediaContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333',
    width: width,
    height: height,
  },
  noMediaText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  header: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 1,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  shareButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  shareButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  shareButtonTextDisabled: {
    opacity: 0.5,
  },
  textInputContainerWrapper: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInputOverlay: {
    position: 'absolute',
    padding: 10,
    minWidth: 150,
    maxWidth: width * 0.9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addTextPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
  },
  addTextPromptText: {
    color: '#bbb',
    fontSize: 16,
    marginLeft: 10,
  },
  storyTextInput: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 10,
    padding: 10,
    minHeight: 50,
  },
  storyTextInputFilled: {
    backgroundColor: 'transparent', // Make background transparent once text is entered
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  colorPaletteContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 10 : 0, // Adjust position based on keyboard for iOS
    left: 0,
    right: 0,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  colorPaletteContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorBubble: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginHorizontal: 5,
  },
  selectedColorBubble: {
    borderWidth: 2,
    borderColor: '#fff',
  },
});

export default StoryEditorScreen; 