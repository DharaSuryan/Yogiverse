import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Text,
  Dimensions,
  Platform,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CreatePostStackParamList, RootStackParamList } from '../../Navigation/types';
import Icon from 'react-native-vector-icons/Ionicons';
import { useBackHandler } from '../../Utils/BackHandler';

const { width: screenWidth } = Dimensions.get('window');

type PostPreviewScreenNavigationProp = NativeStackNavigationProp<CreatePostStackParamList, 'PostPreview'>;
type PostPreviewScreenRouteProp = RouteProp<CreatePostStackParamList, 'PostPreview'>;

const PostPreviewScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { images } = route.params;

  if (!images || images.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <Text style={{ color: '#fff' }}>No images selected.</Text>
      </View>
    );
  }
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
      
  navigation.navigate('Post ', { media: [{ uri: images[0], type: 'image' }] });
    } catch (error) {
      console.error('Error uploading reel:', error);
    }
  };
  // Add back handler
  useBackHandler(() => {
    handleGoBack();
    return true; // Prevent default back behavior
  });

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={()=>handlePost()}>
        <Text style={styles.headerTitle}>Next</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mediaContainer}>
        <Image
          source={{ uri: images[0] }}
          style={styles.imagePreview}
          resizeMode="contain"
        />
      </View>

      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => navigation.navigate('MediaFilter', { media: [{ uri: images[0], type: 'image' }] })}
      >
        <Text style={styles.filterButtonText}>Filter</Text>
      </TouchableOpacity>
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
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 0 : 16,
    height: Platform.OS === 'ios' ? 44 : 56,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  mediaContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePreview: {
    width: screenWidth,
    height: screenWidth,
    resizeMode: 'contain',
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

export default PostPreviewScreen; 