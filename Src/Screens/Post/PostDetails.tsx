import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp, CommonActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CreatePostStackParamList } from '../../Navigation/types';
import Icon from 'react-native-vector-icons/Ionicons';
import { useBackHandler } from '../../Utils/BackHandler';

type NavigationProp = NativeStackNavigationProp<CreatePostStackParamList>;
type PostDetailsRouteProp = RouteProp<CreatePostStackParamList, 'PostDetails'>;

export default function PostDetailsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<PostDetailsRouteProp>();
  const [caption, setCaption] = useState('');
  const { media } = route.params;

  // Add back handler
  useBackHandler(() => {
    handleGoBack();
    return true; // Prevent default back behavior
  });

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleShare = async () => {
    try {
      // Here you would typically upload the media and caption to your backend
      console.log('Sharing post with:', { media, caption });
      
      // Reset the navigation state and go back to the main tab
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            {
              name: 'MainTab',
              state: {
                routes: [{ name: 'HomeTab' }],
              },
            },
          ],
        })
      );
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Icon name="close" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Post</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <Text style={styles.shareButtonText}>Share</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.mediaPreview}>
          {media.map((item, index) => (
            <Image
              key={index}
              source={{ uri: item.uri }}
              style={styles.mediaImage}
            />
          ))}
        </View>

        <TextInput
          style={styles.captionInput}
          placeholder="Write a caption..."
          value={caption}
          onChangeText={setCaption}
          multiline
          maxLength={2200}
        />
      </ScrollView>
    </View>
  );
}

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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  shareButton: {
    padding: 8,
  },
  shareButtonText: {
    color: '#0095f6',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  mediaPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  mediaImage: {
    width: 100,
    height: 100,
    margin: 4,
  },
  captionInput: {
    padding: 16,
    fontSize: 16,
    minHeight: 100,
  },
}); 