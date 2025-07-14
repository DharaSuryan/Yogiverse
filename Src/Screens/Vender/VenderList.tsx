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
const { width } = Dimensions.get('window');
const CARD_MARGIN = 16; // total horizontal margin per card (adjust as needed)
const CARD_WIDTH = (width - CARD_MARGIN * 3) / 2; // 2 columns, 3 margins (left, between, right)

type SearchScreenNavigationProp = NativeStackNavigationProp<
  SearchStackParamList,
  'Search'
>;



const VenderList = ({navigation}:any) => {
  // const navigation = useNavigation<NativeStackNavigationProp<SearchStackParamList>>();

  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedSubcategories, setSelectedSubcategories] = useState<number[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [vendorLoading, setVendorLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVendors, setShowVendors] = useState(false);
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

  // This function is replaced by fetchVendorsForSubcategories

   const handleSelectCategory = (categoryId: number | undefined) => {
      if (categoryId === undefined) return;
      setSelectedCategory(categoryId);
      setSelectedSubcategories([]); // Reset subcategory selection when main category changes
      setShowVendors(false); // Hide vendors when category changes
      setVendors([]); // Clear vendors
    };

    const handleSelectSubcategory = (subcategoryId: number) => {
      setSelectedSubcategories(prev => {
        const newSelection = prev.includes(subcategoryId) 
          ? prev.filter(id => id !== subcategoryId)
          : [...prev, subcategoryId];
        
        // Automatically fetch vendors when subcategory selection changes
        if (newSelection.length > 0) {
          fetchVendorsForSubcategories(newSelection);
        } else {
          setShowVendors(false);
          setVendors([]);
        }
        
        return newSelection;
      });
    };

  const fetchVendorsForSubcategories = async (subcategoryIds: number[]) => {
    if (!selectedCategory || subcategoryIds.length === 0) {
      return;
    }

    try {
      setVendorLoading(true);
      setShowVendors(true);
      
      // Build URL with proper parameters
      let url = `https://pashuahar.com/vendor_list/?main_category=${selectedCategory}`;
      if (subcategoryIds.length > 0) {
        url += `&subcategory=${subcategoryIds[0]}`;
      }
      
      console.log('Calling vendor API:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === true && data.vendors) {
        console.log('Vendors from API:', data.vendors);
        setVendors(data.vendors);
      } else {
        console.log('API response error:', data);
        setVendors([]);
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
      setVendors([]);
    } finally {
      setVendorLoading(false);
    }
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
  
  // Vendors are now shown automatically when subcategories are selected

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

  const renderVendor = ({ item }: any) => {
    const username = item.user?.username || item.profile?.username || 'Unknown';
    const profilePicture = item.profile?.profile_picture;
    const firstName = item.user?.first_name || item.profile?.first_name || '';
    const lastName = item.user?.last_name || item.profile?.last_name || '';
    const phoneNofYogi = item.user?.phone_no || '';
    const email = item.user?.email || '';
    const followers = item.followers_count || 0;
    const following = item.following_count || 0;
    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

    return (
      <TouchableOpacity
        style={{
          backgroundColor: '#fffbe6',
          borderColor: '#bea063',
          borderWidth: 1,
          borderRadius: 18,
          padding: 12,
          marginBottom: CARD_MARGIN,
          alignItems: 'center',
          width: CARD_WIDTH,
          shadowColor: '#bea063',
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 2,
        }}
        onPress={() => {
          const userId = item.profile?.user || item.user?.id;
          (navigation as any).navigate('UserProfile', { userId: userId, isFromSearch: true,IsfromVendorList:true });
        }}
      >
        {/* Initials or Profile Picture */}
        <View style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: '#fff',
          borderWidth: 2,
          borderColor: '#bea063',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 10,
        }}>
          {profilePicture ? (
            <Image
              source={{ uri: profilePicture }}
              style={{ width: 60, height: 60, borderRadius: 30 }}
              defaultSource={require('../../Assets/Role.png')}
            />
          ) : (
            <Text style={{ color: '#bea063', fontSize: 22, fontWeight: 'bold' }}>{initials}</Text>
          )}
        </View>
        {/* Name */}
        <Text style={{ color: '#bea063', fontWeight: 'bold', fontSize: 18, marginBottom: 2 }}>
          {firstName} {lastName}
        </Text>
        {/* Username */}
        <Text style={{ color: '#bea063', fontSize: 15, marginBottom: 2 }}>
          @{username}
        </Text>
        {/* Email */}
        <Text style={{ color: '#bea063', fontSize: 13, marginBottom: 2 }}>
          {email}
        </Text>
        {/* Phone */}
        <Text style={{ color: '#bea063', fontSize: 13, marginBottom: 2 }}>
          {phoneNofYogi}
        </Text>
        {/* Followers/Following */}
        <Text style={{ color: '#bea063', fontSize: 13, marginBottom: 10 }}>
          Followers: {followers}  Following: {following}
        </Text>
        {/* View Profile Button */}
        <TouchableOpacity
          style={{
            borderColor: '#bea063',
            borderWidth: 1,
            borderRadius: 8,
            paddingVertical: 6,
            paddingHorizontal: 18,
            marginTop: 6,
          }}
          onPress={() => {
            const userId = item.profile?.user || item.user?.id;
            (navigation as any).navigate('UserProfile', { userId: userId, isFromSearch: true });
          }}
        >
          <Text style={{ color: '#bea063', fontWeight: 'bold' }}>View Profile</Text>
        </TouchableOpacity>
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
                const subcategories = selectedCat?.sub_categories || [];
                console.log('Selected category subcategories:', subcategories);
                
                // Split subcategories into chunks of 10 for multiple horizontal rows
                const chunkSize = 10;
                const subcategoryChunks = [];
                for (let i = 0; i < subcategories.length; i += chunkSize) {
                  subcategoryChunks.push(subcategories.slice(i, i + chunkSize));
                }
                
                return (
                  <View>
                    {subcategoryChunks.map((chunk, chunkIndex) => (
                      <View key={`chunk-${chunkIndex}`} style={styles.subcategoryRow}>
                        <FlatList
                          key={`horizontal-row-${chunkIndex}`}
                          data={chunk}
                          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                          renderItem={renderSubcategory}
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          contentContainerStyle={styles.subcategoryList}
                        />
                      </View>
                    ))}
                  </View>
                );
              })()}
            </View>
          )}
          
          {/* Vendors will be shown automatically when subcategories are selected */}

          {/* Vendors Section */}
          {showVendors && (
            <View style={styles.vendorSection}>
              {/* <Text style={styles.vendorSectionTitle}>
                Vendors for Selected Subcategory
              </Text> */}
              {(() => {
                const selectedCat = categories.find(cat => 
                  selectedCategory === (cat.id !== undefined ? cat.id : cat.categories)
                );
                const selectedSubcat = selectedCat?.sub_categories?.find((sub: any) => 
                  selectedSubcategories.includes(sub.id)
                );
                return selectedSubcat ? (
                  <Text style={styles.selectedSubcategoryText}>
                    {selectedSubcat.name || selectedSubcat.sub_category_name || 'Subcategory'}
                  </Text>
                ) : null;
              })()}
              
              {vendorLoading ? (
                <View style={styles.vendorLoadingContainer}>
                  <ActivityIndicator size="large" color="#bea063" />
                  <Text style={styles.vendorLoadingText}>Loading ...</Text>
                </View>
              ) : vendors.length > 0 ? (
                <FlatList
                  data={vendors}
                  keyExtractor={(item) => item.user?.id?.toString() || item.id?.toString()}
                  numColumns={2}
                  renderItem={renderVendor}
                  contentContainerStyle={{ paddingHorizontal: CARD_MARGIN, paddingBottom: 20 }}
                  columnWrapperStyle={{ justifyContent: 'space-between' ,alignSelf:'center',gap:10}}
                  showsVerticalScrollIndicator={false}
                  scrollEnabled={false}
                />
              ) : (
                <View style={styles.emptyVendorContainer}>
                  <Text style={styles.emptyVendorText}>No Yogic found for selected categories</Text>
                </View>
              )}
            </View>
          )}
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
  subcategoryGridCard: {
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
  subcategoryGridList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  vendorSection: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  vendorSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  selectedSubcategoryText: {
    fontSize: 16,
    color: '#bea063',
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  vendorLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  vendorLoadingText: {
    marginLeft: 10,
    color: '#bea063',
    fontSize: 16,
  },
  vendorGridContainer: {
    paddingBottom: 20,
  },
  vendorGridCard: {
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
  vendorImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    overflow: 'hidden',
  },
  vendorGridImage: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    resizeMode: 'cover',
  },
  vendorInitialsContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  vendorInitials: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  vendorGridName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#222',
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 20,
  },
  emptyVendorContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyVendorText: {
    fontSize: 16,
    color: '#666',
  },
  subcategoryRow: {
    marginBottom: 10, // Add some space between rows
  },
})

export default VenderList;
