import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ActivityIndicator, Platform, Alert,
  Modal,
} from 'react-native';
import Video from 'react-native-video';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CreatePostStackParamList } from '../../Navigation/types';
import {postPosts, postReels} from "../../Api/Api";
import { CommonActions } from '@react-navigation/native';
import { Video as CompressorVideo } from 'react-native-compressor';
import LocationPicker, { LocationOption } from '../../Components/LocationPicker';

const ReelPreviewScreen = () => {
  
const navigation = useNavigation<NativeStackNavigationProp<CreatePostStackParamList>>();
  const route = useRoute();
  // @ts-ignore
  const { uri } = route.params || {};
  console.log('ReelPreviewScreen uri:', uri);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationOption | null>(null);
  const [videoUri, setVideoUri] = useState(() => {
    if (Platform.OS === 'ios' && typeof uri === 'string') {
      return uri.replace('file://', '');
    }
    return uri;
  });

  // Update videoUri if trimmedUri param is present when screen is focused
  useFocusEffect(
    useCallback(() => {
      const params: any = route.params;
      if (params && params.trimmedUri) {
        setVideoUri(params.trimmedUri);
        // Clear the param after using it
        navigation.setParams({ trimmedUri: undefined });
      }
    }, [route.params])
  );

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
      // Use the current videoUri (already trimmed/filtered) for upload
      const fileName = videoUri.split('/').pop();
      const fileType = getMimeType(videoUri);
      formData.append('caption', caption);
      formData.append('is_draft', 'false');
      formData.append('allow_comments', 'true');
      formData.append('hide_like_count', 'false');
      formData.append('music_track', '');
      formData.append('location', selectedLocation ? selectedLocation.display_name : '');
      formData.append('duration', '15');
      // No need to re-compress, just use videoUri
      formData.append('video_file', {
        uri: Platform.OS === 'ios' ? videoUri.replace('file://', '') : videoUri,
        name: fileName || 'video.mp4',
        type: fileType,
      });

      await postReels({ formData });
      setLoading(false);

      Alert.alert('Success', 'Your Reel has been uploaded!');
      navigation.navigate("UploadOptions")
    } catch (error) {
      setLoading(false);
      console.error('Error uploading reel:', error);
    }
  };

  // Placeholder for video trimming logic
  const handleTrim = async () => {
    Alert.alert('Trim', 'Video trimming functionality will be implemented here.');
    // Integrate with a video trimming library and update setTrimmedUri(newUri)
  };

  // Callback to handle trimmed video URI from ReelEditorScreen
  const handleTrimFinish = useCallback((trimmedUri: string) => {
    setVideoUri(trimmedUri);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          {React.createElement(Ionicons as any, { name: 'arrow-back', size: 24, color: '#bea063' })}
        </TouchableOpacity>
        <Text style={[styles.title,{color:"#bea063"}]}>Preview Reel</Text>
        <TouchableOpacity onPress={handlePost} disabled={loading}>
          <Text style={[styles.postButton,{color:"#bea063"}]}>{loading ? 'Posting...' : 'Post'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.videoContainer}>
        <Video
          source={{ uri: videoUri }}
          style={styles.video}
          resizeMode="cover"
          repeat
          paused={false}
        />
      </View>

      <View style={styles.controlsContainer}>
        <TextInput
          style={styles.captionInput}
          placeholder="Write a caption..."
          placeholderTextColor="#bea063"
          value={caption}
          onChangeText={setCaption}
          multiline
        />
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowLocationPicker(true)}
        >
          <Text style={{ color: '#bea063' }}>{selectedLocation ? selectedLocation.display_name : 'Select Location'}</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity
          style={styles.trimButton}
          onPress={handleTrim}
        >
          <Text style={styles.trimButtonText}>Trim Video</Text>
        </TouchableOpacity> */}
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() =>{ 
            console.log("yes comes here ...");
            (navigation as any).navigate('ReelEditorScreen', { media: { uri: videoUri, type: 'video' } })
          }}
        >
          <Text style={styles.filterButtonText}>Filter</Text>
        </TouchableOpacity>
      </View>

      {/* Location Picker Modal */}
      <Modal visible={showLocationPicker} animationType="slide" onRequestClose={() => setShowLocationPicker(false)}>
        <LocationPicker
          value={selectedLocation}
          onChange={location => {
            setSelectedLocation(location);
            setShowLocationPicker(false);
          }}
        />
      </Modal>

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
  controlsContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  captionInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    minHeight: 60,
    marginBottom: 12,
    color: '#222',
  },
  locationButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  trimButton: {
    backgroundColor: '#bea063',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  trimButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  filterButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bea063',
    marginBottom: 12,
  },
  filterButtonText: {
    color: '#bea063',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ReelPreviewScreen; 