import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Text,
  TextInput,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp, CommonActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CreatePostStackParamList } from '../../Navigation/types';
import Icon from 'react-native-vector-icons/Ionicons';

type StoryPreviewScreenNavigationProp = NativeStackNavigationProp<CreatePostStackParamList, 'StoryPreview'>;
type StoryPreviewScreenRouteProp = RouteProp<CreatePostStackParamList, 'StoryPreview'>;

const StoryPreviewScreen = () => {
  const navigation = useNavigation<StoryPreviewScreenNavigationProp>();
  const route = useRoute<StoryPreviewScreenRouteProp>();
  const [caption, setCaption] = useState('');
  const { media } = route.params;

  const handleShare = async () => {
    try {
      // TODO: Implement story upload logic
      // await uploadStory(media.uri, caption);
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        })
      );
    } catch (error) {
      console.error('Error uploading story:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.shareButton}
          onPress={handleShare}
        >
          <Text style={styles.shareButtonText}>Share</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Image
          source={{ uri: media.uri }}
          style={styles.preview}
          resizeMode="cover"
        />
        <View style={styles.captionContainer}>
          <TextInput
            style={styles.captionInput}
            placeholder="Add caption..."
            placeholderTextColor="#999"
            value={caption}
            onChangeText={setCaption}
            multiline
          />
        </View>
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
    paddingTop: Platform.OS === 'ios' ? 0 : 15,
  },
  shareButton: {
    backgroundColor: '#0095f6',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 5,
  },
  shareButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  preview: {
    flex: 1,
    width: '100%',
  },
  captionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 15,
  },
  captionInput: {
    color: '#fff',
    fontSize: 16,
    minHeight: 40,
  },
});

export default StoryPreviewScreen; 