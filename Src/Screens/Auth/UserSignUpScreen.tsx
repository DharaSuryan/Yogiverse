import React, { useState, useEffect, FC } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, Alert, Image, ActivityIndicator, Modal, FlatList, GestureResponderEvent
} from 'react-native';
import { Formik, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import MultiSelect from 'react-native-multiple-select';
import { launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import api, { fetchCountries, registerUser } from '../../Api/Api';
import Icon from 'react-native-vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

// Type Definitions
interface Country {
  id: number;
  country_name: string;
  name: string;
  calling_code: string;
  all_state: State[];
}

interface State {
  id: number;
  name: string;
}

interface City {
  id: number;
  name: string;
}

interface SubCategory {
  id: number;
  name: string;
}

interface MainCategory {
  categories: number;
  category_name: string;
  sub_categories: SubCategory[];
}

type AuthStackParamList = {
  SignUp: { role: 'user' | 'vendor' };
  Login: undefined;
};

type SignUpScreenProps = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

// const MAIN_CATEGORIES = ["Yog", "Meditation", "Spiritual", "Holistic"];
// const SUBCATEGORIES = ["Centre", "Guru", "Yogi", "Yogini", "Teacher", "Education", "Online", "Wellness centre"];
const ITEMS_PER_PAGE = 50;

const UserSchema = Yup.object().shape({
  first_name: Yup.string().required('Required'),
  last_name: Yup.string().required('Required'),
  username: Yup.string().required('Required'),
  email: Yup.string().email('Invalid email').required('Required'),
  phone_no: Yup.string().required('Required'),
  password: Yup.string().min(6).required('Required'),
  confirm_password: Yup.string().oneOf([Yup.ref('password')], 'Passwords must match').required('Required'),
  country: Yup.string().nullable(),
  state: Yup.string().nullable(),
  city: Yup.string().nullable(),
});

const VendorSchema = Yup.object().shape({
  ...UserSchema.fields,
  business_name: Yup.string().required('Required'),
  main_categories: Yup.array().min(1, 'Select at least one'),
  subcategories: Yup.array().min(1, 'Select at least one'),
});

const SignUpScreen: FC<SignUpScreenProps> = ({ navigation, route }) => {
  const { role: initialRole } = route.params;
  const [role, setRole] = useState(initialRole);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Location states
  const [allCountries, setAllCountries] = useState<Country[]>([]);
  const [filteredStates, setFilteredStates] = useState<State[]>([]);
  const [filteredCities, setFilteredCities] = useState<City[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedState, setSelectedState] = useState<State | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  // UI controls
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showStatePicker, setShowStatePicker] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [stateSearch, setStateSearch] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  const [mainCategories, setMainCategories] = useState<MainCategory[]>([]);
  const [mainCategoryIds, setMainCategoryIds] = useState<number[]>([]);
  const [subCategoryIds, setSubCategoryIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        // Replace with your actual API endpoint if baseURL is not set globally
        const res = await api.get('main_with_sub_categories/');
        setMainCategories(res.data.data || []);
        console.log(res.data.data, "maincategories");

      } catch (err) {
        Alert.alert('Error', 'Failed to load categories');
        setMainCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // 1. Fetch all countries (with their states) on mount
  useEffect(() => {
    const fetchAllCountries = async () => {
      setIsLoadingCountries(true);
      let page = 1, all: Country[] = [];
      while (true) {
        const res = await fetchCountries(page, ITEMS_PER_PAGE);
        if (!res?.data?.data) break;
        all = [...all, ...res.data.data];
        if (res.data.data.length < ITEMS_PER_PAGE) break;
        page++;
      }
      setAllCountries(all); // Contains all countries, each with .all_state
      setIsLoadingCountries(false);
    };
    fetchAllCountries();
  }, []);

  // 2. When country is selected
  const handleCountrySelect = (item: Country, setFieldValue: (field: string, value: any) => void) => {
    setSelectedCountry(item);
    setFieldValue('country', item.id.toString());
    setShowCountryPicker(false);

    // Reset state & city
    setSelectedState(null);
    setSelectedCity(null);
    setFilteredStates(item.all_state || []);
    setFilteredCities([]);
  };

  // 3. When state is selected (fetch state-wise cities)
  // API call
  const fetchCities = async (stateId: number) => {
    try {
      const response = await api.get(`/helper_app/cities/${stateId}/`);
      return {
        data: response.data,
        status: response.status,
        message: 'Cities fetched successfully'
      };
    } catch (error) {
      throw error;
    }
  };


  // State handler
  const handleStateSelect = async (item: State, setFieldValue: (field: string, value: any) => void) => {
    setSelectedState(item);
    setFieldValue('state', item.id.toString());
    setShowStatePicker(false);

    setSelectedCity(null);
    setFilteredCities([]);
    setCitySearch('');

    if (!item?.id) return;

    setIsLoadingCities(true);
    try {
      const res = await fetchCities(item.id);
      // res.data.data is your array

      const cityArray = res?.data || [];
      setFilteredCities(cityArray?.data);

    } catch (err) {
      setFilteredCities([]);
    } finally {
      setIsLoadingCities(false);
    }
  };


  // 4. When city is selected
  const handleCitySelect = (item: City, setFieldValue: (field: string, value: any) => void) => {
    setSelectedCity(item);
    setFieldValue('city', item.id.toString());
    setShowCityPicker(false);
  };

  // Image picker
  const handleImagePick = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, (response: ImagePickerResponse) => {
      if (response.assets && response.assets.length > 0 && response.assets[0].uri) {
        setProfileImage(response.assets[0].uri);
      }
    });
  };

  // Pickers
  const renderCountryPicker = (setFieldValue: (field: string, value: any) => void) => (
    <Modal visible={showCountryPicker} transparent animationType="slide" onRequestClose={() => setShowCountryPicker(false)}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Country</Text>
            <TouchableOpacity onPress={() => setShowCountryPicker(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="Search countries..."
            value={countrySearch}
            onChangeText={setCountrySearch}
          />
          <FlatList
            data={allCountries.filter(c => (c?.country_name || c?.name || '').toLowerCase().includes(countrySearch.toLowerCase()))}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.locationItem} onPress={() => handleCountrySelect(item, setFieldValue)}>
                <View style={styles.countryItemContainer}>
                  <Text style={styles.countryName}>{item.country_name || item.name}</Text>
                  <Text style={styles.countryCodeText}>+{item.calling_code}</Text>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={() => <View style={styles.emptyContainer}><Text style={styles.emptyText}>No countries found</Text></View>}
          />
        </View>
      </View>
    </Modal>
  );

  const renderStatePicker = (setFieldValue: (field: string, value: any) => void) => (
    <Modal visible={showStatePicker} transparent animationType="slide" onRequestClose={() => setShowStatePicker(false)}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select State</Text>
            <TouchableOpacity onPress={() => setShowStatePicker(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="Search states..."
            value={stateSearch}
            onChangeText={setStateSearch}
          />
          <FlatList
            data={filteredStates.filter(s => (s.name || '').toLowerCase().includes(stateSearch.toLowerCase()))}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.locationItem} onPress={() => handleStateSelect(item, setFieldValue)}>
                <Text style={styles.locationItemText}>{item.name}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={() => <View style={styles.emptyContainer}><Text style={styles.emptyText}>No states found</Text></View>}
          />
        </View>
      </View>
    </Modal>
  );

  const renderCityPicker = (setFieldValue: (field: string, value: any) => void) => (
    <Modal visible={showCityPicker} transparent animationType="slide" onRequestClose={() => setShowCityPicker(false)}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select City</Text>
            <TouchableOpacity onPress={() => setShowCityPicker(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="Search cities..."
            value={citySearch}
            onChangeText={setCitySearch}
          />
          <FlatList
            data={filteredCities.filter(c => (c.name || '').toLowerCase().includes(citySearch.toLowerCase()))}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.locationItem} onPress={() => handleCitySelect(item, setFieldValue)}>
                <Text style={styles.locationItemText}>{item.name}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={() => <View style={styles.emptyContainer}><Text style={styles.emptyText}>No cities found</Text></View>}
            ListFooterComponent={() => isLoadingCities ? (<View style={styles.loadingContainer}><ActivityIndicator size="small" color="#0000ff" /></View>) : null}
          />
        </View>
      </View>
    </Modal>
  );

  const initialValues = {
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    phone_no: '',
    password: '',
    confirm_password: '',
    country: '',
    state: '',
    city: '',
    bio: '',
    ...(role === 'vendor' && {
      business_name: '',
      main_categories: [] as number[],
      subcategories: [] as number[],
    }),
  };

  // Form Submission
  const handleSubmit = async (values: typeof initialValues, { setSubmitting }: FormikHelpers<typeof initialValues>) => {
    try {
      setSubmitting(true);
      console.log('Form submission started');
      console.log('Form values:', values);

      const formData = new FormData();
      
      // Append all fields one by one, which is the format the server expects
      formData.append('first_name', values.first_name || '');
      formData.append('last_name', values.last_name || '');
      formData.append('email', values.email || '');
      formData.append('phone_no', `+${selectedCountry?.calling_code || '91'}${values.phone_no || ''}`);
      formData.append('username', values.username || '');
      formData.append('password', values.password || '');
      formData.append('country', selectedCountry ? selectedCountry.id.toString() : '');
      formData.append('state', selectedState ? selectedState.id.toString() : '');
      formData.append('city', selectedCity ? selectedCity.id.toString() : '');
      formData.append('role', route.params.role);
      formData.append('bio', values.bio || '');

      if (role === 'vendor') {
        formData.append('business_name', values.business_name || '');
        // The server might expect the arrays as a JSON string
        formData.append('main_categories', JSON.stringify(mainCategoryIds || []));
        formData.append('subcategories', JSON.stringify(subCategoryIds || []));
      }
      
      if (profileImage) {
        formData.append('profile_image', {
          uri: profileImage,
          type: 'image/jpeg',
          name: 'profile.jpg',
        });
      }

      console.log('Sending FormData:', formData);
      const response = await registerUser(formData);
      
      if (response.status) {
        Alert.alert('Success', response.message || 'Registration successful!');
        navigation.navigate('Login');
      } else {
        Alert.alert('Error', response.message || 'Registration failed. Please try again.');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      const serverMessage = error?.response?.data?.message || error.message;
      Alert.alert('Error', serverMessage || 'An error occurred during registration.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* {role !== 'user' ? <Text style={{ textAlign: 'center', color: '#bea063', marginTop: 10 }}>Everyone is Yogi</Text> : null}
        {role !== 'user' ? <Text style={{ textAlign: 'center', marginVertical: 5, color: '#bea063' }}>by his/her Karma and Dharma.</Text> : null} */}
        <Text style={{fontSize: 22, fontWeight: 'bold', marginVertical: 16, alignSelf: 'center', color: 'gray'}}>Sign Up as <Text style={styles.header}>{role === 'user' ? 'Seekers' : "Yogi's"}</Text></Text>
        <Formik
          initialValues={initialValues}
          validationSchema={role === 'user' ? UserSchema : VendorSchema}
          onSubmit={handleSubmit}
        >
          {({ handleChange, handleBlur, handleSubmit, setFieldValue, values, errors, touched, isSubmitting }) => (
            <View style={styles.formContainer}>
              {/* Profile Image */}
              <View style={styles.profileImageContainer}>
                {profileImage ? (
                  <Image source={{ uri: profileImage }} style={styles.profileImage} />
                ) : (
                  <View style={styles.profileImagePlaceholder} />
                )}
                <TouchableOpacity onPress={handleImagePick}>
                  <Text style={styles.selectPhotoText}>Select Profile Photo</Text>
                </TouchableOpacity>
              </View>

              {/* Personal Information */}
              <Text style={styles.sectionTitle}>Personal Information</Text>
              {(['first_name', 'last_name', 'username', 'email'] as const).map(field => (
                <View key={field}>
                  <Text style={styles.label}>{field.replace('_', ' ').toUpperCase()}</Text>
                  <TextInput
                    style={[styles.input, touched[field] && errors[field] && styles.inputError]}
                    onChangeText={handleChange(field)}
                    onBlur={handleBlur(field)}
                    value={values[field]}
                  />
                  {touched[field] && errors[field] && (
                    <Text style={styles.errorText}>{errors[field]}</Text>
                  )}
                </View>
              ))}

              {/* Security Information */}
              <Text style={styles.sectionTitle}>Security Information</Text>
              <View style={styles.passwordField}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Password"
                  secureTextEntry={!showPassword}
                  onChangeText={handleChange('password')}
                  value={values.password}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Icon name={showPassword ? 'eye' : 'eye-off'} size={20} color="#888" />
                </TouchableOpacity>
              </View>
              {touched.password && errors.password && <Text style={styles.error}>{errors.password}</Text>}

              <View style={styles.passwordField}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Confirm Password"
                  secureTextEntry={!showConfirmPassword}
                  onChangeText={handleChange('confirm_password')}
                  value={values.confirm_password}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Icon name={showConfirmPassword ? 'eye' : 'eye-off'} size={20} color="#888" />
                </TouchableOpacity>
              </View>
              {touched.confirm_password && errors.confirm_password && <Text style={styles.error}>{errors.confirm_password}</Text>}

              {/* Location Information */}
              <Text style={styles.sectionTitle}>Location Information</Text>
              <View style={styles.locationContainer}>
                <TouchableOpacity style={styles.locationField} onPress={() => setShowCountryPicker(true)}>
                  <Text style={styles.locationLabel}>Country</Text>
                  <Text style={styles.locationValue}>
                    {selectedCountry ? (selectedCountry.name || selectedCountry.country_name) : 'Select Country'}
                  </Text>
                </TouchableOpacity>
                <View key="phone_no">
                  <Text style={styles.label}>PHONE NUMBER</Text>
                  <View style={styles.phoneContainer}>
                    <TouchableOpacity
                      style={styles.countryCodeContainer}
                      onPress={() => setShowCountryPicker(true)}
                    >
                      <Text style={styles.countryCode}>{selectedCountry ? `+${selectedCountry.calling_code}` : '+91'}</Text>
                    </TouchableOpacity>
                    <TextInput
                      style={[styles.phoneInput, touched.phone_no && errors.phone_no && styles.inputError]}
                      onChangeText={handleChange('phone_no')}
                      onBlur={handleBlur('phone_no')}
                      value={values.phone_no}
                      keyboardType="phone-pad"
                    />
                  </View>
                  {touched.phone_no && errors.phone_no && (
                    <Text style={styles.errorText}>{errors.phone_no}</Text>
                  )}
                </View>
                <TouchableOpacity
                  style={[styles.locationField, !selectedCountry && styles.locationFieldDisabled]}
                  onPress={() => selectedCountry && setShowStatePicker(true)}
                  disabled={!selectedCountry}
                >
                  <Text style={styles.locationLabel}>State</Text>
                  <Text style={[styles.locationValue, !selectedCountry && styles.locationValueDisabled]}>
                    {selectedState ? selectedState.name : 'Select State'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.locationField, !selectedState && styles.locationFieldDisabled]}
                  onPress={() => selectedState && setShowCityPicker(true)}
                  disabled={!selectedState}
                >
                  <Text style={styles.locationLabel}>City</Text>
                  <Text style={[styles.locationValue, !selectedState && styles.locationValueDisabled]}>
                    {selectedCity ? selectedCity.name : 'Select City'}
                  </Text>
                </TouchableOpacity>
              </View>
              {renderCountryPicker(setFieldValue)}
              {renderStatePicker(setFieldValue)}
              {renderCityPicker(setFieldValue)}

              {/* Vendor fields */}
              {role === 'vendor' && (
                <>
                  <Text style={styles.sectionTitle}>Business Information</Text>
                  <Text style={styles.label}>Business Name</Text>
                  <TextInput
                    style={[styles.input, touched.business_name && errors.business_name && styles.inputError]}
                    onChangeText={handleChange('business_name')}
                    onBlur={handleBlur('business_name')}
                    value={values.business_name}
                  />
                  {touched.business_name && errors.business_name && (
                    <Text style={styles.errorText}>{errors.business_name}</Text>
                  )}

                  <Text style={styles.sectionTitle}>Categories</Text>
                  <MultiSelect
                    items={mainCategories}
                    uniqueKey="categories"
                    onSelectedItemsChange={items => {
                      setFieldValue('main_categories', items);
                      setMainCategoryIds(items); // <-- keep local state in sync!
                    }}
                    selectedItems={values.main_categories || []}
                    selectText="Select Main Categories"
                    displayKey="category_name"
                    submitButtonText="Done"
                  />
                  {touched.main_categories && errors.main_categories && <Text style={styles.error}>{errors.main_categories}</Text>}

                  {mainCategories
                    .filter(mc => mainCategoryIds.includes(mc.categories))
                    .map(mainCategory => {
                      if (!mainCategory?.sub_categories) return null;

                      const subcatsForThisMain = mainCategory.sub_categories;
                      const selectedSubcatIdsForThisMain = (values.subcategories || []).filter(subId => 
                          subcatsForThisMain.some(s => s.id === subId)
                      );

                      return (
                          <View key={mainCategory.categories} style={{marginTop: 16}}>
                              <Text style={styles.subCategoryHeader}>{mainCategory.category_name}</Text>
                              <MultiSelect
                                  items={subcatsForThisMain}
                                  uniqueKey="id"
                                  onSelectedItemsChange={(newlySelectedIds) => {
                                      const otherSubcatIds = (values.subcategories || []).filter(subId =>
                                          !subcatsForThisMain.some(s => s.id === subId)
                                      );
                                      const allSelectedIds = [...otherSubcatIds, ...newlySelectedIds];
                                      setSubCategoryIds(allSelectedIds);
                                      setFieldValue('subcategories', allSelectedIds);
                                  }}
                                  selectedItems={selectedSubcatIdsForThisMain}
                                  selectText="Select subcategories..."
                                  displayKey="name"
                                  submitButtonText="Done"
                              />
                          </View>
                      );
                  })}
                  {touched.subcategories && errors.subcategories && <Text style={styles.error}>{errors.subcategories}</Text>}
                </>
              )}

              <TouchableOpacity style={styles.button} onPress={handleSubmit as (e?: GestureResponderEvent) => void} disabled={isSubmitting}>
                {isSubmitting 
                  ? <ActivityIndicator color="#FFFFFF" /> 
                  : <Text style={styles.buttonText}>Sign Up</Text>
                }
              </TouchableOpacity>
            </View>
          )}
        </Formik>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 40 },


  header: { fontSize: 22, fontWeight: 'bold', marginVertical: 16, alignSelf: 'center', color: '#bea063' },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#bea063',
    marginTop: 20,
    marginBottom: 10
  },
  subCategoryHeader: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  input: { backgroundColor: '#fafafa', borderRadius: 5, padding: 15, fontSize: 16, marginBottom: 10 },
  picker: { backgroundColor: '#fafafa', borderColor: '#ccc', borderWidth: 1, marginBottom: 10 },
  loadMoreButton: {
    padding: 8,
    alignItems: 'center',
    marginTop: -6,
    marginBottom: 16,
  },
  loadMore: {
    color: '#bea063',
    fontSize: 14,
  },
  error: { color: '#ed4956', marginBottom: 4, fontSize: 12 },
  button: {
    backgroundColor: '#bea063',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  countryCodeContainer: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#dbdbdb',
    marginRight: 10,
  },
  countryCode: {
    fontSize: 16,
    color: '#666',
  },
  countryItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  countryName: {
    fontSize: 16,
    flex: 1,
  },
  countryCodeText: {
    fontSize: 16,
    color: '#666',
    minWidth: 50,
  },
  phoneInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  inputWrapper: { marginBottom: 10 },
  passwordField: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#dbdbdb',
    borderRadius: 5,
    backgroundColor: '#fafafa',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchInput: {
    backgroundColor: '#fafafa',
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
  },
  locationItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  locationItemText: {
    fontSize: 16,
  },
  loadingContainer: {
    padding: 10,
    alignItems: 'center',
  },
  locationContainer: {
    marginBottom: 20,
  },
  locationField: {
    backgroundColor: '#fafafa',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 15,
    marginBottom: 10,
  },
  locationLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  locationValue: {
    fontSize: 16,
    color: '#000',
  },
  locationValueDisabled: {
    color: '#999',
  },
  inputContainer: {
    marginBottom: 10,
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  inputError: {
    borderColor: '#ed4956',
  },
  errorText: {
    color: '#ed4956',
    marginTop: 4,
    fontSize: 12,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ccc',
  },
  selectPhotoText: {
    marginTop: 10,
    color: '#bea063',
    fontSize: 14,
  },
  locationFieldDisabled: {
    opacity: 0.5,
  },
  formContainer: {
    // Add appropriate styles for the form container
    marginTop: 10
  },
  submitButton: {
    backgroundColor: '#bea063', padding: 15, borderRadius: 5,
    alignItems: 'center', marginTop: 24, marginBottom: 40,
  },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  arrayContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  arrayItem: {
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 4,
    fontSize: 14,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
  },
});

export default SignUpScreen;


