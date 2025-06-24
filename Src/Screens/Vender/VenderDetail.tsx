// Src/Screens/Vendor/VendorDetailScreen.tsx

import React, { useRef, useState, useEffect } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { VendorStackParamList } from '../../Navigation/types'; // Adjust path as needed
import { vendorDetail } from '../../Api/Api';

// Get screen dimensions for responsive styling
const { width, height } = Dimensions.get('window');

// --- INTERFACES FOR DUMMY DATA ---
interface Product {
  id: string;
  name: string;
  price: string;
  image: any; // For require() or string URL
}

interface Review {
  id: string;
  user: string;
  rating: number;
  comment: string;
  timestamp: string;
}

interface Vendor {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  coverImage: any;
  logo: any;
  description: string;
  address: string;
  phone: string;
  email: string;
  products: Product[];
  reviews: Review[];
  galleryImages: any[];
}

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

const dummyVendor: Vendor = {
  id: 'v1',
  name: 'Yogi Organics',
  category: 'Organic Food & Wellness',
  rating: 4.8,
  reviewCount: 245,
  coverImage: require('../../Assets/yoga.jpg'),
  logo: require('../../Assets/yoga.jpg'),
  description: 'Yogi Organics brings you the purest organic produce and wellness products directly from sustainable farms. Our mission is to promote health and well-being through nature\'s finest offerings, harvested with care and delivered with love. We believe in harmony with nature and provide products that nourish both body and soul.',
  address: '123 Wellness Lane, Yoga City, YV 10001',
  phone: '+91 98765 43210',
  email: 'info@yogiorganics.com',
  products: [
    { id: 'p1', name: 'Organic Ghee (500ml)', price: '₹ 450', image: require('../../Assets/yoga.jpg'), },
    { id: 'p2', name: 'Herbal Tea Blend', price: '₹ 220', image: require('../../Assets/yoga.jpg'), },
    { id: 'p3', name: 'Natural Honey (250g)', price: '₹ 300', image: require('../../Assets/yoga.jpg'),},
    { id: 'p4', name: 'Handmade Soap Set', price: '₹ 500', image: require('../../Assets/yoga.jpg'), },
  ],
  reviews: [
    { id: 'r1', user: 'Aarav Sharma', rating: 5, comment: 'Excellent quality ghee, truly organic!', timestamp: '2 days ago' },
    { id: 'r2', user: 'Priya Singh', rating: 4, comment: 'Love the herbal tea, very soothing.', timestamp: '1 week ago' },
    { id: 'r3', user: 'Rahul Kumar', rating: 5, comment: 'Fast delivery and fresh products. Highly recommend.', timestamp: '3 weeks ago' },
  ],
  galleryImages: [
   require('../../Assets/yoga.jpg'),
    require('../../Assets/yoga.jpg'),
    require('../../Assets/yoga.jpg'),
  ],
};

// --- SCREEN COMPONENT ---
type VendorDetailScreenRouteProp = RouteProp<VendorStackParamList, 'VenderDetail'>;

type VendorDetailScreenNavigationProp = NativeStackNavigationProp<VendorStackParamList, 'VenderDetail'>;
const VendorDetailScreen: React.FC = () => {

  const scrollViewRef = useRef<ScrollView>(null);
  const navigation = useNavigation<VendorDetailScreenNavigationProp>();
  const route = useRoute<VendorDetailScreenRouteProp>();
  const isMounted = useRef(false); // Added isMounted ref
  const [vendor, setVendor] = useState([])

  const [vendorData, setVendorData] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Add cleanup on unmount
  useEffect(() => {
    isMounted.current = true; // Set to true when mounted
    return () => {
      isMounted.current = false; // Set to false when unmounted
      // Cleanup any subscriptions or listeners here
    };
  }, []);

  const handleGoBack = () => {
    try {
      // Introduce a small delay to allow native views to settle
      setTimeout(() => {
        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          // Fallback navigation if can't go back
          navigation.navigate('Vendor');
        }
      }, 100); // 100ms delay
    } catch (error) {
      console.log('Navigation error:', error);
      // Fallback navigation, also with a delay
      setTimeout(() => {
        navigation.navigate('Vendor');
      }, 100); // 100ms delay
    }
  };
