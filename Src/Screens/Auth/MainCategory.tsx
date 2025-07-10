import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  Image,
  BackHandler,
  PixelRatio,
  useWindowDimensions,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useFocusEffect} from '@react-navigation/native';
import {
  NativeStackScreenProps,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import {AuthStackParamList} from '../../navigation/types';
import {MainCategoryType} from '../../types';
import api from '../../Api/Api';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');
const scale = screenWidth / 375; // Base width for scaling
const normalize = (size: number) =>
  Math.round(PixelRatio.roundToNearestPixel(size * scale));

const NUM_COLUMNS = 3;
const ITEM_MARGIN = 10;
const ITEM_WIDTH =
  (screenWidth - ITEM_MARGIN * (NUM_COLUMNS + 1)) / NUM_COLUMNS;
const GRID_PADDING = 10;

interface MainCategoryProps {
  navigation: NativeStackNavigationProp<AuthStackParamList>;
  route: NativeStackScreenProps<AuthStackParamList, 'MainCategory'> & {
    params: {
      signupData: any;
      role: 'user' | 'vendor';
    };
  };
}

const MainCategoryScreen: React.FC<MainCategoryProps> = ({
  route,
  navigation,
}) => {
  const { signupData } = route.params || {};
  const [mainCategories, setMainCategories] = useState<MainCategoryType[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const {width: screenWidth, height: screenHeight} = useWindowDimensions();
  const scale = screenWidth / 375; // Base width for scaling
  const normalize = (size: number) =>
    Math.round(PixelRatio.roundToNearestPixel(size * scale));
  // Dynamic styles based on screen dimensions
  const dynamicStyles = StyleSheet.create({
    categoryCard: {
      backgroundColor: '#fff',
      width: (screenWidth - normalize(80)) / 3,
      height: normalize(160),
      borderRadius: normalize(12),
      marginBottom: normalize(15),
      padding: normalize(16),
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: 'transparent',
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    categoryIcon: {
      width: normalize(60),
      height: normalize(60),
      marginBottom: normalize(12),
      borderRadius: normalize(8),
    },
    categoryName: {
      fontSize: normalize(14),
      fontWeight: '500',
      color: '#333',
      marginTop: normalize(8),
      textAlign: 'center',
      // lineHeight: normalize(20),
      // paddingHorizontal: normalize(4)
      flexWrap: 'wrap',
      maxWidth: '100%',
      // includeFontPadding: false
    },
    headerTitle: {
      fontSize: normalize(18),
      fontWeight: 'bold',
      color: '#bea063',
      flex: 1,
      textAlign: 'center',
    },
    sectionTitle: {
      fontSize: normalize(16),
      fontWeight: 'bold',
      color: '#bea063',
      marginBottom: normalize(15),
      textAlign: 'center',
    },
    buttonText: {
      color: '#fff',
      fontSize: normalize(16),
      fontWeight: '600',
    },
    errorText: {
      fontSize: normalize(16),
      fontWeight: 'bold',
      color: '#ff0000',
      marginBottom: normalize(20),
      textAlign: 'center',
      paddingHorizontal: normalize(20),
    },
    retryButtonText: {
      color: '#fff',
      fontSize: normalize(16),
      fontWeight: '600',
    },
    loadingText: {
      marginTop: normalize(10),
      fontSize: normalize(16),
      fontWeight: 'bold',
      color: '#333',
      textAlign: 'center',
    },
  });
console.log("userdata.... params", signupData);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError(null);
      try {
        // console.log('Starting API call to main_with_sub_categories...');
        // console.log('API base URL:', api.defaults.baseURL);
        console.log(
          'Full URL:',
          `${api.defaults.baseURL}main_with_sub_categories/`,
        );
        console.log('Network timeout:', api.defaults.timeout);

        // Test basic connectivity first
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          await fetch('https://www.google.com', {
            method: 'HEAD',
            signal: controller.signal,
          });
          clearTimeout(timeoutId);
          console.log('Basic internet connectivity confirmed');
        } catch (connectivityError) {
          console.error('No internet connectivity:', connectivityError);
          setError(
            'No internet connection. Please check your network settings.',
          );
          setLoading(false);
          return;
        }

        const res = await api.get('main_with_sub_categories/');
        // console.log('Main categories API response:', res.data);
        // // console.log('Categories data:', res.data.data);
        // console.log('Number of categories:', res.data.data?.length || 0);

        if (res.data.data && Array.isArray(res.data.data)) {
          setMainCategories(res.data.data || []);
          console.log('Categories set successfully:', res.data.data.length);
        } else {
          console.log('No valid categories data found in response');
          setMainCategories([]);
        }
      } catch (err: any) {
        console.error('Error fetching categories:', err);
        console.error('Error details:', JSON.stringify(err, null, 2));
        console.error('Error code:', err.code);
        console.error('Error message:', err.message);

        // Check if it's a network error
        if (err.message === 'Network Error' || err.code === 'ERR_NETWORK') {
          setError(
            'Network connection failed. Please check your internet connection and try again.',
          );
        } else if (err.code === 'ECONNABORTED') {
          setError(
            'Request timed out. Please check your connection and try again.',
          );
        } else {
          setError(
            `Failed to load categories: ${err.message || 'Unknown error'}`,
          );
        }

        // Try alternative endpoint as fallback
        try {
          console.log('Trying alternative endpoint: main_categories/');
          const fallbackRes = await api.get('main_categories/');
          // console.log('Fallback response:', fallbackRes.data);
          if (fallbackRes.data.data && Array.isArray(fallbackRes.data.data)) {
            setMainCategories(fallbackRes.data.data);
            console.log('Categories loaded from fallback endpoint');
            setError(null);
            return;
          }
        } catch (fallbackErr) {
          console.error('Fallback endpoint also failed:', fallbackErr);
        }

        setMainCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [retryCount]);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        setSelectedCategories([]);
        navigation.navigate('SignUp', {role: route.params.role as 'user' | 'vendor'});
        return true;
      };
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [navigation, route.params.role]),
  );

  const handleSelectCategory = (categoryId: number | undefined) => {
    if (categoryId === undefined) return;
    // If already selected, deselect
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(prev => prev.filter(id => id !== categoryId));
      return;
    }
    // Only allow up to 3 main categories
    if (selectedCategories.length >= 3) {
      Alert.alert('Limit Reached', 'You can select only 3 main categories.');
      return;
    }
    setSelectedCategories(prev => [...prev, categoryId]);
  };

  const handleNext = () => {
    if (selectedCategories.length === 0) {
      Alert.alert('Selection Required', 'Please select at least one main category.');
      return;
    }
    
    // Update the data object with main categories (same format)
    const updatedData = {
      ...signupData,
      main_categories: selectedCategories
    };
    
    console.log('Updated data with main categories:', updatedData);
    
    // Navigate to SubCategory with updated data object
    navigation.navigate('SubCategory', { signupData: updatedData });
  };


  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={dynamicStyles.loadingText}>Loading categories...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                setSelectedCategories([]);
                navigation.navigate('SignUp', {
                  role: route.params.role as 'user' | 'vendor',
                });
              }}>
              <MaterialIcons name="arrow-back" size={24} color="#bea063" />
            </TouchableOpacity>
            <Text style={dynamicStyles.headerTitle}>
              Select Main Categories
            </Text>
          </View>
          <View style={styles.errorContainer}>
            <Text style={dynamicStyles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Text style={dynamicStyles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              setSelectedCategories([]);
              navigation.navigate('SignUp', {role: route.params.role as 'user' | 'vendor'});
            }}>
            <MaterialIcons name="arrow-back" size={24} color="#bea063" />
          </TouchableOpacity>
          <Text style={dynamicStyles.headerTitle}>Select Main Categories</Text>
        </View>
        <FlatList
          data={mainCategories}
          numColumns={3}
          columnWrapperStyle={styles.gridContainer}
          renderItem={({item}) => (
            <TouchableOpacity
              style={[
                dynamicStyles.categoryCard,
                selectedCategories.includes(item?.categories) &&
                  styles.selectedCard,
              ]}
              onPress={() => handleSelectCategory(item?.categories)}>
              <View style={styles.cardContent}>
                <Image
                  source={{uri: item?.main_category_image}}
                  style={dynamicStyles.categoryIcon}
                  resizeMode="contain"
                />
                <Text
                  style={[
                    dynamicStyles.categoryName,
                    selectedCategories.includes(item?.categories) &&
                      styles.selectedCategoryName,
                  ]}
                  numberOfLines={2}
                  ellipsizeMode="middle">
                  {item?.category_name}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={item =>
            item?.id?.toString() || `category-${Math.random()}`
          }
          ListFooterComponent={() => (
            <View style={styles.footerContainer}>
              <TouchableOpacity style={styles.button} onPress={handleNext}>
                <Text style={dynamicStyles.buttonText}>Next</Text>
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={[
            // styles.listContainer,
            {paddingTop: normalize(10)},
          ]}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#fff'},
  container: {flex: 1},
  scrollView: {flex: 1},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: normalize(20),
    paddingVertical: normalize(15),
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  backButton: {padding: normalize(8), marginRight: normalize(10)},
  contentContainer: {
    // padding: normalize(0),
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridContainer: {
    // justifyContent: 'space-between',
    marginBottom: normalize(8),
    alignSelf: 'center',
    gap: 5,
  },
  categoryCard: {
    backgroundColor: '#fff',
    width: (screenWidth - normalize(80)) / 3, // instead of /3 to make 2 columns
    height: normalize(180),
    borderRadius: normalize(12),
    marginBottom: normalize(15),
    paddingHorizontal: normalize(20),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  selectedCard: {
    borderColor: '#bea063',
    backgroundColor: '#fff5e6',
    shadowColor: '#bea063',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  cardContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: normalize(80),
    height: normalize(80),
    // marginBottom: normalize(12),
    borderRadius: normalize(8),
  },
  categoryName: {
    fontSize: normalize(15),
    fontWeight: '600',
    color: '#333',
    marginTop: normalize(8),
    textAlign: 'center',
    lineHeight: normalize(20),
    paddingHorizontal: normalize(4),
  },
  selectedCategoryName: {
    color: '#bea063',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#bea063',
    paddingVertical: normalize(15),
    paddingHorizontal: normalize(40),
    borderRadius: normalize(8),
    alignItems: 'center',
    minWidth: normalize(120),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {color: '#fff', fontSize: normalize(16), fontWeight: '600'},
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: normalize(18),
    fontWeight: 'bold',
    color: '#bea063',
    marginBottom: normalize(20),
    textAlign: 'center',
  },
  footerContainer: {
    padding: normalize(25),
    alignItems: 'center',
  },
  listContainer: {
    paddingHorizontal: normalize(20),
    paddingBottom: normalize(20),
    flexGrow: 1,
  },
  loadingText: {
    marginTop: normalize(10),
    fontSize: normalize(16),
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: normalize(20),
  },
  errorText: {
    fontSize: normalize(16),
    fontWeight: 'bold',
    color: '#ff0000',
    marginBottom: normalize(20),
    textAlign: 'center',
    paddingHorizontal: normalize(20),
  },
  retryButton: {
    backgroundColor: '#bea063',
    padding: normalize(16),
    borderRadius: normalize(8),
    alignItems: 'center',
    minWidth: normalize(100),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: normalize(16),
    fontWeight: '600',
  },
  headerSection: {
    paddingHorizontal: normalize(20),
    paddingVertical: normalize(15),
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
});

export default MainCategoryScreen;
