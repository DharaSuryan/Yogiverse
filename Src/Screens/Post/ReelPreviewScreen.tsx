import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ActivityIndicator, Platform, Alert,
} from 'react-native';
import Video from 'react-native-video';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CreatePostStackParamList } from '../../Navigation/types';
import { PostApi } from '../../Api/PostApi';
import {postPosts, postReels} from "../../Api/Api";
import { CommonActions } from '@react-navigation/native';
import { Video as CompressorVideo } from 'react-native-compressor';

const ReelPreviewScreen = () => {
  
const navigation = useNavigation<NativeStackNavigationProp<CreatePostStackParamList>>();
  const route = useRoute();
  // @ts-ignore
  const { uri } = route.params || {};
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);

  const getMimeType = (uri: string): string => {
    const extension = uri.split('.').pop()?.toLowerCase();
    const mimeTypes: { [key: string]: string } = {
      mp4: 'video/mp4',
      mov: 'video/quicktime',
      avi: 'video/x-msvideo',
      webm: 'video/webm',
      m4v: 'video/x-m4v',
      mkv: 'video/x-matroska',
    };
    return (extension && mimeTypes[extension]) || 'application/octet-stream';
  };

  const handlePost = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      // Type guard for params
      let uri: string = '';
      if (
        route &&
        typeof route === 'object' &&
        'params' in route &&
        route.params &&
        typeof route.params === 'object' &&
        'uri' in route.params &&
        typeof (route.params as any).uri === 'string'
      ) {
        uri = (route.params as any).uri;
      }
      const fileName = uri.split('/').pop();
      const fileType = getMimeType(uri);
      formData.append('caption', caption);
      formData.append('is_draft', 'false');
      formData.append('allow_comments', 'true');
      formData.append('hide_like_count', 'false');
      formData.append('music_track', '');
      formData.append('duration', '15');
      let compressedUri = uri;
      try {
        compressedUri = await CompressorVideo.compress(uri, {
          compressionMethod: 'auto',
        });
      } catch (e) {
        console.log('Video compression error:', e);
      }
      formData.append('video_file', {
        uri: Platform.OS === 'ios' ? compressedUri.replace('file://', '') : compressedUri,
        name: fileName || 'video.mp4',
        type: fileType,
      });

      await postReels({ formData });
      setLoading(false);

      Alert.alert('Success', 'Your Reel has been uploaded!');
      navigation.navigate("UploadOptions")
      // navigation.goBack();
      // navigation.dispatch(
      //   CommonActions.reset({
      //     index: 0,
      //     routes: [
      //       {
      //         name: 'MainTab',
      //         state: {
      //           routes: [{ name: 'HomeTab' }],
      //         },
      //       },
      //     ],
      //   })
      // );
    } catch (error) {
      setLoading(false);
      console.error('Error uploading reel:', error);
      // Optionally show error to user
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          {React.createElement(Ionicons as any, { name: 'arrow-back', size: 24, color: '#000' })}
        </TouchableOpacity>
        <Text style={styles.title}>Preview Reel</Text>
        <TouchableOpacity onPress={handlePost} disabled={loading}>
          <Text style={styles.postButton}>{loading ? 'Posting...' : 'Post'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.videoContainer}>
        <Video
          source={{ uri }}
          style={styles.video}
          resizeMode="cover"
          repeat
          paused={false}
        />
      </View>

      <View style={styles.captionContainer}>
        <TextInput
          style={styles.captionInput}
          placeholder="Write a caption..."
          value={caption}
          onChangeText={setCaption}
          multiline
        />
      </View>

      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => navigation.navigate('ReelEditor', { media: { uri, type: 'video' } })}
      >
        <Text style={styles.filterButtonText}>Filter</Text>
      </TouchableOpacity>

      {loading && (
        <View
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(0,0,0,0.3)',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10,
          }}
        >
          <ActivityIndicator size="large" color="#0095f6" />
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
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  postButton: {
    color: '#0095f6',
    fontWeight: '600',
  },
  videoContainer: {
    width: '100%',
    height: '50%',
    backgroundColor: '#000',
  },
  video: {
    flex: 1,
  },
  captionContainer: {
    padding: 16,
  },
  captionInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    minHeight: 100,
  },
  filterButton: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
  },
  filterButtonText: {
    color: '#000',
  },
});

export default ReelPreviewScreen; 