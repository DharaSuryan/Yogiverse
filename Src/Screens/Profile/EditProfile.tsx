import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
  Modal,
  FlatList,
  Dimensions,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import api, {
  fetchCountries,
  fetchStates,
  fetchCities,
} from '../../Api/Api';
import {MultiSelect} from 'react-native-element-dropdown';
import DocumentPicker from 'react-native-document-picker';
import { Formik } from 'formik';
import * as Yup from 'yup';
const Ionicons = require('react-native-vector-icons/Ionicons').default;

// ... (Your interfaces stay the same)

// ... (constants and Dimension code unchanged)

const EditProfile = ({navigation, route}: any) => {
  const {role: initialRole, data}: {role: string; data: ProfileData} = route.params || {role: 'user'};

  // State for non-Formik fields
  const [role, setRole] = useState(initialRole);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Location and category picker states
  const [allCountries, setAllCountries] = useState<Country[]>([]);
  const [filteredStates, setFilteredStates] = useState<State[]>([]);
  const [filteredCities, setFilteredCities] = useState<City[]>([]);
  const [countrySearch, setCountrySearch] = useState('');
  const [stateSearch, setStateSearch] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showStatePicker, setShowStatePicker] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);
  const [isLoadingStates, setIsLoadingStates] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [hasMoreCountries, setHasMoreCountries] = useState(true);
  const [hasMoreStates, setHasMoreStates] = useState(true);
  const [hasMoreCities, setHasMoreCities] = useState(true);

  // File/image/document states (not managed by Formik directly)
  const [logoFile, setLogoFile] = useState<any>(null);
  const [bannerFile, setBannerFile] = useState<any>(null);
  const [panFile, setPanFile] = useState<any>(null);
  const [aadharFile, setAadharFile] = useState<any>(null);
  const [gstFile, setGstFile] = useState<any>(null);
  const [companyRegFile, setCompanyRegFile] = useState<any>(null);
  const [msmeFile, setMsmeFile] = useState<any>(null);

  // Categories/subcategories
  const [categories, setCategories] = useState<Category[]>([]);
  const [availableSubCategories, setAvailableSubCategories] = useState<any[]>([]);

  const [userId, setUserId] = useState(data.profile.user);

  useEffect(() => {
    // Get all countries
    const fetchAllCountries = async () => {
      setIsLoadingCountries(true);
      let page = 1, all: Country[] = [];
      while (true) {
        const res = await fetchCountries(page, 10);
        if (!res?.data?.data) break;
        all = [...all, ...res.data.data];
        if (res.data.data.length < 10) break;
        page++;
      }
      setAllCountries(all);
      setIsLoadingCountries(false);
    };
    fetchAllCountries();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('main_with_sub_categories/');
        setCategories(res.data.data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Helper for city fetch (outside Formik for cleaner code)
  const fetchCityList = async (stateId: number) => {
    try {
      const response = await api.get(`/helper_app/cities/${stateId}/`);
      return response.data?.data || [];
    } catch {
      return [];
    }
  };

  // File and image pickers
  const pickImage = (setter: (file: any) => void) => {
    launchImageLibrary({mediaType: 'photo', quality: 0.8}, response => {
      if (response.assets && response.assets.length > 0) {
        setter(response.assets[0]);
      }
    });
  };

  const pickDocument = async (setter: (file: any) => void) => {
    try {
      const res = await DocumentPicker.pickSingle({type: [DocumentPicker.types.allFiles]});
      setter(res);
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        Alert.alert('Error', 'Failed to pick document');
      }
    }
  };

  // Location Pickers (triggered from within Formik)
  const renderCountryPicker = (setFieldValue: any) => (
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
              <TouchableOpacity
                style={styles.locationItem}
                onPress={() => {
                  setFieldValue('country', item.id);
                  setFieldValue('state', '');
                  setFieldValue('city', '');
                  setFilteredStates(item.all_state || []);
                  setFilteredCities([]);
                  setShowCountryPicker(false);
                }}>
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

  const renderStatePicker = (setFieldValue: any, selectedCountryId: number) => (
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
              <TouchableOpacity
                style={styles.locationItem}
                onPress={() => {
                  setFieldValue('state', item.id);
                  setFieldValue('city', '');
                  setShowStatePicker(false);
                  // Fetch cities for this state
                  (async () => {
                    const cities = await fetchCityList(item.id);
                    setFilteredCities(cities);
                  })();
                }}>
                <Text style={styles.locationItemText}>{item.name}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={() => <View style={styles.emptyContainer}><Text style={styles.emptyText}>No states found</Text></View>}
          />
        </View>
      </View>
    </Modal>
  );

  const renderCityPicker = (setFieldValue: any) => (
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
            data={filteredCities.filter(city => city.name.toLowerCase().includes(citySearch.toLowerCase()))}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.locationItem}
                onPress={() => {
                  setFieldValue('city', item.id);
                  setShowCityPicker(false);
                }}>
                <Text style={styles.locationItemText}>{item.name}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={() => <View style={styles.emptyContainer}><Text style={styles.emptyText}>No cities found</Text></View>}
          />
        </View>
      </View>
    </Modal>
  );

  // Initial form values (extract from `data`)
  const initialValues = {
    first_name: data.profile.first_name || '',
    last_name: data.profile.last_name || '',
    username: data.profile.username || '',
    bio: data.profile.bio || '',
    email: data.profile.email || '',
    phone_no: data.profile.phone_no || '',
    business_name: data?.vendor_profile?.business_name || '',
    description: data?.vendor_profile?.description || '',
    main_categories: data?.vendor_profile?.main_categories?.map(cat => cat.id) || [],
    selected_subcategories: data?.vendor_profile?.subcategories?.map(sub => sub.id) || [],
    aadhar_number: data?.vendor_profile?.aadhar_number || '',
    achievement_awards: data?.vendor_profile?.achievement_awards || '',
    business_presence: data?.vendor_profile?.business_presence || '',
    business_type: data?.vendor_profile?.business_type || '',
    company_registration: data?.vendor_profile?.company_registration || '',
    gst_number: data?.vendor_profile?.gst_number || '',
    pan_number: data?.vendor_profile?.pan_number || '',
    perma_link: data?.vendor_profile?.perma_link || '',
    status: data?.vendor_profile?.status || 'published',
    country: data.profile.country?.id || '',
    state: data.profile.state?.id || '',
    city: data.profile.city?.id || '',
    // file fields: leave empty, will handle with local state
  };

  // Validation schema (remove unnecessary fields for now)
  const validationSchema = Yup.object({
    first_name: Yup.string().required('First Name is required'),
    last_name: Yup.string().required('Last Name is required'),
    username: Yup.string().required('Username is required'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    phone_no: Yup.string().required('Phone number is required'),
    business_name: Yup.string().when([], {
      is: () => role === 'vendor',
      then: Yup.string().required('Business Name is required')
    }),
    // ... more validation as needed ...
  });

  // Submit handler
  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      for (let key in values) {
        formData.append(key, values[key]);
      }
      // Attach files if selected
      if (logoFile?.uri) {
        formData.append('logo', {
          uri: logoFile.uri,
          type: logoFile.type || 'image/jpeg',
          name: logoFile.fileName || 'logo.jpg',
        });
      }
      // Profile image
      if (profileImage && !profileImage.startsWith('http')) {
        formData.append('profile_picture', {
          uri: profileImage,
          type: 'image/jpeg',
          name: 'profile.jpg',
        });
      }
      // ... repeat for other document fields if needed

      const response = await api.patch(`/profile/${userId}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data) {
        Alert.alert('Success', 'Profile updated successfully');
        navigation.navigate('Profile')
      } else {
        Alert.alert('Error', 'Failed to update profile');
      }
    } catch (error: any) {
      console.error('Error:', error);
      Alert.alert('Error', error.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  // Main render
  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Back Arrow */}
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#bea063" />
        </TouchableOpacity>
        <Text style={styles.header}>Edit Profile</Text>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.formContainer}>
          {/* Profile Image */}
          <View style={styles.profileImageContainer}>
            {profileImage ? (
              <Image source={{uri: profileImage}} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImagePlaceholder} />
            )}
            <TouchableOpacity onPress={() => pickImage(setProfileImage)}>
              <Text style={styles.selectPhotoText}>Select Profile Photo</Text>
            </TouchableOpacity>
          </View>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ handleChange, handleBlur, handleSubmit, setFieldValue, values, errors, touched, isSubmitting }) => (
              <>
                <Text style={styles.sectionTitle}>Personal Information</Text>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>First Name</Text>
                  <TextInput
                    style={styles.input}
                    value={values.first_name}
                    onChangeText={handleChange('first_name')}
                    onBlur={handleBlur('first_name')}
                  />
                  {touched.first_name && errors.first_name && <Text style={styles.errorText}>{errors.first_name}</Text>}
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Last Name</Text>
                  <TextInput
                    style={styles.input}
                    value={values.last_name}
                    onChangeText={handleChange('last_name')}
                    onBlur={handleBlur('last_name')}
                  />
                  {touched.last_name && errors.last_name && <Text style={styles.errorText}>{errors.last_name}</Text>}
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Username</Text>
                  <TextInput
                    style={styles.input}
                    value={values.username}
                    onChangeText={handleChange('username')}
                    onBlur={handleBlur('username')}
                  />
                  {touched.username && errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Bio</Text>
                  <TextInput
                    style={styles.input}
                    value={values.bio}
                    onChangeText={handleChange('bio')}
                    onBlur={handleBlur('bio')}
                  />
                  {touched.bio && errors.bio && <Text style={styles.errorText}>{errors.bio}</Text>}
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={styles.input}
                    value={values.email}
                    editable={false}
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                  />
                  {touched.email && errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Phone No</Text>
                  <TextInput
                  editable={false}
                    style={styles.input}
                    value={values.phone_no}
                    onChangeText={handleChange('phone_no')}
                    onBlur={handleBlur('phone_no')}
                  />
                  {touched.phone_no && errors.phone_no && <Text style={styles.errorText}>{errors.phone_no}</Text>}
                </View>
                {/* Location */}
                <Text style={styles.sectionTitle}>Location Information</Text>
                <View style={styles.locationContainer}>
                  <TouchableOpacity style={styles.locationField} onPress={() => setShowCountryPicker(true)}>
                    <Text style={styles.locationLabel}>Country</Text>
                    <Text style={styles.locationValue}>
                      {values.country
                        ? allCountries.find(c => c.id === values.country)?.country_name ||
                          allCountries.find(c => c.id === values.country)?.name
                        : 'Select Country'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.locationField,
                      !values.country && styles.locationFieldDisabled,
                    ]}
                    onPress={() => values.country && setShowStatePicker(true)}
                    disabled={!values.country}>
                    <Text style={styles.locationLabel}>State</Text>
                    <Text
                      style={[
                        styles.locationValue,
                        !values.country && styles.locationValueDisabled,
                      ]}>
                      {values.state
                        ? filteredStates.find(s => s.id === values.state)?.name
                        : 'Select State'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.locationField,
                      !values.state && styles.locationFieldDisabled,
                    ]}
                    onPress={() => values.state && setShowCityPicker(true)}
                    disabled={!values.state}>
                    <Text style={styles.locationLabel}>City</Text>
                    <Text
                      style={[
                        styles.locationValue,
                        !values.state && styles.locationValueDisabled,
                      ]}>
                      {values.city
                        ? filteredCities.find(c => c.id === values.city)?.name
                        : 'Select City'}
                    </Text>
                  </TouchableOpacity>
                </View>
                {renderCountryPicker(setFieldValue)}
                {renderStatePicker(setFieldValue, values.country)}
                {renderCityPicker(setFieldValue)}

                {/* Vendor fields go here, use Formik as above */}

                <TouchableOpacity
                  style={styles.button}
                  onPress={handleSubmit}
                  disabled={isSubmitting}>
                  <Text style={styles.buttonText}>
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </Formik>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  content: {padding: 20, paddingBottom: 40},
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#bea063',
    flex: 1,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#bea063',
    marginTop: 20,
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#fafafa',
    borderRadius: 5,
    padding: 15,
    fontSize: 16,
    marginBottom: 10,
  },
  picker: {
    backgroundColor: '#fafafa',
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
  },
  loadMoreButton: {
    padding: 8,
    alignItems: 'center',
    marginTop: -6,
    marginBottom: 16,
  },
  loadMore: {color: '#bea063', fontSize: 14},
  button: {
    backgroundColor: '#bea063',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  buttonText: {color: '#fff', fontSize: 16, fontWeight: '600'},
  passwordField: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#dbdbdb',
    borderRadius: 5,
    backgroundColor: '#fafafa',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  passwordInput: {flex: 1, padding: 12, fontSize: 16},
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
  modalHeader: {flexDirection: 'row', alignItems: 'center', marginBottom: 10},
  modalTitle: {flex: 1, fontSize: 18, fontWeight: 'bold'},
  closeButton: {fontSize: 16, fontWeight: 'bold'},
  searchInput: {
    backgroundColor: '#fafafa',
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
  },
  locationItem: {padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc'},
  locationItemText: {fontSize: 16},
  loadingContainer: {padding: 10, alignItems: 'center'},
  locationContainer: {marginBottom: 20},
  locationField: {
    backgroundColor: '#fafafa',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 15,
    marginBottom: 10,
  },
  locationLabel: {fontSize: 12, color: '#666', marginBottom: 5},
  locationValue: {fontSize: 16, color: '#000'},
  locationValueDisabled: {color: '#999'},
  profileImageContainer: {alignItems: 'center', marginBottom: 20},
  profileImage: {width: 100, height: 100, borderRadius: 50},
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ccc',
  },
  selectPhotoText: {marginTop: 10, color: '#bea063', fontSize: 14},
  locationFieldDisabled: {opacity: 0.5},
  formContainer: {},
  submitButton: {
    backgroundColor: '#bea063',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  submitButtonText: {color: '#fff', fontSize: 16, fontWeight: '600'},
  emptyContainer: {padding: 20, alignItems: 'center'},
  emptyText: {color: '#666', fontSize: 16},
  dropcontainer: {
    backgroundColor: 'white',
    padding: 16,
  },
  dropdown: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  icon: {
    marginRight: 5,
  },
  label: {
    // position: 'absolute',
    backgroundColor: 'white',
    // left: 22,
    // top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  formMainContainer: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    margin: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    alignItems: 'stretch',
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#bea063',
    marginBottom: 24,
    alignSelf: 'flex-start',
  },
  formGroup: {
    marginBottom: 20,
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  fileButton: {
    backgroundColor: '#bea063',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignItems: 'center',
    marginTop: 6,
  },
  fileButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  fileName: {
    marginTop: 6,
    color: '#888',
    fontSize: 14,
  },
  filePreview: {
    width: 80,
    height: 80,
    marginVertical: 8,
    borderRadius: 8,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
  },
  headerSpacer: {
    width: 40,
  },
});
// ... your styles stay unchanged ...

export default EditProfile;
