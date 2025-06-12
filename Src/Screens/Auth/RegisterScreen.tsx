import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, Alert, Image, ActivityIndicator, Modal, FlatList
} from 'react-native';
import { Formik, FormikErrors, FormikTouched } from 'formik';
import * as Yup from 'yup';
import { Picker } from '@react-native-picker/picker';
import MultiSelect from 'react-native-multiple-select';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Navigation/types';
import { launchImageLibrary } from 'react-native-image-picker';
import { fetchCountries, fetchStates, fetchCities, registerUser } from '../../Api/Api';
import Icon from 'react-native-vector-icons/Ionicons';

const MAIN_CATEGORIES = ["Yog", "Meditation", "Spiritual", "Holistic"];
const SUBCATEGORIES = ["Centre", "Guru", "Yogi", "Yogini", "Teacher", "Education", "Online", "Wellness centre"];
const ITEMS_PER_PAGE = 10;

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
  status: Yup.string().oneOf(['published', 'locked']).required('Required'),
});

interface Location {
  id: number;
  name: string;
  country_name?: string;
}

interface SignUpFormValues {
  profileImage?: any; // Made optional as it might be null initially
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  phone_no: string;
  password: string;
  confirm_password: string;
  country: string;
  state: string;
  city: string;
  business_name?: string;
  main_categories?: string[];
  subcategories?: string[];
  status?: 'published' | 'locked';
  bio?: string;
}

interface SignUpScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'SignUp'>;
  route: {
    params: {
      role: string;
    };
  };
}

