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
import { SearchStackParamList } from '../../Navigation/types';
import { useNavigation } from '@react-navigation/native';
import WarpperComponent from './warppercomponets';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { push } from '../../Component/Route';
import MasonryList from '@react-native-seoul/masonry-list';
const Ionicons = require('react-native-vector-icons/Ionicons').default;



const screenWidth = Dimensions.get('window').width;
const imageSource = require('../../Assets/yoga.jpg');


type SearchScreenNavigationProp = NativeStackNavigationProp<
  SearchStackParamList,
  'Search'
>;

const SearchScreen = () => {
  const navigation = useNavigation<SearchScreenNavigationProp>();

  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trendingPosts, setTrendingPosts] = useState<any[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(false);
  const [trendingError, setTrendingError] = useState<string | null>(null);

console.log("categories",categories);

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
      console.log("data. main category",mainCategoryRes.data);
      
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
      console.log("here comes ....", query);

      const searchRes = await axios.get(`https://pashuahar.com/search?search=${query}`);
      // console.log("searchRes.data?.resultssearchRes.data?.results",searchRes.data?.data?.results);
      console.log("datat....", searchRes.data?.data);

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
      const res = await axios.get('https://pashuahar.com/trending/?type=post', { headers });
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
    console.log("here comes ....", item);


    if (item.first_name) {
      // User result - navigate to Profile tab (current user's profile)
      navigation.navigate('UserProfile' as any, { userId: item.id.toString(), isFromSearch: true });
      
    } else {
      // Category or other result - navigate to SubCateGoryDisplay
      push('SubCateGoryDisplay', { item });
    }
  };

  const renderCategory = ({ item }: any) => {
    return (
      <TouchableOpacity
        style={styles.categoryCardNew}
        onPress={() => handleItemPress(item)}
        activeOpacity={0.8}
      >
        <View style={styles.categoryImageWrapperNew}>
          <Image
            source={item.main_category_image ? { uri: item.main_category_image } : imageSource}
            style={styles.categoryImageNew}
          />
        </View>
        <Text
          numberOfLines={2}
          ellipsizeMode="tail"
          style={styles.categoryTitleNew}
        >
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
    console.log("itesm....", item);

    let displayName = '';
    let displayType = '';
    let avatarSource = null;
    let isUser = false;

    if (item.first_name) {
      // User result
      displayName = `${item.first_name} ${item.last_name || ''}`;
      displayType = item.username;
      isUser = true;
      avatarSource = item?.profile_picture
        ? { uri: item?.profile_picture }
        : null; // We'll handle the default icon in render
    } else if (item.caption) {
      // Post result
      displayName = item.caption;
      displayType = 'Post';
      avatarSource = require('../../Assets/yoga.jpg');
    } else {
      // Suggestion or other
      displayName = item.title || item.name || '';
      displayType = '';
      avatarSource = null;
    }

    return (
      <TouchableOpacity
        style={styles.searchResultRow}
        onPress={() => handleItemPress(item)}
        activeOpacity={0.8}
      >
        <View style={styles.searchResultAvatarContainer}>
          {isUser ? (
            avatarSource ? (
              <Image
                source={avatarSource}
                style={styles.searchResultAvatar}
              />
            ) : (
              <View style={styles.searchResultIconCircle}>
                {React.createElement(Ionicons, { name: "person-circle", size: 44, color: "#bea063" })}
              </View>
            )
          ) : (
            <View style={styles.searchResultIconCircle}>
              {React.createElement(Ionicons, { name: "search", size: 20, color: "#fff" })}
            </View>
          )}
        </View>
        <View style={styles.searchResultTextContainer}>
          <Text style={styles.searchResultText} numberOfLines={1}>{displayName}</Text>
          {displayType ? (
            <Text style={styles.searchResultType} numberOfLines={1}>{displayType}</Text>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  const renderTrendingPost = ({ item }: any) => {
    let mediaUrl = '';
    if (Array.isArray(item.media) && item.media.length > 0) {
      mediaUrl = item.media[0]?.media_file || '';
    }

    const randomHeight = Math.floor(Math.random() * 120) + 200;
    const screenWidth = Dimensions.get('window').width;
    const columnWidth = screenWidth / 2 - 16;

    return (
      <TouchableOpacity
        style={
          {
            margin: 8,
            borderRadius: 12,
            overflow: 'hidden',
            backgroundColor: '#f0f0f0',
          }
        }
        onPress={() => navigation.push('TrendingDetailScreen', { post: item })}
        activeOpacity={0.9}
      >
        {mediaUrl ? (
          <Image
            source={{ uri: mediaUrl }}
            style={{
              height: randomHeight,

              width: columnWidth,
              borderRadius: 12,
            }}
            resizeMode="cover"
          />
        ) : (
          <Image
            style={[styles.masonryImage, { height: randomHeight, backgroundColor: '#ccc' }]}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        {React.createElement(Ionicons, { name: "search", size: 20, color: "#000", style: styles.searchIcon })}
        <TextInput
          placeholder="Search for Yogic"
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
            keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
            renderItem={renderCategory}
            numColumns={3}
            scrollEnabled={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
          {trendingLoading ? (
            <ActivityIndicator size="large" color="#000" style={{ marginTop: 20 }} />
          ) : trendingError ? (
            <Text style={{ color: 'red', textAlign: 'center' }}>{trendingError}</Text>
          ) : trendingPosts.length > 0 && (
            <View style={{ marginTop: 30, marginBottom: 10 }}>
          
              <MasonryList
                data={trendingPosts}
                keyExtractor={(item: any, index: any) => `${item.id}-${index}`}
                numColumns={2}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.container}
                renderItem={renderTrendingPost}
              />
              {/* <FlatList
                data={trendingPosts}
                keyExtractor={(item) => item?.id?.toString() || Math.random().toString()}
                renderItem={renderTrendingPost}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 8 }}
                contentContainerStyle={{ paddingBottom: 30, paddingTop: 8 }}
                scrollEnabled={false}
              /> */}
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
  searchResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchResultAvatarContainer: {
    marginRight: 12,
  },
  searchResultAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#333',
  },
  searchResultIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchResultTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  searchResultText: {
    color: '#bea063',
    fontSize: 16,
    fontWeight: '500',
  },
  searchResultType: {
    color: '#aaa',
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
  gridItem: {
    flex: 1,
    aspectRatio: 0.9,
    margin: 2,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  gridImageContainer: {
    width: '100%',
    height: '75%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 8,
  },
  gridTextContainer: {
    width: '100%',
    height: '25%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  gridTitle: {
    fontSize: 12,
    color: '#222',
    textAlign: 'center',
  },
  masonryItem: {
    flex: 1,
    margin: 4,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  masonryImage: {
    width: '100%',
    borderRadius: 16,
  },
  categoryCardNew: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 6,
    paddingVertical: 18,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
    minWidth: 0,
    maxWidth: '32%',
  },
  categoryImageWrapperNew: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    overflow: 'hidden',
  },
  categoryImageNew: {
    width: 80,
    height: 80,
    borderRadius: 40,
    resizeMode: 'cover',
  },
  categoryTitleNew: {
    fontSize: 15,
    fontWeight: '700',
    color: '#222',
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 20,
  },
})

export default WarpperComponent(SearchScreen);
