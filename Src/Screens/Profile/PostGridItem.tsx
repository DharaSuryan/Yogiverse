import React from 'react';
import { TouchableOpacity, Image, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const PostGridItem = ({ post, onPress }) => {
  const firstMedia = post.media[0]?.[0]?.media_file;

  return (
    <TouchableOpacity
      onPress={() => onPress(post)}
      style={{ width: width / 3, aspectRatio: 1 }}
    >
      <Image
        source={{ uri: firstMedia }}
        style={{ width: '100%', height: '100%' }}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );
};

export default PostGridItem;
