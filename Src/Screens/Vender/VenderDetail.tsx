// Src/Screens/Vendor/VendorDetailScreen.tsx

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
  Alert,
  ActivityIndicator,
  NativeSyntheticEvent,
  NativeScrollEvent,
  FlatList,
  Button,
  findNodeHandle,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
const Ionicons = require('react-native-vector-icons/Ionicons').default;
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { VendorStackParamList } from '../../Navigation/types'; // Adjust path as needed
import { vendorDetail, vendorList } from '../../Api/Api';

// Get screen dimensions for responsive styling
const { width, height } = Dimensions.get('window');

// --- INTERFACES FOR DUMMY DATA ---



// --- DUMMY DATA (REPLACE WITH YOUR API FETCH) ---
// IMPORTANT: You'll need to create these assets in your Src/Assets folder
// Example assets you need to create:
// - vendor_banner.jpg
// - vendor_logo.png
// - product_ghee.jpg
// - product_tea.jpg
// - product_honey.jpg
// - product_soap.jpg
// - gallery_1.jpg, gallery_2.jpg, gallery_3.jpg, gallery_4.jpg


// --- SCREEN COMPONENT ---

const VendorDetailScreen = ({navigation}:any) => {
  const route = useRoute();
  
  const [vendors, setVendors] = useState<any[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get the selected categories from navigation params
  const { mainCategoryId, subcategoryIds, mainCategoryName } = route.params as any;
  console.log("Navigation params received:", route.params);
  console.log("mainCategoryId:", mainCategoryId);
  console.log("subcategoryIds:", subcategoryIds);

  useEffect(() => {
    fetchVendors();
  }, []);

  // Back handler for mobile back button
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        // Navigate back to VenderList screen
        
        navigation.goBack();
        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [navigation])
  );

  const fetchVendors = async () => {
    try {
      setLoading(true);
      
      // Use the correct parameter names from navigation
      const mainCategory = mainCategoryId;
      const subcategory = subcategoryIds && subcategoryIds.length > 0 ? subcategoryIds[0] : null;
      
      // Build URL with proper parameters
      let url = `https://pashuahar.com/vendor_list/?main_category=${mainCategory}`;
      if (subcategory) {
        url += `&subcategory=${subcategory}`;
      }
      
      console.log('Calling API:', url);
      
      const response = await fetch(url);
      console.log("vender detail response:", response);
      
      const data = await response.json();
      console.log("vender detail data:", data);
      
      if (data.status === true && data.vendors) {
        console.log('Vendors from API:', data.vendors);
        setVendors(data.vendors);
        // Apply filtering after fetching
        filterVendorsByCategories(data.vendors);
      } else {
        console.log('API response error:', data);
        setError('Failed to fetch vendors');
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
      setError('Something went wrong while loading vendors');
    } finally {
      setLoading(false);
    }
  };

  const filterVendorsByCategories = (allVendors: any[]) => {
    if (!subcategoryIds || !mainCategoryId) {
      setFilteredVendors(allVendors);
      return;
    }

    // Filter vendors based on main categories and subcategories
    const filtered = allVendors.filter((vendor: any) => {
      // Check if vendor belongs to the selected main category
      const hasMainCategory = vendor.category_id === mainCategoryId || 
                             vendor.main_category_id === mainCategoryId;
      
      // Check if vendor has any of the selected subcategories
      const hasSubcategory = vendor.sub_categories && 
                            vendor.sub_categories.some((sub: any) => 
                              subcategoryIds.includes(sub.id)
                            );
      
      return hasMainCategory || hasSubcategory;
    });

    console.log('Filtered vendors:', filtered);
    setFilteredVendors(filtered);
  };

  const handleVendorPress = (vendor: any) => {
    // Navigate to individual vendor detail
    const userId = vendor.profile?.user || vendor.user?.id;
    console.log('Navigating to UserProfile with userId:', userId);
    (navigation as any).navigate('UserProfile', { userId: userId });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#bea063" />
          <Text style={styles.loadingText}>Loading vendors...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchVendors}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => {
            // Navigate back to previous screen
            navigation.goBack();
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#bea063" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Yogi's</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Vendor Grid */}
      <FlatList
        data={filteredVendors}
        keyExtractor={(item) => item.user?.id?.toString() || item.id?.toString()}
        numColumns={3}
        renderItem={({ item }) => {
          const username = item.user?.username || item.profile?.username || 'Unknown';
          const profilePicture = item.profile?.profile_picture;
          const firstName = item.user?.first_name || item.profile?.first_name || '';
          const lastName = item.user?.last_name || item.profile?.last_name || '';
          
          // Create initials from first and last name
          const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
          
          return (
            <TouchableOpacity 
              style={styles.vendorGridCard}
              onPress={() => handleVendorPress(item)}
            >
              <View style={styles.vendorImageContainer}>
                {profilePicture ? (
                  <Image 
                    source={{ uri: profilePicture }} 
                    style={styles.vendorGridImage}
                    defaultSource={require('../../Assets/Role.png')}
                  />
                ) : (
                  <View style={styles.vendorInitialsContainer}>
                    <Text style={styles.vendorInitials}>{initials}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.vendorGridName} numberOfLines={2}>
                {username}
              </Text>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
      />

      {filteredVendors.length === 0 && !loading && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No vendors found for selected categories</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    marginBottom: 20,
    textAlign: 'center',
  },
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    // backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fixedHeaderTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  coverImage: {
    width: width,
    height: height * 0.35, // Responsive height (35% of screen height)
  },
  heroOverlay: {
    position: 'absolute',
    top: height * 0.40 - 100, // Position above the bottom of the cover image
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    paddingTop: 80, // Space for the logo to peek out
    backgroundColor: 'rgba(255,255,255,0.9)', // Semi-transparent white background
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  vendorLogo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#fff',
    position: 'absolute',
    top: -50, // Position half outside the overlay
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  vendorName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    // marginTop: 10,
  },
  vendorCategory: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  starIcon: {
    marginHorizontal: 1,
  },
  reviewCountText: {
    fontSize: 14,
    color: '#777',
    marginLeft: 5,
  },
  sectionNavContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    // Position this right below the hero section or make it sticky if desired
    // position: 'sticky', top: Platform.OS === 'ios' ? 44 : 56, zIndex: 5, // Example for sticky header
  },
  sectionNavLink: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  sectionNavText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
    marginTop: 0, // No extra margin at top after section nav
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  descriptionText: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
    marginBottom: 15,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 10,
  },
  productColumnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 10, // Space between rows
  },
  productCard: {
    width: (width - 60) / 2, // 20 padding left + 20 padding right + 20 space between = 60
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 10,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  productImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  productName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    paddingHorizontal: 8,
    textAlign: 'center',
  },
  productPrice: {
    fontSize: 14,
    color: '#0095f6',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  reviewItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#0095f6',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  reviewUser: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  reviewComment: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  reviewTimestamp: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
    textAlign: 'right',
  },
  galleryColumnWrapper: {
    justifyContent: 'space-between',
  },
  galleryImageContainer: {
    width: (width - 60) / 3, // 20 padding left + 20 padding right + 2*10 space between = 60
    height: (width - 60) / 3,
    marginBottom: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#0095f6',
    borderRadius: 30,
    width: 180, // Wider for text
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  fabText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  galleryGrid: {
    justifyContent: 'space-between',
  },
  // New styles for vendor list
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  retryButton: {
    backgroundColor: '#bea063',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
  },
  vendorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  vendorImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  vendorInfo: {
    flex: 1,
  },
  vendorLocation: {
    fontSize: 12,
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  // Grid styles for 3-column layout
  gridContainer: {
    padding: 16,
  },
  vendorGridCard: {
    flex: 1,
    margin: 8,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: (width - 80) / 3, // Account for margins and padding
  },
  vendorImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  vendorGridImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  vendorInitialsContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#bea063',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vendorInitials: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  vendorGridName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default VendorDetailScreen;