import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CreatePostStackParamList } from '../../Navigation/types';
import Icon from 'react-native-vector-icons/Ionicons';

type NavigationProp = NativeStackNavigationProp<CreatePostStackParamList>;

const UploadOptionsScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  const handleMediaPicker = () => {
    navigation.navigate('MediaPicker');
  };

  const handleCreateStory = () => {
    navigation.navigate('CreateStory');
  };

  const handleCreateReel = () => {
    navigation.navigate('CreateReel');
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Icon name="close" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create New Post</Text>
      </View>

      <View style={styles.optionsContainer}>
        <TouchableOpacity style={styles.option} onPress={handleMediaPicker}>
          <Icon name="images-outline" size={32} color="#000" />
          <Text style={styles.optionText}>Upload Photo/Video</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.option} onPress={handleCreateStory}>
          <Icon name="add-circle-outline" size={32} color="#000" />
          <Text style={styles.optionText}>Create Story</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.option} onPress={handleCreateReel}>
          <Icon name="videocam-outline" size={32} color="#000" />
          <Text style={styles.optionText}>Create Reel</Text>
        </TouchableOpacity>
      </View>
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
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 15,
  },
  optionsContainer: {
    padding: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionText: {
    fontSize: 16,
    marginLeft: 15,
  },
});

export default UploadOptionsScreen; 