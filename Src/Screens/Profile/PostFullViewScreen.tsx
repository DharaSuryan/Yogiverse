import React, { useState, useRef } from 'react';
import {
  View,
  FlatList,
  Dimensions,
  Image,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Video from 'react-native-video';

const { width, height } = Dimensions.get('window');

const PostFullViewScreen = ({ route }) => {
  const { posts, initialIndex } = route.params;
  const flatListRef = useRef();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const renderMedia = (mediaArray) => {
    return (
      <FlatList
        data={mediaArray}
        horizontal
        pagingEnabled
        keyExtractor={(_, idx) => idx.toString()}
        renderItem={({ item }) => {
          const mediaUri = item?.media_file;
          const isVideo = mediaUri?.endsWith('.mp4');
          return isVideo ? (
            <Video
              source={{ uri: mediaUri }}
              style={{ width, height: height * 0.6 }}
              resizeMode="cover"
              repeat
              muted
            />
          ) : (
            <Image
              source={{ uri: mediaUri }}
              style={{ width, height: height * 0.6 }}
              resizeMode="cover"
            />
          );
        }}
      />
    );
  };

  const renderPostItem = ({ item }) => (
    <ScrollView>
      {renderMedia(item.media.map((m) => m[0]))}
      <View style={{ padding: 16 }}>
        <Text style={{ fontWeight: 'bold' }}>{item.profile.username}</Text>
        <Text>{item.caption}</Text>
        <Text>{item.like_count} likes</Text>
        <Text>{item.comment_count} comments</Text>
      </View>
    </ScrollView>
  );

  return (
    <FlatList
      ref={flatListRef}
      data={posts}
      pagingEnabled
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderPostItem}
      horizontal={false}
      onMomentumScrollEnd={(e) => {
        const index = Math.round(e.nativeEvent.contentOffset.y / height);
        setCurrentIndex(index);
      }}
      initialScrollIndex={initialIndex}
    />
  );
};

export default PostFullViewScreen;
