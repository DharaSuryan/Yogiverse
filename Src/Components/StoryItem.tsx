import React from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Story } from '../Types';
import LinearGradient from 'react-native-linear-gradient';

interface StoryItemProps {
  story: Story;
  onPress: () => void;
}

const StoryItem: React.FC<StoryItemProps> = ({ story, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <LinearGradient
        colors={['#f09433', '#e6683c', '#dc2743', '#cc2366', '#bc1888']}
        style={styles.gradientBorder}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: story.userProfilePicture }}
            style={styles.image}
          />
        </View>
      </LinearGradient>
      <Text style={styles.username} numberOfLines={1}>
        {story.username}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginHorizontal: 8,
    width: 80,
  },
  gradientBorder: {
    padding: 2,
    borderRadius: 40,
  },
  imageContainer: {
    backgroundColor: '#fff',
    borderRadius: 38,
    padding: 2,
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  username: {
    marginTop: 4,
    fontSize: 12,
    textAlign: 'center',
    color: '#262626',
  },
});

export default StoryItem; 