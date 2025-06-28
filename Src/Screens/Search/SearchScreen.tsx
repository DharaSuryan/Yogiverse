import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SearchStackParamList } from '../../Navigation/types';
import { useNavigation } from '@react-navigation/native';
import WarpperComponent from './warppercomponets';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { navigate,push } from '../../Component/Route';


const screenWidth = Dimensions.get('window').width;
const imageSource = require('../../Assets/yoga.jpg');

const suggestions = [
  { title: 'Lemon recipes', subtitle: 'Food', image: imageSource },
  { title: 'Heritage Desserts', subtitle: 'Food', image: imageSource },
  { title: 'Yoga Lifestyle', subtitle: 'Health', image: imageSource },
  { title: 'Healing Foods', subtitle: 'Ayurveda', image: imageSource },
  { title: 'Daily Detox', subtitle: 'Health', image: imageSource },
  { title: 'Organic Choices', subtitle: 'Market', image: imageSource },
];

type SearchScreenNavigationProp = NativeStackNavigationProp<
  SearchStackParamList,
  'Search'
>;

const SearchScreen = () => {
  const navigation = useNavigation<SearchScreenNavigationProp>();

  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(false);
  const [trendingError, setTrendingError] = useState<string | null>(null);
  const NUM_COLUMNS = 2;
  const ITEM_MARGIN = 10;
  const { width } = Dimensions.get('window');

  const ITEM_WIDTH = (width - ITEM_MARGIN * (NUM_COLUMNS + 1)) / NUM_COLUMNS;
  
  useEffect(() => {
    fetchCategories();
    fetchTrendingPosts();
  }, []);

  const fetchCategories = async (query = '') => {
    setLoading(true);
    setError(null);
    try {
      const mainCategoryRes = await axios.get(
        `https://pashuahar.com/main_with_sub_categories?search=${query}`
      );
      // console.log("here comes resoponse ...",mainCategoryRes.data?.data);
      
      setCategories(mainCategoryRes.data?.data || []);
    } catch (err) {
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const fetchSearchResults = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      console.log("here comes ....",query);
      
      const searchRes = await axios.get(`https://pashuahar.com/search?search=${query}`);
      console.log("searchRes.data?.resultssearchRes.data?.results",searchRes.data?.data?.results);
      
      setSearchResults(searchRes.data?.data?.results || []);
    } catch (err) {
      setError('Failed to fetch search results');
    } finally {
      setLoading(false);
    }
  };

  const fetchTrendingPosts = async () => {
    setTrendingLoading(true);
    setTrendingError(null);
    try {
      const authToken = await AsyncStorage.getItem('accessToken');

      const headers = {
        'Accept': 'application/json',
        'Authorization': `Bearer ${authToken}`
      };
      const res = await axios.get('https://pashuahar.com/trending/?type=post',{headers});
      setTrendingPosts(res.data?.data || []);
    } catch (err) {
      setTrendingError('Failed to load trending posts');
    } finally {
      setTrendingLoading(false);
    }
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    fetchSearchResults(text);
  };

  const handleItemPress = (item: any) => {
    console.log("here comes ....",item);
    

    if (item.first_name) {
      // User result - navigate to UserProfile
      navigation.navigate('UserProfile' as any, { userId: item.id.toString() });
    } else {
      // Category or other result - navigate to SubCateGoryDisplay
      push('SubCateGoryDisplay' , { item });
    }
  };

  const renderCategory = ({ item }: any) => {
    return (
      <TouchableOpacity
        style={styles.categoryCard}
        onPress={() => handleItemPress(item)}
        activeOpacity={0.8}
      >
        <View style={styles.imageWrapper}>
          <Image source={imageSource} style={styles.image} />
        </View>
        <Text numberOfLines={2} style={styles.categoryTitle}>
          {item.category_name}
        </Text>
      </TouchableOpacity>
    );
  };
  
  // const renderCategory = ({ item }: any) => {
  //   const getImageSource = () => {
  //     return categoryImages[item.category_name] || categoryImages['default'];
  //   };
  
  //   return (
  //     <TouchableOpacity
  //       style={styles.categoryCard}
  //       onPress={() => handleItemPress(item)}
  //     >
  //       <View style={styles.imageContainer}>
  //         <Image 
  //           source={getImageSource()} 
  //           style={styles.categoryImage}
  //           resizeMode="cover"
  //         />
  //       </View>
  //       <Text style={styles.categoryTitle} numberOfLines={2}>
  //         {item.category_name}
  //       </Text>
  //     </TouchableOpacity>
  //   );
  // };
  const renderSearchResult = ({ item }: any) => {
    // Handle different types of search results
    let displayName = '';
    let displayType = '';
    
    if (item.first_name) {
      // User result
      displayName = `${item.first_name} ${item.last_name || ''}`;
      displayType = 'User';
    } else if (item.caption) {
      // Post result
      displayName = item.caption;
      displayType = 'Post';
    }
    
    return (
      <TouchableOpacity
        style={styles.searchResultCard}
        onPress={() => handleItemPress(item)}
      >
        <Text style={styles.searchResultText}>{displayName}</Text>
        <Text style={styles.searchResultType}>{displayType}</Text>
      </TouchableOpacity>
    );
  };

  const renderTrendingPost = ({ item }: any) => {
    // console.log("here comes item ...", item);

    let mediaUrl = '';
    if (Array.isArray(item.media) && item.media.length > 0) {
      mediaUrl = item.media[0]?.media_file || '';
    }

    return (
      <TouchableOpacity
        style={{
          width: (screenWidth - 36) / 2,
          backgroundColor: '#fff',
          borderRadius: 18,
          marginBottom: 8,
          marginHorizontal: 4,
          overflow: 'hidden',
          elevation: 2,
          shadowColor: '#000',
          shadowOpacity: 0.06,
          shadowOffset: { width: 0, height: 2 },
          shadowRadius: 8,
        }}
        onPress={() => navigation.push('TrendingDetailScreen', { post: item })}
        activeOpacity={0.9}
      >
        {mediaUrl ? (
          <Image
            source={{ uri: mediaUrl }}
            style={{ width: '100%', height: 180 }}
            resizeMode="cover"
          />
        ) : (
          <View style={{ width: '100%', height: 180, backgroundColor: '#eee' }} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Icon name="search" size={20} color="#000" style={styles.searchIcon} />
        <TextInput
          placeholder="Search for ideas"
          placeholderTextColor="black"
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={handleSearchChange}
        />
      </View>


      {loading ? (
        <ActivityIndicator size="large" color="#000" style={{ marginTop: 20 }} />
      ) : error ? (
        <Text style={{ color: 'red', textAlign: 'center' }}>{error}</Text>
      ) : (
        <>
          {searchQuery.trim().length > 0 && searchResults.length > 0 && (
            <View style={styles.searchResultBlock}>
              <Text style={styles.categoryTitle}>Search Results</Text>
              <FlatList
                data={searchResults}
                scrollEnabled={false}
                keyExtractor={(item) => item?.id?.toString() || Math.random().toString()}
                renderItem={renderSearchResult}
              />
            </View>
          )}
          <FlatList
            data={categories}
            keyExtractor={(item) => item.categories?.toString() || Math.random().toString()}
            renderItem={renderCategory}
            numColumns={2}
        //     columnWrapperStyle={{
        //       justifyContent: 'space-between',
        //       marginBottom: ITEM_MARGIN,
        //     }}
        // contentContainerStyle={{padding: ITEM_MARGIN,
        //   paddingBottom: 20,}}
            scrollEnabled={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
          {trendingLoading ? (
            <ActivityIndicator size="large" color="#000" style={{ marginTop: 20 }} />
          ) : trendingError ? (
            <Text style={{ color: 'red', textAlign: 'center' }}>{trendingError}</Text>
          ) : trendingPosts.length > 0 && (
            <View style={{ marginTop: 30, marginBottom: 10 }}>
              <Text style={[styles.categoryTitle, { fontSize: 18, marginBottom: 10 }]}>Trending</Text>
              <FlatList
                data={trendingPosts}
                keyExtractor={(item) => item?.id?.toString() || Math.random().toString()}
                renderItem={renderTrendingPost}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 8 }}
                contentContainerStyle={{ paddingBottom: 30, paddingTop: 8 }}
                scrollEnabled={false}
              />
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  
 
  searchResultBlock: {
        marginVertical: 10,
        paddingHorizontal: 10,
      },  
  // categoryTitle: {
  //       fontSize: 16,
  //       fontWeight: 'bold',
  //       color: 'black',
  //     },
  // image: { width: '100%', height: '100%', },
  

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
      backgroundColor: '#D3D3D3',
      padding: 10,
      borderRadius: 10,
  },
  cardImage: { width: '95%', height: 70, borderRadius: 40 },
  cardTitle: { fontSize: 14, fontWeight: 'bold', marginTop: 5, color: 'black' },
  cardSubtitle: { fontSize: 12, color: 'black' },
  gridContainer: { paddingHorizontal: 8, paddingBottom: 20 },
  column: { justifyContent: 'space-between', marginBottom: 12 },
  card: {
      width: screenWidth / 2 - 12,
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: '#eee',
  },
  // image: { width: '100%', height: '100%', },
  menuIconContainer: {
      position: 'absolute',
      bottom: 8,
      right: 10,
      backgroundColor: 'rgba(0,0,0,0.4)',
      borderRadius: 12,
      padding: 4,
  },
  searchResultCard: {
    backgroundColor: '#EFEFEF',
    padding: 10,
    marginBottom: 8,
    borderRadius: 8,
  },
  searchResultText: {
    color: '#000',
    fontSize: 16,
  },
  searchResultType: {
    color: '#666',
    fontSize: 13,
    marginTop: 2,
  },
  // categoryCard: {
  //   backgroundColor: '#D3D3D3',
  //   padding: 15,
  //   marginHorizontal: 10,
  //   marginBottom: 10,
  //   borderRadius: 8,
  //   alignItems: 'center',
  // },
  categoryImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 6,
  },
  // categoryTitle: {
  //   fontSize: 16,
  //   fontWeight: 'bold',
  //   color: 'black',
  // },
  categoryCard: {
    width: 130 + 30,
    margin: 8,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  imageWrapper: {
    width: 120,
    height: 120,
    borderRadius: 120 / 2,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    marginBottom: 8,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 4,
  },
})

export default WarpperComponent(SearchScreen);
