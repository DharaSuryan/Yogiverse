import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function RoleSelectionScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Walk Your Path With Yogiverse</Text>
         <Text style={{ textAlign: 'center', color: '#bea063', marginVertical:0,fontSize:18,}}>Everyone is Yogi</Text> 
              <Text style={{ textAlign: 'center', marginVertical: 5, color: '#bea063',fontSize:18 }}>by his/her Karma and Dharma.</Text> 
      <View style={styles.roleContainer}>
        <TouchableOpacity
          style={[styles.roleCard, { backgroundColor: '#f4f8fb' }]}
          onPress={() => navigation.navigate('SignUp', { role: 'user' })}
          activeOpacity={0.85}
        >
          <Ionicons name="person-outline" size={42} color="#bea063" style={styles.icon} />
          <Text style={styles.roleName}>Seeker (Users)</Text>
          <Text style={styles.roleDesc}>Explore, connect, and grow on your path of wellness and inner balance.</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleCard, { backgroundColor: '#fff9f2' }]}
          onPress={() => navigation.navigate('SignUp', { role: 'vendor' })}
          activeOpacity={0.85}
        >
          <Image source={require('../../Assets/Role.png')} style={{ width: 200,
    height: 100,}} resizeMode="contain" />
          <Text style={styles.roleName}>Yogi's</Text>
          <Text style={styles.roleDesc}>Share your offerings, guide others, and grow with our conscious community.</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18,  color: '#bea063', marginBottom: 15 ,textAlign:'center',borderBottomWidth:1,borderBottomColor:'#bea063'},
  roleContainer: { width: '90%', alignItems: 'center',marginTop:15 },
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

