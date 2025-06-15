import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const UploadOptionsScreen = () => {
  const navigation = useNavigation();

  const options = [
    {
      title: 'Post',
      icon: 'image-outline',
      onPress: () => navigation.navigate('MediaPicker', { type: 'post' }),
    },
    {
      title: 'Reel',
      icon: 'videocam-outline',
      onPress: () => navigation.navigate('CreateReel'),
    },
    {
      title: 'Story',
      icon: 'camera-outline',
      onPress: () => navigation.navigate('CreateStory'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="close" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Create New</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.optionsContainer}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.option}
            onPress={option.onPress}
          >
            <Icon name={option.icon} size={32} color="#000" />
            <Text style={styles.optionText}>{option.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  optionsContainer: {
    flex: 1,
    padding: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionText: {
    marginLeft: 16,
    fontSize: 16,
  },
});

export default UploadOptionsScreen; 