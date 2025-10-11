import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

const ContactUs = () => {
  const navigation = useNavigation();
  const [company, setCompany] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [country, setCountry] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!company || !name || !email || !subject || !country || !phone) {
      Alert.alert('Error', 'Please fill all required fields.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        company,
        name,
        country,
        phone,
        email,
        subject,
      };
      const response = await axios.post('https://pashuahar.com/helper_app/inquiry/', payload);
      if (response.status === 200 || response.status === 201) {
        Alert.alert('Success', 'Your inquiry has been submitted!');
        setCompany(''); setName(''); setEmail(''); setSubject(''); setCountry(''); setPhone('');
      } else {
        Alert.alert('Error', 'Failed to submit inquiry. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to submit inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.card}>
        {/* Back Arrow */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#bea063" />
        </TouchableOpacity>
        <Text style={styles.title}>Get in Touch</Text>
        <Text style={styles.subtitle}>
          We're here to help. Reach out for any question, suggestion, or inquiry.
        </Text>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Your Company *</Text>
          <TextInput
            style={styles.input}
            placeholder="Your Company"
            value={company}
            onChangeText={setCompany}
          />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Your Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Your Name"
            value={name}
            onChangeText={setName}
          />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Email Address *</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Phone *</Text>
          <TextInput
            style={styles.input}
            placeholder="Your Phone Number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Subject *</Text>
          <TextInput
            style={styles.input}
            placeholder="Subject"
            value={subject}
            onChangeText={setSubject}
          />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Country *</Text>
          <TextInput
            style={styles.input}
            placeholder="Select country..."
            value={country}
            onChangeText={setCountry}
          />
        </View>
        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Submitting...' : 'Submit Inquiry'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFCF5',
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 28,
    width: '100%',
    maxWidth: 400,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f5e6c8',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 5,
    top: 10,
    padding: 8,
    zIndex: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#bea063',
    textAlign: 'center',
    marginBottom: 8,
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 18,
  },
  formGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    color: '#bea063',
    marginBottom: 4,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#f8f6f2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e6d7b0',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#222',
  },
  button: {
    backgroundColor: '#bea063',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ContactUs; 