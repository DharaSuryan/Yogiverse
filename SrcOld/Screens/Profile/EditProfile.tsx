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
  Modal,
  FlatList,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import api, {editProfile, fetchCountries} from '../../Api/Api';
import DocumentPicker from 'react-native-document-picker';
import {Formik} from 'formik';
import * as Yup from 'yup';
const Ionicons = require('react-native-vector-icons/Ionicons').default;

// --- Helper for FormData (arrays, files, empty checks) ---
const buildFormData = (values, files = {}) => {
  const formData = new FormData();
  Object.entries(values).forEach(([key, value]) => {
    // Arrays as repeated fields
    if (Array.isArray(value) && value.length > 0) {
      value.forEach(val => formData.append(key, val));
    } else if (key === 'country' || key === 'state' || key === 'city') {
      if (value) formData.append(key, value);
    } else if (typeof value === 'string' && value.trim() !== '') {
      formData.append(key, value);
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      formData.append(key, value);
    }
  });
  // Files (images/docs)
  Object.entries(files).forEach(([key, file]) => {
    if (file?.uri) {
      formData.append(key, {
        uri: file.uri,
        type: file.type || 'application/octet-stream',
        name: file.fileName || `${key}.jpg`,
      });
    }
  });
  return formData;
};

const EditProfile = ({navigation, route}: any) => {
  const {role: initialRole, data}: {role: string; data: any} = route.params || {
    role: 'user',
  };
  // console.log('datadata', data?.profile?.city);

  // State for non-Formik fields
  const [role, setRole] = useState(initialRole);
  const [profileImage, setProfileImage] = useState<string | null>(
    data?.profile?.profile_picture || null,
  );

  // Location and category picker states
  const [allCountries, setAllCountries] = useState<any[]>([]);
  const [filteredStates, setFilteredStates] = useState<any[]>([]);
  const [filteredCities, setFilteredCities] = useState<any[]>([]);
  const [countrySearch, setCountrySearch] = useState('');
  const [stateSearch, setStateSearch] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showStatePicker, setShowStatePicker] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);

  // File/image/document states (not managed by Formik directly)
  const [logoFile, setLogoFile] = useState<any>(null);
  const [bannerFile, setBannerFile] = useState<any>(null);
  const [panFile, setPanFile] = useState<any>(null);
  const [aadharFile, setAadharFile] = useState<any>(null);
  const [gstFile, setGstFile] = useState<any>(null);
  const [companyRegFile, setCompanyRegFile] = useState<any>(null);
  const [msmeFile, setMsmeFile] = useState<any>(null);

  // Categories/subcategories
  const [categories, setCategories] = useState<any[]>([]);
  const [userId, setUserId] = useState(data.profile.user);

  // --- Fetch countries & categories ---
  useEffect(() => {
    const fetchAllCountries = async () => {
      let page = 1,
        all: any[] = [];
      while (true) {
        const res = await fetchCountries(page, 10);
        if (!res?.data?.data) break;
        all = [...all, ...res.data.data];
        if (res.data.data.length < 10) break;
        page++;
      }
      setAllCountries(all);
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
    try {
      launchImageLibrary({mediaType: 'photo', quality: 0.8}, response => {
        if (response.assets && response.assets.length > 0) {
          const asset = response.assets[0];
          setter(asset.uri);
        }
      });
    } catch (error) {
      console.log("Error picking image: ", error);
      
      // Alert.alert('Error', 'Failed to pick image');
    // launchImageLibrary({mediaType: 'photo', quality: 0.8}, response => {
    //   if (response.assets && response.assets.length > 0) {
    //     setter(response.assets[0]);
    //   }
    // });
  };
}

  const pickDocument = async (setter: (file: any) => void) => {
    try {
      const res = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.allFiles],
      });
      setter(res);
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        Alert.alert('Error', 'Failed to pick document');
      }
    }
  };

  // --- Pickers for location ---
  const renderCountryPicker = (setFieldValue: any) => (
    <Modal
      visible={showCountryPicker}
      transparent
      animationType="slide"
      onRequestClose={() => setShowCountryPicker(false)}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Country</Text>
            <TouchableOpacity onPress={() => setShowCountryPicker(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            placeholderTextColor={'black'}
            style={styles.searchInput}
            placeholder="Search countries..."
            value={countrySearch}
            onChangeText={setCountrySearch}
          />
          <FlatList
            data={allCountries.filter(c =>
              (c?.country_name || c?.name || '')
                .toLowerCase()
                .includes(countrySearch.toLowerCase()),
            )}
            keyExtractor={item => item.id.toString()}
            renderItem={({item}) => (
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
                  <Text style={styles.countryName}>
                    {item.country_name || item.name}
                  </Text>
                  <Text style={styles.countryCodeText}>
                    +{item.calling_code}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
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

  const renderStatePicker = (setFieldValue: any, selectedCountryId: number) => (
    <Modal
      visible={showStatePicker}
      transparent
      animationType="slide"
      onRequestClose={() => setShowStatePicker(false)}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select State</Text>
            <TouchableOpacity onPress={() => setShowStatePicker(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            placeholderTextColor={'black'}
            style={styles.searchInput}
            placeholder="Search states..."
            value={stateSearch}
            onChangeText={setStateSearch}
          />
          <FlatList
            data={filteredStates.filter(s =>
              (s.name || '').toLowerCase().includes(stateSearch.toLowerCase()),
            )}
            keyExtractor={item => item.id.toString()}
            renderItem={({item}) => (
              <TouchableOpacity
                style={styles.locationItem}
                onPress={() => {
                  setFieldValue('state', item.id);
                  setFieldValue('city', '');
                  setShowStatePicker(false);
                  (async () => {
                    const cities = await fetchCityList(item.id);
                    setFilteredCities(cities);
                  })();
                }}>
                <Text style={styles.locationItemText}>{item.name}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No states found</Text>
              </View>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  const renderCityPicker = (setFieldValue: any) => (
    <Modal
      visible={showCityPicker}
      transparent
      animationType="slide"
      onRequestClose={() => setShowCityPicker(false)}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select City</Text>
            <TouchableOpacity onPress={() => setShowCityPicker(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            placeholderTextColor={'black'}
            style={styles.searchInput}
            placeholder="Search cities..."
            value={citySearch}
            onChangeText={setCitySearch}
          />
          <FlatList
            data={filteredCities.filter(city =>
              city.name.toLowerCase().includes(citySearch.toLowerCase()),
            )}
            keyExtractor={item => item.id.toString()}
            renderItem={({item}) => (
              <TouchableOpacity
                style={styles.locationItem}
                onPress={() => {
                  setFieldValue('city', item.id);
                  setShowCityPicker(false);
                }}>
                <Text style={styles.locationItemText}>{item.name}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No cities found</Text>
              </View>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  // --- Initial form values from props/data ---
  const initialValues = {
    first_name: data.profile.first_name || '',
    last_name: data.profile.last_name || '',
    username: data.profile.username || '',
    bio: data.profile.bio || '',
    email: data.profile.email || '',
    phone_no: data.profile.phone_no || '',
    business_name: data?.vendor_profile?.business_name || '',
    description: data?.vendor_profile?.description || '',
    main_categories:
      data?.vendor_profile?.main_categories?.map((cat: any) => cat.id) || [],
    selected_subcategories:
      data?.vendor_profile?.subcategories?.map((sub: any) => sub.id) || [],
    aadhar_number: data?.vendor_profile?.aadhar_number || '',
    achievement_awards: data?.vendor_profile?.achievement_awards || '',
    business_presence: data?.vendor_profile?.business_presence || '',
    business_type: data?.vendor_profile?.business_type || '',
    company_registration: data?.vendor_profile?.company_registration || '',
    gst_number: data?.vendor_profile?.gst_number || '',
    pan_number: data?.vendor_profile?.pan_number || '',
    perma_link: data?.vendor_profile?.perma_link || '',
    country: data.profile.country?.id || '',
    state: data.profile.state?.id || '',
    city: data.profile.city?.id || '',
    role: role,
  };

  // --- Validation schema ---
  const validationSchema = Yup.object({
    first_name: Yup.string().required('First Name is required'),
    last_name: Yup.string().required('Last Name is required'),
    username: Yup.string().required('Username is required'),
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    phone_no: Yup.string().required('Phone number is required'),
    business_name: Yup.string().when([], {
      is: () => role === 'vendor',
      then: Yup.string().required('Business Name is required'),
    }),
  });

  // --- Submit handler (uses buildFormData) ---
  const handleSubmit = async (values: any, {setSubmitting}: any) => {
    setSubmitting(true);
    try {
      // Collect files
      const files = {
        logo: logoFile,
        banner: bannerFile,
        pan: panFile,
        aadhar: aadharFile,
        gst: gstFile,
        company_registration: companyRegFile,
        msme: msmeFile,
        profile_picture:
          profileImage && !profileImage.startsWith('http')
            ? {uri: profileImage, type: 'image/jpeg', name: 'profile.jpg'}
            : null,
      };

      const formData = buildFormData(values, files);
      console.log('formdata  ;;;;;', formData);

      // Do not use formData.entries() in React Native!
      // If you want to see what's inside, you can log the keys:
      // console.log('FormData:', formData);

      const response = await editProfile(userId, formData);
      console.log('response', response);
      if (response?.status) {
        Alert.alert('Success', 'Profile updated successfully');
        navigation.goBack();
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error: any) {
      console.error('Error:', error);
      Alert.alert('Error', error.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  // --- Main render ---
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
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
              <View
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  backgroundColor: '#f5f5f5',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                {React.createElement(Ionicons, {
                  name: 'person-circle',
                  size: 100,
                  color: '#bea063',
                })}
              </View>
            )}
            <TouchableOpacity onPress={() => pickImage(setProfileImage)}>
              <Text style={styles.selectPhotoText}>Select Profile Photo</Text>
            </TouchableOpacity>
          </View>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}>
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              setFieldValue,
              values,
              errors,
              touched,
              isSubmitting,
            }) => (
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
                  {touched.first_name && errors.first_name && (
                    <Text style={styles.errorText}>{errors.first_name}</Text>
                  )}
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Last Name</Text>
                  <TextInput
                    style={styles.input}
                    value={values.last_name}
                    onChangeText={handleChange('last_name')}
                    onBlur={handleBlur('last_name')}
                  />
                  {touched.last_name && errors.last_name && (
                    <Text style={styles.errorText}>{errors.last_name}</Text>
                  )}
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Username</Text>
                  <TextInput
                    style={styles.input}
                    value={values.username}
                    onChangeText={handleChange('username')}
                    onBlur={handleBlur('username')}
                  />
                  {touched.username && errors.username && (
                    <Text style={styles.errorText}>{errors.username}</Text>
                  )}
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Bio</Text>
                  <TextInput
                    style={styles.input}
                    value={values.bio}
                    onChangeText={handleChange('bio')}
                    onBlur={handleBlur('bio')}
                  />
                  {touched.bio && errors.bio && (
                    <Text style={styles.errorText}>{errors.bio}</Text>
                  )}
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
                  {touched.email && errors.email && (
                    <Text style={styles.errorText}>{errors.email}</Text>
                  )}
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
                  {touched.phone_no && errors.phone_no && (
                    <Text style={styles.errorText}>{errors.phone_no}</Text>
                  )}
                </View>
                {/* Location */}
                <Text style={styles.sectionTitle}>Location Information</Text>
                
                <View style={styles.locationContainer}>
                  <TouchableOpacity
                    style={styles.locationField}
                    onPress={() => setShowCountryPicker(true)}>
                    <Text style={styles.locationLabel}>Country</Text>
                    <Text style={styles.locationValue}>
                      {values.country
                        ? (allCountries.find(c => c.id === values.country)
                            ?.country_name ||
                          allCountries.find(c => c.id === values.country)?.name)
                        :  data?.profile?.country ||  'Select Country'}
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
                        : data?.profile?.state ||  'Select State'}
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
                        :data?.profile?.city ||  'Select City'}
                    </Text>
                  </TouchableOpacity>
                </View>
                {renderCountryPicker(setFieldValue)}
                {renderStatePicker(setFieldValue, values.country)}
                {renderCityPicker(setFieldValue)}
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

// --- Styles ---
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
  button: {
    backgroundColor: '#bea063',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  buttonText: {color: '#fff', fontSize: 16, fontWeight: '600'},
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
  emptyContainer: {padding: 20, alignItems: 'center'},
  emptyText: {color: '#666', fontSize: 16},
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
  backButton: {padding: 8},
  headerSpacer: {width: 40},
  formGroup: {marginBottom: 20},
  errorText: {color: 'red', marginTop: -8, marginBottom: 10},
});

export default EditProfile;
