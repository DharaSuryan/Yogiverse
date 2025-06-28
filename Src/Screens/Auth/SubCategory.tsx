import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Image, ActivityIndicator, Alert
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { MainCategoryWithSubCategories, SubCategoryType } from '../../types';
import api from '../../Api/Api';

const NUM_COLUMNS = 3;

const SubCategoryScreen: React.FC<NativeStackScreenProps<AuthStackParamList, 'SubCategory'>> = ({
  route, navigation
}) => {
  const { userData, profileImageUri, mainCategories, role } = route.params || {};
  const [categories, setCategories] = useState<MainCategoryWithSubCategories[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!mainCategories?.length) {
      Alert.alert('Error', 'No categories selected');
      navigation.goBack();
      return;
    }
    setLoading(true);
    api.get('main_with_sub_categories/').then(res => {
      const data: MainCategoryWithSubCategories[] = res.data.data || [];
      setCategories(data.filter(cat => mainCategories.includes(cat.categories)));
    }).catch(() => {
      Alert.alert('Error', 'Failed to load subcategories');
    }).finally(() => setLoading(false));
  }, [mainCategories, navigation]);

  const handleSelect = (id: number) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSignUp = () => {
    if (selected.length === 0) {
      Alert.alert('Selection Required', 'Please select at least one subcategory.');
      return;
    }
    // Submit logic here
    Alert.alert('Selected:', JSON.stringify(selected));
  };

  const renderSubcategoryRow = (subcats: SubCategoryType[], catIdx: number) => {
    const rows = [];
    for (let i = 0; i < subcats.length; i += NUM_COLUMNS) {
      const rowItems = subcats.slice(i, i + NUM_COLUMNS);
      while (rowItems.length < NUM_COLUMNS) rowItems.push(null as any);
      rows.push(
        <View style={styles.row} key={`row-${catIdx}-${i}`}>
          {rowItems.map((sub, idx) =>
            sub ?
              <TouchableOpacity
                key={sub.id}
                style={[styles.card, selected.includes(sub.id) && styles.selectedCard]}
                onPress={() => handleSelect(sub.id)}
              >
                <Image source={{ uri: sub.sub_category_image || undefined }} style={styles.icon} />
                <Text style={[styles.name, selected.includes(sub.id) && styles.selectedName]}>{sub.name}</Text>
              </TouchableOpacity>
              :
              <View style={[styles.card, { opacity: 0 }]} key={`empty-${idx}`} />
          )}
        </View>
      );
    }
    return rows;
  };

  if (loading) return <View style={styles.loading}><ActivityIndicator size="large" color="#bea063" /></View>;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('MainCategory', { userData, profileImageUri, role })}>
          <MaterialIcons name="arrow-back" size={24} color="#bea063" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Subcategories</Text>
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
        {categories.map((cat, idx) => (
          <View key={cat.categories} style={{ marginBottom: 22 }}>
            <Text style={styles.sectionHeader}>{cat.category_name}</Text>
            {renderSubcategoryRow(cat.sub_categories, idx)}
          </View>
        ))}
        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderColor: '#eee', backgroundColor: '#fff' },
  headerTitle: { fontWeight: 'bold', color: '#bea063', fontSize: 18, marginLeft: 16, flex: 1 },
  content: { padding: 18, paddingBottom: 40 },
  sectionHeader: { fontWeight: 'bold', fontSize: 16, color: '#bea063', marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  card: { flex: 1, alignItems: 'center', padding: 14, backgroundColor: '#f8f8f8', borderRadius: 10, marginHorizontal: 6, borderWidth: 2, borderColor: 'transparent' },
  selectedCard: { borderColor: '#bea063', backgroundColor: '#fffbe6' },
  icon: { width: 48, height: 48, marginBottom: 8, borderRadius: 6, backgroundColor: '#eee' },
  name: { textAlign: 'center', fontWeight: '500', color: '#333', fontSize: 13 },
  selectedName: { color: '#bea063', fontWeight: 'bold' },
  button: { backgroundColor: '#bea063', paddingVertical: 15, borderRadius: 8, alignItems: 'center', marginTop: 24, width: "85%", alignSelf: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default SubCategoryScreen;
