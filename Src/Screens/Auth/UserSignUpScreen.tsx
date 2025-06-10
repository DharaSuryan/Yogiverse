import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, Alert, Image
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Picker } from '@react-native-picker/picker';
import MultiSelect from 'react-native-multiple-select';
import { fetchCities, fetchCountries, fetchStates, registerUser } from '../../Api/Api';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';

const MAIN_CATEGORIES = ["Yog", "Meditation", "Spiritual", "Holistic"];
const SUBCATEGORIES = ["Centre", "Guru", "Yogi", "Yogini", "Teacher", "Education", "Online", "Wellness centre"];

const UserSchema = Yup.object().shape({
  first_name: Yup.string().required('Required'),
  last_name: Yup.string().required('Required'),
  username: Yup.string().required('Required'),
  phone_no: Yup.string().required('Required'),
  password: Yup.string().min(6).required('Required'),
  confirm_password: Yup.string().oneOf([Yup.ref('password')], 'Passwords must match').required('Required'),
  country: Yup.string().required('Required'),
  state: Yup.string().required('Required'),
  city: Yup.string().required('Required'),
});

const VendorSchema = Yup.object().shape({
  ...UserSchema.fields,
  business_name: Yup.string().required('Required'),
  main_categories: Yup.array().min(1, 'Select at least one'),
  subcategories: Yup.array().min(1, 'Select at least one'),
  status: Yup.string().oneOf(['published', 'locked']).required('Required'),
});

