import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  SectionList,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CreatePostStackParamList } from '../../Navigation/types';
import { launchImageLibrary } from 'react-native-image-picker';
import { navigationRef } from '../../Component/Route';

// type UploadOptionsScreenNavigationProp = NativeStackNavigationProp<CreatePostStackParamList>;

const UploadOptionsScreen = () => {
  const navigation = useNavigation();
  const [navigating, setNavigating] = useState(false);
  const routes = useNavigationState(state => state.routeNames);

  const options = [
    {
      title: 'Post',
      description: 'Share a photo or video to your feed',
      icon: 'images-outline',
      onPress: () => navigation.navigate('UploadPost', {}),
    },
    {
      title: 'Story',
      description: 'Share a photo or video to your story',
      icon: 'add-circle-outline',
      onPress: () => {
        navigationRef.current?.navigate('StoryUpload');
      },
    },
    {
      title: 'Reel',
      description: 'Create a short-form video',
      icon: 'videocam-outline',
      onPress: () => navigation.navigate('ReelCamera'),
    },
  ];

  // SectionList data structure
  const sections = [
    {
      title: 'Options',
      data: options,
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
          if (selected.uri) {
            navigation.navigate('StoryPreview', {
              uri: selected.uri,
              type: selected.type?.startsWith('video') ? 'video' : 'image',
            });
          }
        } else if (type === 'reel') {
          if (selected.uri) {
            navigation.navigate('ReelPreview', { uri: selected.uri });
          }
        } else {
          const uris = result.assets.map(a => a.uri).filter((uri): uri is string => !!uri);
          navigation.navigate('PostPreview', { images: uris });
        }
      }
    } finally {
      setTimeout(() => setNavigating(false), 500); // Give time for navigation to complete
    }
  };

  const goToStoryUpload = () => {
    if (routes && routes.includes('StoryUpload')) {
      navigation.navigate('StoryUpload');
    } else {
      navigation.navigate('CreatePostTab', { screen: 'StoryUpload' });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="#bea063" />
        </TouchableOpacity>
        <Text style={styles.title}>Create New</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.optionsContainer}>
        <SectionList
          sections={sections}
          keyExtractor={item => item.title}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.option}
              onPress={item.onPress}
            >
              <View style={styles.optionContent}>
                <View style={styles.iconContainer}>
                  <Ionicons name={item.icon} size={32} color="#bea063" />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.optionTitle}>{item.title}</Text>
                  <Text style={styles.optionDescription}>{item.description}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#bea063" style={styles.chevron} />
            </TouchableOpacity>
          )}
          renderSectionHeader={() => null}
          showsVerticalScrollIndicator={false}
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
    color: '#bea063',
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