import React, { useState } from 'react';
import { View, Image, Text, TouchableOpacity, FlatList, StyleSheet, Dimensions, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
// import { GPUImageView, Sepia, Grayscale, ... } from 'react-native-image-filter-kit'; // If you want to add filters!

const screenWidth = Dimensions.get('window').width;

// Dummy filters (demo)
const FILTERS = [
  { key: 'none', name: 'Normal' },
  { key: 'sepia', name: 'Sepia' },
  { key: 'grayscale', name: 'Grayscale' },
  // Add more as needed, or use a real filter library!
];

export default function MediaFilterScreen() {
  const navigation = useNavigation();
  const { media } = useRoute().params || { media: [] };
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState('none');

  // For demo: only applies fake filter by name, you can integrate react-native-image-filter-kit for real filters!
  const applyFilter = (uri) => {
    // Use your filter library here!
    return uri;
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      {/* Back */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Image/Video preview */}
      <FlatList
        data={media}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, i) => item.uri + i}
        renderItem={({ item, index }) => (
          <View style={styles.mediaContainer}>
            {item.type === 'video' ? (
              <View style={styles.videoStub}>
                <Icon name="videocam" size={40} color="#fff" />
                <Text style={{ color: '#fff' }}>Video</Text>
              </View>
            ) : (
              <Image source={{ uri: applyFilter(item.uri) }} style={styles.imagePreview} />
            )}
          </View>
        )}
        onMomentumScrollEnd={e => {
          const index = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
          setSelectedIndex(index);
        }}
        style={{ flexGrow: 0 }}
      />

      {/* Simple Filters */}
      <View style={styles.filterBar}>
        <FlatList
          data={FILTERS}
          horizontal
          keyExtractor={item => item.key}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterChip, selectedFilter === item.key && styles.selectedChip]}
              onPress={() => setSelectedFilter(item.key)}
            >
              <Text style={{ color: selectedFilter === item.key ? '#3897f0' : '#fff' }}>
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Next */}
      <TouchableOpacity
        style={styles.nextButton}
        onPress={() => navigation.navigate('PostDetails', { media })}
      >
        <Text style={styles.nextText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  backButton: { position: 'absolute', top: 48, left: 16, zIndex: 3 },
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
  videoStub: {
    width: screenWidth * 0.8,
    height: screenWidth * 1.05,
    backgroundColor: '#1a1a1a',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
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
