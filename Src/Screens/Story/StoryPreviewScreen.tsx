import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { NavigationProp, RouteProp, CommonActions } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { StoryStackParamList } from '../../Navigation/StoryNavigator';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

interface StoryPreviewScreenProps {
  navigation: NativeStackNavigationProp<StoryStackParamList>;
  route: RouteProp<StoryStackParamList, 'StoryPreview'>;
}

const StoryPreviewScreen: React.FC<StoryPreviewScreenProps> = ({
  navigation,
  route,
}) => {
  const { imageUri, caption } = route.params;
  const [isPosting, setIsPosting] = useState(false);
  const [selectedAudience, setSelectedAudience] = useState<'all' | 'close'>('all');

  useEffect(() => {
    return () => {
      // Cleanup function
      setIsPosting(false);
      setSelectedAudience('all');
    };
  }, []);

  const handlePost = async () => {
    setIsPosting(true);
    try {
      // Here you would typically upload the story to your backend
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Reset navigation to home after successful post
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'StoryHome' }],
        })
      );
    } catch (error) {
      console.error('Error posting story:', error);
    } finally {
      setIsPosting(false);
    }
  };

  const handleClose = () => {
    navigation.goBack(); // This will properly animate back
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={handleClose}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.headerButton}
        >
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Preview</Text>
        <TouchableOpacity 
          onPress={handlePost}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.headerButton}
        >
          {isPosting ? (
            <ActivityIndicator color="#0095F6" />
          ) : (
            <Text style={styles.shareButton}>Share</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.previewContainer}>
        <Image source={{ uri: imageUri }} style={styles.previewImage} />
        <LinearGradient
          colors={['rgba(0,0,0,0.4)', 'transparent', 'transparent', 'rgba(0,0,0,0.4)']}
          style={styles.gradient}
        />
        {caption && (
          <View style={styles.captionOverlay}>
            <Text style={styles.captionText}>{caption}</Text>
          </View>
        )}
      </View>

      <View style={styles.optionsContainer}>
        <Text style={styles.sectionTitle}>Share to</Text>
        <View style={styles.audienceOptions}>
          <TouchableOpacity
            style={[
              styles.audienceOption,
              selectedAudience === 'all' && styles.selectedAudience,
            ]}
            onPress={() => setSelectedAudience('all')}>
            <Ionicons
              name="globe-outline"
              size={24}
              color={selectedAudience === 'all' ? '#0095F6' : '#fff'}
            />
            <Text
              style={[
                styles.audienceText,
                selectedAudience === 'all' && styles.selectedAudienceText,
              ]}>
              Your Story
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.audienceOption,
              selectedAudience === 'close' && styles.selectedAudience,
            ]}
            onPress={() => setSelectedAudience('close')}>
            <Ionicons
              name="star-outline"
              size={24}
              color={selectedAudience === 'close' ? '#0095F6' : '#fff'}
            />
            <Text
              style={[
                styles.audienceText,
                selectedAudience === 'close' && styles.selectedAudienceText,
              ]}>
              Close Friends
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Your story will be visible for 24 hours
        </Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    height: 56,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  shareButton: {
    color: '#0095F6',
    fontSize: 16,
    fontWeight: '600',
  },
  previewContainer: {
    width: width,
    height: height * 0.6,
    backgroundColor: '#222',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  captionOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 8,
  },
  captionText: {
    color: '#fff',
    fontSize: 16,
  },
  optionsContainer: {
    padding: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
  },
  audienceOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  audienceOption: {
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    minWidth: 120,
  },
  selectedAudience: {
    backgroundColor: 'rgba(0,149,246,0.2)',
  },
  audienceText: {
    color: '#fff',
    marginTop: 8,
    fontSize: 14,
  },
  selectedAudienceText: {
    color: '#0095F6',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#666',
    fontSize: 14,
  },
});

export default StoryPreviewScreen; 