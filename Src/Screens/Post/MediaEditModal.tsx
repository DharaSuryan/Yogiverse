import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  Animated as RNAnimated,
  Alert,
  Platform,
} from 'react-native';
import { ColorMatrix, sepia, grayscale, brightness, contrast } from 'react-native-color-matrix-image-filters';
import ViewShot, { captureRef } from 'react-native-view-shot';
import ImageCropPicker from 'react-native-image-crop-picker';

const screenWidth = Dimensions.get('window').width;

const FILTERS = [
  { key: 'normal', label: 'Normal', matrix: undefined },
  { key: 'grayscale', label: 'Grayscale', matrix: grayscale() },
  { key: 'sepia', label: 'Sepia', matrix: sepia() },
  { key: 'brightness', label: 'Bright', matrix: brightness(1.5) },
  { key: 'contrast', label: 'Contrast', matrix: contrast(2) },
];

interface MediaEditModalProps {
  uri: string;
  onApply: (result: { uri: string }) => void;
  onCancel: () => void;
}

const MediaEditModal: React.FC<MediaEditModalProps> = ({ uri, onApply, onCancel }) => {
  const [selectedFilter, setSelectedFilter] = useState('normal');
  const [imageUri, setImageUri] = useState(uri);
  const [hasEdits, setHasEdits] = useState(false); // crop or any non-normal filter applied
  const viewShotRef = useRef(null);
  
  // Debug logging (can be removed in production)
  console.log("MediaEditModal rendered with uri:", uri);

  const filterObj = FILTERS.find(f => f.key === selectedFilter);
  const FilterWrapper = filterObj && filterObj.matrix
    ? (props: { children: React.ReactNode }) => <ColorMatrix matrix={filterObj.matrix}>{props.children}</ColorMatrix>
    : React.Fragment;

  const handleCrop = async () => {
    try {
      const result = await ImageCropPicker.openCropper({
        path: imageUri,
        width: 800,
        height: 800,
        cropping: true,
        cropperCircleOverlay: false,
        mediaType: 'photo',
      });
      if (result && result.path) {
        setImageUri(result.path);
        setSelectedFilter('normal');
        setHasEdits(true);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to crop image.');
    }
  };

  const handleApply = async () => {
    // If no edits were made (no crop and filter is normal), return original/current uri
    if (!hasEdits && selectedFilter === 'normal' && imageUri === uri) {
      onApply({ uri: imageUri });
      return;
    }
    if (viewShotRef.current) {
      try {
        const uriResult = await captureRef(viewShotRef, {
          format: 'jpg',
          quality: 0.95,
        });
        onApply({ uri: uriResult });
      } catch (e) {
        Alert.alert('Error', 'Failed to process image.');
      }
    }
  };

  return (
    <View style={styles.modalContainer}>
      {/* Close button */}
      <TouchableOpacity 
        style={styles.closeButton}
        onPress={onCancel}
      >
        <Text style={styles.closeButtonText}>✕</Text>
      </TouchableOpacity>
      
      <View style={{ alignItems: 'center' ,justifyContent:'center',marginTop:30}}>
        <ViewShot ref={viewShotRef} options={{ format: 'jpg', quality: 0.95 }} style={styles.animatedImage}>
          <FilterWrapper>
            <Image
              source={{ uri: imageUri }}
              style={styles.image}
              resizeMode="contain"
            />
          </FilterWrapper>
        </ViewShot>
        <TouchableOpacity
          style={[styles.applyButton,{marginTop:10}]}
          onPress={handleCrop}
        >
          <Text style={styles.cropText}>Crop</Text>
        </TouchableOpacity>
        <FlatList
          data={FILTERS}
          horizontal
          keyExtractor={f => f.key}
          style={[styles.filterBar,{ height: 70 } ]}
          contentContainerStyle={{ paddingHorizontal: 10, alignItems: 'center' }}
          renderItem={({ item: filter }) => {
            const isSelected = selectedFilter === filter.key;
            const ThumbWrapper = filter.matrix
              ? (props: { children: React.ReactNode }) => <ColorMatrix matrix={filter.matrix}>{props.children}</ColorMatrix>
              : React.Fragment;
            return (
              <TouchableOpacity
                onPress={() => setSelectedFilter(filter.key)}
                style={[styles.filterChip, isSelected && styles.selectedChip]}
              >
                <ThumbWrapper>
                  <Image
                    source={{ uri: imageUri }}
                    style={styles.filterThumb}
                  />
                </ThumbWrapper>
                <Text style={{ color: isSelected ? '#0095f6' : '#fff', fontSize: 12 }}>{filter.label}</Text>
              </TouchableOpacity>
            );
          }}
        />
        <TouchableOpacity
          style={styles.applyButton}
          onPress={handleApply}
        >
          <Text style={styles.applyText}>Apply & Next</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onCancel}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 44 : 0, // Account for iOS status bar
  },
  animatedImage: {  
    width: screenWidth * 0.9,
    height: screenWidth * 0.9,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cropButton: {
    marginTop: 10,
    backgroundColor: '#0095f6',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 8,
  },
  cropText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  filterBar: {
    marginTop: 24,
    marginBottom: 8,
    borderWidth:0,
  },
  filterChip: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  selectedChip: {
    borderBottomWidth: 2,
    borderColor: '#0095f6',
  },
  filterThumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginBottom: 4,
  },
  applyButton: {
    // marginTop: 24,
    backgroundColor: '#bea063',
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 24,
  },
  applyText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  cancelButton: {
    marginTop: 16,
    padding: 10,
  },
  cancelText: {
    color: '#fff',
    fontSize: 16,
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    zIndex: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default MediaEditModal;