console.log("route.params.vendorId",route.params.vendorId);

    useEffect(() => {
  
      fetchVendor();
    }, []);
    const fetchVendor = async () => {
      try {
  
        const response = await vendorDetail(route.params.vendorId);
        console.log("vendor Detail", response.data);
  
        setVendor(response.data);
      } catch (error: any) {
        setError('Something went wrong while loading profile.');
      } finally {
        setLoading(false);
      }
    };
  // States for vendor data (replace with actual fetch)
 

  // Refs for scroll positions for "jump to section" functionality
  const aboutRef = useRef<View>(null);
  const productsRef = useRef<View>(null);
  const reviewsRef = useRef<View>(null);
  const galleryRef = useRef<View>(null);

  const sections = [
    { name: 'About', ref: aboutRef },
    { name: 'Products', ref: productsRef },
    { name: 'Reviews', ref: reviewsRef },
    { name: 'Gallery', ref: galleryRef },
  ];

  // Simulate fetching vendor data based on ID from route params
  useEffect(() => {
    // const fetchVendor = async () => {
    //   try {
    //     setLoading(true);
    //     // In a real app, you'd fetch data using route.params?.vendorId
    //     // const response = await api.get(`/vendors/${route.params?.vendorId}`);
    //     // setVendorData(response.data);
        
    //     // Using dummy data for demonstration
    //     setTimeout(() => {
    //       if (!isMounted.current) return; // Prevent state update if component unmounted
    //       setVendorData(dummyVendor);
    //       setLoading(false);
    //     }, 1000); // Simulate network delay
    //   } catch (err) {
    //     if (!isMounted.current) return; // Prevent state update if component unmounted
    //     setError('Failed to load vendor details.');
    //     setLoading(false);
    //   }
    // };
    // fetchVendor();
  }, [route.params?.vendorId]); // Re-fetch if vendorId changes

 

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={16}
          color="#FFD700"
          style={styles.starIcon}
        />
      );
    }
    return <View style={styles.starsContainer}>{stars}</View>;
  };

  const handleContactVendor = () => {
    Alert.alert('Contact Vendor', `You can call ${vendorData?.phone} or email ${vendorData?.email}`);
    // In a real app, implement linking to phone dialer or email client
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0095f6" />
        <Text style={styles.loadingText}>Loading vendor details...</Text>
      </SafeAreaView>
    );
  }

  if (error || !vendorData) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'Vendor data not available.'}</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.fixedHeader}>
        <TouchableOpacity 
          onPress={handleGoBack}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text>
            <Ionicons name="arrow-back" size={26} color="#fff" />
          </Text>
        </TouchableOpacity>
        <Text style={styles.fixedHeaderTitle}>{vendorData?.name || ''}</Text>
        <View style={styles.backButton} /> {/* Placeholder for balance */}
      </View>

      {/* Scrollable Content */}
      <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <Image source={vendorData.coverImage} style={styles.coverImage} resizeMode="cover" />
        <View style={styles.heroOverlay}>
          <Image source={vendorData.logo} style={styles.vendorLogo} />
          <Text style={styles.vendorName}>{vendorData.name}</Text>
          <Text style={styles.vendorCategory}>{vendorData.category}</Text>
          <View style={styles.ratingRow}>
            {renderStars(vendorData.rating)}
            <Text style={styles.reviewCountText}> ({vendorData.reviewCount} reviews)</Text>
          </View>
        </View>

        {/* Section Navigation (Jump Links) */}
        {/* <View style={styles.sectionNavContainer}>
          {sections.map((section) => (
            <TouchableOpacity
              key={section.name}
              onPress={() => scrollToSection(section.ref)}
              style={styles.sectionNavLink}
            >
              <Text style={styles.sectionNavText}>{section.name}</Text>
            </TouchableOpacity>
          ))}
        </View> */}

        {/* --- Content Sections --- */}

        {/* About Section */}
        <View ref={aboutRef} style={styles.section}>
          <Text style={styles.sectionTitle}>About {vendorData.name}</Text>
          <Text style={styles.descriptionText}>{vendorData.description}</Text>
          <View style={styles.contactInfo}>
            <Ionicons name="location-outline" size={18} color="#555" />
            <Text style={styles.contactText}>{vendorData.address}</Text>
          </View>
          <View style={styles.contactInfo}>
            <Ionicons name="call-outline" size={18} color="#555" />
            <Text style={styles.contactText}>{vendorData.phone}</Text>
          </View>
          <View style={styles.contactInfo}>
            <Ionicons name="mail-outline" size={18} color="#555" />
            <Text style={styles.contactText}>{vendorData.email}</Text>
          </View>
        </View>

        {/* Products Section */}
        <View ref={productsRef} style={styles.section}>
          <Text style={styles.sectionTitle}>Our Products</Text>
          <FlatList
            data={vendorData.products}
            keyExtractor={(item) => item.id}
            numColumns={2} // Two columns for a grid layout
            scrollEnabled={false} // Prevent inner scrolling
            columnWrapperStyle={styles.productColumnWrapper}
            removeClippedSubviews={false}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.productCard}>
                <Image source={item.image} style={styles.productImage} resizeMode="cover" />
                <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.productPrice}>{item.price}</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Reviews Section */}
        <View ref={reviewsRef} style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Reviews ({vendorData.reviewCount})</Text>
          {vendorData.reviews.map((review) => (
            <View key={review.id} style={styles.reviewItem}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewUser}>{review.user}</Text>
                {renderStars(review.rating)}
              </View>
              <Text style={styles.reviewComment}>{review.comment}</Text>
              <Text style={styles.reviewTimestamp}>{review.timestamp}</Text>
            </View>
          ))}
        </View>

        {/* Gallery Section */}
        <View ref={galleryRef} style={styles.section}>
          <Text style={styles.sectionTitle}>Gallery</Text>
          <FlatList
            data={vendorData.galleryImages}
            keyExtractor={(item, index) => `gallery-${index}`}
            numColumns={3} // Three columns for a gallery grid
            scrollEnabled={false}
            columnWrapperStyle={styles.galleryColumnWrapper}
            removeClippedSubviews={false}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.galleryImageContainer}>
                <Image source={item} style={styles.galleryImage} resizeMode="cover" />
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.galleryGrid}
          />
        </View>
        <View style={{ height: 80 }} />{/* Padding for FAB */}
      </ScrollView>

      {/* Floating Action Button (FAB) */}
      {/* <TouchableOpacity style={styles.fab} onPress={handleContactVendor}>
        <Ionicons name="chatbubble-ellipses-outline" size={28} color="#fff" />
        <Text style={styles.fabText}>Contact Vendor</Text>
      </TouchableOpacity> */}
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
});

export default VendorDetailScreen;