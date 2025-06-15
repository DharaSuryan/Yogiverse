import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  TextInput,
} from 'react-native';
import Video from 'react-native-video';
import { useNavigation, useRoute } from '@react-navigation/native';

const StoryPreviewScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { uri } = route.params;
  const [caption, setCaption] = useState('');

  const handlePost = async () => {
    try {
      // Here you would implement the logic to upload the story
      // to your backend server
      const formData = new FormData();
      formData.append('media', {
        uri,
        type: uri.includes('video') ? 'video/mp4' : 'image/jpeg',
        name: uri.includes('video') ? 'story.mp4' : 'story.jpg',
      });
      formData.append('caption', caption);

      // Example API call
      // await api.post('/stories', formData);
      
      navigation.navigate('HomeTab');
    } catch (error) {
      console.error('Error uploading story:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Preview Story</Text>
        <TouchableOpacity onPress={handlePost}>
          <Text style={styles.postButton}>Post</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.previewContainer}>
        {uri.includes('video') ? (
          <Video
            source={{ uri }}
            style={styles.preview}
            resizeMode="cover"
            repeat
            paused={false}
          />
        ) : (
          <Image source={{ uri }} style={styles.preview} />
        )}
      </View>

      <View style={styles.captionContainer}>
        <TextInput
          style={styles.captionInput}
          placeholder="Add a caption..."
          placeholderTextColor="#fff"
          value={caption}
          onChangeText={setCaption}
          multiline
        />
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
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  backButton: {
    color: '#0095f6',
  },
  postButton: {
    color: '#0095f6',
    fontWeight: '600',
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  preview: {
    flex: 1,
  },
  captionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 16,
  },
  captionInput: {
    color: '#fff',
    fontSize: 16,
    minHeight: 40,
  },
});

export default StoryPreviewScreen; 