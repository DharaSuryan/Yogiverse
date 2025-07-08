import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { changePassword } from '../../Api/Api';

const ChangePasswordScreen = ({navigation}:any) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChangePassword = async () => {
  if (!oldPassword || !newPassword || !confirmPassword) {
    Alert.alert('Error', 'Please fill all fields.');
    return;
  }
  if (newPassword !== confirmPassword) {
    Alert.alert('Error', 'New passwords do not match.');
    return;
  }

  try {
    const formData = {
      old_password: oldPassword,
      new_password: newPassword,
      confirm_password: confirmPassword,
    };
    const response = await changePassword({ formData });
    Alert.alert('Success', response.message || 'Password changed successfully!');
    navigation.navigate('Menu')
    // Optionally, navigate away or reset fields here
  } catch (error: any) {
    // You can customize error handling as needed
    Alert.alert('Error', error?.response?.data?.message || 'Failed to change password.');
  }
};
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Yogiverse</Text>
      <Text style={styles.heading}>Change Your Password</Text>
      <Text style={styles.subtitle}>
        A safe path begins with a strong key. Let your password reflect your strength.
      </Text>

      {/* Old Password */}
      <View style={{ position: 'relative', marginBottom: 16 }}>
        <TextInput
          style={styles.input}
          placeholder="Old Password"
          secureTextEntry={!showOld}
          value={oldPassword}
          onChangeText={setOldPassword}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowOld(!showOld)}
        >
          <Icon name={showOld ? 'eye' : 'eye-off'} size={22} color="#888" />
        </TouchableOpacity>
      </View>

      {/* New Password */}
      <View style={{ position: 'relative', marginBottom: 16 }}>
        <TextInput
          style={styles.input}
          placeholder="New Password"
          secureTextEntry={!showNew}
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowNew(!showNew)}
        >
          <Icon name={showNew ? 'eye' : 'eye-off'} size={22} color="#888" />
        </TouchableOpacity>
      </View>

      {/* Confirm Password */}
      <View style={{ position: 'relative', marginBottom: 16 }}>
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          secureTextEntry={!showConfirm}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowConfirm(!showConfirm)}
        >
          <Icon name={showConfirm ? 'eye' : 'eye-off'} size={22} color="#888" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
        <Text style={styles.buttonText}>Change Password</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#bea063',
    textAlign: 'center',
    marginBottom: 12,
  },
  heading: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    paddingRight: 44, // space for the eye icon
    backgroundColor: '#fff',
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 14,
    padding: 4,
  },
  button: {
    backgroundColor: '#bea063',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ChangePasswordScreen;