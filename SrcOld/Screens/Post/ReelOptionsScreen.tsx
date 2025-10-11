import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CreatePostStackParamList } from '../../Navigation/types';
import Icon from 'react-native-vector-icons/Ionicons';

type NavigationProp = NativeStackNavigationProp<CreatePostStackParamList, 'ReelCamera'>;

const ReelOptionsScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Reel</Text>
      <TouchableOpacity
        style={styles.optionButton}
        onPress={() => navigation.navigate('ReelCamera')}
      >
        <Icon name="camera" size={24} color="#fff" style={styles.icon} />
        <Text style={styles.optionText}>Open Camera</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.optionButton}
        onPress={() => navigation.navigate('MediaPicker', { type: 'reel' })}
      >
        <Icon name="images" size={24} color="#fff" style={styles.icon} />
        <Text style={styles.optionText}>Select from Gallery</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 32,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginVertical: 12,
    width: 260,
    justifyContent: 'center',
  },
  optionText: {
    color: '#fff',
    fontSize: 18,
    marginLeft: 12,
  },
  icon: {
    marginRight: 8,
  },
});

export default ReelOptionsScreen; 