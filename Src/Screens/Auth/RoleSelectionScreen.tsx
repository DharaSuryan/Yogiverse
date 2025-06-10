import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function RoleSelectionScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Your Role</Text>
      <View style={styles.roleContainer}>
        <TouchableOpacity
          style={[styles.roleCard, { backgroundColor: '#f4f8fb' }]}
          onPress={() => navigation.navigate('Signup', { role: 'user' })}
          activeOpacity={0.85}
        >
          <Ionicons name="person-outline" size={42} color="#1E90FF" style={styles.icon} />
          <Text style={styles.roleName}>User</Text>
          <Text style={styles.roleDesc}>Browse, buy, and connect as a user.</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleCard, { backgroundColor: '#fff9f2' }]}
          onPress={() => navigation.navigate('Signup', { role: 'vendor' })}
          activeOpacity={0.85}
        >
          <Ionicons name="storefront-outline" size={42} color="#ef934b" style={styles.icon} />
          <Text style={styles.roleName}>Vendor</Text>
          <Text style={styles.roleDesc}>Grow your business and manage your store.</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#222', marginBottom: 42 },
  roleContainer: { width: '90%', alignItems: 'center' },
  roleCard: {
    width: '100%',
    borderRadius: 18,
    alignItems: 'center',
    paddingVertical: 38,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 4,
  },
  icon: { marginBottom: 12 },
  roleName: { fontSize: 22, fontWeight: 'bold', color: '#444', marginBottom: 4 },
  roleDesc: { fontSize: 14, color: '#888', textAlign: 'center', maxWidth: 220 },
});

