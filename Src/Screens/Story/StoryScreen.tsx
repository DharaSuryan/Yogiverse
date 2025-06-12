import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {Camera, useCameraDevices} from 'react-native-vision-camera';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {StoryStackParamList} from '../../Navigation/StoryNavigator';

interface PhotoItem {
  id: string;
  uri: string;
}

type StoryScreenNavigationProp = NativeStackNavigationProp<
  StoryStackParamList,
  'StoryHome'
>;

interface StoryScreenProps {
  navigation: StoryScreenNavigationProp;
}

const {width} = Dimensions.get('window');
const COLUMN_COUNT = 3;
const ITEM_WIDTH = width / COLUMN_COUNT;
const ITEM_HEIGHT = ITEM_WIDTH;

// Mock data for recent photos
const MOCK_PHOTOS: PhotoItem[] = [
  {id: '1', uri: 'https://picsum.photos/400/400?random=1'},
  {id: '2', uri: 'https://picsum.photos/400/400?random=2'},
  {id: '3', uri: 'https://picsum.photos/400/400?random=3'},
  {id: '4', uri: 'https://picsum.photos/400/400?random=4'},
  {id: '5', uri: 'https://picsum.photos/400/400?random=5'},
  {id: '6', uri: 'https://picsum.photos/400/400?random=6'},
  {id: '7', uri: 'https://picsum.photos/400/400?random=7'},
  {id: '8', uri: 'https://picsum.photos/400/400?random=8'},
  {id: '9', uri: 'https://picsum.photos/400/400?random=9'},
  {id: '10', uri: 'https://picsum.photos/400/400?random=10'},
  {id: '11', uri: 'https://picsum.photos/400/400?random=11'},
  {id: '12', uri: 'https://picsum.photos/400/400?random=12'},
];

const StoryScreen: React.FC<StoryScreenProps> = ({navigation}) => {
  const [selectedTab, setSelectedTab] = useState('RECENTS');
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const devices = useCameraDevices();
  const device = devices.back;

  const onTakePhoto = useCallback(async () => {
    try {
      if (device) {
        const photo = await camera.current?.takePhoto({
          flash: flash,
          qualityPrioritization: 'quality',
        });
        if (photo?.path) {
          navigation.navigate('StoryEditor', {imageUri: `file://${photo.path}`});
        }
      }
    } catch (error) {
      console.error('Failed to take photo:', error);
    }
  }, [device, flash, navigation]);

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Icon name="close" size={28} color="#fff" />
      </TouchableOpacity>
      <View style={styles.headerIcons}>
        <TouchableOpacity 
          style={styles.headerIcon}
          onPress={() => setFlash(flash === 'off' ? 'on' : 'off')}>
          <Icon 
            name={flash === 'off' ? "flash-off" : "flash"} 
            size={24} 
            color="#fff" 
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerIcon}>
          <Icon name="settings-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <TouchableOpacity 
        style={[styles.tab, selectedTab === 'CAMERA' && styles.activeTab]}
        onPress={() => setSelectedTab('CAMERA')}>
        <Icon name="camera-outline" size={20} color="#fff" />
        <Text style={styles.tabText}>CAMERA</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.tab, selectedTab === 'RECENTS' && styles.activeTab]}
        onPress={() => setSelectedTab('RECENTS')}>
        <Text style={styles.tabText}>RECENTS</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPhotoItem = ({
    item,
    index,
  }: {
    item: PhotoItem;
    index: number;
  }) => (
    <TouchableOpacity 
      style={styles.photoItem}
      onPress={() => navigation.navigate('StoryEditor', {imageUri: item.uri})}>
      <Image source={{uri: item.uri}} style={styles.photo} />
    </TouchableOpacity>
  );

  const renderCamera = () => {
    if (!device) return null;
    return (
      <View style={styles.cameraContainer}>
        <Camera
          ref={camera}
          style={styles.camera}
          device={device}
          isActive={selectedTab === 'CAMERA'}
          photo={true}
        />
        <TouchableOpacity 
          style={styles.captureButton}
          onPress={onTakePhoto}>
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderTabs()}
      {selectedTab === 'CAMERA' ? (
        renderCamera()
      ) : (
        <FlatList
          data={MOCK_PHOTOS}
          renderItem={renderPhotoItem}
          keyExtractor={item => item.id}
          numColumns={COLUMN_COUNT}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.gridContainer}
        />
      )}
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
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginLeft: 20,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#333',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#fff',
  },
  tabText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  photoItem: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    padding: 1,
  },
  photo: {
    width: '100%',
    height: '100%',
    backgroundColor: '#222',
  },
  gridContainer: {
    paddingBottom: 100, // Adjust as needed for camera controls
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  camera: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 4,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
});

export default StoryScreen; 