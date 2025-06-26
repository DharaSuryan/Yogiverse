import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
  Image,
  FlatList,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { MainCategoryType, SubCategoryType, MainCategoryWithSubCategories } from '../../types';
import { api } from '../../Api/Api';
import { styles } from './styles';

const NUM_COLUMNS = 3;
const ITEM_MARGIN = 10;
const GRID_PADDING = 10;
const ITEM_WIDTH = (Dimensions.get('window').width - ITEM_MARGIN * (NUM_COLUMNS + 1)) / NUM_COLUMNS;

const SubCategoryScreen: React.FC<NativeStackScreenProps<AuthStackParamList, 'SubCategory'>> = ({
  route,
  navigation
}) => {
  const { userData, profileImageUri, mainCategories, role } = route.params || {};
  const [subCategories, setSubCategories] = useState<SubCategoryType[]>([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mainCategoryIds = Array.isArray(mainCategories) ? mainCategories : [];

  useEffect(() => {
    if (!mainCategories || !Array.isArray(mainCategories) || mainCategories.length === 0) {
      Alert.alert('Error', 'No categories selected');
      navigation.goBack();
      return;
    }

    const fetchSubCategories = async () => {
      try {
        setLoading(true);
        const res = await api.get<{ data: { data: MainCategoryWithSubCategories[] } }>('main_with_sub_categories/');
        const allCategories = res.data.data || [];
        const filteredSubCategories = allCategories
          .filter((category: MainCategoryWithSubCategories) => mainCategoryIds.includes(category.categories))
          .flatMap((category: MainCategoryWithSubCategories) => category.sub_categories);

        if (filteredSubCategories.length === 0) {
          Alert.alert('Error', 'No subcategories found for selected categories');
          navigation.goBack();
          return;
        }
        setSubCategories(filteredSubCategories);
      } catch (error) {
        Alert.alert('Error', 'Failed to load subcategories');
      } finally {
        setLoading(false);
      }
    };

    fetchSubCategories();
  }, [mainCategories, navigation]);

  const handleSelectSubCategory = (item: SubCategoryType) => {
    setSelectedSubCategories(prev =>
      prev.includes(item.id)
        ? prev.filter(selectedId => selectedId !== item.id)
        : [...prev, item.id]
    );
  };

  const handleSignUp = async () => {
    if (selectedSubCategories.length === 0) {
      Alert.alert('Error', 'Please select at least one subcategory');
      return;
    }
    Alert.alert('Success', 'Selected subcategories: ' + JSON.stringify(selectedSubCategories));
    // navigation.navigate('Login'); // or wherever you need
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerText}>
          Select Subcategories
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#bea063" />
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <FlatList
            data={subCategories}
            numColumns={NUM_COLUMNS}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.categoryCard,
                  selectedSubCategories.includes(item.id) && styles.selectedCard
                ]}
                onPress={() => handleSelectSubCategory(item)}
              >
                <View style={styles.cardContent}>
                  <Image
                    source={{ uri: item.sub_category_image || '' }}
                    style={styles.categoryIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.categoryName}>{item.sub_category_name}</Text>
                </View>
              </TouchableOpacity>
            )}
            contentContainerStyle={{
              padding: 10,
              flexGrow: 1,
              justifyContent: 'space-between'
            }}
            showsVerticalScrollIndicator={false}
          />
          <View style={{ marginTop: 20 }}>
            <TouchableOpacity
              style={[
                styles.button,
                isSubmitting && styles.disabledButton
              ]}
              onPress={handleSignUp}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>
                  Continue
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default SubCategoryScreen;
