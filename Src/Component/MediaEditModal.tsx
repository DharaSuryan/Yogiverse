import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  Animated as RNAnimated,
  PanResponder,
  Alert,
} from 'react-native';
import { ColorMatrix, sepia, grayscale, brightness, contrast } from 'react-native-color-matrix-image-filters';
import ViewShot, { captureRef } from 'react-native-view-shot';

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
  const [zoom, setZoom] = useState(1);
  const [selectedFilter, setSelectedFilter] = useState('normal');
  const scale = useRef(new RNAnimated.Value(1)).current;
  const lastScale = useRef(1);
  const lastDistance = useRef<number | null>(null);
  const viewShotRef = useRef(null);

  // PanResponder for pinch-to-zoom
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        lastScale.current = zoom;
        lastDistance.current = null;
      },
      onPanResponderMove: (evt, gestureState) => {
        if (evt.nativeEvent.touches.length === 2) {
          const touch1 = evt.nativeEvent.touches[0];
          const touch2 = evt.nativeEvent.touches[1];
          const dx = touch1.pageX - touch2.pageX;
          const dy = touch1.pageY - touch2.pageY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (lastDistance.current === null) {
            lastDistance.current = distance;
          } else {
            const scaleFactor = distance / lastDistance.current;
            let newScale = Math.max(1, Math.min(lastScale.current * scaleFactor, 3));
            scale.setValue(newScale);
            setZoom(newScale);
          }
        }
      },
      onPanResponderRelease: () => {
        lastScale.current = zoom;
        lastDistance.current = null;
      },
      onPanResponderTerminationRequest: () => false,
    })
  ).current;

  const handleZoomIn = () => {
    let newZoom = Math.min(zoom + 0.2, 3);
    setZoom(newZoom);
    scale.setValue(newZoom);
    lastScale.current = newZoom;
  };
  const handleZoomOut = () => {
    let newZoom = Math.max(zoom - 0.2, 1);
    setZoom(newZoom);
    scale.setValue(newZoom);
    lastScale.current = newZoom;
  };

  const filterObj = FILTERS.find(f => f.key === selectedFilter);
  const FilterWrapper = filterObj && filterObj.matrix
    ? (props: { children: React.ReactNode }) => <ColorMatrix matrix={filterObj.matrix}>{props.children}</ColorMatrix>
    : React.Fragment;

  const handleApply = async () => {
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
      <View style={{ alignItems: 'center' }}>
        <ViewShot ref={viewShotRef} options={{ format: 'jpg', quality: 0.95 }} style={styles.animatedImage}>
          <RNAnimated.View
            style={[{ transform: [{ scale }] }]}
            {...panResponder.panHandlers}
          >
            <FilterWrapper>
              <Image
                source={{ uri }}
                style={styles.image}
              />
            </FilterWrapper>
          </RNAnimated.View>
        </ViewShot>
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
              ? (props: { children: React.ReactNode }) => <ColorMatrix matrix={filter.matrix}>{props.children}</ColorMatrix>
              : React.Fragment;
            return (
              <TouchableOpacity
                onPress={() => setSelectedFilter(filter.key)}
                style={[styles.filterChip, isSelected && styles.selectedChip]}
              >
                <ThumbWrapper>
                  <Image
                    source={{ uri }}
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
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
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

export default MediaEditModal; 