import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../Navigation/types';
import { Story } from '../Types';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { RootState } from '../Store/store';

const { width } = Dimensions.get('window');
const STORY_SIZE = 70;

const StoryList = () => {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const stories = useSelector((state: RootState) => state.stories.stories) as Story[];

  const handleStoryPress = (story: Story) => {
    navigation.navigate('StoryViewer', {
      stories: stories,
      initialIndex: stories.findIndex((s: Story) => s.id === story.id),
    });
  };

  const handleCreateStory = () => {
    navigation.navigate('CreateStory');
  };

  const renderStory = (story: Story, index: number) => (
    <TouchableOpacity
      key={story.id}
      style={styles.storyContainer}
      onPress={() => handleStoryPress(story)}>
      <View style={[styles.storyRing, story.isViewed && styles.viewedStoryRing]}>
        <Image source={{ uri: story.userProfilePicture }} style={styles.storyImage} />
      </View>
      <Text style={styles.username} numberOfLines={1}>
        {story.username}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity
          style={styles.storyContainer}
          onPress={handleCreateStory}>
          <View style={styles.createStoryRing}>
            <Image
              source={{ uri: 'https://picsum.photos/200' }} // Replace with user's profile picture
              style={styles.storyImage}
            />
            <View style={styles.plusButton}>
              <Ionicons name="add-circle" size={20} color="#0095f6" />
            </View>
          </View>
          <Text style={styles.username}>Your Story</Text>
        </TouchableOpacity>
        {stories.map((story, index) => renderStory(story, index))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 100,
    borderBottomWidth: 0.5,
    borderBottomColor: '#dbdbdb',
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  storyContainer: {
    width: STORY_SIZE,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  storyRing: {
    width: STORY_SIZE,
    height: STORY_SIZE,
    borderRadius: STORY_SIZE / 2,
    borderWidth: 2,
    borderColor: '#ff8501',
    padding: 2,
    marginBottom: 5,
  },
  viewedStoryRing: {
    borderColor: '#dbdbdb',
  },
  createStoryRing: {
    width: STORY_SIZE,
    height: STORY_SIZE,
    borderRadius: STORY_SIZE / 2,
    borderWidth: 2,
    borderColor: '#dbdbdb',
    padding: 2,
    marginBottom: 5,
  },
  storyImage: {
    width: '100%',
    height: '100%',
    borderRadius: STORY_SIZE / 2,
  },
  plusButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  username: {
    fontSize: 12,
    textAlign: 'center',
    width: STORY_SIZE,
  },
});

export default StoryList; 