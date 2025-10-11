import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet, FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  BackHandler,
  Animated,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';

const Ionicons = require('react-native-vector-icons/Ionicons').default;

const { width } = Dimensions.get('window');
const NUM_COLUMNS = 2;
const ITEM_MARGIN = 10;
const ITEM_WIDTH = (width - ITEM_MARGIN * (NUM_COLUMNS + 1)) / NUM_COLUMNS;

// Shimmer Component
const ShimmerEffect = ({ width, height, borderRadius = 0 }: { width: number; height: number; borderRadius?: number }) => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: '#E1E9EE',
          opacity,
        },
        styles.shimmerContainer,
      ]}
    />
  );
};

// Text Shimmer Component
const TextShimmer = ({ width, height }: { width: number; height: number }) => {
  return <ShimmerEffect width={width} height={height} borderRadius={4} />;
};

// Image Component with Shimmer
const ImageWithShimmer = ({ uri, style, fallbackSource }: { uri?: string; style: any; fallbackSource: any }) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    console.log('Image failed to load:', uri);
    setImageError(true);
  };

  const handleImageLoad = () => {
    console.log('Image loaded successfully:', uri);
  };

  // If no URI provided, show fallback immediately
  if (!uri) {
    console.log('No URI provided, showing fallback');
    return (
      <Image
        source={fallbackSource}
        style={style}
        resizeMode="cover"
      />
    );
  }

  // If image failed to load, show fallback
  if (imageError) {
    console.log('Showing fallback due to image error');
    return (
      <Image
        source={fallbackSource}
        style={style}
        resizeMode="cover"
      />
    );
  }

  // Show the actual image
  console.log('Rendering image with URI:', uri);
  return (
    <Image
      source={{ uri }}
      style={style}
      resizeMode="cover"
      onLoad={handleImageLoad}
      onError={handleImageError}
    />
  );
};

const SubCateGoryDisplay = ({navigation}:any) => {
  const route = useRoute();
  // const navigation = useNavigation();
  const { item } = route.params as { item: any };
  const subCategories = item?.sub_categories || [];
  const imageSource = require('../../Assets/yoga.jpg');
  const [isDataLoading, setIsDataLoading] = useState(false);
  console.log("itemitemitem",item);

  // Only show loading if we don't have data yet
  React.useEffect(() => {
    if (subCategories.length === 0) {
      setIsDataLoading(true);
      // If no data after 2 seconds, stop loading
      const timer = setTimeout(() => {
        setIsDataLoading(false);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setIsDataLoading(false);
    }
  }, [subCategories.length]);

  // Android hardware back button support
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        (navigation as any).navigate('MainTab', { screen: 'SearchTab' });

        return true;
      };
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [navigation])
  );


  const renderSubCategory = ({ item }: { item: any }) => {
    console.log("mainCategoryId",item);
    console.log("sub_category_image:", item.sub_category_image);
    console.log("isDataLoading:", isDataLoading);
    
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
          <ImageWithShimmer
            uri={item.sub_category_image}
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              marginBottom: 6,
            }}
            fallbackSource={imageSource}
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
        <TouchableOpacity onPress={() => {
              (navigation as any).navigate('MainTab', { screen: 'SearchTab' });

        }}>
          {React.createElement(Ionicons, { name: 'arrow-back', size: 24, color: '#bea063' })}
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {item?.category_name || item?.title || 'Subcategories'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {isDataLoading ? (
        <View style={styles.loadingContainer}>
          <FlatList
            data={Array.from({ length: 6 }, (_, i) => ({ id: i }))}
            renderItem={() => (
              <View style={styles.subCategoryCard}>
                <View style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  <ShimmerEffect
                    width={80}
                    height={80}
                    borderRadius={40}
                  />
                  <TextShimmer width={60} height={16} />
                </View>
              </View>
            )}
            keyExtractor={(item) => item.id.toString()}
            numColumns={NUM_COLUMNS}
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={styles.listContent}
          />
        </View>
      ) : (
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
      )}
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
    color: '#bea063',
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
  shimmerContainer: {
    backgroundColor: '#E1E9EE',
    overflow: 'hidden',
  },
  loadingContainer: {
    flex: 1,
  },
});

export default SubCateGoryDisplay;