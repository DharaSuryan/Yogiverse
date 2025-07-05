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
  Alert,
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
  const navigation = useNavigation<NativeStackNavigationProp<SearchStackParamList>>();

  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedSubcategories, setSelectedSubcategories] = useState<number[]>([]);
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


   const handleSelectCategory = (categoryId: number | undefined) => {
      if (categoryId === undefined) return;
      setSelectedCategory(categoryId);
      setSelectedSubcategories([]); // Reset subcategory selection when main category changes
    };

    const handleSelectSubcategory = (subcategoryId: number) => {
      setSelectedSubcategories(prev => {
        if (prev.includes(subcategoryId)) {
          return prev.filter(id => id !== subcategoryId);
        } else {
          return [...prev, subcategoryId];
        }
      });
    };
  
    const handleItemPress = () => {
      if (selectedCategory === null) {
        Alert.alert('Selection Required', 'Please select a vendor.');
        return;
      }
      
      // Update the data object with main categories (same format)
      const updatedData = {
      
        main_categories: [selectedCategory]
      };
      
      console.log('Updated data with main categories:', updatedData);
      
      // Navigate to SubCategory with updated data object
      navigation.navigate('VendorSubCategory', { category: updatedData });
    };
  

  const renderCategory = ({ item }: any) => {
    const categoryId = item.id !== undefined ? item.id : item.categories;
    const isSelected = selectedCategory === categoryId;
    return (
      <TouchableOpacity
        style={[
          styles.categoryCardNew,
          isSelected && {
            borderColor: '#bea063',
            backgroundColor: '#fff5e6',
            shadowColor: '#bea063',
            shadowOpacity: 0.3,
            shadowRadius: 6,
            elevation: 5,
          }
        ]}
        onPress={() => handleSelectCategory(categoryId)}
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
        {isSelected && (
          <View style={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: '#bea063',
            borderRadius: 10,
            padding: 2,
          }}>
            <Text style={{ color: '#fff', fontSize: 12 }}>✓</Text>
          </View>
        )}
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
 
  const handleShowSubcategories = () => {
    if (selectedCategory === null) {
      Alert.alert('Selection Required', 'Please select a main category first.');
      return;
    }
    
    if (selectedSubcategories.length === 0) {
      Alert.alert('Selection Required', 'Please select at least one subcategory.');
      return;
    }
    
    const selectedVendor = categories.find(cat =>
      selectedCategory === (cat.id !== undefined ? cat.id : cat.categories)
    );
    if (!selectedVendor) {
      Alert.alert('Selection Error', 'No valid vendor found for your selection.');
      return;
    }
    
    // Navigate directly to VenderDetail with selected data
    const navigationParams = {
      mainCategoryId: selectedCategory,
      subcategoryIds: selectedSubcategories,
      mainCategoryName: selectedVendor.category_name
    };
    
    console.log('Navigation params:', navigationParams);
    console.log('Main Category ID:', selectedCategory);
    console.log('Selected Subcategory IDs:', selectedSubcategories);
    
    navigation.navigate('VenderDetail', navigationParams);
  };

  const renderSubcategory = ({ item }: any) => {
    console.log('Subcategory item:', item);
    const isSelected = selectedSubcategories.includes(item.id);
    return (
      <TouchableOpacity
        style={[
          styles.subcategoryCardNew,
          isSelected && {
            borderColor: '#bea063',
            backgroundColor: '#fff5e6',
            shadowColor: '#bea063',
            shadowOpacity: 0.3,
            shadowRadius: 6,
            elevation: 5,
          }
        ]}
        onPress={() => handleSelectSubcategory(item.id)}
        activeOpacity={0.8}
      >
        <View style={styles.categoryImageWrapperNew}>
          <Image
            source={item.image || item.sub_category_image || item.category_image ? 
              { uri: item.image || item.sub_category_image || item.category_image } : imageSource}
            style={styles.categoryImageNew}
          />
        </View>
        <Text
          numberOfLines={2}
          ellipsizeMode="tail"
          style={styles.categoryTitleNew}
        >
          {item.name || item.sub_category_name || item.category_name || 'Subcategory'}
        </Text>
        {isSelected && (
          <View style={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: '#bea063',
            borderRadius: 10,
            padding: 2,
          }}>
            <Text style={{ color: '#fff', fontSize: 12 }}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

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
          
          {/* Subcategories Slider */}
          {selectedCategory && (
            <View style={styles.subcategorySection}>
              <Text style={styles.subcategoryTitle}>
                {categories.find(cat => 
                  selectedCategory === (cat.id !== undefined ? cat.id : cat.categories)
                )?.category_name || 'Select Subcategories:'}
              </Text>
              {(() => {
                const selectedCat = categories.find(cat => 
                  selectedCategory === (cat.id !== undefined ? cat.id : cat.categories)
                );
                console.log('Selected category subcategories:', selectedCat?.sub_categories);
                return (
                  <FlatList
                    data={selectedCat?.sub_categories || []}
                    keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                    renderItem={renderSubcategory}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.subcategoryList}
                  />
                );
              })()}
            </View>
          )}
          
          <TouchableOpacity
            style={{
              backgroundColor: '#bea063',
              margin: 16,
              padding: 14,
              borderRadius: 8,
              alignItems: 'center',
            }}
            onPress={handleShowSubcategories}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
              Show Vendors
            </Text>
          </TouchableOpacity>
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
  subcategoryCardNew: {
    backgroundColor: '#fff',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginLeft: 0,
    marginTop: 0,
    marginBottom: 0,
    paddingVertical: 18,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
    width: 120,
    height: 140,
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
  subcategorySection: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  subcategoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  subcategoryList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
})

export default VenderList;
