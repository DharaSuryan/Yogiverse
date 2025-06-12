import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Platform,
  Keyboard, StatusBar, TouchableWithoutFeedback, Alert
} from 'react-native';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../Store/actions/authActions';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, AuthStackParamList } from '../../Navigation/types';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { loginUser } from '../../Api/Api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useBackHandler } from '../../Utils/BackHandler';

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 0;

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
};

const LoginSchema = Yup.object().shape({
  username: Yup.string().required('Username is required'),
  password: Yup.string().required('Password is required'),
});

const LoginScreen: React.FC<LoginScreenProps> = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);

  // Add back handler
  useBackHandler();

  const handleLogin = async (values: { username: string; password: string }) => {
    try {
      const response = await loginUser(values);
      if (response.status === 200 && response.data) {
        // Store tokens and user data
        await AsyncStorage.setItem('accessToken', response.data.access_token);
        await AsyncStorage.setItem('refreshToken', response.data.refresh_token);
        await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
        
        // Update Redux state
        dispatch(
          loginSuccess({
            user: response.data.user,
            token: response.data.access_token,
            refreshToken: response.data.refresh_token,
          })
        );
        
        // Navigate to main tab
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTab' }],
        });
      } else {
        Alert.alert('Login Failed', 'Invalid username or password');
      }
    } catch (error: any) {
      Alert.alert('Login Failed', error.response?.data?.message || 'Invalid username or password');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.logoContainer}>
          <Image source={require('../../Assets/yoga.jpg')} style={styles.logo} resizeMode="contain" />
        </View>
        <Formik
          initialValues={{ username: '', password: '' }}
          validationSchema={LoginSchema}
          onSubmit={handleLogin}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <View style={styles.formContainer}>
              <TextInput
                style={styles.input}
                placeholder="Username"
                onChangeText={handleChange('username')}
                onBlur={handleBlur('username')}
                value={values.username}
                autoCapitalize="none"
              />
              {touched.username && errors.username && <Text style={styles.errorText}>{errors.username}</Text>}

              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="Password"
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  value={values.password}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Icon
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={24}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
              {touched.password && errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
              <TouchableOpacity style={styles.forgotPassword} onPress={() => navigation.navigate('Auth', { screen: 'ForgotPassword' })}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.loginButton} onPress={() => handleSubmit()}>
                <Text style={styles.loginButtonText}>Log In</Text>
              </TouchableOpacity>
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>
              <TouchableOpacity style={styles.signupButton} onPress={() => navigation.navigate('Auth', { screen: 'RoleSelection' })}>
                <Text style={styles.signupButtonText}>
                  Don't have an account? Sign up
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </Formik>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: STATUSBAR_HEIGHT,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 200,
    height: 100,
  },
  formContainer: {
    width: '100%',
  },
  input: {
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#dbdbdb',
    borderRadius: 5,
    padding: 15,
    marginBottom: 10,
    fontSize: 16,
  },
  errorText: {
    color: '#ed4956',
    marginBottom: 10,
    textAlign: 'left',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#003569',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#bea063',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#dbdbdb',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#8e8e8e',
  },
  signupButton: {
    alignItems: 'center',
  },
  signupButtonText: {
    color: '#003569',
    fontSize: 14,
  },
  passwordContainer: {
    position: 'relative',
    width: '100%',
  },
  passwordInput: {
    paddingRight: 50, // Make room for the eye icon
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: '50%',
    transform: [{ translateY: -12 }],
    padding: 5,
  },
});

export default LoginScreen;
