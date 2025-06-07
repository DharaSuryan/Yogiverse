import React, { useState } from 'react';
import {
  View,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
} from 'react-native';
import { Post } from '../Types';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const NUM_COLUMNS = 3;
const ITEM_WIDTH = SCREEN_WIDTH / NUM_COLUMNS;

// Mock data for posts and reels
const mockData: Post[] = [
  {
    id: '1',
    userId: '1',
    username: 'user1',
    userProfilePicture: 'https://i.pravatar.cc/150?u=1',
    image: 'https://picsum.photos/500/500?random=1',
    caption: 'Beautiful sunset! 🌅',
    likes: 120,
    comments: [],
    timestamp: '2h',
    isLiked: false,
    isSaved: false,
  },
  {
    id: '2',
    userId: '2',
    username: 'user2',
    userProfilePicture: 'https://i.pravatar.cc/150?u=2',
    image: 'https://picsum.photos/500/500?random=2',
    caption: 'City vibes 🌆',
    likes: 85,
    comments: [],
    timestamp: '3h',
    isLiked: false,
    isSaved: false,
  },
  {
    id: '3',
    userId: '3',
    username: 'user3',
    userProfilePicture: 'https://i.pravatar.cc/150?u=3',
    image: 'https://picsum.photos/500/500?random=3',
    caption: 'Nature is beautiful 🌿',
    likes: 200,
    comments: [],
    timestamp: '4h',
    isLiked: false,
    isSaved: false,
  },
  {
    id: '4',
    userId: '4',
    username: 'user4',
    userProfilePicture: 'https://i.pravatar.cc/150?u=4',
    image: 'https://picsum.photos/500/500?random=4',
    caption: 'Travel memories ✈️',
    likes: 150,
    comments: [],
    timestamp: '5h',
    isLiked: false,
    isSaved: false,
  },
  {
    id: '5',
    userId: '5',
    username: 'user5',
    userProfilePicture: 'https://i.pravatar.cc/150?u=5',
    image: 'https://picsum.photos/500/500?random=5',
    caption: 'Foodie life 🍕',
    likes: 300,
    comments: [],
    timestamp: '6h',
    isLiked: false,
    isSaved: false,
  },
  {
    id: '6',
    userId: '6',
    username: 'user6',
    userProfilePicture: 'https://i.pravatar.cc/150?u=6',
    image: 'https://picsum.photos/500/500?random=6',
    caption: 'Art and creativity 🎨',
    likes: 180,
    comments: [],
    timestamp: '7h',
    isLiked: false,
    isSaved: false,
  },
];

interface SearchGridProps {
  onItemPress: (item: Post) => void;
}

const SearchGrid: React.FC<SearchGridProps> = ({ onItemPress }) => {
  const [data] = useState<Post[]>(mockData);

  const renderItem = ({ item }: { item: Post }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => onItemPress(item)}
    >
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.overlay}>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="heart" size={16} color="#fff" />
            <Text style={styles.statText}>{item.likes}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="chatbubble" size={16} color="#fff" />
            <Text style={styles.statText}>{item.comments.length}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      numColumns={NUM_COLUMNS}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 1,
  },
  itemContainer: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH,
    padding: 1,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 2,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'flex-end',
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    color: '#fff',
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '600',
  },
});

export default SearchGrid; 