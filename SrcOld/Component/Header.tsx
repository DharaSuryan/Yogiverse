import { Dimensions, Image, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Ionicons from 'react-native-vector-icons/Ionicons';
import { TouchableOpacity } from 'react-native';
const { width } = Dimensions.get('window');
const Header = ({ onAddPostPress, onMessagePress }:any) => {
 return (
    <View style={styles.headerContainer}>
     
      <Text style={styles.title}>Yogiverse</Text>
      <View style={styles.iconContainer}>
        <TouchableOpacity onPress={onMessagePress}>
          <Ionicons name="paper-plane-outline" size={26} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onAddPostPress}>
          <Ionicons name="add-circle-outline" size={26} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default Header

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#fff',
    elevation: 2, // For Android shadow
    shadowColor: '#000', // For iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  logo: {
    width: width * 0.25, // Logo width is 25% of the screen width
    height: 30, // Adjust based on your logo size
    resizeMode: 'contain',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    flex: 1, // Allow title to take available space
    textAlign: 'center', // Center the title
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});