export default function SignUpScreen({ navigation, route }) {
  const { role: initialRole } = route.params;
  const [role, setRole] = useState(initialRole);
  const [profileImage, setProfileImage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [allCountries, setAllCountries] = useState([]);
  const [allStates, setAllStates] = useState([]);
  const [filteredStates, setFilteredStates] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);

  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        const countries = await fetchCountries();
        const states = await fetchStates();
        setAllCountries(countries);
        setAllStates(states);
      } catch (err) {
        console.error('Dropdown fetch error:', err);
      }
    };
    loadDropdowns();
  }, []);

  const pickImage = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
      },
      response => {
        if (response.assets && response.assets.length > 0) {
          setProfileImage(response.assets[0]);
        }
      }
    );
  };

  const userInitialValues = {
    first_name: '', last_name: '', username: '', phone_no: '',
    password: '', confirm_password: '', country: '', state: '', city: '',
  };

  const vendorInitialValues = {
    ...userInitialValues,
    business_name: '',
    main_categories: [],
    subcategories: [],
    status: '',
  };

  const initialValues = role === 'user' ? userInitialValues : vendorInitialValues;
  const validationSchema = role === 'user' ? UserSchema : VendorSchema;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>Sign Up as {role === 'user' ? 'User' : 'Vendor'}</Text>

        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          {profileImage ? (
            <Image source={{ uri: profileImage.uri }} style={{ width: 100, height: 100, borderRadius: 50 }} />
          ) : (
            <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: '#ccc' }} />
          )}
          <TouchableOpacity onPress={pickImage}>
            <Text style={{ marginTop: 10, color: '#bea063' }}>Select Profile Photo</Text>
          </TouchableOpacity>
        </View>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          enableReinitialize
          onSubmit={async values => {
            try {
              const response = await registerUser({ ...values, role });
              Alert.alert('Success', `${role} registered successfully!`);
              navigation.navigate('Login');
            } catch (error) {
              Alert.alert('Error', 'Registration failed.');
            }
          }}
        >
          {({ handleChange, handleBlur, handleSubmit, setFieldValue, values, errors, touched }) => {

            useEffect(() => {
              if (values.country) {
                const filtered = allStates.filter(state => state.country.toString() === values.country);
                setFilteredStates(filtered);
                setFieldValue('state', '');
                setFieldValue('city', '');
                setFilteredCities([]);
              }
            }, [values.country]);

            useEffect(() => {
              const loadCities = async () => {
                if (values.state) {
                  try {
                    const cities = await fetchCities(values.state);
                    setFilteredCities(cities);
                  } catch (err) {
                    console.error('City fetch error:', err);
                  }
                }
              };
              loadCities();
            }, [values.state]);

            return (
              <View>
                {['first_name', 'last_name', 'username', 'phone_no'].map(field => (
                  <View key={field} style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder={field.replace('_', ' ').toUpperCase()}
                      onChangeText={handleChange(field)}
                      onBlur={handleBlur(field)}
                      value={values[field]}
                    />
                    {touched[field] && errors[field] && <Text style={styles.error}>{errors[field]}</Text>}
                  </View>
                ))}

                <View style={styles.passwordField}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Password"
                    secureTextEntry={!showPassword}
                    onChangeText={handleChange('password')}
                    onBlur={handleBlur('password')}
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
                    onBlur={handleBlur('confirm_password')}
                    value={values.confirm_password}
                  />
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                    <Icon name={showConfirmPassword ? 'eye' : 'eye-off'} size={20} color="#888" />
                  </TouchableOpacity>
                </View>
                {touched.confirm_password && errors.confirm_password && <Text style={styles.error}>{errors.confirm_password}</Text>}

                {role === 'vendor' && (
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="Business Name"
                      onChangeText={handleChange('business_name')}
                      onBlur={handleBlur('business_name')}
                      value={values.business_name}
                    />
                    {touched.business_name && errors.business_name && <Text style={styles.error}>{errors.business_name}</Text>}
                  </View>
                )}

                <Picker
                  selectedValue={values.country}
                  onValueChange={val => setFieldValue('country', val)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Country" value="" />
                  {allCountries.map(c => (
                    <Picker.Item label={c.name} value={c.id.toString()} key={c.id} />
                  ))}
                </Picker>
                {touched.country && errors.country && <Text style={styles.error}>{errors.country}</Text>}

                <Picker
                  selectedValue={values.state}
                  onValueChange={val => setFieldValue('state', val)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select State" value="" />
                  {filteredStates.map(s => (
                    <Picker.Item label={s.name} value={s.id.toString()} key={s.id} />
                  ))}
                </Picker>
                {touched.state && errors.state && <Text style={styles.error}>{errors.state}</Text>}

                <Picker
                  selectedValue={values.city}
                  onValueChange={val => setFieldValue('city', val)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select City" value="" />
                  {filteredCities.map(c => (
                    <Picker.Item label={c.name} value={c.id.toString()} key={c.id} />
                  ))}
                </Picker>
                {touched.city && errors.city && <Text style={styles.error}>{errors.city}</Text>}

                {role === 'vendor' && (
                  <>
                    <MultiSelect
                      items={MAIN_CATEGORIES.map(c => ({ id: c, name: c }))}
                      uniqueKey="id"
                      onSelectedItemsChange={items => setFieldValue('main_categories', items)}
                      selectedItems={values.main_categories}
                      selectText="Select Main Categories"
                      displayKey="name"
                      submitButtonText="Done"
                    />
                    {touched.main_categories && errors.main_categories && <Text style={styles.error}>{errors.main_categories}</Text>}

                    <MultiSelect
                      items={SUBCATEGORIES.map(c => ({ id: c, name: c }))}
                      uniqueKey="id"
                      onSelectedItemsChange={items => setFieldValue('subcategories', items)}
                      selectedItems={values.subcategories}
                      selectText="Select Subcategories"
                      displayKey="name"
                      submitButtonText="Done"
                    />
                    {touched.subcategories && errors.subcategories && <Text style={styles.error}>{errors.subcategories}</Text>}

                    <Picker
                      selectedValue={values.status}
                      style={styles.picker}
                      onValueChange={val => setFieldValue('status', val)}
                    >
                      <Picker.Item label="Select Status" value="" />
                      <Picker.Item label="Published" value="published" />
                      <Picker.Item label="Locked" value="locked" />
                    </Picker>
                    {touched.status && errors.status && <Text style={styles.error}>{errors.status}</Text>}
                  </>
                )}

                <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                  <Text style={styles.buttonText}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            );
          }}
        </Formik>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 40 },
  header: { fontSize: 22, fontWeight: 'bold', marginVertical: 16, alignSelf: 'center', color: '#bea063' },
  input: { backgroundColor: '#fafafa', borderRadius: 5, padding: 15, fontSize: 16, marginBottom: 10 },
  picker: { backgroundColor: '#fafafa', borderColor: '#ccc', borderWidth: 1, marginBottom: 10 },
  error: { color: '#ed4956', marginBottom: 4, fontSize: 12 },
  button: {
    backgroundColor: '#bea063', padding: 15, borderRadius: 5,
    alignItems: 'center', marginTop: 24, marginBottom: 40,
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
});