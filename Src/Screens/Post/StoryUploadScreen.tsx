import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Dimensions,
  Alert,
  Platform,
  Switch,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'react-native-image-picker';
import { postStories } from '../../Api/Api';
import LocationPicker, { LocationOption } from '../../Components/LocationPicker';
import { useNavigation, useFocusEffect, CommonActions } from '@react-navigation/native';
import MediaEditModal from './MediaEditModal';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const StoryUploadScreen = () => {
  const navigation = useNavigation();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<LocationOption | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<'input' | 'location' | null>(null);
  const [pendingModal, setPendingModal] = useState<'input' | 'location' | null>(null);
  const [mentionInput, setMentionInput] = useState('');
    const [mentionSuggestions, setMentionSuggestions] = useState<any[]>([]);
    const [selectedMentions, setSelectedMentions] = useState<number[]>([]);
    const [selectedMentionUsers, setSelectedMentionUsers] = useState<any[]>([]);
    const [mentionLoading, setMentionLoading] = useState(false);

  // Step 1: Pick image on mount
  React.useEffect(() => {
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
        if (asset.uri) {
          setSelectedImage(asset.uri);
          setShowEditModal(true); // Open filter modal first
        }
      }
    );
  }, []);

  // Step 2: Tap to open input modal
  const handleImageTap = () => {
    setShowEditModal(true);
  };

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (mentionInput.trim().length > 0) {
        setMentionLoading(true);
        try {
          const authToken = await AsyncStorage.getItem('accessToken');
          const headers = {
            'Accept': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          };
          console.log("Mention Input:", mentionInput);
          
          const res = await axios.get(
            `https://pashuahar.com/users/search/?query=${mentionInput}`,
            { headers }
          );
          console.log("Mention Suggestions Response:", res.data);
          
          setMentionSuggestions(res.data || []);
        } catch (error: any) {
          console.log("Error fetching mentions:", error);
          
          setMentionSuggestions([]);
        } finally {
          setMentionLoading(false);
        }
      } else {
        setMentionSuggestions([]);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(delayDebounce);
  }, [mentionInput]);

  // Handle pending modal transitions
  React.useEffect(() => {
    if (pendingModal && activeModal === null) {
      setActiveModal(pendingModal);
      setPendingModal(null);
    }
  }, [activeModal, pendingModal]);

  // Step 3: Handle story upload
  const handleNext = async () => {
    const imageToUpload = processedImage || selectedImage;
    if (!imageToUpload) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('caption', caption);
      formData.append('is_highlighted', isHighlighted ? 'true' : 'false');
      formData.append('media_metadata', JSON.stringify([{ is_video: false }]));
      formData.append('media_file', {
        uri:  imageToUpload,
        type: 'image/jpeg',
        name: 'story.jpg',
      });
      if (selectedLocation) {
        formData.append('location', selectedLocation.display_name);
      } else {
        formData.append('location', '');
      }
      if (selectedMentions.length > 0) {
            selectedMentions.forEach(id => {
              formData.append('mentions', id);
            });
          }
          console.log("formData",formData);
          // return
          
      await postStories({ formData });
      Alert.alert('Success', 'Your story has been uploaded!');
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{
            name: 'MainTab',
            params: {
              screen: 'HomeTab',
              refreshStories: true
            }
          }]
        })
      );
      // Signal HomeScreen to refresh stories
      // navigation.navigate({
      //   name: 'HomeScreen',
      //   params: { refreshStories: true },
      //   merge: true,
      // });
      // navigation.goBack();
    } catch (e) {
      if (e && typeof e === 'object') {
        console.log('erororo (full error):', JSON.stringify(e, Object.getOwnPropertyNames(e), 2));
      } else {
        console.log('erororo:', e);
      }
      Alert.alert('Error', 'Failed to upload story.');
    } finally {
      setUploading(false);
    }
  };

  if (!selectedImage) return null;

  // Debug modal states
  console.log("Modal states - activeModal:", activeModal, "showEditModal:", showEditModal, "pendingModal:", pendingModal);

  return (
    <View style={styles.container}>
      {/* Close button in top-left corner */}
      <TouchableOpacity 
        style={styles.topCloseButton} 
        onPress={() => {
          Alert.alert(
            'Discard Story?',
            'Are you sure you want to discard this story? Your changes will be lost.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() }
            ]
          );
        }}
      >
        <Text style={styles.topCloseButtonText}>✕</Text>
      </TouchableOpacity>
      
      {/* Next button in top-right corner */}
      <TouchableOpacity style={styles.topNextButton} onPress={handleNext} disabled={uploading}>
        {uploading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.topNextButtonText}>Next</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.imageContainer} activeOpacity={0.95} onPress={() => setShowEditModal(true)}>
        <Image source={{ uri: processedImage || selectedImage }} style={styles.image} resizeMode="cover" />
      </TouchableOpacity>

      {/* Bottom Toolbar */}
      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.toolbarButton} onPress={() => {
          // Force close any other modals first
          setActiveModal(null);
          
          // Toggle the edit modal
          setShowEditModal(prev => !prev);
        }}>
          <Text style={styles.toolbarButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolbarButton} onPress={() => {
          console.log("=== CAPTION BUTTON PRESSED ===");
          console.log("Current showEditModal:", showEditModal);
          console.log("Current activeModal:", activeModal);
          setShowEditModal(false);
          setActiveModal('input');
        }}>
          <Text style={styles.toolbarButtonText}>Caption</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolbarButton} onPress={() => {
          setShowEditModal(false);
          setActiveModal('location');
        }}>
          <Text style={styles.toolbarButtonText}>Location</Text>
        </TouchableOpacity>
      </View>
      {/* Input Modal for Caption and Address */}
      <Modal visible={activeModal === 'input'} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.inputModal}>
            {/* Close button */}
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setActiveModal(null)}
            >
              <Text style={styles.modalCloseButtonText}>✕</Text>
            </TouchableOpacity>
            
            <Text style={[styles.inputLabel, { color: '#bea063' }]}>Add a caption...</Text>
            <TextInput
              style={[styles.captionInput, { borderColor: '#bea063', color: '#bea063' }]}
              placeholder="Write a caption..."
              placeholderTextColor="#bea063"
              value={caption}
              onChangeText={setCaption}
              multiline
            />
            <View style={{paddingHorizontal: 1, marginBottom: 5}}>
                      <Text style={{fontSize: 16, marginTop: 10, color: '#bea063'}}>Mention Users</Text>
                      <TextInput
                        style={{
                          borderWidth: 1,
                          borderColor: '#bea063',
                          borderRadius: 8,
                          padding: 10,
                          marginTop: 10,
                          marginBottom: 5,
                          color: '#bea063'
                        }}
                        placeholder="Type to search users..."
                        placeholderTextColor="#bea063"
                        value={mentionInput}
                        onChangeText={setMentionInput}
                      />
                      {/* Suggestions dropdown */}
                      {mentionLoading ? (
                        <ActivityIndicator size="small" color="#bea063" />
                      ) : mentionSuggestions.length > 0 && (
                        <View style={{backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#bea063', marginTop: 2, maxHeight: 120}}>
                          <ScrollView>
                            {mentionSuggestions.map(user => (
                              <TouchableOpacity
                                key={user.id}
                                style={{padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee'}}
                                onPress={() => {
                                  if (!selectedMentions.includes(user.id)) {
                                    setSelectedMentions(prev => [...prev, user.id]);
                                    setSelectedMentionUsers(prev => [...prev, user]);
                                  }
                                  setMentionInput('');
                                  setMentionSuggestions([]);
                                }}>
                                <Text style={{color: '#bea063'}}>{user.username} ({user.first_name} {user.last_name})</Text>
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        </View>
                      )}
                      {/* Show selected mentions */}
                      {selectedMentionUsers.length > 0 && (
                        <View style={{flexDirection: 'row', flexWrap: 'wrap', marginTop: 6}}>
                          {selectedMentionUsers.map(u => (
                            <View key={u.id} style={{backgroundColor: '#bea063', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4, marginRight: 6, marginBottom: 4}}>
                              <Text style={{color: '#fff'}}>{u.username}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
            {/* <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 16, marginRight: 10, color: '#bea063' }}>Highlight this story?</Text>
              <Switch
                value={isHighlighted}
                onValueChange={setIsHighlighted}
                trackColor={{ false: '#ccc', true: '#bea063' }}
                thumbColor={isHighlighted ? '#bea063' : '#fff'}
              />
            </View> */}
            <TouchableOpacity
              style={[styles.locationButton, { borderColor: '#bea063' }]}
              onPress={() => {
                // Set pending modal and close current modal
                setPendingModal('location');
                setActiveModal(null);
              }}
            >
              <Text style={{ color: '#bea063' }}>{selectedLocation ? selectedLocation.display_name : 'Select Location'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNext}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.nextButtonText}>Next</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setActiveModal(null)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Location Modal - iOS Compatible */}
      {activeModal === 'location' && (
        <View style={styles.locationModalOverlay}>
          <View style={styles.locationModalContainer}>
            {/* <View style={styles.locationModalHeader}>
              <Text style={styles.locationModalTitle}>Select Location</Text>
              <TouchableOpacity 
                style={styles.locationModalCloseButton}
                onPress={() => {
                  setActiveModal(null);
                }}
              >
                <Text style={styles.locationModalCloseText}>✕</Text>
              </TouchableOpacity>
            </View> */}
            <View style={styles.locationModalContent}>
              <LocationPicker
                value={selectedLocation}
                onChange={location => {
                  setSelectedLocation(location);
                  setActiveModal(null); // Close location modal after selecting
                }}
              />
            </View>
          </View>
        </View>
      )}
      {/* Pinch/Filter Edit Modal */}
      <Modal 
        visible={showEditModal && activeModal === null} 
        animationType="slide" 
        transparent={false}
        onRequestClose={() => {
          console.log("=== MODAL ONREQUESTCLOSE ===");
          setShowEditModal(false);
        }}
        presentationStyle="fullScreen"
      >
        <MediaEditModal
          uri={processedImage || selectedImage}
          onApply={({ uri }) => {
            console.log("=== MEDIA EDIT MODAL APPLY ===");
            setProcessedImage(uri);
            setShowEditModal(false);
            // Don't automatically open caption modal - let user choose
          }}
          onCancel={() => {
            console.log("=== MEDIA EDIT MODAL CANCEL ===");
            setShowEditModal(false);
            // Don't automatically open caption modal - let user choose
          }}
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    flex: 1,
    width: screenWidth,
    height: screenHeight,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputModal: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'stretch',
    maxHeight: '80%',
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#222',
    textAlign: 'center',
  },
  captionInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    minHeight: 60,
    marginBottom: 16,
    color: '#222',
    textAlignVertical: 'top',
  },
  locationButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  nextButton: {
    backgroundColor: '#bea063',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  cancelButton: {
    alignItems: 'center',
    padding: 10,
  },
  cancelButtonText: {
    color: '#888',
    fontSize: 16,
  },
  toolbar: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'transparent',
    borderRadius: 10,
    padding: 0,
    zIndex: 10,
  },
  toolbarButton: {
    backgroundColor: '#bea063',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  toolbarButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  topCloseButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    zIndex: 10,
  },
  topCloseButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  topNextButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: '#bea063',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    zIndex: 10,
  },
  topNextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 15,
    paddingVertical: 6,
    paddingHorizontal: 10,
    zIndex: 10,
  },
  modalCloseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  locationModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1000,
  },
  locationModalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: Platform.OS === 'ios' ? 44 : 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  locationModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  locationModalTitle: {
    color: '#bea063',
    fontSize: 18,
    fontWeight: 'bold',
  },
  locationModalCloseButton: {
    backgroundColor: '#bea063',
    borderRadius: 15,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  locationModalCloseText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  locationModalContent: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 0,
  },
});

export default StoryUploadScreen; 