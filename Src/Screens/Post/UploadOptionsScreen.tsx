import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  FlatList,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CreatePostStackParamList } from '../../Navigation/types';
import { launchImageLibrary } from 'react-native-image-picker';

type UploadOptionsScreenNavigationProp = NativeStackNavigationProp<CreatePostStackParamList>;

const UploadOptionsScreen = () => {
  const navigation = useNavigation<UploadOptionsScreenNavigationProp>();
  const [navigating, setNavigating] = useState(false);

  const options = [
    {
      title: 'Post',
      description: 'Share a photo or video to your feed',
      icon: 'images-outline',
      onPress: () => navigation.navigate('MediaPicker', { type: 'post' }),
    },
    {
      title: 'Story',
      description: 'Share a photo or video to your story',
      icon: 'add-circle-outline',
      onPress: () => navigation.navigate('MediaPicker', { type: 'story' }),
    },
    {
      title: 'Reel',
      description: 'Create a short-form video',
      icon: 'videocam-outline',
      onPress: () => navigation.navigate('ReelCamera'),
    },
  ];

  const handleMediaSelect = async (type: string) => {
    if (navigating) return;
    setNavigating(true);
    try {
      const result = await launchImageLibrary({
        mediaType: type === 'post' ? 'mixed' : 'video',
        selectionLimit: type === 'post' ? 10 : 1,
        quality: 1,
      });
      if (result.assets && result.assets.length > 0) {
        const selected = result.assets[0];
        if (type === 'story') {
          navigation.navigate('StoryPreview', {
            uri: selected.uri,
            type: selected.type?.startsWith('video') ? 'video' : 'image',
          });
        } else if (type === 'reel') {
          navigation.navigate('ReelPreview', { uri: selected.uri });
        } else {
          navigation.navigate('PostPreview', { images: result.assets.map(a => a.uri) });
        }
      }
    } finally {
      setTimeout(() => setNavigating(false), 500); // Give time for navigation to complete
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="close" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Create New</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.optionsContainer}>
        <FlatList
          data={options}
          keyExtractor={item => item.uri || item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.option}
              
              onPress={() => {
               Alert.alert("Coming Soon");
                // handleMediaSelect(item.title.toLowerCase())
              }}
            >
              <View style={styles.optionContent}>
                <View style={styles.iconContainer}>
                  <Icon name={item.icon} size={32} color="#bea063" />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.optionTitle}>{item.title}</Text>
                  <Text style={styles.optionDescription}>{item.description}</Text>
                </View>
              </View>
              <Icon name="chevron-forward" size={24} color="#bea063" style={styles.chevron} />
            </TouchableOpacity>
          )}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Your content will be visible to your followers
        </Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  optionsContainer: {
    flex: 1,
    padding: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(190, 160, 99, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
  },
  chevron: {
    opacity: 0.7,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default UploadOptionsScreen; 