import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, Alert, Image, ActivityIndicator, Modal, FlatList
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Navigation/types';
import { launchImageLibrary } from 'react-native-image-picker';
import { fetchCountries, fetchStates, fetchCities, registerUser } from '../../Api/Api';
import Icon from 'react-native-vector-icons/Ionicons';

const MAIN_CATEGORIES = ["Yog", "Meditation", "Spiritual", "Holistic"];
const SUBCATEGORIES = ["Centre", "Guru", "Yogi", "Yogini", "Teacher", "Education", "Online", "Wellness centre"];
const ITEMS_PER_PAGE = 10;

const EditProfileScreen = ({ navigation, route }) => {
  const { role: initialRole } = route.params || { role: 'user' };
  const [role, setRole] = useState(initialRole);
  const [profileImage, setProfileImage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
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
  const [main_categories, setMainCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [status, setStatus] = useState('published');
  // Location states
  const [allCountries, setAllCountries] = useState([]);
  const [filteredStates, setFilteredStates] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
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
  const [countrySearch, setCountrySearch] = useState('');
  const [stateSearch, setStateSearch] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { loadCountries(); }, []);

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

  const loadStates = async (countryId) => {
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

  const loadCities = async (stateId) => {
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
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, response => {
      if (response.assets && response.assets.length > 0 && response.assets[0].uri) {
        setProfileImage(response.assets[0].uri);
      }
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    let formData = new FormData();
    const user = {
      first_name,
      last_name,
      email,
      phone_no,
      username,
      password,
      // country: selectedCountry ? selectedCountry.id.toString() : '',
      // state: selectedState ? selectedState.id.toString() : '',
      // city: selectedCity ? selectedCity.id.toString() : '',
      role,
    };
    formData.append('user', JSON.stringify(user));
    const profile = { bio };
    formData.append('profile', JSON.stringify(profile));
    if (role === 'vendor') {
      const vendor = {
        business_name,
        main_categories,
        subcategories,
      };
      formData.append('vendor', JSON.stringify(vendor));
    }
    if (profileImage) {
      formData.append('profile_image', {
        uri: profileImage,
        type: 'image/jpeg',
        name: 'profile.jpg',
      });
    }
    try {
      const response = await registerUser(formData);
      if (response.status === 200) {
        Alert.alert('Success', 'Profile updated!');
        navigation.navigate('Profile');
      } else {
        Alert.alert('Error', response.data.message || 'Update failed.');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'An error occurred during update.');
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
        <Text style={styles.header}>Edit Profile</Text>
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
          <Text style={styles.label}>First Name</Text>
          <TextInput style={styles.input} value={first_name} onChangeText={setFirstName} />
          <Text style={styles.label}>Last Name</Text>
          <TextInput style={styles.input} value={last_name} onChangeText={setLastName} />
          <Text style={styles.label}>Username</Text>
          <TextInput style={styles.input} value={username} onChangeText={setUsername} />
          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} />
          <Text style={styles.label}>Phone No</Text>
          <TextInput style={styles.input} value={phone_no} onChangeText={setPhoneNo} />

          {/* Security Information */}
          <Text style={styles.sectionTitle}>Security Information</Text>
          <View style={styles.passwordField}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Icon name={showPassword ? 'eye' : 'eye-off'} size={20} color="#888" />
            </TouchableOpacity>
          </View>
          <View style={styles.passwordField}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Confirm Password"
              secureTextEntry={!showConfirmPassword}
              value={confirm_password}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Icon name={showConfirmPassword ? 'eye' : 'eye-off'} size={20} color="#888" />
            </TouchableOpacity>
          </View>

          {/* Vendor-specific fields */}
          {role === 'vendor' && (
            <>
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
              {/* {renderCountryPicker()}
              {renderStatePicker()}
              {renderCityPicker()} */}
              <Text style={styles.sectionTitle}>Business Information</Text>
              <Text style={styles.label}>Business Name</Text>
              <TextInput style={styles.input} value={business_name} onChangeText={setBusinessName} />
              <Text style={styles.sectionTitle}>Categories</Text>
              <Text style={styles.label}>Main Categories (comma separated)</Text>
              <TextInput style={styles.input} value={main_categories.join(',')} onChangeText={text => setMainCategories(text.split(','))} />
              <Text style={styles.label}>Subcategories (comma separated)</Text>
              <TextInput style={styles.input} value={subcategories.join(',')} onChangeText={text => setSubcategories(text.split(','))} />
            </>
          )}

          <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={isSubmitting}>
            <Text style={styles.buttonText}>{isSubmitting ? 'Saving...' : 'Save Changes'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 40 },
  header: { fontSize: 22, fontWeight: 'bold', marginVertical: 16, alignSelf: 'center', color: '#bea063' },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#bea063', marginTop: 20, marginBottom: 10 },
  input: { backgroundColor: '#fafafa', borderRadius: 5, padding: 15, fontSize: 16, marginBottom: 10 },
  picker: { backgroundColor: '#fafafa', borderColor: '#ccc', borderWidth: 1, marginBottom: 10 },
  loadMoreButton: { padding: 8, alignItems: 'center', marginTop: -6, marginBottom: 16 },
  loadMore: { color: '#bea063', fontSize: 14 },
  button: { backgroundColor: '#bea063', padding: 15, borderRadius: 5, alignItems: 'center', marginTop: 24, marginBottom: 40 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  passwordField: { flexDirection: 'row', alignItems: 'center', borderColor: '#dbdbdb', borderRadius: 5, backgroundColor: '#fafafa', paddingHorizontal: 10, marginBottom: 10 },
  passwordInput: { flex: 1, padding: 12, fontSize: 16 },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 10, width: '80%', maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  modalTitle: { flex: 1, fontSize: 18, fontWeight: 'bold' },
  closeButton: { fontSize: 16, fontWeight: 'bold' },
  searchInput: { backgroundColor: '#fafafa', borderColor: '#ccc', borderWidth: 1, padding: 10, marginBottom: 10 },
  locationItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  locationItemText: { fontSize: 16 },
  loadingContainer: { padding: 10, alignItems: 'center' },
  locationContainer: { marginBottom: 20 },
  locationField: { backgroundColor: '#fafafa', borderColor: '#ccc', borderWidth: 1, borderRadius: 5, padding: 15, marginBottom: 10 },
  locationLabel: { fontSize: 12, color: '#666', marginBottom: 5 },
  locationValue: { fontSize: 16, color: '#000' },
  locationValueDisabled: { color: '#999' },
  profileImageContainer: { alignItems: 'center', marginBottom: 20 },
  profileImage: { width: 100, height: 100, borderRadius: 50 },
  profileImagePlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#ccc' },
  selectPhotoText: { marginTop: 10, color: '#bea063', fontSize: 14 },
  locationFieldDisabled: { opacity: 0.5 },
  formContainer: {},
  submitButton: { backgroundColor: '#bea063', padding: 15, borderRadius: 5, alignItems: 'center', marginTop: 24, marginBottom: 40 },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  emptyContainer: { padding: 20, alignItems: 'center' },
  emptyText: { color: '#666', fontSize: 16 },
});

export default EditProfileScreen;
