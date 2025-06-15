import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';

const ReelPreviewScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { uri } = route.params;
  const [caption, setCaption] = useState('');

  const handlePost = async () => {
    try {
      // Here you would implement the logic to upload the reel
      // to your backend server
      const formData = new FormData();
      formData.append('video', {
        uri,
        type: 'video/mp4',
        name: 'reel.mp4',
      });
      formData.append('caption', caption);

      // Example API call
      // await api.post('/reels', formData);
      
      navigation.navigate('HomeTab');
    } catch (error) {
      console.error('Error uploading reel:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Preview Reel</Text>
        <TouchableOpacity onPress={handlePost}>
          <Text style={styles.postButton}>Post</Text>
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
});

export default ReelPreviewScreen; 