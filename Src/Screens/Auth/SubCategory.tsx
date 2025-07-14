import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Image, ActivityIndicator, Alert
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { MainCategoryWithSubCategories, SubCategoryType } from '../../types';
import api, { registerUser } from '../../Api/Api';

const NUM_COLUMNS = 3;

const SubCategoryScreen: React.FC<NativeStackScreenProps<AuthStackParamList, 'SubCategory'>> = ({
  route, navigation
}) => {
  const { signupData, role } = route.params || {};
  const [categories, setCategories] = useState<MainCategoryWithSubCategories[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!signupData?.main_categories?.length) {
      Alert.alert('Error', 'No categories selected');
      navigation.goBack();
      return;
    }
    setLoading(true);
    api.get('main_with_sub_categories/').then(res => {
      const data: MainCategoryWithSubCategories[] = res.data.data || [];
      setCategories(data.filter(cat => signupData.main_categories.includes(cat.categories)));
    }).catch(() => {
      Alert.alert('Error', 'Failed to load subcategories');
    }).finally(() => setLoading(false));
  }, [signupData?.main_categories, navigation]);

  const handleSelect = (id: number) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSignUp = async () => {
    if (selected.length === 0) {
      Alert.alert('Selection Required', 'Please select at least one subcategory.');
      return;
    }

    try {
      setSubmitting(true);
      console.log('Form submission started');
      console.log('Signup data:', signupData);
      console.log('Selected subcategories:', selected);

      const formData = new FormData();

      // Append all fields one by one, which is the format the server expects
      formData.append('first_name', signupData.first_name || '');
      formData.append('last_name', signupData.last_name || '');
      formData.append('email', signupData.email || '');
      formData.append('phone_no', signupData.phone_no || '');
      formData.append('username', signupData.username || '');
      formData.append('password', signupData.password || '');
      formData.append('country', signupData.country_id?.toString() || '');
      formData.append('state', signupData.state_id?.toString() || '');
      formData.append('city', signupData.city_id?.toString() || '');
      formData.append('role', 'vendor');
      formData.append('bio', signupData.bio || '');

      if (signupData.role === 'vendor') {
        formData.append('business_name', signupData.business_name || '');
        // The server expects the arrays as a JSON string
        formData.append('main_categories', JSON.stringify(signupData.main_categories || []));
        formData.append('subcategories', JSON.stringify(selected || []));
      }

      if (signupData.profileImage && !signupData.profileImage.startsWith('http')) {
        formData.append('profile_image', {
          uri: signupData.profileImage,
          type: 'image/jpeg',
          name: 'profile.jpg',
        });
      }

      console.log('Sending FormData:', formData);
      console.log('Calling registration API...');
      
      const response = await registerUser(formData);
      console.log('Sign-up API Response:', JSON.stringify(response, null, 2));

      console.log("response ===> ", response);

      if (response.status) {
        Alert.alert('Success', response.message || 'Registration successful!');
        navigation.navigate('Login');
      } else {
        Alert.alert('Error', response.message || 'Registration failed. Please try again.');
      }
    } catch (error: any) {
      
      console.error('Registration error 000000000:', error?.response?.data); 
      handleRegistrationError(error?.response?.data)
      
      // const serverMessage = error?.response?.data?.message || error.message;
      // Alert.alert('Error', serverMessage || 'An error occurred during registration.');

      //  if (response.data?.errors) {
      //   const errorMessages = Object.entries(response.data.errors)
      //     .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
      //     .join('\n');
      //   Alert.alert('Validation Error', errorMessages);
      // } else {
      //   Alert.alert('Error', response?.data?.message || 'Update failed.');
      // }

    } finally {
      setSubmitting(false);
    }
  };

  function handleRegistrationError(errorResponse: any) {
    console.error('errorResponse 00000:', errorResponse); 
  if (!errorResponse || typeof errorResponse !== 'object') {
    alert('Something went wrong. Please try again.');
    return;
  }

  const { errors, message } = errorResponse;

  if (errors) {
    let alertMessages = [];

    if (errors.email && errors.email.length > 0) {
      alertMessages.push(`Email: ${errors.email.join(', ')}`);
    }

    if (errors.username && errors.username.length > 0) {
      alertMessages.push(`Username: ${errors.username.join(', ')}`);
    }

    if (errors.phone_no && errors.phone_no.length > 0) {
      alertMessages.push(`Phone No: ${errors.phone_no.join(', ')}`);
    }

    // Show the collected error messages
    if (alertMessages.length > 0) {
      alert(alertMessages.join('\n'));
      return;
    }
  }

  // Fallback message
  alert(message || 'Something went wrong. Please try again.');
}


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
        <TouchableOpacity onPress={() => navigation.navigate('MainCategory', { signupData })}>
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
        <TouchableOpacity 
          style={[styles.button, submitting && { opacity: 0.6 }]} 
          onPress={handleSignUp}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Complete Sign Up</Text>
          )}
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
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default SubCategoryScreen;
