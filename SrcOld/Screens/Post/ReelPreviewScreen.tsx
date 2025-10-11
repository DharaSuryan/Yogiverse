import React, {useState, useCallback, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  Platform,
  Alert,
  Modal,
  ScrollView,
  Switch,
} from 'react-native';
import Video from 'react-native-video';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {CreatePostStackParamList} from '../../Navigation/types';
import {postPosts, postReels} from '../../Api/Api';
import {CommonActions} from '@react-navigation/native';
import {Video as CompressorVideo} from 'react-native-compressor';
import LocationPicker, {LocationOption} from '../../Components/LocationPicker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ReelPreviewScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<CreatePostStackParamList>>();
  const route = useRoute();
  // @ts-ignore
  const {uri} = route.params || {};
  console.log('ReelPreviewScreen uri:', uri);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [selectedLocation, setSelectedLocation] =
    useState<LocationOption | null>(null);
  const [mentionInput, setMentionInput] = useState('');
  const [mentionSuggestions, setMentionSuggestions] = useState<any[]>([]);
  const [selectedMentions, setSelectedMentions] = useState<number[]>([]);
  const [selectedMentionUsers, setSelectedMentionUsers] = useState<any[]>([]);
  const [mentionLoading, setMentionLoading] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [allowComments, setAllowComments] = useState(true);
  const [hideLikeCount, setHideLikeCount] = useState(false);
  const [videoUri, setVideoUri] = useState(() => {
    if (Platform.OS === 'ios' && typeof uri === 'string') {
      return uri.replace('file://', '');
    }
    return uri;
  });
  const [compressedUri, setCompressedUri] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [videoDuration, setVideoDuration] = useState<number>(0);

  // Update videoUri if trimmedUri param is present when screen is focused
  useFocusEffect(
    useCallback(() => {
      const params: any = route.params;
      if (params && params.trimmedUri) {
        setVideoUri(params.trimmedUri);
        // Clear the param after using it
        navigation.setParams({trimmedUri: undefined});
      }
    }, [route.params]),
  );

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (mentionInput.trim().length > 0) {
        setMentionLoading(true);
        try {
          const authToken = await AsyncStorage.getItem('accessToken');
          const headers = {
            Accept: 'application/json',
            Authorization: `Bearer ${authToken}`,
          };
          console.log('Mention Input:', mentionInput);

          const res = await axios.get(
            `https://pashuahar.com/users/search/?query=${mentionInput}`,
            {headers},
          );
          console.log('Mention Suggestions Response:', res.data);

          setMentionSuggestions(res.data || []);
        } catch (error: any) {
          console.log('Error fetching mentions:', error);

          setMentionSuggestions([]);
        } finally {
          setMentionLoading(false);
        }
      } else {
        setMentionSuggestions([]);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(delayDebounce);
  }, [mentionInput]);

  // Compress video as soon as videoUri changes
  React.useEffect(() => {
    if (!videoUri) return;
    let isActive = true;
    const compress = async () => {
      setCompressing(true);
      try {
        let result = videoUri;
        try {
          // Compress in background to 360px max size, manual method
          result = await CompressorVideo.compress(videoUri, {
            compressionMethod: 'manual',
            maxSize: 360, // Smaller file for faster upload
          });
          if (result && typeof result === 'string') {
            console.log('[Compressor] Output file:', result);
            if (!result.endsWith('.mp4')) {
              console.warn('[Compressor] Output is not .mp4!');
            }
          }
        } catch (e) {
          console.log('Video compression error:', e);
        }
        if (isActive) setCompressedUri(result);
      } finally {
        if (isActive) setCompressing(false);
      }
    };
    compress();
    return () => {
      isActive = false;
    };
  }, [videoUri]);

  const getMimeType = (uri: string): string => {
    const extension = uri.split('.').pop()?.toLowerCase();
    const mimeTypes: {[key: string]: string} = {
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
      const fileName = (compressedUri || videoUri).split('/').pop();
      const fileType = getMimeType(compressedUri || videoUri);
      formData.append('caption', caption);
      formData.append('is_draft', isDraft ? 'true' : 'false');
      formData.append('allow_comments', allowComments ? 'false' : 'true');
      formData.append('hide_like_count', hideLikeCount ? 'true' : 'false');
      formData.append('music_track', '');
      formData.append(
        'location',
        selectedLocation ? selectedLocation.display_name : '',
      );
      // Use actual video duration
      formData.append('duration', videoDuration ? String(Math.round(videoDuration)) : '0');
      // Use compressedUri for upload
      if (!compressedUri) {
        Alert.alert('Error', 'Video is still processing. Please wait.');
        setLoading(false);
        return;
      }
      formData.append('video_file', {
        uri:
          Platform.OS === 'ios'
            ? compressedUri.replace('file://', '')
            : compressedUri,
        name: fileName || 'video.mp4',
        type: fileType,
      });
      if (selectedMentions.length > 0) {
        selectedMentions.forEach(id => {
          formData.append('mentions', id);
        });
      }

      console.log('Form Data Entries:', formData);
// return
      await postReels({formData});
      setLoading(false);

      Alert.alert('Success', 'Your Reel has been uploaded!');
      navigation.reset({
              index: 0,
              routes: [{ name: 'MainTab' }],
            });
      // navigation.navigate('UploadOptions');
    } catch (error) {
      setLoading(false);
      console.error('Error uploading reel:', error);
    }
  };

  // Placeholder for video trimming logic
  const handleTrim = async () => {
    Alert.alert(
      'Trim',
      'Video trimming functionality will be implemented here.',
    );
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
          {React.createElement(Ionicons as any, {
            name: 'arrow-back',
            size: 24,
            color: '#bea063',
          })}
        </TouchableOpacity>
        <Text style={[styles.title, {color: '#bea063'}]}>Preview Reel</Text>
        <TouchableOpacity onPress={handlePost} disabled={loading}>
          <Text style={[styles.postButton, {color: '#bea063'}]}>
            {loading ? 'Posting...' : 'Post'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.videoContainer}>
        <Video
          source={{uri: videoUri}}
          style={styles.video}
          resizeMode="cover"
          repeat
          paused={false}
          onLoad={data => setVideoDuration(data.duration)}
        />
      </View>

      {/* Make controls scrollable */}
      <ScrollView
        style={styles.controlsScroll}
        contentContainerStyle={styles.controlsContainer}
        keyboardShouldPersistTaps="handled">
        <TextInput
          style={styles.captionInput}
          placeholder="Write a caption..."
          placeholderTextColor="#bea063"
          value={caption}
          onChangeText={setCaption}
          multiline
        />
        <View style={{paddingHorizontal: 1, marginBottom: 5}}>
          <Text style={{fontSize: 16, marginTop: 6, color: '#bea063'}}>
            Mention Users
          </Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#bea063',
              borderRadius: 8,
              padding: 10,
              marginTop: 11,
              marginBottom: 5,
              color: '#bea063',
            }}
            placeholder="Type to search users..."
            placeholderTextColor="#bea063"
            value={mentionInput}
            onChangeText={setMentionInput}
          />
          {/* Suggestions dropdown */}
          {mentionLoading ? (
            <ActivityIndicator size="small" color="#bea063" />
          ) : (
            mentionSuggestions.length > 0 && (
              <View
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#bea063',
                  marginTop: 2,
                  maxHeight: 120,
                }}>
                <ScrollView>
                  {mentionSuggestions.map(user => (
                    <TouchableOpacity
                      key={user.id}
                      style={{
                        padding: 10,
                        borderBottomWidth: 1,
                        borderBottomColor: '#eee',
                      }}
                      onPress={() => {
                        if (!selectedMentions.includes(user.id)) {
                          setSelectedMentions(prev => [...prev, user.id]);
                          setSelectedMentionUsers(prev => [...prev, user]);
                        }
                        setMentionInput('');
                        setMentionSuggestions([]);
                      }}>
                      <Text style={{color: '#bea063'}}>
                        {user.username} ({user.first_name} {user.last_name})
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )
          )}
          {/* Show selected mentions */}
          {selectedMentionUsers.length > 0 && (
            <View
              style={{flexDirection: 'row', flexWrap: 'wrap', marginTop: 6}}>
              {selectedMentionUsers.map(u => (
                <View
                  key={u.id}
                  style={{
                    backgroundColor: '#bea063',
                    borderRadius: 12,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    marginRight: 6,
                    marginBottom: 4,
                  }}>
                  <Text style={{color: '#fff'}}>{u.username}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowLocationPicker(true)}>
          <Text style={{color: '#bea063'}}>
            {selectedLocation
              ? selectedLocation.display_name
              : 'Select Location'}
          </Text>
        </TouchableOpacity>
        {/* <TouchableOpacity
          style={styles.trimButton}
          onPress={handleTrim}
        >
          <Text style={styles.trimButtonText}>Trim Video</Text>
        </TouchableOpacity> */}
        <TouchableOpacity
          style={[styles.filterButton]}
          onPress={() => {
            console.log('yes comes here ...');
            (navigation as any).navigate('ReelEditor', {
              media: {uri: videoUri, type: 'video'},
            });
          }}>
          <Text style={styles.filterButtonText}>Filter</Text>
        </TouchableOpacity>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            marginVertical: 24,
          }}>
          <View style={{alignItems: 'center'}}>
            <Text style={{color: '#bea063', marginBottom: 8}}>Draft</Text>
            <Switch
              value={isDraft}
              onValueChange={setIsDraft}
              trackColor={{false: '#ccc', true: '#bea063'}}
              thumbColor={isDraft ? '#bea063' : '#fff'}
            />
          </View>
          <View style={{alignItems: 'center'}}>
            <Text style={{color: '#bea063', marginBottom: 8}}>
              {' '}
              Dont Allow Comments
            </Text>
            <Switch
              value={!allowComments}
              onValueChange={() => setAllowComments(!allowComments)}
              trackColor={{false: '#ccc', true: '#bea063'}}
              thumbColor={!allowComments ? '#bea063' : '#fff'}
            />
          </View>
          <View style={{alignItems: 'center'}}>
            <Text style={{color: '#bea063', marginBottom: 8}}>
              Hide Like Count
            </Text>
            <Switch
              value={hideLikeCount}
              onValueChange={setHideLikeCount}
              trackColor={{false: '#ccc', true: '#bea063'}}
              thumbColor={hideLikeCount ? '#bea063' : '#fff'}
            />
          </View>
        </View>
      </ScrollView>

      {/* Location Picker Modal */}
      <Modal
        visible={showLocationPicker}
        animationType="slide"
        onRequestClose={() => setShowLocationPicker(false)}>
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
          }}>
          <ActivityIndicator size="large" color="#0095f6" />
          {compressing && (
            <Text style={{color: '#fff', marginTop: 12}}>
              Compressing video...
            </Text>
          )}
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
  controlsScroll: {
    flex: 1,
    backgroundColor: '#fff',
  },
  controlsContainer: {
    padding: 16,
    backgroundColor: '#fff',
    // Remove minHeight, let ScrollView handle height
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
