import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SearchStackParamList } from '../../Navigation/types';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { push } from '../../Component/Route';

const imageSource = require('../../Assets/yoga.jpg');



type SearchScreenNavigationProp = NativeStackNavigationProp<
  SearchStackParamList,
  'Search'
>;

const VenderList = () => {
  const navigation = useNavigation<SearchScreenNavigationProp>();

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    fetchCategories();
    
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
 
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      


      {loading ? (
        <ActivityIndicator size="large" color="#000" style={{ marginTop: 20 }} />
      ) : error ? (
        <Text style={{ color: 'red', textAlign: 'center' }}>{error}</Text>
      ) : (
        <>
         <View style={styles.header}>
//         <Text style={styles.headerTitle}>Everyone is Yogi</Text>
//         {/* <TouchableOpacity style={styles.filterButton}>
//             <Icon name="filter" size={24} color="#333" />
//           </TouchableOpacity> */}
//       </View>

          <FlatList
            data={categories}
            keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
            renderItem={renderCategory}
            numColumns={3}
            scrollEnabled={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
          
        </>
      )}
    </ScrollView>
  );
};


const styles = StyleSheet.create({

  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
   headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#bea063',
  },
  
  cardImage: { width: '95%', height: 70, borderRadius: 40 },
  
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

export default VenderList;
