import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import StoryGalleryModal from './StoryGalleryModal';

interface PhotoItem {
  id: string;
  uri: string;
}

// Mock data for recent photos
const MOCK_PHOTOS: PhotoItem[] = [
  { id: '1', uri: 'https://picsum.photos/400/400?random=1' },
  { id: '2', uri: 'https://picsum.photos/400/400?random=2' },
  { id: '3', uri: 'https://picsum.photos/400/400?random=3' },
  { id: '4', uri: 'https://picsum.photos/400/400?random=4' },
  { id: '5', uri: 'https://picsum.photos/400/400?random=5' },
  { id: '6', uri: 'https://picsum.photos/400/400?random=6' },
  { id: '7', uri: 'https://picsum.photos/400/400?random=7' },
  { id: '8', uri: 'https://picsum.photos/400/400?random=8' },
  { id: '9', uri: 'https://picsum.photos/400/400?random=9' },
];

const {width} = Dimensions.get('window');
const COLUMN_COUNT = 3;
const ITEM_WIDTH = width / COLUMN_COUNT;
const ITEM_HEIGHT = ITEM_WIDTH;

const StoryScreen = () => {
  const [isGalleryModalVisible, setIsGalleryModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<PhotoItem | null>(null);

  const handlePhotoPress = (photo: PhotoItem) => {
    setSelectedImage(photo);
    setIsGalleryModalVisible(true);
  };

  const handleCloseGallery = () => {
    setIsGalleryModalVisible(false);
  };

  const handleSelectImage = (image: PhotoItem) => {
    setSelectedImage(image);
    setIsGalleryModalVisible(false);
    // Here you would typically navigate to the story editor screen
    // with the selected image
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity style={styles.closeButton}>
        <Icon name="close" size={28} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Add to story</Text>
      <TouchableOpacity style={styles.settingsButton}>
        <Icon name="settings-outline" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  const renderCameraSection = () => (
    <TouchableOpacity style={styles.cameraSection}>
      <View style={styles.cameraIcon}>
        <Icon name="camera" size={32} color="#fff" />
      </View>
      <Text style={styles.cameraText}>Camera</Text>
    </TouchableOpacity>
  );

  const renderPhotoItem = ({item, index}: {item: PhotoItem; index: number}) => (
    <TouchableOpacity 
      style={styles.photoItem}
      onPress={() => handlePhotoPress(item)}>
      <Image source={{uri: item.uri}} style={styles.photo} />
    </TouchableOpacity>
  );

  const renderRecentsSection = () => (
    <View style={styles.recentsSection}>
      <View style={styles.recentsTitleContainer}>
        <Text style={styles.recentsTitle}>Recents</Text>
        <TouchableOpacity>
          <Text style={styles.selectMultiple}>Select Multiple</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={MOCK_PHOTOS}
        renderItem={renderPhotoItem}
        keyExtractor={item => item.id}
        numColumns={COLUMN_COUNT}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      {renderHeader()}
      {renderCameraSection()}
      {renderRecentsSection()}

      <Modal
        visible={isGalleryModalVisible}
        animationType="slide"
        presentationStyle="fullScreen">
        <StoryGalleryModal
          onClose={handleCloseGallery}
          onSelectImage={handleSelectImage}
        />
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  closeButton: {
    padding: 5,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  settingsButton: {
    padding: 5,
  },
  cameraSection: {
    height: 100,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  cameraIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#405DE6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  cameraText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  recentsSection: {
    flex: 1,
  },
  recentsTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  recentsTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  selectMultiple: {
    color: '#0095F6',
    fontSize: 14,
    fontWeight: '500',
  },
  photoItem: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    padding: 1,
  },
  photo: {
    flex: 1,
    backgroundColor: '#222',
  },
});

export default StoryScreen; 