//  navigation.navigate('PostDetails', { images: selectedImages });
// MediaPickerScreen
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
  Platform,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'react-native-image-picker';
import { ColorMatrix, sepia, grayscale, brightness, contrast } from 'react-native-color-matrix-image-filters';
import { PinchGestureHandler, PinchGestureHandlerEventPayload } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedGestureHandler, useAnimatedStyle, withSpring } from 'react-native-reanimated';

const screenWidth = Dimensions.get('window').width;

const FILTERS = [
  { key: 'normal', label: 'Normal', matrix: undefined },
  { key: 'grayscale', label: 'Grayscale', matrix: grayscale() },
  { key: 'sepia', label: 'Sepia', matrix: sepia() },
  { key: 'brightness', label: 'Bright', matrix: brightness(1.5) },
  { key: 'contrast', label: 'Contrast', matrix: contrast(2) },
];

const MediaPicker = () => {
  const navigation = useNavigation();
  const [selectedImage, setSelectedImage] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [selectedFilter, setSelectedFilter] = useState('normal');

  // Open image picker on mount
  useEffect(() => {
    ImagePicker.launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: 1,
      },
      (response) => {
        if (response.didCancel || !response.assets || response.assets.length === 0) {
          navigation.goBack();
          return;
        }
        const asset = response.assets[0];
        setSelectedImage({ uri: asset.uri, type: asset.type });
        setShowEditModal(true);
      }
    );
  }, []);

  // Pinch gesture handler
  const scale = useSharedValue(zoom);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const onPinchEvent = useAnimatedGestureHandler<PinchGestureHandlerEventPayload>({
    onActive: (event) => {
      scale.value = event.scale;
    },
    onEnd: () => {
      setZoom(scale.value);
      scale.value = withSpring(scale.value, { damping: 10 });
    },
  });

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.2, 3));
    scale.value = Math.min(scale.value + 0.2, 3);
  };
  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.2, 1));
    scale.value = Math.max(scale.value - 0.2, 1);
  };

  const handleApplyEdit = () => {
    setShowEditModal(false);
    navigation.navigate('PostPreview', {
      images: [selectedImage.uri],
      filter: selectedFilter,
      zoom,
    });
  };

  if (!selectedImage) return null;

  const filterObj = FILTERS.find(f => f.key === selectedFilter);
  const FilterWrapper = filterObj && filterObj.matrix
    ? (props) => <ColorMatrix matrix={filterObj.matrix}>{props.children}</ColorMatrix>
    : React.Fragment;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={{ alignItems: 'center' }}>
            <PinchGestureHandler onGestureEvent={onPinchEvent}>
              <Animated.View style={animatedStyle}>
                <FilterWrapper>
                  <Image
                    source={{ uri: selectedImage.uri }}
                    style={styles.image}
                  />
                </FilterWrapper>
              </Animated.View>
            </PinchGestureHandler>
            <View style={styles.zoomRow}>
              <TouchableOpacity onPress={handleZoomOut} style={styles.zoomButton}>
                <Text style={styles.zoomText}>-</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleZoomIn} style={styles.zoomButton}>
                <Text style={styles.zoomText}>+</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={FILTERS}
              horizontal
              keyExtractor={f => f.key}
              style={styles.filterBar}
              contentContainerStyle={{ paddingHorizontal: 10 }}
              renderItem={({ item: filter }) => {
                const isSelected = selectedFilter === filter.key;
                const ThumbWrapper = filter.matrix
                  ? (props) => <ColorMatrix matrix={filter.matrix}>{props.children}</ColorMatrix>
                  : React.Fragment;
                return (
                  <TouchableOpacity
                    onPress={() => setSelectedFilter(filter.key)}
                    style={[styles.filterChip, isSelected && styles.selectedChip]}
                  >
                    <ThumbWrapper>
                      <Image
                        source={{ uri: selectedImage.uri }}
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
              onPress={handleApplyEdit}
            >
              <Text style={styles.applyText}>Apply & Next</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowEditModal(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: screenWidth * 0.9,
    height: screenWidth * 0.9,
    resizeMode: 'contain',
  },
  zoomRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  zoomButton: {
    marginHorizontal: 20,
    backgroundColor: '#222',
    borderRadius: 20,
    padding: 10,
  },
  zoomText: {
    color: '#fff',
    fontSize: 20,
  },
  filterBar: {
    marginTop: 24,
    marginBottom: 8,
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
    marginTop: 24,
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
});

export default MediaPicker;
