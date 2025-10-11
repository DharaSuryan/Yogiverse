import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  FlatList,
  Dimensions,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CreatePostStackParamList } from '../../Navigation/types';
import * as ImagePicker from 'react-native-image-picker';
import Video from 'react-native-video';

type StoryReelsSelectionScreenNavigationProp = NativeStackNavigationProp<CreatePostStackParamList>;

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width / 3;

const StoryReelsSelectionScreen = () => {
  const navigation = useNavigation<StoryReelsSelectionScreenNavigationProp>();
  const [media, setMedia] = useState<Array<{ uri: string; type: 'image' | 'video' }>>([]);
  const [selectedType, setSelectedType] = useState<'story' | 'reel'>('story');

  const handleMediaSelect = async () => {
    const options = {
      mediaType: 'mixed',
      selectionLimit: 0,
      includeBase64: false,
      includeExtra: true,
    };

    try {
      const result = await ImagePicker.launchImageLibrary(options);
      if (result.assets && result.assets.length > 0) {
        const newMedia = result.assets.map(asset => ({
          uri: asset.uri || '',
          type: asset.type?.startsWith('video/') ? 'video' : 'image',
        }));
        setMedia(prev => [...prev, ...newMedia]);
      }
    } catch (error) {
      console.error('Error selecting media:', error);
    }
  };

  const handleCameraPress = () => {
    if (selectedType === 'story') {
      navigation.navigate('StoryCamera');
    } else {
      navigation.navigate('ReelCamera');
    }
  };

  const handleMediaPress = (item: { uri: string; type: 'image' | 'video' }) => {
    if (selectedType === 'story') {
      navigation.navigate('StoryPreview', { uri: item.uri, type: item.type });
    } else {
      navigation.navigate('ReelPreview', { uri: item.uri });
    }
  };

  const renderMediaItem = ({ item }: { item: { uri: string; type: 'image' | 'video' } }) => (
    <TouchableOpacity
      style={styles.mediaItem}
      onPress={() => handleMediaPress(item)}
    >
      {item.type === 'image' ? (
        <Image source={{ uri: item.uri }} style={styles.mediaPreview} />
      ) : (
        <View style={styles.mediaPreview}>
          <Video
            source={{ uri: item.uri }}
            style={styles.mediaPreview}
            muted
            repeat
            resizeMode="cover"
            paused={true}
          />
          <View style={styles.videoIcon}>
            <Icon name="videocam" size={20} color="#fff" />
          </View>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="close" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[styles.typeButton, selectedType === 'story' && styles.selectedType]}
            onPress={() => setSelectedType('story')}
          >
            <Text style={[styles.typeText, selectedType === 'story' && styles.selectedTypeText]}>
              Story
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeButton, selectedType === 'reel' && styles.selectedType]}
            onPress={() => setSelectedType('reel')}
          >
            <Text style={[styles.typeText, selectedType === 'reel' && styles.selectedTypeText]}>
              Reel
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleCameraPress}>
            <Icon name="camera" size={24} color="#000" />
            <Text style={styles.actionText}>Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleMediaSelect}>
            <Icon name="images" size={24} color="#000" />
            <Text style={styles.actionText}>Gallery</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={media}
          renderItem={renderMediaItem}
          keyExtractor={(_, index) => index.toString()}
          numColumns={3}
          contentContainerStyle={styles.mediaGrid}
        />
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
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 2,
  },
  typeButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  selectedType: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  selectedTypeText: {
    color: '#000',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionButton: {
    alignItems: 'center',
  },
  actionText: {
    marginTop: 8,
    fontSize: 14,
    color: '#000',
  },
  mediaGrid: {
    padding: 1,
  },
  mediaItem: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH,
    padding: 1,
  },
  mediaPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  videoIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: 4,
  },
});

export default StoryReelsSelectionScreen; 