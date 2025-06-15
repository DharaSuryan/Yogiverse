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
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const CreatePostScreen = () => {
  const navigation = useNavigation();
  const [caption, setCaption] = useState('');

  const handleUploadOptions = () => {
    navigation.navigate('UploadOptions');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="close" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Create Post</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <TouchableOpacity 
          style={styles.uploadButton}
          onPress={handleUploadOptions}
        >
          <Icon name="add-circle-outline" size={50} color="#0095f6" />
          <Text style={styles.uploadText}>Upload Photo or Video</Text>
        </TouchableOpacity>

        <View style={styles.captionContainer}>
          <TextInput
            style={styles.captionInput}
            placeholder="Write a caption..."
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
  content: {
    flex: 1,
    padding: 16,
  },
  uploadButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 8,
    marginBottom: 16,
  },
  uploadText: {
    marginTop: 8,
    color: '#0095f6',
    fontSize: 16,
  },
  captionContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
  },
  captionInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
});

export default CreatePostScreen; 