import React from 'react';
import { TouchableOpacity, Image, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const ReelItem = ({ reel, onPress }) => {
  return (
    <TouchableOpacity
      onPress={() => onPress(reel)}
      style={{ width: width / 3, aspectRatio: 1 }}
    >
      <Image
        source={{ uri: reel.profile.profile_picture }}
        style={{ width: '100%', height: '100%' }}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );
};

export default ReelItem;
