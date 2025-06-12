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
import { CreatePostStackParamList } from '../../Navigation/types';
import Icon from 'react-native-vector-icons/Ionicons';
import { useBackHandler } from '../../Utils/BackHandler';

const { width: screenWidth } = Dimensions.get('window');

type PostPreviewScreenNavigationProp = NativeStackNavigationProp<CreatePostStackParamList, 'PostPreview'>;
type PostPreviewScreenRouteProp = RouteProp<CreatePostStackParamList, 'PostPreview'>;

const PostPreviewScreen = () => {
  const navigation = useNavigation<PostPreviewScreenNavigationProp>();
  const route = useRoute<PostPreviewScreenRouteProp>();
  const { media } = route.params;

  // Add back handler
  useBackHandler(() => {
    handleGoBack();
    return true; // Prevent default back behavior
  });

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleNext = () => {
    navigation.navigate('PostDetails', { media: [media] });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Preview</Text>
        <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mediaContainer}>
        <Image
          source={{ uri: media.uri }}
          style={styles.imagePreview}
          resizeMode="contain"
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
  nextButton: {
    padding: 8,
  },
  nextButtonText: {
    color: '#0095f6',
    fontSize: 16,
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
});

export default PostPreviewScreen; 