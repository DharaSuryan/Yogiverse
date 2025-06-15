import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

// Sample data with unique IDs
const VENDORS = [
  {
    id: '1',
    name: 'Yoga Studio 1',
    image: 'https://picsum.photos/200',
    rating: 4.5,
    reviews: 128,
    location: 'New York',
    isVerified: true,
  },
  {
    id: '2',
    name: 'Yoga Studio 2',
    image: 'https://picsum.photos/201',
    rating: 4.8,
    reviews: 256,
    location: 'Los Angeles',
    isVerified: true,
  },
  {
    id: '3',
    name: 'Yoga Studio 3',
    image: 'https://picsum.photos/202',
    rating: 4.2,
    reviews: 89,
    location: 'Chicago',
    isVerified: false,
  },
  {
    id: '4',
    name: 'Yoga Studio 4',
    image: 'https://picsum.photos/203',
    rating: 4.9,
    reviews: 312,
    location: 'Miami',
    isVerified: true,
  },
];

const { width } = Dimensions.get('window');
const numColumns = 2;
const tileSize = (width - (numColumns + 1) * 16) / numColumns;

const VendorListScreen = () => {
  const renderVendorCard = ({ item, index }) => (
    <TouchableOpacity 
      style={styles.vendorCard}
      key={`vendor-${item.id}`}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.image }}
          style={styles.vendorImage}
          resizeMode="cover"
        />
        {item.isVerified && (
          <View style={styles.verifiedBadge}>
            <Icon name="checkmark-circle" size={16} color="#fff" />
          </View>
        )}
      </View>
      
      <View style={styles.vendorInfo}>
        <Text style={styles.vendorName} numberOfLines={1}>
          {item.name}
        </Text>
        
        <View style={styles.ratingContainer}>
          <Icon name="star" size={14} color="#FFD700" />
          <Text style={styles.ratingText}>
            {item.rating} ({item.reviews})
          </Text>
        </View>
        
        <View style={styles.locationContainer}>
          <Icon name="location-outline" size={14} color="#666" />
          <Text style={styles.locationText} numberOfLines={1}>
            {item.location}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Vendors</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Icon name="filter" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={VENDORS}
        renderItem={renderVendorCard}
        keyExtractor={(item) => `vendor-${item.id}`}
        numColumns={numColumns}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="business-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No vendors found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
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
  },
  filterButton: {
    padding: 8,
  },
  listContainer: {
    padding: 8,
  },
  vendorCard: {
    width: tileSize,
    margin: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
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
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: tileSize * 0.7,
  },
  vendorImage: {
    width: '100%',
    height: '100%',
  },
  verifiedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#0095f6',
    borderRadius: 12,
    padding: 4,
  },
  vendorInfo: {
    padding: 12,
  },
  vendorName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 16,
    color: '#666',
  },
});

export default VendorListScreen; 