const SignUpScreen: React.FC<SignUpScreenProps> = ({ navigation, route }) => {
  const { role: initialRole } = route.params;
  const [role, setRole] = useState(initialRole);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Location data states
  const [allCountries, setAllCountries] = useState<Location[]>([]);
  const [filteredStates, setFilteredStates] = useState<Location[]>([]);
  const [filteredCities, setFilteredCities] = useState<Location[]>([]);

  // Pagination states
  const [countryPage, setCountryPage] = useState(1);
  const [statePage, setStatePage] = useState(1);
  const [cityPage, setCityPage] = useState(1);

  // Loading states
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);
  const [isLoadingStates, setIsLoadingStates] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  // Has more data states
  const [hasMoreCountries, setHasMoreCountries] = useState(true);
  const [hasMoreStates, setHasMoreStates] = useState(true);
  const [hasMoreCities, setHasMoreCities] = useState(true);

  // New location picker states
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showStatePicker, setShowStatePicker] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [stateSearch, setStateSearch] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Location | null>(null);
  const [selectedState, setSelectedState] = useState<Location | null>(null);
  const [selectedCity, setSelectedCity] = useState<Location | null>(null);

  // Load initial countries
  useEffect(() => {
    loadCountries();
  }, []);

  const loadCountries = async () => {
    if (isLoadingCountries || !hasMoreCountries) return;
    try {
      setIsLoadingCountries(true);
      const response = await fetchCountries(countryPage, ITEMS_PER_PAGE);
      if (!response || !response.data) throw new Error('No response received from server');

      let countries;
      if (Array.isArray(response.data)) {
        countries = response.data;
      } else if (response.data.results && Array.isArray(response.data.results)) {
        countries = response.data.results;
      } else {
        throw new Error('Invalid data format received from server');
      }

      if (countries.length === 0) {
        setHasMoreCountries(false);
        if (countryPage === 1) {
          Alert.alert('No Countries', 'No countries found. Please try again later.');
        }
      } else {
        setAllCountries(prev => [...prev, ...countries]);
        setCountryPage(prev => prev + 1);
        setHasMoreCountries(true);
      }
    } catch (error: any) {
      setHasMoreCountries(false);
      Alert.alert('Error Loading Countries', error.message || 'Failed to load countries.');
    } finally {
      setIsLoadingCountries(false);
    }
  };

  const loadStates = async (countryId: number) => {
    if (isLoadingStates || !hasMoreStates) return;
    try {
      setIsLoadingStates(true);
      const response = await fetchStates(countryId, statePage, ITEMS_PER_PAGE);
      if (!response || !response.data) throw new Error('No data received from server');
      const newStates = response.data;
      if (newStates.length === 0) {
        setHasMoreStates(false);
      } else {
        setFilteredStates(prev => [...prev, ...newStates]);
        setStatePage(prev => prev + 1);
      }
    } catch (error: any) {
      setHasMoreStates(false);
      Alert.alert('Error', error.message || 'Failed to load states.');
    } finally {
      setIsLoadingStates(false);
    }
  };

  const loadCities = async (stateId: number) => {
    if (isLoadingCities || !hasMoreCities) return;
    try {
      setIsLoadingCities(true);
      const response = await fetchCities(stateId, cityPage, ITEMS_PER_PAGE);
      if (!response || !response.data) throw new Error('No data received from server');
      const newCities = response.data;
      if (newCities.length === 0) {
        setHasMoreCities(false);
      } else {
        setFilteredCities(prev => [...prev, ...newCities]);
        setCityPage(prev => prev + 1);
      }
    } catch (error: any) {
      setHasMoreCities(false);
      Alert.alert('Error', error.message || 'Failed to load cities.');
    } finally {
      setIsLoadingCities(false);
    }
  };

  const handleImagePick = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, response => {
      if (response.assets && response.assets.length > 0 && response.assets[0].uri) {
        setProfileImage(response.assets[0].uri);
      }
    });
  };

  const handleSubmit = async (values: SignUpFormValues, { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }) => {
    let formData = new FormData();

    // User data
    const user = {
      first_name: values.first_name || "",
      last_name: values.last_name || "",
      email: values.email || "",
      phone_no: values.phone_no || "",
      username: values.username || "",
      password: values.password || "",
      country: selectedCountry ? selectedCountry.id.toString() : "",
      state: selectedState ? selectedState.id.toString() : "",
      city: selectedCity ? selectedCity.id.toString() : "",
      role: role,
    };
    formData.append("user", JSON.stringify(user));

    // Profile data
    const profile = {
      bio: values.bio || "",
    };
    formData.append("profile", JSON.stringify(profile));

    // Vendor data (only if role is vendor)
    if (role === "vendor") {
      const vendor = {
        business_name: values.business_name || "",
        main_categories: values.main_categories || [],
        subcategories: values.subcategories || [],
      };
      formData.append("vendor", JSON.stringify(vendor));
    }

    // Profile image (if present)
    if (profileImage) {
      formData.append('profile_image', {
        uri: profileImage,
        type: 'image/jpeg',
        name: 'profile.jpg',
      });
    }

    console.log("formdata", formData);

    try {
      const response = await registerUser(formData);
      if (response.status === 200) {
        Alert.alert('Success', 'Registration successful!');
        console.log(" registration response",response);
        
        navigation.navigate('Login');
      } else {
        Alert.alert('Error', response.data.message || 'Registration failed. Please try again.');
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      Alert.alert('Error', error.message || 'An error occurred during registration.');
    } finally {
      setSubmitting(false);
    }
  };

  const initialValues: SignUpFormValues = {
    profileImage: null,
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
    ...(role === 'vendor' && {
      business_name: '',
      main_categories: [],
      subcategories: [],
      status: 'published'
    }),
  };

  const renderCountryPicker = (setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void) => (
    <Modal
      visible={showCountryPicker}
      transparent
      animationType="slide"
      onRequestClose={() => setShowCountryPicker(false)}
    >
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
            data={allCountries.filter(country => {
              const countryName = country?.name || country?.country_name || '';
              return countryName.toLowerCase().includes(countrySearch.toLowerCase());
            })}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.locationItem}
                onPress={() => {
                  setSelectedCountry(item);
                  setFieldValue('country', item.id.toString());
                  setShowCountryPicker(false);
                  setSelectedState(null);
                  setSelectedCity(null);
                  setFilteredStates([]);
                  setFilteredCities([]);
                  setStatePage(1);
                  setCityPage(1);
                  setHasMoreStates(true);
                  setHasMoreCities(true);
                }}
              >
                <Text style={styles.locationItemText}>{item.name || item.country_name}</Text>
              </TouchableOpacity>
            )}
            onEndReached={() => {
              if (!isLoadingCountries && hasMoreCountries) {
                loadCountries();
              }
            }}
            onEndReachedThreshold={0.5}
            ListFooterComponent={() =>
              isLoadingCountries ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#0000ff" />
                </View>
              ) : null
            }
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No countries found</Text>
              </View>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  const renderStatePicker = (setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void) => (
    <Modal
      visible={showStatePicker}
      transparent
      animationType="slide"
      onRequestClose={() => setShowStatePicker(false)}
    >
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
            data={filteredStates.filter(state =>
              state.name.toLowerCase().includes(stateSearch.toLowerCase())
            )}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.locationItem}
                onPress={() => {
                  setSelectedState(item);
                  setFieldValue('state', item.id.toString());
                  setShowStatePicker(false);
                  setSelectedCity(null);
                  setFilteredCities([]);
                  setCityPage(1);
                  setHasMoreCities(true);
                  loadCities(item.id);
                }}
              >
                <Text style={styles.locationItemText}>{item.name}</Text>
              </TouchableOpacity>
            )}
            onEndReached={() => {
              if (!isLoadingStates && hasMoreStates && selectedCountry) {
                loadStates(selectedCountry.id);
              }
            }}
            onEndReachedThreshold={0.5}
            ListFooterComponent={() =>
              isLoadingStates ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#0000ff" />
                </View>
              ) : null
            }
          />
        </View>
      </View>
    </Modal>
  );

  const renderCityPicker = (setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void) => (
    <Modal
      visible={showCityPicker}
      transparent
      animationType="slide"
      onRequestClose={() => setShowCityPicker(false)}
    >
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
            data={filteredCities.filter(city =>
              city.name.toLowerCase().includes(citySearch.toLowerCase())
            )}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.locationItem}
                onPress={() => {
                  setSelectedCity(item);
                  setFieldValue('city', item.id.toString());
                  setShowCityPicker(false);
                }}
              >
                <Text style={styles.locationItemText}>{item.name}</Text>
              </TouchableOpacity>
            )}
            onEndReached={() => {
              if (!isLoadingCities && hasMoreCities && selectedState) {
                loadCities(selectedState.id);
              }
            }}
            onEndReachedThreshold={0.5}
            ListFooterComponent={() =>
              isLoadingCities ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#0000ff" />
                </View>
              ) : null
            }
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>Sign Up as {role === 'user' ? 'User' : 'Vendor'}</Text>
        <Formik
          initialValues={initialValues}
          validationSchema={role === 'user' ? UserSchema : VendorSchema}
          onSubmit={handleSubmit}
        >
          {({ handleChange, handleBlur, handleSubmit, setFieldValue, values, errors, touched, isSubmitting }: {
            handleChange: (field: string) => (text: string | React.ChangeEvent<any>) => void;
            handleBlur: (field: string) => (e: any) => void;
            handleSubmit: (e?: React.FormEvent<HTMLFormElement> | undefined) => void;
            setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void;
            values: SignUpFormValues;
            errors: FormikErrors<SignUpFormValues>;
            touched: FormikTouched<SignUpFormValues>;
            isSubmitting: boolean;
          }) => (
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
              {(['first_name', 'last_name', 'username', 'email', 'phone_no'] as const).map(field => (
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

              {/* Vendor-specific fields */}
              {role === 'vendor' && (
                <>
                  {/* Location Information */}
                  <Text style={styles.sectionTitle}>Location Information</Text>
                  <View style={styles.locationContainer}>
                    <TouchableOpacity style={styles.locationField} onPress={() => setShowCountryPicker(true)}>
                      <Text style={styles.locationLabel}>Country</Text>
                      <Text style={styles.locationValue}>
                        {selectedCountry ? (selectedCountry.name || selectedCountry.country_name) : 'Select Country'}
                      </Text>
                    </TouchableOpacity>
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
                    items={MAIN_CATEGORIES.map(c => ({ id: c, name: c }))}
                    uniqueKey="id"
                    onSelectedItemsChange={items => setFieldValue('main_categories', items)}
                    selectedItems={values.main_categories || []}
                    selectText="Select Main Categories"
                    displayKey="name"
                    submitButtonText="Done"
                  />
                  {touched.main_categories && errors.main_categories && <Text style={styles.error}>{errors.main_categories}</Text>}

                  <MultiSelect
                    items={SUBCATEGORIES.map(c => ({ id: c, name: c }))}
                    uniqueKey="id"
                    onSelectedItemsChange={items => setFieldValue('subcategories', items)}
                    selectedItems={values.subcategories || []}
                    selectText="Select Subcategories"
                    displayKey="name"
                    submitButtonText="Done"
                  />
                  {touched.subcategories && errors.subcategories && <Text style={styles.error}>{errors.subcategories}</Text>}
                </>
              )}

              <TouchableOpacity style={styles.button} onPress={() => handleSubmit()} disabled={isSubmitting}>
                <Text style={styles.buttonText}>{isSubmitting ? 'Signing Up...' : 'Sign Up'}</Text>
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