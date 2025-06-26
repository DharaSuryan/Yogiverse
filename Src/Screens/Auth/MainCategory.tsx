import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import api from '../../Api/Api';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainCategoryType } from '../../types';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');
const NUM_COLUMNS = 3;
const ITEM_MARGIN = 10;
const GRID_PADDING = 10;
const ITEM_WIDTH = (width - ITEM_MARGIN * (NUM_COLUMNS + 1)) / NUM_COLUMNS;

interface MainCategoryScreenParams {
  userData: any;
  profileImageUri: string | null;
  role: 'user' | 'vendor';
}

interface MainCategoryProps {
  route: NativeStackScreenProps<AuthStackParamList, 'MainCategory'> & {
    params: MainCategoryScreenParams;
  };
  navigation: NativeStackNavigationProp<AuthStackParamList>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  contentContainer: {
    padding: GRID_PADDING,
    flexGrow: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  gridContainer: {
    flex: 1,
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: GRID_PADDING,
  },
  categoryRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    width: '100%' as const,
    marginBottom: 10,
  },
  categoryColumn: {
    flex: 1,
    marginHorizontal: 5,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#bea063',
  },
  safeArea: {
    flex: 1,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  categoryCard: {
    backgroundColor: '#fff',
    width: ITEM_WIDTH,
    aspectRatio: 1,
    margin: ITEM_MARGIN,
    borderRadius: 8,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedCard: {
    backgroundColor: '#f0f8ff',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  categoryIcon: {
    width: '80%' as const,
    height: '80%' as const,
    resizeMode: 'contain' as const,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: '#333',
    marginTop: 8,
    textAlign: 'center' as const,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  button: {
    backgroundColor: '#bea063',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center' as const,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  selectedCategoryName: {
    color: '#4CAF50',
  },
});

export const MainCategoryScreen = ({ route, navigation }: MainCategoryProps) => {
  const { userData, profileImageUri, role } = route.params;
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await api.get('main_categories/');
        console.log("res",res.data);
        
        setCategories(res.data.data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryPress = (id: number) => {
    setSelectedCategories(prev => (
      prev.includes(id)
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    ));
  };

  const handleNext = () => {
    if (selectedCategories.length === 0) {
      Alert.alert('Error', 'Please select at least one category');
      return;
    }
    
    navigation.navigate('SubCategory', {
      userData,
      profileImageUri,
      mainCategories: selectedCategories,
      role
    });
  };

  const renderCategoryItem = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity
        style={[
          styles.categoryCard,
          selectedCategories.includes(item.id) && styles.selectedCard,
        ]}
        onPress={() => handleCategoryPress(item.id)}
      >
        <Image
          source={{ uri: item.image }}
          style={styles.categoryIcon}
        />
        <Text style={styles.categoryName}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Ionicons name="chevron-back" size={24} color="#bea063" />
          <Text style={styles.headerTitle}>Select Categories</Text>
        </View>
        <View style={styles.safeArea}>
          <Text style={styles.sectionTitle}>Choose your categories</Text>
          <View style={styles.gridContainer}>
            {categories.map((item, index) => (
              <View key={item.id} style={styles.categoryColumn}>
                <TouchableOpacity
                  style={[
                    styles.categoryCard,
                    selectedCategories.includes(item.id) && styles.selectedCard,
                  ]}
                  onPress={() => handleCategoryPress(item.id)}
                >
                  <Image
                    source={{ uri: item.image }}
                    style={styles.categoryIcon}
                  />
                  <Text style={styles.categoryName}>{item.name}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default MainCategoryScreen;
