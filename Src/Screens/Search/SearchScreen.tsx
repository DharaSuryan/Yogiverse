import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Video from 'react-native-video';
import { SearchStackParamList } from '../../Navigation/types';
import { useNavigation } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;

const suggestions = [
  { title: 'Lemon recipes', subtitle: 'Food', image: require('../../Assets/yoga.jpg') },
  { title: 'Heritage Desserts', subtitle: 'Food', image: require('../../Assets/yoga.jpg') },
  { title: 'Yoga Lifestyle', subtitle: 'Health', image: require('../../Assets/yoga.jpg') },
  { title: 'Healing Foods', subtitle: 'Ayurveda', image: require('../../Assets/yoga.jpg') },
  { title: 'Daily Detox', subtitle: 'Health', image: require('../../Assets/yoga.jpg') },
  { title: 'Organic Choices', subtitle: 'Market', image: require('../../Assets/yoga.jpg') },
];

const imageData = [
  require('../../Assets/yoga.jpg'),
  require('../../Assets/yoga.jpg'),
  require('../../Assets/yoga.jpg'),
  require('../../Assets/yoga.jpg'),
  require('../../Assets/yoga.jpg'),
  require('../../Assets/yoga.jpg'),
];
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


export default function SearchScreen() {
    const navigation = useNavigation<any>();
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Icon name="search" size={20} color="#000" style={styles.searchIcon} />
        <TextInput placeholder="Search for ideas" style={styles.searchInput} />
      </View>

      {/* Banner Text */}
      <View style={styles.bannerTextContainer}>
        <Text style={styles.bannerSubheading}>Adorable snapshots</Text>
        <Text style={styles.bannerHeading}>Pet photo ideas</Text>
      </View>

      {/* Suggestions Section */}
      <Text style={styles.suggestionTitle}>Ideas you might like</Text>
      <FlatList
        data={suggestions}
        numColumns={3}
        scrollEnabled={false} // Important: disable scroll here
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.suggestionList}
        columnWrapperStyle={styles.columnWrapperStyle}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.suggestionCard} >
            <Image source={item.image} style={styles.cardImage} resizeMode="cover" />
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Image Grid Section */}
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
          onPress={()=>navigation.navigate('SearchDetail', { id : "1" })}
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
                        <Icon name="ellipsis-vertical" size={18} color="#fff" />
                      </View>
        </TouchableOpacity>
  )}
/>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eee',
    borderRadius: 10,
    margin: 10,
    paddingHorizontal: 10,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 40 },
  bannerTextContainer: { paddingHorizontal: 16, marginTop: 10 },
  bannerSubheading: { fontSize: 14, color: '#888' },
  bannerHeading: { fontSize: 22, fontWeight: 'bold' },
  suggestionTitle: { fontSize: 18, fontWeight: '600', margin: 10 },
  suggestionList: { paddingHorizontal: 10 },
  columnWrapperStyle: { justifyContent: 'space-between', marginBottom: 15 },
  suggestionCard: {
    width: screenWidth / 3 - 15,
    marginHorizontal: 5,
    backgroundColor: '#d4b981',
    padding: 10,
    borderRadius: 10,
  },
  cardImage: { width: '100%', height: 70, borderRadius: 40 },
  cardTitle: { fontSize: 14, fontWeight: 'bold', marginTop: 5, color: 'white' },
  cardSubtitle: { fontSize: 12, color: 'white' },
  gridContainer: { paddingHorizontal: 8, paddingBottom: 20 },
  column: { justifyContent: 'space-between', marginBottom: 12 },
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
