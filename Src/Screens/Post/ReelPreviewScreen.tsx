import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
} from 'react-native';
import Video from 'react-native-video';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute,CompositeNavigationProp } from '@react-navigation/native';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootStackParamList, MainTabParamList } from '../../Navigation/types';
import { PostApi } from '../../Api/PostApi';
import {postPosts, postReels} from "../../Api/Api";


const ReelPreviewScreen = () => {
  
const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  // @ts-ignore
  const { uri } = route.params || {};
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePost = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('caption', caption);
      formData.append('is_draft', 'false');
      formData.append('allow_comments', 'false');
      formData.append('hide_like_count', 'false');
      formData.append('music_track', ' ');
      formData.append('video_file', {
        uri,
        type: 'video/mp4',
        name: 'reel.mp4',
      });
      formData.append('media_metadata', JSON.stringify([{ is_video: true }]));

      console.log("reels params ----->>",JSON.stringify(formData))

      await postReels({ formData });
      setLoading(false);
      navigation.navigate('MainTab', {
        screen: 'HomeTab',
        params: {
          screen: 'Home',
        },
      });
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
        onPress={() => navigation.navigate('ReelEditor', { media: [{ uri, type: 'video' }] })}
      >
        <Text style={styles.filterButtonText}>Filter</Text>
      </TouchableOpacity>
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