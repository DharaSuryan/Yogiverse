import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'react-native-image-picker';

const StoryCreation = ({ navigation }) => {
  const [media, setMedia] = useState(null);
  const [caption, setCaption] = useState('');

  const handleSelectMedia = () => {
    const options = {
      mediaType: 'mixed',
      quality: 1,
      includeBase64: false,
    };

    ImagePicker.launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        return;
      }
      if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
        return;
      }
      if (response.assets && response.assets[0]) {
        setMedia(response.assets[0]);
      }
    });
  };

  const handleCreateStory = () => {
    // Here you would typically upload the media and caption to your backend
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="close" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Story</Text>
        <TouchableOpacity
          onPress={handleCreateStory}
          disabled={!media}
        >
          <Text style={[styles.shareButton, !media && styles.shareButtonDisabled]}>
            Share
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {media ? (
          <Image source={{ uri: media.uri }} style={styles.mediaPreview} />
        ) : (
          <TouchableOpacity
            style={styles.mediaPlaceholder}
            onPress={handleSelectMedia}
          >
            <Icon name="add-circle-outline" size={48} color="#666" />
            <Text style={styles.mediaPlaceholderText}>
              Select photo or video
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.captionContainer}>
          <TextInput
            style={styles.captionInput}
            placeholder="Write a caption..."
            value={caption}
            onChangeText={setCaption}
            multiline
          />
        </View>
      </ScrollView>
    </View>
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
    ...Platform.select({
      ios: {
        paddingTop: 50,
      },
      android: {
        paddingTop: 16,
      },
    }),
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  shareButton: {
    color: '#0095f6',
    fontWeight: '600',
    fontSize: 16,
  },
  shareButtonDisabled: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
  },
  mediaPlaceholder: {
    height: 400,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
  },
  mediaPlaceholderText: {
    marginTop: 8,
    color: '#666',
  },
  mediaPreview: {
    width: '100%',
    height: 400,
    resizeMode: 'cover',
  },
  captionContainer: {
    padding: 16,
  },
  captionInput: {
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
});

export default StoryCreation; 