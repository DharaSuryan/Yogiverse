import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Platform,
  StatusBar,
  ScrollView,
  Keyboard,
} from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

// Calculate responsive sizes
const getResponsiveSize = (size: number) => {
  const baseWidth = 375;
  const scale = width / baseWidth;
  const newSize = size * scale;
  return Math.round(newSize);
};

interface SignUpScreenProps {
  navigation: NavigationProp<any>;
}

const SignUpScreen: React.FC<SignUpScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSignUp = () => {
    Keyboard.dismiss();
    // Add your signup logic here
    navigation.navigate('MainTabs');
  };

  const handleFacebookSignUp = () => {
    navigation.navigate('MainTabs');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#FF9A8B', '#FF6A88', '#FF99AC']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <View style={styles.mainContainer}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
          keyboardDismissMode="none">
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>YOGIVERSE</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="rgba(255,255,255,0.7)"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="rgba(255,255,255,0.7)"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor="rgba(255,255,255,0.7)"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="rgba(255,255,255,0.7)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={getResponsiveSize(24)}
                  color="rgba(255,255,255,0.7)"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.button,
                !email || !fullName || !username || !password ? styles.buttonDisabled : null,
              ]}
              onPress={handleSignUp}
              disabled={!email || !fullName || !username || !password}>
              <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>

            <View style={styles.orContainer}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>OR</Text>
              <View style={styles.orLine} />
            </View>

            <TouchableOpacity style={styles.facebookButton} onPress={handleFacebookSignUp}>
              <Ionicons name="logo-facebook" size={getResponsiveSize(24)} color="#fff" />
              <Text style={styles.facebookButtonText}>Sign up with Facebook</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
              <Text style={styles.loginText}>Log in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  mainContainer: {
    flex: 1,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 0.15,
  },
  scrollContent: {
    minHeight: '100%',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: getResponsiveSize(40),
  },
  logoText: {
    fontSize: getResponsiveSize(40),
    color: '#fff',
    fontFamily: Platform.OS === 'ios' ? 'Noteworthy-Light' : 'normal',
    letterSpacing: getResponsiveSize(2),
  },
  formContainer: {
    width: '100%',
    maxWidth: Math.min(500, width * 0.9),
    alignSelf: 'center',
    paddingHorizontal: getResponsiveSize(20),
  },
  inputContainer: {
    marginBottom: getResponsiveSize(15),
    position: 'relative',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: getResponsiveSize(5),
    padding: getResponsiveSize(15),
    color: '#fff',
    fontSize: getResponsiveSize(16),
    height: Platform.OS === 'ios' ? getResponsiveSize(50) : undefined,
  },
  eyeIcon: {
    position: 'absolute',
    right: getResponsiveSize(15),
    top: '50%',
    transform: [{ translateY: -getResponsiveSize(12) }],
  },
  button: {
    backgroundColor: '#0095F6',
    borderRadius: getResponsiveSize(5),
    padding: getResponsiveSize(15),
    alignItems: 'center',
    marginTop: getResponsiveSize(10),
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: getResponsiveSize(16),
    fontWeight: '600',
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: getResponsiveSize(20),
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  orText: {
    color: 'rgba(255,255,255,0.7)',
    marginHorizontal: getResponsiveSize(10),
    fontSize: getResponsiveSize(14),
  },
  facebookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: getResponsiveSize(10),
  },
  facebookButtonText: {
    color: '#0095F6',
    marginLeft: getResponsiveSize(10),
    fontSize: getResponsiveSize(14),
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: getResponsiveSize(20),
    marginTop: getResponsiveSize(20),
  },
  footerText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: getResponsiveSize(14),
  },
  loginText: {
    color: '#0095F6',
    fontSize: getResponsiveSize(14),
    fontWeight: '600',
  },
});

export default SignUpScreen; 