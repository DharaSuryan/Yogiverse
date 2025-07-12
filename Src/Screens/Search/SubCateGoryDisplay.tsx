import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet, FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  BackHandler
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';

const Ionicons = require('react-native-vector-icons/Ionicons').default;

const { width } = Dimensions.get('window');
const NUM_COLUMNS = 2;
const ITEM_MARGIN = 10;
const ITEM_WIDTH = (width - ITEM_MARGIN * (NUM_COLUMNS + 1)) / NUM_COLUMNS;

const SubCateGoryDisplay = ({navigation}:any) => {
  const route = useRoute();
  // const navigation = useNavigation();
  const { item } = route.params as { item: any };
  const subCategories = item?.sub_categories || [];
  const imageSource = require('../../Assets/yoga.jpg');
  console.log("itemitemitem",item);

  // Android hardware back button support
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.goBack();
        return true;
      };
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [navigation])
  );


  const renderSubCategory = ({ item }: { item: any }) => {
    console.log("mainCategoryId",item);
    
    return (
      <TouchableOpacity
        style={styles.subCategoryCard}
        onPress={() => navigation.navigate('VenderDetail', {
          mainCategoryId: item.main_category ,
          subcategoryIds: [item.id],
          mainCategoryName: item.category_name || item.title,
        })}
      >
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Image
            source={item.sub_category_image ? { uri: item.sub_category_image } : imageSource}
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              marginBottom: 6,
            }}
          />
          <Text style={[styles.subCategoryName, { textAlign: 'center', marginTop: 4 }]} numberOfLines={2}>
            {item.name}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('MainTab', { screen: 'SearchTab' })}>
          {React.createElement(Ionicons, { name: 'arrow-back', size: 24, color: '#000' })}
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {item?.category_name || item?.title || 'Subcategories'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={subCategories}
        renderItem={renderSubCategory}
        keyExtractor={(item) => item.id.toString()}
        numColumns={NUM_COLUMNS}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {React.createElement(Ionicons, { name: 'alert-circle-outline', size: 48, color: '#ccc' })}
            <Text style={styles.emptyText}>No subcategories found</Text>
          </View>
        }
        ListHeaderComponent={
          <Text style={styles.sectionTitle}>
            {subCategories.length} Subcategories
          </Text>
        }
      />
    </View>
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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  listContent: {
    padding: ITEM_MARGIN,
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: ITEM_MARGIN,
  },
  subCategoryCard: {
    width: ITEM_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  subCategoryImage: {
    width: '100%',
    height: ITEM_WIDTH * 0.8,
    backgroundColor: '#f5f5f5',
  },
  subCategoryInfo: {
    padding: 12,
  },
  subCategoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
    minHeight: 40, // Ensure consistent height for 2 lines
  },
  subCategoryMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subCategoryType: {
    fontSize: 12,
    color: '#888',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    margin: 16,
    marginBottom: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    marginTop: 16,
  },
});

export default SubCateGoryDisplay;