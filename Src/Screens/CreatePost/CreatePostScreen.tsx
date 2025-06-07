import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList } from '../../Navigation/types';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch } from 'react-redux';
import { addPost } from '../../Store/slices/postSlice';

type CreatePostScreenProps = {
  navigation: NativeStackNavigationProp<MainTabParamList, 'CreatePost'>;
};

const CreatePostScreen: React.FC<CreatePostScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch();
  const [image, setImage] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');

  const handleImagePick = () => {
    // In a real app, you would use image picker here
    // For demo, we'll use a placeholder image
    setImage('https://picsum.photos/500/500');
  };

  const handleCreatePost = () => {
    if (!image) return;

    const newPost = {
      id: Date.now().toString(),
      userId: '1', // This would come from auth state
      username: 'demo_user',
      userProfilePicture: 'https://i.pravatar.cc/150',
      image,
      caption,
      likes: 0,
      comments: [],
      timestamp: 'now',
      isLiked: false,
      isSaved: false,
      location: location || undefined,
    };

    dispatch(addPost(newPost));
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Post</Text>
        <TouchableOpacity
          onPress={handleCreatePost}
          disabled={!image}
          style={[styles.shareButton, !image && styles.shareButtonDisabled]}>
          <Text style={[styles.shareButtonText, !image && styles.shareButtonTextDisabled]}>
            Share
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.imageSection}>
          {image ? (
            <Image source={{ uri: image }} style={styles.selectedImage} />
          ) : (
            <TouchableOpacity style={styles.imagePlaceholder} onPress={handleImagePick}>
              <Ionicons name="image-outline" size={40} color="#666" />
              <Text style={styles.imagePlaceholderText}>Add Photo</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.formSection}>
          <TextInput
            style={styles.captionInput}
            placeholder="Write a caption..."
            value={caption}
            onChangeText={setCaption}
            multiline
            maxLength={2200}
          />

          <View style={styles.locationInput}>
            <Ionicons name="location-outline" size={20} color="#666" />
            <TextInput
              style={styles.locationTextInput}
              placeholder="Add location"
              value={location}
              onChangeText={setLocation}
            />
          </View>
        </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#dbdbdb',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  shareButton: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 5,
    backgroundColor: '#0095f6',
  },
  shareButtonDisabled: {
    backgroundColor: '#b2dffc',
  },
  shareButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  shareButtonTextDisabled: {
    color: '#fff',
    opacity: 0.7,
  },
  content: {
    flex: 1,
  },
  imageSection: {
    width: '100%',
    height: 300,
    backgroundColor: '#fafafa',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  formSection: {
    padding: 15,
  },
  captionInput: {
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  locationInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#dbdbdb',
  },
  locationTextInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
});

export default CreatePostScreen; 