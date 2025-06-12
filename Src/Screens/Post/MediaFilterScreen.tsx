import React, { useState } from 'react';
import { View, Image, Text, TouchableOpacity, FlatList, StyleSheet, Dimensions, TextInput, ScrollView, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CreatePostStackParamList } from '../../Navigation/types';
import { useBackHandler } from '../../Utils/BackHandler';
// import { GPUImageView, Sepia, Grayscale, ... } from 'react-native-image-filter-kit'; // If you want to add filters!

const screenWidth = Dimensions.get('window').width;

type MediaFilterScreenNavigationProp = NativeStackNavigationProp<CreatePostStackParamList, 'MediaFilter'>;
type MediaFilterScreenRouteProp = RouteProp<CreatePostStackParamList, 'MediaFilter'>;

interface Media {
  uri: string;
  type: string;
  fileName?: string;
}

// Dummy filters (demo)
const FILTERS = [
  { key: 'none', name: 'Normal' },
  { key: 'sepia', name: 'Sepia' },
  { key: 'grayscale', name: 'Grayscale' },
  // Add more as needed, or use a real filter library!
];

const applyFilter = (uri: string, filter: string = 'normal'): string => {
  // In a real app, you would apply actual image filters here
  // For now, we'll just return the original URI
  return uri;
};

const MediaFilterScreen = () => {
  const navigation = useNavigation<MediaFilterScreenNavigationProp>();
  const route = useRoute<MediaFilterScreenRouteProp>();
  const [selectedFilter, setSelectedFilter] = useState('normal');
  const { media } = route.params;

  // Add back handler
  useBackHandler(() => {
    handleGoBack();
    return true; // Prevent default back behavior
  });

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleNext = () => {
    navigation.navigate('PostPreview', { media });
  };

  return (
    <View style={styles.container}>
      {/* Back */}
      <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
        <Icon name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Image/Video preview */}
      <View style={styles.mediaContainer}>
        <Image
          source={{ uri: applyFilter(media.uri, selectedFilter) }}
          style={styles.imagePreview}
          resizeMode="contain"
        />
      </View>

      {/* Simple Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
      >
        <TouchableOpacity
          style={[
            styles.filterChip,
            selectedFilter === 'normal' && styles.selectedChip,
          ]}
          onPress={() => setSelectedFilter('normal')}
        >
          <Text style={styles.filterText}>Normal</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChip,
            selectedFilter === 'vintage' && styles.selectedChip,
          ]}
          onPress={() => setSelectedFilter('vintage')}
        >
          <Text style={styles.filterText}>Vintage</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChip,
            selectedFilter === 'bw' && styles.selectedChip,
          ]}
          onPress={() => setSelectedFilter('bw')}
        >
          <Text style={styles.filterText}>B&W</Text>
        </TouchableOpacity>
        {/* Add more filters as needed */}
      </ScrollView>

      {/* Next */}
      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 48 : 16,
    left: 16,
    zIndex: 3,
  },
  mediaContainer: {
    width: screenWidth,
    height: screenWidth * 1.1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePreview: {
    width: screenWidth * 0.95,
    height: screenWidth * 1.05,
    borderRadius: 14,
    resizeMode: 'contain',
  },
  filterBar: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  filterChip: {
    backgroundColor: '#222',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 18,
    marginRight: 8,
  },
  selectedChip: {
    backgroundColor: '#3897f0',
  },
  filterText: {
    color: '#fff',
    fontSize: 14,
  },
  nextButton: {
    backgroundColor: '#3897f0',
    position: 'absolute',
    bottom: 30,
    right: 24,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    zIndex: 2,
  },
  nextText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default MediaFilterScreen;
