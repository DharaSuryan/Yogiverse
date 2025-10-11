import React, { useState, useRef } from 'react';
import {
  View,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Text,
} from 'react-native';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

const ReelFullViewScreen = ({ route }) => {
  const { reels, initialIndex } = route.params;
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);

  const onViewRef = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index);
    }
  });

  return (
    <FlatList
      data={reels}
      pagingEnabled
      keyExtractor={(item) => item.id.toString()}
      showsVerticalScrollIndicator={false}
      renderItem={({ item, index }) => (
        <View style={{ width, height, position: 'relative' }}>
          <Video
            source={{ uri: item.video_file }}
            style={{ width, height }}
            resizeMode="cover"
            repeat
            paused={activeIndex !== index || paused}
            muted={muted}
          />
          {/* Controls */}
          {activeIndex === index && (
            <>
              <TouchableOpacity
                onPress={() => setPaused((prev) => !prev)}
                style={{ position: 'absolute', top: 40, right: 20 }}
              >
                <Icon
                  name={paused ? 'play' : 'pause'}
                  size={32}
                  color="#fff"
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setMuted((prev) => !prev)}
                style={{ position: 'absolute', top: 90, right: 20 }}
              >
                <Icon
                  name={muted ? 'volume-mute' : 'volume-high'}
                  size={28}
                  color="#fff"
                />
              </TouchableOpacity>
            </>
          )}
          <View style={{ position: 'absolute', bottom: 60, left: 16 }}>
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>
              {item.profile.username}
            </Text>
            <Text style={{ color: '#fff' }}>{item.caption}</Text>
            <Text style={{ color: '#fff' }}>{item.like_count} likes</Text>
          </View>
        </View>
      )}
      onViewableItemsChanged={onViewRef.current}
      viewabilityConfig={{ itemVisiblePercentThreshold: 80 }}
    />
  );
};

export default ReelFullViewScreen;
