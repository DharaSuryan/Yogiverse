import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  FlatList,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Video from 'react-native-video';
import { useNavigation } from '@react-navigation/native';
import { BackHandler } from 'react-native';
const screenWidth = Dimensions.get('window').width;
const reelsAndPosts = [
  { id: '1', type: 'image', src: 'https://picsum.photos/id/1015/400/600' },
  { id: '2', type: 'video', src: 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4' },
  { id: '3', type: 'image', src: 'https://picsum.photos/id/1018/400/400' },
  { id: '4', type: 'image', src: 'https://picsum.photos/id/1024/400/500' },
  { id: '5', type: 'video', src: 'https://samplelib.com/lib/preview/mp4/sample-10s.mp4' },
  { id: '6', type: 'image', src: 'https://picsum.photos/id/1027/400/450' },
  { id: '7', type: 'image', src: 'https://picsum.photos/id/1035/400/700' },
  { id: '8', type: 'video', src: 'https://samplelib.com/lib/preview/mp4/sample-3s.mp4' },
  { id: '9', type: 'image', src: 'https://picsum.photos/id/1042/400/500' },
  { id: '10', type: 'image', src: 'https://picsum.photos/id/1049/400/600' }
];
const exploreMoreData = [
  require('../../Assets/yoga.jpg'),
  require('../../Assets/yoga.jpg'),
  require('../../Assets/yoga.jpg'),
  require('../../Assets/yoga.jpg'),
];

const SearchDetailScreen = () => {
    const navigation = useNavigation();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(2100);

  const toggleLike = () => {
    setLiked(!liked);
    setLikeCount(prev => prev + (liked ? -1 : 1));
  };
useEffect(
  React.useCallback(() => {
    const onBackPress = () => {
      navigation.navigate('SearchScreen'); // This assumes your tab is named 'Search'
      return true; // Prevent default back behavior
    };

    BackHandler.addEventListener('hardwareBackPress', onBackPress);

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    };
  }, [navigation])
);
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.mediaWrapper}>
        <Image source={require('../../Assets/yoga.jpg')} style={styles.mainMedia} />

        <TouchableOpacity style={styles.backButton}  onPress={() => navigation.navigate('SearchScreen')}>
          <Ionicons name="arrow-back" size={28} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.actionRow}>
        <View style={styles.leftActions}>
          <TouchableOpacity onPress={toggleLike} style={styles.iconWithText}>
            <Ionicons name={liked ? 'heart' : 'heart-outline'} size={22} color={liked ? 'red' : 'black'} />
            <Text style={styles.iconText}>{likeCount}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconWithText}>
            <Ionicons name="chatbubble-outline" size={22} color="#000" />
            <Text style={styles.iconText}>8</Text>
          </TouchableOpacity>

          <Ionicons name="share-outline" size={22} style={styles.icon} />
        </View>

        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.captionWrapper}>
        <Text style={styles.username}>Fiya</Text>
        <Text style={styles.title}>HAPPY EID AL ASDHA...</Text>
        <Text style={styles.caption}>Ma Shaa ALLAH Ma shaa ALLAH 😍🤍 See more</Text>
      </View>

      <Text style={styles.moreText}>More to explore</Text>

        <FlatList
  data={reelsAndPosts}
  numColumns={2}
  scrollEnabled={false} // Important: disable scroll here
  keyExtractor={(item, index) => index.toString()}
  columnWrapperStyle={styles.column}
  contentContainerStyle={styles.gridContainer}
  renderItem={({ item, index }) => (
     <TouchableOpacity
          style={[styles.card, { height:  230  }]}
        
        >
          {item.type === 'image' ? (
            <Image source={{ uri: item.src }} style={styles.image} />
          ) : (
            <Video
              source={{ uri: item.src }}
              style={styles.image}
              muted
              repeat
              resizeMode="cover"
              paused={true} // Lazy load
            />
          )}
           <View style={styles.menuIconContainer}>
                        <Ionicons name="ellipsis-vertical" size={18} color="#fff" />
                      </View>
        </TouchableOpacity>
  )}
/>
    </ScrollView>
  );
};

export default SearchDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  mediaWrapper: { position: 'relative' },
  mainMedia: {
    width: '100%',
    height: screenWidth * 1.1,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 16,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 4,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 12,
  },
  leftActions: { flexDirection: 'row', alignItems: 'center' },
  icon: { marginLeft: 12 },
  iconWithText: { flexDirection: 'row', alignItems: 'center', marginRight: 12 },
  iconText: { marginLeft: 4 },
  saveButton: {
    backgroundColor: '#E60023',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  saveButtonText: { color: '#fff', fontWeight: 'bold' },
  captionWrapper: { paddingHorizontal: 16, marginTop: 12 },
  username: { fontWeight: 'bold', fontSize: 16 },
  title: { fontSize: 18, fontWeight: '600', marginTop: 4 },
  caption: { marginTop: 4, color: '#555' },
  moreText: { fontWeight: '600', fontSize: 16, margin: 16 },
  exploreList: { paddingHorizontal: 8 },
  exploreItem: {
    marginRight: 10,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  exploreImage: {
    width: screenWidth * 0.4,
    height: screenWidth * 0.6,
    borderRadius: 10,
  },
  durationTag: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  durationText: { color: '#fff', fontSize: 10 },
  column: { justifyContent: 'space-between', marginBottom: 12 },
    gridContainer: { paddingHorizontal: 8, paddingBottom: 20 },
  card: {
    width: screenWidth / 2 - 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#eee',
  },
  image: { width: '100%', height: '100%', },
   menuIconContainer: {
    position: 'absolute',
    bottom: 8,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 12,
    padding: 4,
  },
});
