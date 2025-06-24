import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  TextInput,
  Dimensions,
  PanResponder,
  Animated,
} from 'react-native';
import Video from 'react-native-video';
import { useNavigation, useRoute, RouteProp, CommonActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { CreatePostStackParamList, RootStackParamList } from '../../Navigation/types';
import { postStories } from '../../Api/Api';

type StoryPreviewScreenRouteProp = RouteProp<CreatePostStackParamList, 'StoryPreview'>;
type StoryPreviewScreenNavigationProp = NativeStackNavigationProp<CreatePostStackParamList, 'StoryPreview'>;

interface Sticker {
  id: string;
  emoji: string;
  position: Animated.ValueXY;
}

interface TextElement {
  id: string;
  text: string;
  color: string;
  fontSize: number;
  position: Animated.ValueXY;
}

const { width, height } = Dimensions.get('window');

const StoryPreviewScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<StoryPreviewScreenRouteProp>();
  const { uri, type = 'image' } = route.params;
  const [isPlaying, setIsPlaying] = useState(true);
  const [caption, setCaption] = useState('');
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#FFFFFF');
  const [fontSize, setFontSize] = useState(24);
  const videoRef = useRef<any>(null);

  const createPanResponder = (position: Animated.ValueXY) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event(
        [null, { dx: position.x, dy: position.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        position.extractOffset();
      },
    });
  };

  const addSticker = (emoji: string) => {
    const newSticker: Sticker = {
      id: Date.now().toString(),
      emoji,
      position: new Animated.ValueXY({ x: width / 2 - 20, y: height / 2 - 20 }),
    };
    setStickers([...stickers, newSticker]);
    setShowStickerPicker(false);
  };

  const addText = () => {
    const newText: TextElement = {
      id: Date.now().toString(),
      text: 'Double tap to edit',
      color: selectedColor,
      fontSize,
      position: new Animated.ValueXY({ x: width / 2 - 50, y: height / 2 - 20 }),
    };
    setTextElements([...textElements, newText]);
    setShowTextEditor(false);
  };

  const handlePost = async (uri) => {
    console.log("uri", uri);

    try {
      // Here you would typically upload the media to your backend
      // For now, we'll just navigate back to the main screen
      const formData = new FormData();
      formData.append('media_file', {
        uri: uri,
        type: type === 'video' ? 'video/mp4' : 'image/jpeg',
        name: type === 'video' ? 'story.mp4' : 'story.jpg',
      });
      const response = await postStories(formData);
      console.log("response story", response);

      // Handle success (e.g., show a message, n
      navigation.navigate('MainTab', {
        screen: 'HomeTab',
        params: {
          screen: 'Home',
        },
      });
    } catch (error) {
      console.error('Error posting story:', error);
    }
  };

  const renderMedia = () => {
    if (type === 'video') {
      return (
        <TouchableOpacity
          style={styles.mediaContainer}
          onPress={() => setIsPlaying(!isPlaying)}
          activeOpacity={1}
        >
          <Video
            ref={videoRef}
            source={{ uri }}
            style={styles.media}
            resizeMode="cover"
            repeat
            paused={!isPlaying}
          />
          {!isPlaying && (
            <View style={styles.playButtonContainer}>
              <Icon name="play" size={50} color="#FFFFFF" />
            </View>
          )}
        </TouchableOpacity>
      );
    }
    return (
      <Image source={{ uri }} style={styles.media} resizeMode="cover" />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Icon name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handlePost(uri)} style={styles.shareButton}>
          <Text style={styles.shareButtonText}>Share</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mediaWrapper}>
        {renderMedia()}
        {stickers.map((sticker) => (
          <Animated.View
            key={sticker.id}
            style={[
              styles.sticker,
              {
                transform: sticker.position.getTranslateTransform(),
              },
            ]}
            {...createPanResponder(sticker.position).panHandlers}
          >
            <Text style={styles.stickerText}>{sticker.emoji}</Text>
          </Animated.View>
        ))}
        {textElements.map((element) => (
          <Animated.View
            key={element.id}
            style={[
              styles.textElement,
              {
                transform: element.position.getTranslateTransform(),
              },
            ]}
            {...createPanResponder(element.position).panHandlers}
          >
            <Text
              style={[
                styles.elementText,
                { color: element.color, fontSize: element.fontSize },
              ]}
            >
              {element.text}
            </Text>
          </Animated.View>
        ))}
      </View>

      <View style={styles.toolbar}>
        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={() => setShowStickerPicker(true)}
        >
          <Icon name="happy-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={() => setShowTextEditor(true)}
        >
          <Icon name="text-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolbarButton}>
          <Icon name="brush-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.captionContainer}>
        <TextInput
          style={styles.captionInput}
          placeholder="Add a caption..."
          placeholderTextColor="#FFFFFF80"
          value={caption}
          onChangeText={setCaption}
          multiline
        />
      </View>

      {showStickerPicker && (
        <View style={styles.stickerPicker}>
          <View style={styles.stickerGrid}>
            {['😊', '❤️', '👍', '🎉', '🌟', '🔥', '💯', '🎯', '🎨', '🎭'].map((emoji) => (
              <TouchableOpacity
                key={emoji}
                style={styles.stickerItem}
                onPress={() => addSticker(emoji)}
              >
                <Text style={styles.stickerText}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {showTextEditor && (
        <View style={styles.textEditor}>
          <TextInput
            style={[styles.textInput, { color: selectedColor, fontSize }]}
            placeholder="Type your text..."
            placeholderTextColor="#FFFFFF80"
            multiline
          />
          <View style={styles.colorPicker}>
            {['#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00'].map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  selectedColor === color && styles.selectedColor,
                ]}
                onPress={() => setSelectedColor(color)}
              />
            ))}
          </View>
          <View style={styles.fontSizeControls}>
            <TouchableOpacity onPress={() => setFontSize(Math.max(16, fontSize - 4))}>
              <Icon name="remove" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.fontSizeText}>{fontSize}px</Text>
            <TouchableOpacity onPress={() => setFontSize(Math.min(48, fontSize + 4))}>
              <Icon name="add" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.addTextButton} onPress={addText}>
            <Text style={styles.addTextButtonText}>Add Text</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  closeButton: {
    padding: 8,
  },
  shareButton: {
    backgroundColor: '#0095F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  mediaWrapper: {
    flex: 1,
    position: 'relative',
  },
  mediaContainer: {
    flex: 1,
    position: 'relative',
  },
  media: {
    width: '100%',
    height: '100%',
  },
  playButtonContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  toolbarButton: {
    padding: 8,
  },
  captionContainer: {
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  captionInput: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 16,
  },
  stickerPicker: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    padding: 16,
  },
  stickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  stickerItem: {
    padding: 8,
  },
  stickerText: {
    fontSize: 24,
  },
  textEditor: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    padding: 16,
  },
  textInput: {
    color: '#FFFFFF',
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 16,
  },
  colorPicker: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  colorOption: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginHorizontal: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  selectedColor: {
    borderWidth: 3,
  },
  fontSizeControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  fontSizeText: {
    color: '#FFFFFF',
    marginHorizontal: 16,
  },
  addTextButton: {
    backgroundColor: '#0095F6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addTextButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  sticker: {
    position: 'absolute',
    padding: 8,
  },
  textElement: {
    position: 'absolute',
    padding: 8,
  },
  elementText: {
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default StoryPreviewScreen; 