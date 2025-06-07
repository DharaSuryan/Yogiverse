import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  SafeAreaView,
  FlatList,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface PhotoItem {
  id: string;
  uri: string;
}

const {width, height} = Dimensions.get('window');

interface StoryGalleryModalProps {
  onClose: () => void;
  onSelectImage: (image: PhotoItem) => void;
}

const StoryGalleryModal: React.FC<StoryGalleryModalProps> = ({
  onClose,
  onSelectImage,
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);
  const [photos] = useState<PhotoItem[]>([
    {id: '1', uri: 'https://picsum.photos/800/1200?random=1'},
    {id: '2', uri: 'https://picsum.photos/800/1200?random=2'},
    {id: '3', uri: 'https://picsum.photos/800/1200?random=3'},
    {id: '4', uri: 'https://picsum.photos/800/1200?random=4'},
    {id: '5', uri: 'https://picsum.photos/800/1200?random=5'},
    {id: '6', uri: 'https://picsum.photos/800/1200?random=6'},
  ]);

  const handlePhotoSelect = (photo: PhotoItem) => {
    setSelectedPhoto(photo);
  };

  const handleNext = () => {
    if (selectedPhoto) {
      onSelectImage(selectedPhoto);
    }
  };

  const renderPreview = () => (
    <View style={styles.previewContainer}>
      {selectedPhoto ? (
        <Image source={{uri: selectedPhoto.uri}} style={styles.previewImage} />
      ) : (
        <Image source={{uri: photos[0].uri}} style={styles.previewImage} />
      )}
      <View style={styles.previewOverlay}>
        <View style={styles.overlayTop}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <View style={styles.topButtons}>
            <TouchableOpacity style={styles.topButton}>
              <Icon name="flash-outline" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.topButton}>
              <Icon name="settings-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.overlayBottom}>
          <TouchableOpacity style={styles.galleryButton}>
            <Icon name="images-outline" size={24} color="#fff" />
            <Text style={styles.galleryText}>Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.nextButton, !selectedPhoto && styles.disabledButton]}
            onPress={handleNext}
            disabled={!selectedPhoto}>
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderThumbnail = ({item}: {item: PhotoItem}) => (
    <TouchableOpacity
      style={[
        styles.thumbnail,
        selectedPhoto?.id === item.id && styles.selectedThumbnail,
      ]}
      onPress={() => handlePhotoSelect(item)}>
      <Image source={{uri: item.uri}} style={styles.thumbnailImage} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      {renderPreview()}
      <View style={styles.galleryContainer}>
        <FlatList
          data={photos}
          renderItem={renderThumbnail}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbnailList}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  previewContainer: {
    width: width,
    height: height - 120, // Leave space for thumbnails
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  previewOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  overlayTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
  },
  overlayBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  closeButton: {
    padding: 5,
  },
  topButtons: {
    flexDirection: 'row',
  },
  topButton: {
    marginLeft: 20,
    padding: 5,
  },
  galleryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  galleryText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
  },
  nextButton: {
    backgroundColor: '#0095F6',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  disabledButton: {
    backgroundColor: 'rgba(0, 149, 246, 0.5)',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  galleryContainer: {
    height: 120,
    backgroundColor: '#000',
  },
  thumbnailList: {
    padding: 10,
  },
  thumbnail: {
    width: 80,
    height: 80,
    marginHorizontal: 5,
    borderRadius: 8,
    overflow: 'hidden',
  },
  selectedThumbnail: {
    borderWidth: 2,
    borderColor: '#0095F6',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});

export default StoryGalleryModal; 