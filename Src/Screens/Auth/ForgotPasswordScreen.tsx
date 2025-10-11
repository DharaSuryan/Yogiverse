import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator, // ⬅️ add
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../Navigation/types';
import { forgotPassword } from '../../Api/Api';

type ForgotPasswordScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;
};

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // ⬅️ add

  const validateEmail = (email: string) => {
    const re = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    return re.test(email);
  };

  const handleResetPassword = async () => {
    setError('');
    setSuccess(false);

    const trimmed = email.trim();

    if (!trimmed) {
      setError('Please enter your email address.');
      return;
    }
    if (!validateEmail(trimmed)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true); // ⬅️ start loader
    try {
      await forgotPassword(trimmed);
      setSuccess(true);
    } catch (err) {
      console.log('forgotPassword error', err);
      setError('Given email is not registered!');
    } finally {
      setIsSubmitting(false); // ⬅️ stop loader
    }
  };

  const isDisabled = success || isSubmitting;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.logoContainer}>
          <Image
            source={require('../../Assets/LogoLogin.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Enter your email address and we'll send you a link to reset your password.
          </Text>

          {!!error && <Text style={styles.errorText}>{error}</Text>}
          {success && (
            <Text style={styles.successText}>
              Password reset link has been sent to your email.
            </Text>
          )}

          <TextInput
            style={[styles.input, isDisabled && { opacity: 0.7 }]}
            placeholder="Email"
            placeholderTextColor="#000000"

            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isDisabled}
          />

          <TouchableOpacity
            style={[styles.resetButton, isDisabled && styles.disabledButton]}
            onPress={handleResetPassword}
            disabled={isDisabled}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator color={"#ffffff"} size="small" />
            ) : (
              <Text style={styles.resetButtonText}>
                {success ? 'Email Sent' : 'Send Reset Link'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            disabled={isSubmitting}
          >
            <Text style={[styles.backButtonText, isSubmitting && { opacity: 0.6 }]}>
              Back to Login
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  logo: { width: 200, height: 100 },
  formContainer: { width: '100%' },
  title: { fontSize: 24, fontWeight: '600', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 14, color: '#8e8e8e', textAlign: 'center', marginBottom: 20 },
  input: {
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#dbdbdb',
    borderRadius: 3,
    padding: 12,
    marginBottom: 10,
    fontSize: 14,
  },
  errorText: { color: '#ed4956', textAlign: 'center', marginBottom: 10 },
  successText: { color: '#28a745', textAlign: 'center', marginBottom: 10 },
  resetButton: {
    backgroundColor: '#bea063',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
    minHeight: 44,
    justifyContent: 'center',
  },
  disabledButton: { opacity: 0.8 },
  resetButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  backButton: { marginTop: 20, alignItems: 'center' },
  backButtonText: { color: '#bea063', fontSize: 14 },
});

export default ForgotPasswordScreen;
