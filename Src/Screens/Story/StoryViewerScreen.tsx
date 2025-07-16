import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Modal,
  FlatList,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useDispatch } from 'react-redux';
const Ionicons = require('react-native-vector-icons/Ionicons').default;
import { Story } from '../../Types/index';
import { markStoryAsViewed } from '../../Store/slices/storySlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const { width, height } = Dimensions.get('window');
const STORY_DURATION = 5000; // 5 seconds per story

interface StoryViewerScreenProps {
  route: {
    params: {
      stories: Story[];
      initialIndex: number;
      isPersonal: boolean;
    };
  };
  navigation: any;
}

interface Viewer {
  id: number;
  username: string;
  profile_picture: string | null;
  first_name?: string;
  last_name?: string;
  email?: string;
  profile_link?: string;
}

const StoryViewerScreen: React.FC<StoryViewerScreenProps> = ({ route, navigation }) => {
  const { stories, initialIndex, isPersonal } = route.params;
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const dispatch = useDispatch();
  const progressInterval = useRef<NodeJS.Timeout>();
  const touchStartTime = useRef<number>(0);
  const touchStartX = useRef<number>(0);
  const [viewers, setViewers] = useState<Viewer[]>([]);
  const [viewersVisible, setViewersVisible] = useState(false);
  const [loadingViewers, setLoadingViewers] = useState(false);
  // Get current user id from AsyncStorage (or pass as prop if available)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  // Add state for highlight modal and highlight list
  const [highlightModalVisible, setHighlightModalVisible] = useState(false);
  const [highlights, setHighlights] = useState<any[]>([]);
  const [highlightLoading, setHighlightLoading] = useState(false);
  const [highlightError, setHighlightError] = useState<string | null>(null);
  const [addToHighlightLoading, setAddToHighlightLoading] = useState(false);
  const [newHighlightTitle, setNewHighlightTitle] = useState('');
  const [createHighlightLoading, setCreateHighlightLoading] = useState(false);
  const [createHighlightError, setCreateHighlightError] = useState<string | null>(null);
  const [showCreateHighlight, setShowCreateHighlight] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('userId').then(setCurrentUserId);
  }, []);

  const currentStory = stories[currentIndex];

  if (!stories || stories.length === 0 || !stories[currentIndex]) {
    return (
      <View style={styles.container}>
        <Text style={{ color: '#fff', textAlign: 'center', marginTop: 40 }}>No stories to display.</Text>
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  }

  const fetchViewers = async () => {
    try {
      setLoadingViewers(true);
      const authToken = await AsyncStorage.getItem('accessToken');
      const headers = {
        Accept: 'application/json',
        Authorization: `Bearer ${authToken}`,
      };
      const res = await fetch(`https://pashuahar.com/stories/${currentStory.id}/viewers/`, {
        headers,
      });
      console.log('fetchViewers raw response:', res);
      console.log('fetchViewers status:', res.status);
      console.log('fetchViewers headers:', res.headers);
      if (!res.ok) {
        if (res.status === 401) {
          Alert.alert('Unauthorized', 'Please log in again to view story viewers.');
        } else {
          Alert.alert('Error', `Failed to fetch viewers (status: ${res.status})`);
        }
        setLoadingViewers(false);
        return;
      }
      const data = await res.json();
      console.log('fetchViewers parsed JSON:', data?.data[0]?.viewer , data?.data[0]?.viewer_profile_data );
      // Transform API response to viewer list with profile data
      let viewerList: Viewer[] = [];
      if (Array.isArray(data?.data)) {
        viewerList = data.data.map((item: any) => {
          const profile = item.viewer_profile_data || {};
          return {
            id: profile.user || profile.id || item.viewer,
            username: profile.username || '',
            profile_picture: profile.profile_picture || null,
            first_name: profile.first_name || '',
            last_name: profile.last_name || '',
            email: profile.email || '',
            profile_link: profile.profile_link || '',
          };
        });
      }
      setViewers(viewerList);
      setViewersVisible(true);
      setLoadingViewers(false);
    } catch (e) {
      setLoadingViewers(false);
      Alert.alert('Error', 'Failed to fetch viewers');
      console.log('Fetch viewers error:', e);
    }
  };
// console.log('isPersonal:', isPersonal, 'stories.length:', stories?.length);

  // Only show viewers button if isPersonal is true and stories.length > 0
  {isPersonal && stories?.length > 0 && (
    <>
    <TouchableOpacity style={styles.viewersButton} onPress={fetchViewers}>
      <Ionicons name="eye" size={24} color="#fff" />
      <Text style={{ color: '#fff', marginLeft: 4 }}>Viewers</Text>
    </TouchableOpacity>
    </>
  )}

  useEffect(() => {
    startProgress();
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [currentIndex]);

  useEffect(() => {
    if (viewersVisible) {
      // Pause the story timer
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    } else {
      // Resume the story timer
      startProgress();
    }
  }, [viewersVisible]);

  useEffect(() => {
    // Mark story as seen if not personal
    const markStoryAsSeen = async () => {
      console.log('markStoryAsSeen called:', { isPersonal, currentIndex, storiesLength: stories.length, story: stories[currentIndex] });
      if (!isPersonal && stories.length > 0 && stories[currentIndex]) {
        try {
          const authToken = await AsyncStorage.getItem('accessToken');
          const headers = {
            Accept: 'application/json',
            Authorization: `Bearer ${authToken}`,
          };
          const url = `https://pashuahar.com/stories/${stories[currentIndex].id}/view/`;
          console.log('Calling POST', url, headers);
          const res = await fetch(url, {
            method: 'POST',
            headers,
          });
          console.log('POST response status:', res.status);
          if (!res.ok) {
            const text = await res.text();
            console.log('POST error response:', text);
          }
        } catch (err) {
          console.log('Failed to mark story as seen:', err);
        }
      }
    };
    markStoryAsSeen();
  }, [currentIndex, isPersonal]);

  useEffect(() => {
    if (highlightModalVisible) {
      // Pause the story timer
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    } else if (!viewersVisible) {
      // Resume the story timer only if viewers modal is not open
      startProgress();
    }
  }, [highlightModalVisible]);

  const startProgress = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }

    progressInterval.current = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 1) {
          clearInterval(progressInterval.current);
          handleNext();
          return 0;
        }
        return prevProgress + 0.01;
      });
    }, STORY_DURATION / 100);
  };

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setProgress(0); // Reset progress only when moving to next story
      dispatch(markStoryAsViewed(currentStory.id));
    } else {
      navigation.goBack();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setProgress(0); // Reset progress only when moving to previous story
    }
  };

  const handleTouchStart = (event: any) => {
    touchStartTime.current = Date.now();
    touchStartX.current = event.nativeEvent.locationX;
  };

  const handleTouchEnd = (event: any) => {
    const touchEndTime = Date.now();
    const touchEndX = event.nativeEvent.locationX;
    const touchDuration = touchEndTime - touchStartTime.current;
    const touchDistance = touchEndX - touchStartX.current;

    if (touchDuration < 200) {
      if (touchDistance > 50) {
        handlePrevious();
      } else if (touchDistance < -50) {
        handleNext();
      }
    }
  };

  // Fetch highlights
  const fetchHighlights = async () => {
    setHighlightLoading(true);
    setHighlightError(null);
    try {
      const authToken = await AsyncStorage.getItem('accessToken');
      const headers = {
        Accept: 'application/json',
        Authorization: `Bearer ${authToken}`,
      };
      const res = await axios.get('https://pashuahar.com/highlights/', { headers });
      console.log('[fetchHighlights] API response:', res.data);
      setHighlights(res.data.data || res.data || []);
      setHighlightModalVisible(true);
    } catch (err) {
      setHighlightError('Failed to load highlights');
      setHighlightModalVisible(true);
      console.log('[fetchHighlights] Error:', err);
    } finally {
      setHighlightLoading(false);
    }
  };

  // Add story to highlight
  const addStoryToHighlight = async (highlightId: number) => {
    setAddToHighlightLoading(true);
    try {
      const authToken = await AsyncStorage.getItem('accessToken');
      const formData = new FormData();
      formData.append('story_ids', currentStory.id.toString());
      const url = `https://pashuahar.com/highlights/${highlightId}/`;

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${authToken}`,
          // Do NOT set Content-Type for FormData in fetch!
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log('addStoryToHighlight error:', errorData);
        Alert.alert('Error', 'Failed to add story to highlight');
      } else {
        setHighlightModalVisible(false);
        Alert.alert('Success', 'Story added to highlight!');
      }
    } catch (err) {
      console.log('addStoryToHighlight error:', err);
      Alert.alert('Error', 'Failed to add story to highlight');
    } finally {
      setAddToHighlightLoading(false);
    }
  };

  const createHighlight = async () => {
    if (!newHighlightTitle.trim()) {
      setCreateHighlightError('Title is required');
      return;
    }
    setCreateHighlightLoading(true);
    setCreateHighlightError(null);
    try {
      const authToken = await AsyncStorage.getItem('accessToken');
      const headers = {
        Accept: 'application/json',
        Authorization: `Bearer ${authToken}`,
      };
      const res = await axios.post('https://pashuahar.com/highlights/', { title: newHighlightTitle }, { headers });
      setNewHighlightTitle('');
      setShowCreateHighlight(false);
      await fetchHighlights(); // Refresh the list
    } catch (err) {
      setCreateHighlightError('Failed to create highlight');
    } finally {
      setCreateHighlightLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      
      {/* Progress Bars */}
      <View style={styles.progressContainer}>
        {stories.map((_, index) => (
          <View key={index} style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${index === currentIndex ? progress * 100 : index < currentIndex ? 100 : 0}%`,
                  backgroundColor: index === currentIndex ? '#fff' : '#fff',
                },
              ]}
            />
          </View>
        ))}
      </View>

      {/* Story Content */}
      <View style={styles.storyContainer}>
        <Image source={{ uri: currentStory.imageUrl }} style={styles.storyImage} />
        {/* Caption overlay */}
        {currentStory.caption ? (
          <View style={styles.captionContainer}>
            <Text style={styles.captionText}>{currentStory.caption}</Text>
          </View>
        ) : null}
        {/* User Info */}
        <View style={styles.userInfo}>
          <TouchableOpacity onPress={() => {
          console.log("press itesm .....", currentStory);
          // return
          
          navigation.navigate('UserProfile', { userId: currentStory.userId, isFromSearch: true })
          }}>
            {currentStory.userProfilePicture && currentStory.userProfilePicture !== 'null' && currentStory.userProfilePicture !== '' && !currentStory.userProfilePicture.includes('placeholder.com') ? (
              <Image
                source={{ uri: currentStory.userProfilePicture }}
                style={styles.profilePicture}
              />
            ) : (
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center' }}>
                <Ionicons name="person-circle-outline" size={36} color="#bea063" />
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.username}>{currentStory.user.username}</Text>
          <Text style={styles.timestamp}>
            {new Date(currentStory.createdAt).toLocaleTimeString()}
          </Text>
        </View>

        {/* Location */}
        {currentStory.location && (
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={16} color="#fff" />
            <Text style={styles.locationText}>{currentStory.location}</Text>
          </View>
        )}
        {/* Left tap area */}
        <TouchableOpacity
          style={[styles.tapArea, { left: 0 }]}
          onPress={handlePrevious}
          activeOpacity={0.2}
        />
        {/* Right tap area */}
        <TouchableOpacity
          style={[styles.tapArea, { right: 0 }]}
          onPress={handleNext}
          activeOpacity={0.2}
        />
      </View>

      {/* Viewers Modal */}
      <Modal visible={viewersVisible} transparent animationType="slide" onRequestClose={() => setViewersVisible(false)}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text style={[styles.modalTitle, { color: '#bea063' }]}>Viewers{viewers.length > 0 ? ` (${viewers.length})` : ''}</Text>
            {loadingViewers ? (
              <ActivityIndicator size="large" color="#bea063" style={{ marginVertical: 20 }} />
            ) : viewers.length === 0 ? (
              <Text style={{ textAlign: 'center', marginVertical: 20, color: '#bea063', fontWeight: 'bold' }}>No viewers yet.</Text>
            ) : (
              <FlatList
                data={viewers}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }: { item: Viewer }) => (
                  <TouchableOpacity
                    style={styles.viewerItem}
                    onPress={() => {
                      navigation.navigate('UserProfile', { userId: item.id, isFromSearch: true });
                    }}
                  >
                    {item.profile_picture ? (
                      <Image source={{ uri: item.profile_picture }} style={styles.viewerAvatar} />
                    ) : (
                      <View style={[styles.viewerAvatar, { backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center' }]}> 
                        <Ionicons name="person-circle-outline" size={32} color="#bea063" />
                      </View>
                    )}
                    <View>
                      <Text style={[styles.viewerName, { color: '#bea063' }]}>{item.username}</Text>
                      <Text style={{ color: '#bea063', fontSize: 13 }}>{item.first_name} {item.last_name}</Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            )}
            <TouchableOpacity onPress={() => setViewersVisible(false)}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Highlight Selection Modal */}
      <Modal
        visible={highlightModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setHighlightModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={[styles.modalContent, { maxHeight: '60%' }]}>  
            <Text style={[styles.modalTitle, { color: '#bea063' }]}>Select Highlight</Text>
            {/* Add Highlight UI */}
            {showCreateHighlight ? (
              <View style={{ marginBottom: 16 }}>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: '#bea063',
                    borderRadius: 8,
                    padding: 10,
                    marginBottom: 8,
                    color: '#bea063',
                  }}
                  placeholder="Highlight Title"
                  placeholderTextColor="#bea063"
                  value={newHighlightTitle}
                  onChangeText={setNewHighlightTitle}
                  autoFocus
                />
                {createHighlightError && <Text style={{ color: 'red', marginBottom: 8 }}>{createHighlightError}</Text>}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
                  <TouchableOpacity
                    style={{ flex: 1, padding: 12, borderWidth: 1, borderColor: '#bea063', borderRadius: 5, alignItems: 'center', backgroundColor: '#fff' }}
                    onPress={() => {
                      setShowCreateHighlight(false);
                      setNewHighlightTitle('');
                      setCreateHighlightError(null);
                    }}
                    disabled={createHighlightLoading}
                  >
                    <Text style={{ color: '#bea063', fontWeight: '600' }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ flex: 1, padding: 12, backgroundColor: '#bea063', borderRadius: 5, alignItems: 'center' }}
                    onPress={createHighlight}
                    disabled={createHighlightLoading}
                  >
                    <Text style={{ fontSize: 16, color: '#fff', fontWeight: '600' }}>{createHighlightLoading ? 'Creating...' : 'Create'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={{ marginBottom: 16, backgroundColor: '#bea063', borderRadius: 8, padding: 12, alignItems: 'center' }}
                onPress={() => setShowCreateHighlight(true)}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>+ Add Highlight</Text>
              </TouchableOpacity>
            )}
            {highlightLoading ? (
              <ActivityIndicator size="large" color="#bea063" style={{ marginVertical: 20 }} />
            ) : highlightError ? (
              <Text style={{ color: 'red', textAlign: 'center', marginVertical: 20 }}>{highlightError}</Text>
            ) : (
              <FlatList
                data={highlights}
                keyExtractor={item => item.id?.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' }}
                    onPress={() => addStoryToHighlight(item.id)}
                    disabled={addToHighlightLoading}
                  >
                    <Text style={{ fontSize: 16, color: '#bea063' }}>{item.title || 'Untitled Highlight'}</Text>
                  </TouchableOpacity>
                )}
              />
            )}
            <TouchableOpacity onPress={() => setHighlightModalVisible(false)} style={{ marginTop: 16 }}>
              <Text style={styles.closeText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Add to Highlight Button (top right, next to close) - ensure it's above close button and clickable */}
      {isPersonal && (
        <TouchableOpacity
          style={[
            styles.closeButton,
            { right: 55, zIndex: 20, backgroundColor: 'rgba(190,160,99,0.2)' } // debug bg, remove if not needed
          ]}
          onPress={() => {
            console.log("here called .......");
            fetchHighlights();
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          disabled={highlightLoading}
        >
          <Ionicons name="star-outline" size={24} color="#fff" />
        </TouchableOpacity>
      )}

      {/* Close Button */}
      <TouchableOpacity style={[styles.closeButton, { zIndex: 10 }]} onPress={() => navigation.goBack()}>
        <Ionicons name="close" size={24} color="#fff" />
      </TouchableOpacity>
      {/* Place the viewers button at the bottom for debug visibility */}
      {isPersonal && stories?.length > 0 && (
        <TouchableOpacity style={[styles.viewersButton, { backgroundColor: '#bea063', borderColor: '#bea063', bottom: 40 }]} onPress={fetchViewers}>
          <Ionicons name="eye" size={24} color="#fff" />
          <Text style={{ color: '#fff', marginLeft: 4 }}>Viewers</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  progressContainer: {
    flexDirection: 'row',
    padding: 10,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  progressBarContainer: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 2,
    borderRadius: 1,
  },
  progressBar: {
    height: '100%',
    borderRadius: 1,
  },
  storyContainer: {
    flex: 1,
  },
  storyImage: {
    width,
    height,
    resizeMode: 'cover',
  },
  userInfo: {
    position: 'absolute',
    top: 50,
    left: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePicture: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  username: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
  timestamp: {
    color: '#ccc',
    fontSize: 14,
    marginLeft: 10,
  },
  locationContainer: {
    position: 'absolute',
    bottom: 50,
    left: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  locationText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 15,
    zIndex: 1,
  },
  tapArea: {
    position: 'absolute',
    top: 0,
    width: '50%',
    height: '100%',
    zIndex: 10,
  },
  viewersButton: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    zIndex: 20,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 12,
    textAlign: 'center',
  },
  viewerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  viewerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  viewerName: {
    fontSize: 16,
  },
  closeText: {
    color: '#bea063',
    textAlign: 'center',
    marginTop: 16,
    fontWeight: 'bold',
  },
  captionContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  captionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'left',
  },
});

export default StoryViewerScreen; 