import React, { useEffect, useState ,useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
const Icon = require('react-native-vector-icons/Ionicons').default;
import { goBack } from '../../Component/Route';
import { BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

// Static images for different subcategories
// const subCategoryImages = {
//   'Karma Yogi': require('../../Assets/karma-yogi.jpg'),
//   'Bhakti Yogi': require('../../Assets/bhakti-yogi.jpg'),
//   'Jnana Yogi': require('../../Assets/jnana-yogi.jpg'),
//   'Raja Yogi': require('../../Assets/raja-yogi.jpg'),
//   'Practitioners': require('../../Assets/practitioners.jpg'),
//   'Daily Yogic Routine': require('../../Assets/daily-routine.jpg'),
//   'Sadhaks': require('../../Assets/sadhaks.jpg'),
//   // Default image if no match
//   'default': require('../../Assets/yoga-default.jpg')
// };

const { width: screenWidth } = Dimensions.get('window');
const NUM_COLUMNS = 3;
const CARD_MARGIN = 10;
const CARD_SIZE = (screenWidth - CARD_MARGIN * (NUM_COLUMNS + 1)) / NUM_COLUMNS;

const VendorSubCateGory = ({navigation}:any) => {
  const route = useRoute();

  const { vendors, mainCategoryId } = route.params as any;

  // Single-select state: { [vendorId]: number | undefined }
  const [selectedSubcategories, setSelectedSubcategories] = useState<{ [vendorId: number]: number | undefined }>({});
 useFocusEffect(
  useCallback(() => {
    const onBackPress = () => {
      if (navigation.canGoBack()) {
        navigation.goBack();
        return true;
      } else {
        // Optionally: navigation.navigate('HomeTab');
        return false; // OS handles (may exit app)
      }
    };

    BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
  }, [navigation])
  
)
  if (!vendors || vendors.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>No vendors selected.</Text>
      </View>
    );
  }
console.log("vendor",vendors);

  const handleSelectSubcategory = (vendorId: number, subcategoryId: number) => {
    setSelectedSubcategories(prev => {
      const current = prev[vendorId];
      return {
        ...prev,
        [vendorId]: current === subcategoryId ? undefined : subcategoryId
      };
    });
  };

  const handleContinue = () => {
    // Collect selected subcategories for each vendor
    const result = vendors.map((vendor: any) => {
      const selectedSubId = selectedSubcategories[vendor.id];
      const selectedSubcategory = selectedSubId ? vendor.sub_categories.find((sub: any) => sub.id === selectedSubId) : null;
      
      return {
        vendorId: vendor.id,
        vendorName: vendor.category_name,
        selectedSubcategories: selectedSubcategory ? [selectedSubcategory] : []
      };
    });

    // Filter only vendors that have selected subcategories
    const vendorsWithSelections = result.filter((vendor: any) => vendor.selectedSubcategories.length > 0);
    
    // Extract all selected subcategory IDs for API filtering
    const allSelectedSubcategoryIds = vendorsWithSelections.flatMap((vendor: any) => 
      vendor.selectedSubcategories.map((sub: any) => sub.id)
    );

    // Extract main category IDs
    const mainCategoryIds = vendorsWithSelections.map((vendor: any) => vendor.vendorId);

    console.log('Selected Subcategory IDs:', allSelectedSubcategoryIds);
    console.log('Main Category IDs:', mainCategoryIds);

    // Navigate to VenderDetail with the filtered data
    navigation.navigate('VenderDetail', {
      selectedSubcategoryIds: allSelectedSubcategoryIds,
      mainCategoryIds: mainCategoryIds,
      selectedVendors: vendorsWithSelections,
      mainCategoryId: mainCategoryId // Pass the original main category ID
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.navigate('Vendor')}
        >
          <Icon name="arrow-back" size={24} color="#bea063" />
        </TouchableOpacity>
        <Text style={styles.header}>Subcategories</Text>
      </View>
      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {vendors.map((vendor: any) => (
          <View key={vendor.id} style={styles.vendorSection}>
            <Text style={styles.vendorHeader}>{vendor.category_name} Subcategories</Text>
            <FlatList
              key={`flatlist-${vendor.id}`}
              data={vendor.sub_categories}
              keyExtractor={item => item.id.toString()}
              numColumns={NUM_COLUMNS}
              scrollEnabled={false}
              renderItem={({ item }) => {
                const isSelected = selectedSubcategories[vendor.id] === item.id;
                return (
                  <TouchableOpacity
                    style={[
                      styles.card,
                      isSelected && styles.selectedCard
                    ]}
                    onPress={() => handleSelectSubcategory(vendor.id, item.id)}
                    activeOpacity={0.8}
                  >
                    <Image
                      source={{ uri: item.sub_category_image }}
                      style={styles.cardImage}
                    />
                    <Text style={styles.cardTitle} numberOfLines={2}>
                      {item.name}
                    </Text>
                    {isSelected && (
                      <View style={styles.checkmark}>
                        <Text style={{ color: '#fff', fontSize: 12 }}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              }}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          </View>
        ))}
      </ScrollView>
      <TouchableOpacity
        style={styles.button}
        onPress={handleContinue}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#bea063',
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  vendorSection: {
    marginBottom: 20,
  },
  vendorHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    margin: 16,
    color: '#bea063',
  },
  card: {
    backgroundColor: '#fff',
    width: CARD_SIZE,
    height: CARD_SIZE + 30,
    borderRadius: 12,
    margin: CARD_MARGIN / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
    padding: 8,
  },
  selectedCard: {
    borderColor: '#bea063',
    backgroundColor: '#fffbe6',
    shadowColor: '#bea063',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  cardImage: {
    width: CARD_SIZE - 30,
    height: CARD_SIZE - 30,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 18,
    flexWrap: 'wrap',
    maxWidth: '100%',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#bea063',
    borderRadius: 10,
    padding: 2,
  },
  button: {
    backgroundColor: '#bea063',
    margin: 16,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default VendorSubCateGory;