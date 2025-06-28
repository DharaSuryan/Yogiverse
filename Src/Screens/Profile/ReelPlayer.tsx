import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Image,
  StatusBar
} from 'react-native';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/Ionicons';
import { useRoute } from '@react-navigation/native';

const { height, width } = Dimensions.get('window');

export const ReelPlayer = () => {
  const route = useRoute<any>();
  const { reel } = route.params;

  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const reelsData = [reel]; // If more reels come in, replace this with array

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  });

  const renderItem = ({ item, index }: any) => {
    return (
      <View style={styles.reelContainer}>
        <Video
          source={{ uri: `http://192.168.1.160:9001${item.video_file}` }}
          style={styles.video}
          resizeMode="cover"
          repeat
          paused={currentIndex !== index}
        />

        {/* Overlay UI */}
        <View style={styles.overlay}>
          <View style={styles.userInfo}>
            <Text style={styles.username}>@{item?.user || 'unknown'}</Text>
            <Text style={styles.caption}>{item.caption}</Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.iconButton}>
              <Icon name="heart-outline" size={28} color="#fff" />
              <Text style={styles.iconText}>{item.like_count}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Icon name="chatbubble-outline" size={28} color="#fff" />
              <Text style={styles.iconText}>{item.comment_count}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Icon name="arrow-redo-outline" size={28} color="#fff" />
              <Text style={styles.iconText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <FlatList
        ref={flatListRef}
        data={reelsData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={{ itemVisiblePercentThreshold: 80 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  reelContainer: {
    width,
    height,
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 50,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  userInfo: {
    flex: 1,
    paddingRight: 10,
  },
  username: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  caption: {
    color: '#fff',
    marginTop: 4,
  },
  actions: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  iconButton: {
    marginBottom: 20,
    alignItems: 'center',
  },
  iconText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
});

