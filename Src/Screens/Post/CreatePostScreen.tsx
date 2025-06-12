import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  Platform,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CreatePostStackParamList } from '../../Navigation/types';
import Icon from 'react-native-vector-icons/Ionicons';
import ImagePicker from 'react-native-image-crop-picker';

type NavigationProp = NativeStackNavigationProp<CreatePostStackParamList>;
type CreatePostScreenRouteProp = RouteProp<CreatePostStackParamList, 'PostDetails'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CreatePostScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<CreatePostScreenRouteProp>();
  const [caption, setCaption] = useState('');
  const { media } = route.params; // Get the media from route params

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleCreatePost = () => {
    navigation.navigate('UploadOptions');
  };

  const handlePost = async () => {
    try {
      // TODO: Implement actual post upload logic here
      // This is a placeholder for your API call
      console.log('Posting:', { media, caption });
      Alert.alert('Success', 'Post uploaded!');
      navigation.goBack(); // Or navigate to a different screen after posting
    } catch (error) {
      console.error('Error uploading post:', error);
      Alert.alert('Error', 'Failed to upload post.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Create Post</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageCaptionContainer}>
          {media && media.length > 0 && (
            <Image source={{ uri: media[0].uri }} style={styles.imagePreview} />
          )}
          <TextInput
            style={styles.captionInput}
            placeholder="Write a caption..."
            value={caption}
            onChangeText={setCaption}
            multiline
            placeholderTextColor="#888"
          />
        </View>

        <TouchableOpacity style={styles.createButton} onPress={handleCreatePost}>
          <Icon name="add-circle-outline" size={32} color="#0095F6" />
          <Text style={styles.createButtonText}>Create New Post</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handlePost} style={styles.postButton}>
          <Text style={styles.postButtonText}>Share</Text>
        </TouchableOpacity>
      </ScrollView>
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollContent: {
    flexGrow: 1,
  },
  imageCaptionContainer: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 5,
    marginRight: 10,
  },
  captionInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  createButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#0095F6',
    fontWeight: '500',
  },
  postButton: {
    backgroundColor: '#0095f6',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  postButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default CreatePostScreen; 