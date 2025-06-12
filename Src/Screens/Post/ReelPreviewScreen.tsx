import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  TextInput,
  SafeAreaView,
  Platform,
  Dimensions,
  Image,
} from 'react-native';
import { useNavigation, useRoute, RouteProp, CommonActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CreatePostStackParamList } from '../../Navigation/types';
import Icon from 'react-native-vector-icons/Ionicons';
import Video, { VideoRef } from 'react-native-video';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ReelPreviewScreenNavigationProp = NativeStackNavigationProp<CreatePostStackParamList, 'ReelPreview'>;
type ReelPreviewScreenRouteProp = RouteProp<CreatePostStackParamList, 'ReelPreview'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ReelPreviewScreen = () => {
  const navigation = useNavigation<ReelPreviewScreenNavigationProp>();
  const route = useRoute<ReelPreviewScreenRouteProp>();
  const [caption, setCaption] = useState('');
  const [isPlaying, setIsPlaying] = useState(true);
  const { media } = route.params;
  const videoRef = useRef<VideoRef>(null);

  const handleShare = async () => {
    try {
      // TODO: Implement reel upload logic
      // await uploadReel(media.uri, caption);

      // Get the root navigator
      const rootNavigation = navigation.getParent()?.getParent(); // Assuming CreatePostStack -> MainTabs -> RootStack

      if (rootNavigation) {
        rootNavigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Main' }],
          })
        );
      } else {
        console.error('Could not find root navigator for reset.');
      }
    } catch (error) {
      console.error('Error uploading reel:', error);
    }
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Auth' }],
        })
      );
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.shareButton}
          onPress={handleShare}
        >
          <Text style={styles.shareButtonText}>Share</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <TouchableOpacity 
          style={styles.videoContainer}
          onPress={togglePlayPause}
          activeOpacity={1}
        >
          <Video
            ref={videoRef}
            source={{ uri: media.uri }}
            style={styles.video}
            resizeMode="cover"
            repeat
            paused={!isPlaying}
          />
          {!isPlaying && (
            <View style={styles.playButton}>
              <Icon name="play" size={40} color="#fff" />
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.captionContainer}>
          <TextInput
            style={styles.captionInput}
            placeholder="Add caption..."
            placeholderTextColor="#999"
            value={caption}
            onChangeText={setCaption}
            multiline
          />
        </View>
      </View>
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
    paddingTop: Platform.OS === 'ios' ? 0 : 15,
  },
  shareButton: {
    backgroundColor: '#0095f6',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 5,
  },
  shareButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  videoContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 1.5,
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 15,
  },
  captionInput: {
    color: '#fff',
    fontSize: 16,
    minHeight: 40,
  },
});

export default ReelPreviewScreen; 