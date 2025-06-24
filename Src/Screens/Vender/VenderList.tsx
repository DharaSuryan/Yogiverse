import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Dimensions, SafeAreaView, Platform } from 'react-native'
import React, { useEffect, useState } from 'react'
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { VendorStackParamList } from '../../Navigation/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { vendorList } from '../../Api/Api';
const screenWidth = Dimensions.get('window').width;

const { width } = Dimensions.get('window');
const numColumns = 2;
const tileSize = (width - (numColumns + 1) * 16) / numColumns;

type VendorListNavigationProp = NativeStackNavigationProp<VendorStackParamList, 'Vendor'>;

interface VendorItem {
  id: string;
  title: string;
  subtitle: string;
  image: any;
  isVerified?: boolean;
  location?: string;
}

export default function VenderList() {
  const navigation = useNavigation<VendorListNavigationProp>();
  const [vendor, setVendor] = useState([])
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
 

  console.log("vendor data",vendor);
  
  useEffect(() => {

    fetchVendor();
  }, []);
  const fetchVendor = async () => {
    try {

      const response = await vendorList();
      console.log("vendor list", response.data);

      setVendor(response.data.vendors);
    } catch (error: any) {
      setError('Something went wrong while loading profile.');
    } finally {
      setLoading(false);
    }
  };
  const renderVendorCard = ({ item }: { item: VendorItem }) => (
    <TouchableOpacity
      style={styles.vendorCard}
    //   onPress={() => navigation.navigate('VenderDetail', { vendorId: item.profile?.user })
    // }
    >
      <View style={styles.imageContainer}>
        <Image
          source={{uri:item?.profile?.profile_picture}}
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
          {item?.profile?.first_name }
        </Text>

        <View style={styles.ratingContainer}>
          {/* <Icon name="star" size={14} color="#FFD700" /> */}
          <Text style={styles.ratingText}>
            {item?.followers_count+" "+ "Followers"}
          </Text>
        </View>

        <View style={styles.locationContainer}>
          <Icon name="location-outline" size={14} color="#666" />
          <Text style={styles.locationText} numberOfLines={1}>
            {item?.profile?.country}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Everyone is Yogi</Text>
        {/* <TouchableOpacity style={styles.filterButton}>
            <Icon name="filter" size={24} color="#333" />
          </TouchableOpacity> */}
      </View>

      <FlatList
        data={vendor}
        renderItem={renderVendorCard}
        keyExtractor={(item) => item.id}
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
}


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
    color: '#bea063',
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
})
