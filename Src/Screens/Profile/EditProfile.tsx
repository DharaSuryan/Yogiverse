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
import {useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../Navigation/types';
import {launchImageLibrary} from 'react-native-image-picker';
import api, {
  fetchCountries,
  fetchStates,
  fetchCities,
  registerUser,
  editProfile,
} from '../../Api/Api';
import Icon from 'react-native-vector-icons/Ionicons';
import MainCategoryScreen from '../Auth/MainCategory';
import SubCategoryScreen from '../Auth/SubCategory';
import {Dropdown, MultiSelect} from 'react-native-element-dropdown';
import DocumentPicker from 'react-native-document-picker';

// Types
interface Location {
  id: number;
  name: string;
  country_name?: string;
}

interface Category {
  id: number;
  category_name: string;
  categories: number;
  sub_categories?: any[];
}

interface ProfileData {
  profile: {
    id: number;
    bio: string;
    city: Location | null;
    country: Location | null;
    email: string;
    external_links: any[];
    first_name: string;
    last_name: string;
    phone_no: string;
    profile_link: string;
    profile_picture: string | null;
    state: Location | null;
    user: number;
    username: string;
  };
  role: string;
  vendor_profile: {
    aadhar_document: string | null;
    aadhar_number: string | null;
    achievement_awards: string | null;
    business_name: string;
    business_presence: string | null;
    business_type: string | null;
    company_registration: string | null;
    created_at: string;
    description: string;
    gst_document: string | null;
    gst_number: string | null;
    id: number;
    logo: string | null;
    main_categories: any[];
    msme_certificate: string | null;
    pan_document: string | null;
    pan_number: string | null;
    perma_link: string | null;
    status: string;
    store_owner: any;
    subcategories: any[];
    updated_at: string;
  };
}



const ITEMS_PER_PAGE = 10;

const {width} = Dimensions.get('window');

const EditProfile = ({navigation, route}: any) => {
  const {role: initialRole, data}: {role: string; data: ProfileData} = route.params || {role: 'user'};

  console.log('route.params', route.params.data);

  const [role, setRole] = useState(initialRole);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [first_name, setFirstName] = useState('');
  const [last_name, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone_no, setPhoneNo] = useState('');
  const [password, setPassword] = useState('');
  const [confirm_password, setConfirmPassword] = useState('');
  const [bio, setBio] = useState('');
  const [business_name, setBusinessName] = useState('');
  const [main_categories, setMainCategories] = useState<any[]>([]);
  const [status, setStatus] = useState('published');
  // Location states
  const [allCountries, setAllCountries] = useState<Location[]>([]);
  const [filteredStates, setFilteredStates] = useState<Location[]>([]);
  const [filteredCities, setFilteredCities] = useState<Location[]>([]);
  const [countryPage, setCountryPage] = useState(1);
  const [statePage, setStatePage] = useState(1);
  const [cityPage, setCityPage] = useState(1);
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);
  const [isLoadingStates, setIsLoadingStates] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [hasMoreCountries, setHasMoreCountries] = useState(true);
  const [hasMoreStates, setHasMoreStates] = useState(true);
  const [hasMoreCities, setHasMoreCities] = useState(true);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showStatePicker, setShowStatePicker] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Location | null>(null);
  const [selectedState, setSelectedState] = useState<Location | null>(null);
  const [selectedCity, setSelectedCity] = useState<Location | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoryList, setCategoryList] = useState<any>();
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [value, setValue] = useState<string[]>([]);
  const [isFocus, setIsFocus] = useState(false);

  // Vendor-specific fields
  const [aadhar_number, setAadharNumber] = useState('');
  const [aadhar_document, setAadharDocument] = useState<string | null>(null);
  const [achievement_awards, setAchievementAwards] = useState('');
  const [business_presence, setBusinessPresence] = useState('');
  const [business_type, setBusinessType] = useState('');
  const [company_registration, setCompanyRegistration] = useState('');
  const [gst_number, setGstNumber] = useState('');
  const [gst_document, setGstDocument] = useState<string | null>(null);
  const [logo, setLogo] = useState<string | null>(null);
  const [msme_certificate, setMsmeCertificate] = useState<string | null>(null);
  const [pan_number, setPanNumber] = useState('');
  const [pan_document, setPanDocument] = useState<string | null>(null);
  const [perma_link, setPermaLink] = useState('');

  // Add this state at the top with other useState hooks:
  const [availableSubCategories, setAvailableSubCategories] = useState<any[]>([]);
  const [selectedSubCategoryIds, setSelectedSubCategoryIds] = useState<number[]>([]);

  // Add to state:
  const [logoFile, setLogoFile] = useState<any>(null);
  const [bannerFile, setBannerFile] = useState<any>(null);
  const [panFile, setPanFile] = useState<any>(null);
  const [aadharFile, setAadharFile] = useState<any>(null);
  const [gstFile, setGstFile] = useState<any>(null);
  const [companyRegFile, setCompanyRegFile] = useState<any>(null);
  const [msmeFile, setMsmeFile] = useState<any>(null);
  const [userId,setUserId]=useState(data.profile.user)
  useEffect(() => {
    loadCountries();
  }, []);

  useEffect(() => {
    console.log("route.params.data.profile.user",route.params.data.profile.user);
    if (data) {
      setFirstName(data?.profile?.first_name || '');
      setLastName(data?.profile?.last_name || '');
      setUsername(data?.profile?.username || '');
      setBio(data?.profile?.bio || '');
      setEmail(data?.profile?.email || '');
      setPhoneNo(data?.profile?.phone_no || '');
      setSelectedCountry(data?.profile?.country);
      setSelectedState(data?.profile?.state);
      setSelectedCity(data?.profile?.city);
      
      if (data.role === 'vendor' && data.vendor_profile) {
        setBusinessName(data.vendor_profile.business_name || '');
        setDescription(data.vendor_profile.description || '');
        setAadharNumber(data.vendor_profile.aadhar_number || '');
        setAchievementAwards(data.vendor_profile.achievement_awards || '');
        setBusinessPresence(data.vendor_profile.business_presence || '');
        setBusinessType(data.vendor_profile.business_type || '');
        setCompanyRegistration(data.vendor_profile.company_registration || '');
        setGstNumber(data.vendor_profile.gst_number || '');
        setPanNumber(data.vendor_profile.pan_number || '');
        setPermaLink(data.vendor_profile.perma_link || '');
        setStatus(data.vendor_profile.status || 'published');
        // Set main categories for MultiSelect
        if (Array.isArray(data.vendor_profile.main_categories)) {
          setValue(data.vendor_profile.main_categories.map(cat => cat.categories || cat.id));
          // Set available subcategories from all selected main categories
          const selectedMainCats = categories.filter(cat =>
            data.vendor_profile.main_categories.some(sel => sel.categories === cat.categories || sel.id === cat.id)
          );
          const allSubCats = selectedMainCats.flatMap(cat => cat.sub_categories || []);
          setAvailableSubCategories(allSubCats);
        }
        // Set selected subcategories
        if (Array.isArray(data.vendor_profile.subcategories)) {
          setSelectedSubCategoryIds(data.vendor_profile.subcategories.map(sub => sub.id));
        }
      }
    }
  }, [data, categories]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await api.get('main_with_sub_categories/');

        setCategories(res.data.data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const loadCountries = async () => {
    if (isLoadingCountries || !hasMoreCountries) return;
    try {
      setIsLoadingCountries(true);
      const response = await fetchCountries(countryPage, ITEMS_PER_PAGE);
      let countries;
      if (response.data && Array.isArray(response.data.data)) {
        countries = response.data.data;
      } else {
        countries = [];
      }
      if (countries.length === 0) {
        setHasMoreCountries(false);
      } else {
        setAllCountries(prev => [...prev, ...countries]);
        setCountryPage(prev => prev + 1);
        setHasMoreCountries(true);
      }
    } catch (error) {
      setHasMoreCountries(false);
    } finally {
      setIsLoadingCountries(false);
    }
  };

  const loadStates = async (countryId: number) => {
    if (isLoadingStates || !hasMoreStates) return;
    try {
      setIsLoadingStates(true);
      const response = await fetchStates(countryId, statePage, ITEMS_PER_PAGE);
      let states;
      if (response.data && Array.isArray(response.data.data)) {
        states = response.data.data;
      } else {
        states = [];
      }
      if (states.length === 0) {
        setHasMoreStates(false);
      } else {
        setFilteredStates(prev => [...prev, ...states]);
        setStatePage(prev => prev + 1);
        setHasMoreStates(true);
      }
    } catch (error) {
      setHasMoreStates(false);
    } finally {
      setIsLoadingStates(false);
    }
  };

  const loadCities = async (stateId: number) => {
    if (isLoadingCities || !hasMoreCities) return;
    try {
      setIsLoadingCities(true);
      const response = await fetchCities(stateId, cityPage, ITEMS_PER_PAGE);
      let cities;
      if (response.data && Array.isArray(response.data.data)) {
        cities = response.data.data;
      } else {
        cities = [];
      }
      if (cities.length === 0) {
        setHasMoreCities(false);
      } else {
        setFilteredCities(prev => [...prev, ...cities]);
        setCityPage(prev => prev + 1);
        setHasMoreCities(true);
      }
    } catch (error) {
      setHasMoreCities(false);
    } finally {
      setIsLoadingCities(false);
    }
  };

  const handleImagePick = () => {
    launchImageLibrary({mediaType: 'photo', quality: 0.8}, response => {
      if (
        response.assets &&
        response.assets.length > 0 &&
        response.assets[0].uri
      ) {
        setProfileImage(response.assets[0].uri);
      }
    });
  };

  const pickImage = async (setter: (file: any) => void) => {
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
      if (DocumentPicker.isCancel(err)) return;
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const profileData = {
        user: {
          first_name,
          last_name,
          email,
          phone_no,
          username,
          role,
        },
        profile: {
          bio,
          country: selectedCountry?.id,
          state: selectedState?.id,
          city: selectedCity?.id,
        },
        vendor_profile: {
          business_name,
          description,
          aadhar_number,
          achievement_awards,
          business_presence,
          business_type,
          company_registration,
          gst_number,
          pan_number,
          perma_link,
          status,
          main_categories: categoryList || [],
        }
      };

      const formData = new FormData();
      formData.append('first_name', first_name);
      formData.append('last_name', last_name);
      formData.append('email', email);
      formData.append('phone_no', phone_no);
      formData.append('username', username);
      formData.append('bio', bio);
      formData.append('business_name', business_name);
      formData.append('role', role);
      formData.append('status', status);
      formData.append('country', selectedCountry?.id?.toString() || '');
      formData.append('state', selectedState?.id?.toString() || '');
      formData.append('city', selectedCity?.id?.toString() || '');
      formData.append('description', description);
      formData.append('aadhar_number', aadhar_number);
      formData.append('achievement_awards', achievement_awards);
      formData.append('business_presence', business_presence);
      formData.append('business_type', business_type);
      formData.append('company_registration', company_registration);
      formData.append('gst_number', gst_number);
      formData.append('pan_number', pan_number);
      formData.append('perma_link', perma_link);
      formData.append('main_categories', JSON.stringify(categoryList || []));
      formData.append('selected_subcategories', JSON.stringify(selectedSubCategoryIds));
      formData.append('selected_categories', JSON.stringify(selectedCategories));
      formData.append('value', JSON.stringify(value));
      formData.append('selected_country', selectedCountry?.id?.toString() || '');
      formData.append('selected_state', selectedState?.id?.toString() || '');
      formData.append('selected_city', selectedCity?.id?.toString() || '');

      if (logoFile && logoFile.uri) {
        formData.append('logo', {
          uri: logoFile.uri,
          type: logoFile.type || 'image/jpeg',
          name: logoFile.fileName || 'logo.jpg',
        });
      }

      const response = await api.patch(`/profile/${userId}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
console.log("response",response);

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
      setIsSubmitting(false);
    }
  };

  // Pickers

  const renderCityPicker = () => (
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
                  setSelectedCity(item);
                  setShowCityPicker(false);
                }}>
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
        <Text style={styles.header}>Edit Profile</Text>
        <View style={styles.formContainer}>
          {/* Profile Image */}
          <View style={styles.profileImageContainer}>
            {profileImage ? (
              <Image source={{uri: profileImage}} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImagePlaceholder} />
            )}
            <TouchableOpacity onPress={handleImagePick}>
              <Text style={styles.selectPhotoText}>Select Profile Photo</Text>
            </TouchableOpacity>
          </View>

          {/* Personal Information */}
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.formGroup}>
            <Text style={styles.label}>First Name</Text>
            <TextInput style={styles.input} value={first_name} onChangeText={setFirstName} />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Last Name</Text>
            <TextInput style={styles.input} value={last_name} onChangeText={setLastName} />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Username</Text>
            <TextInput style={styles.input} value={username} onChangeText={setUsername} />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Bio</Text>
            <TextInput style={styles.input} value={bio} onChangeText={setBio} />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Phone No</Text>
            <TextInput style={styles.input} value={phone_no} onChangeText={setPhoneNo} />
          </View>

          {/* Security Information */}
         
          {/* Vendor-specific fields */}
         
              <Text style={styles.sectionTitle}>Location Information</Text>
              <View style={styles.locationContainer}>
                <TouchableOpacity
                  style={styles.locationField}
                  onPress={() => setShowCountryPicker(true)}>
                  <Text style={styles.locationLabel}>Country</Text>
                  <Text style={styles.locationValue}>
                    {selectedCountry
                      ? selectedCountry.name || selectedCountry.country_name
                      : 'Select Country'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.locationField,
                    !selectedCountry && styles.locationFieldDisabled,
                  ]}
                  onPress={() => selectedCountry && setShowStatePicker(true)}
                  disabled={!selectedCountry}>
                  <Text style={styles.locationLabel}>State</Text>
                  <Text
                    style={[
                      styles.locationValue,
                      !selectedCountry && styles.locationValueDisabled,
                    ]}>
                    {selectedState ? selectedState.name : 'Select State'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.locationField,
                    !selectedState && styles.locationFieldDisabled,
                  ]}
                  onPress={() => selectedState && setShowCityPicker(true)}
                  disabled={!selectedState}>
                  <Text style={styles.locationLabel}>City</Text>
                  <Text
                    style={[
                      styles.locationValue,
                      !selectedState && styles.locationValueDisabled,
                    ]}>
                    {selectedCity ? selectedCity.name : 'Select City'}
                  </Text>
                </TouchableOpacity>
              </View>
              {renderCityPicker()}
          
          
 {/* Vendor profile */}
 {data.role === 'vendor' && (
          <ScrollView contentContainerStyle={styles.formMainContainer}>
            <Text style={styles.sectionHeader}>Vendor Profile</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Business Name</Text>
              <TextInput style={styles.input} value={business_name} onChangeText={setBusinessName} placeholder="Business Name" />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description (0/200)</Text>
              <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} placeholder="Short business description" multiline />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Main Categories</Text>
              <MultiSelect
                style={[styles.dropdown, isFocus && {borderColor: 'blue'}]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                iconStyle={styles.iconStyle}
                data={categories.map(cat => ({
                  label: cat.category_name,
                  value: String(cat.categories),
                }))}
                search
                maxHeight={300}
                labelField="label"
                valueField="value"
                searchPlaceholder="Search..."
                value={value.map(String)}
                onFocus={() => setIsFocus(true)}
                onChange={selectedValues => {
                  setValue(selectedValues.map(v => Number(v)));
                  const selectedMainCats = categories.filter(cat => selectedValues.map(Number).includes(cat.categories));
                  const allSubCats = selectedMainCats.flatMap(cat => cat.sub_categories || []);
                  setAvailableSubCategories(allSubCats);
                  setSelectedSubCategoryIds([]);
                }}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Subcategories</Text>
              <TextInput
                style={styles.input}
                value={availableSubCategories.filter(sub => selectedSubCategoryIds.includes(sub.id)).map(sub => sub.name).join(', ')}
                editable={false}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Logo</Text>
              <TouchableOpacity style={styles.fileButton} onPress={() => pickImage(setLogoFile)}>
                <Text style={styles.fileButtonText}>Choose Image</Text>
              </TouchableOpacity>
              {logoFile && logoFile.uri && (
                <Image source={{uri: logoFile.uri}} style={styles.filePreview} />
              )}
              {!logoFile && <Text style={styles.fileName}>No file chosen</Text>}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>PAN Number</Text>
              <TextInput
                style={styles.input}
                value={pan_number}
                onChangeText={setPanNumber}
              />
              <TouchableOpacity style={styles.fileButton} onPress={() => pickDocument(setPanFile)}>
                <Text style={styles.fileButtonText}>Choose File</Text>
              </TouchableOpacity>
              {panFile && panFile.name && <Text style={styles.fileName}>{panFile.name}</Text>}
              {!panFile && <Text style={styles.fileName}>No file chosen</Text>}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Aadhar Number</Text>
              <TextInput
                style={styles.input}
                value={aadhar_number}
                onChangeText={setAadharNumber}
              />
              <TouchableOpacity style={styles.fileButton} onPress={() => pickDocument(setAadharFile)}>
                <Text style={styles.fileButtonText}>Choose File</Text>
              </TouchableOpacity>
              {aadharFile && aadharFile.name && <Text style={styles.fileName}>{aadharFile.name}</Text>}
              {!aadharFile && <Text style={styles.fileName}>No file chosen</Text>}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>GST Number</Text>
              <TextInput
                style={styles.input}
                value={gst_number}
                onChangeText={setGstNumber}
              />
              <TouchableOpacity style={styles.fileButton} onPress={() => pickDocument(setGstFile)}>
                <Text style={styles.fileButtonText}>Choose File</Text>
              </TouchableOpacity>
              {gstFile && gstFile.name && <Text style={styles.fileName}>{gstFile.name}</Text>}
              {!gstFile && <Text style={styles.fileName}>No file chosen</Text>}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Company Registration</Text>
              <TextInput
                style={styles.input}
                value={company_registration}
                onChangeText={setCompanyRegistration}
              />
              <TouchableOpacity style={styles.fileButton} onPress={() => pickDocument(setCompanyRegFile)}>
                <Text style={styles.fileButtonText}>Choose File</Text>
              </TouchableOpacity>
              {companyRegFile && companyRegFile.name && <Text style={styles.fileName}>{companyRegFile.name}</Text>}
              {!companyRegFile && <Text style={styles.fileName}>No file chosen</Text>}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>MSME Certificate</Text>
              <TouchableOpacity style={styles.fileButton} onPress={() => pickDocument(setMsmeFile)}>
                <Text style={styles.fileButtonText}>Choose File</Text>
              </TouchableOpacity>
              {msmeFile && msmeFile.name && <Text style={styles.fileName}>{msmeFile.name}</Text>}
              {!msmeFile && <Text style={styles.fileName}>No file chosen</Text>}
            </View>
          </ScrollView>
 )}
          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit}
            disabled={isSubmitting}>
            <Text style={styles.buttonText}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  content: {padding: 20, paddingBottom: 40},
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 16,
    alignSelf: 'center',
    color: '#bea063',
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
});

export default EditProfile;
