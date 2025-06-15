import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const ShareModal = ({ visible, onClose, post }) => {
  const [caption, setCaption] = useState('');
  const [selectedAudience, setSelectedAudience] = useState('public');
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);

  const socialPlatforms = [
    { id: 'facebook', name: 'Facebook', icon: 'logo-facebook' },
    { id: 'twitter', name: 'Twitter', icon: 'logo-twitter' },
    { id: 'whatsapp', name: 'WhatsApp', icon: 'logo-whatsapp' },
    { id: 'telegram', name: 'Telegram', icon: 'paper-plane' },
  ];

  const audienceOptions = [
    { id: 'public', label: 'Public', icon: 'globe-outline' },
    { id: 'followers', label: 'Followers', icon: 'people-outline' },
    { id: 'close_friends', label: 'Close Friends', icon: 'heart-outline' },
  ];

  const handleShare = () => {
    // Implement sharing logic here
    console.log('Sharing post:', {
      post,
      caption,
      audience: selectedAudience,
      platforms: selectedPlatforms,
    });
    onClose();
  };

  const togglePlatform = (platformId) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const renderPlatform = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.platformItem,
        selectedPlatforms.includes(item.id) && styles.selectedPlatform
      ]}
      onPress={() => togglePlatform(item.id)}
    >
      <Icon 
        name={item.icon} 
        size={24} 
        color={selectedPlatforms.includes(item.id) ? '#fff' : '#000'} 
      />
      <Text style={[
        styles.platformName,
        selectedPlatforms.includes(item.id) && styles.selectedPlatformText
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Share Post</Text>
            <TouchableOpacity 
              onPress={handleShare}
              disabled={selectedPlatforms.length === 0}
            >
              <Text style={[
                styles.shareButton,
                selectedPlatforms.length === 0 && styles.shareButtonDisabled
              ]}>
                Share
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.postPreview}>
            <Image source={{ uri: post?.image }} style={styles.postImage} />
            <TextInput
              style={styles.captionInput}
              placeholder="Write a caption..."
              value={caption}
              onChangeText={setCaption}
              multiline
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Share to</Text>
            <FlatList
              data={socialPlatforms}
              renderItem={renderPlatform}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.platformsList}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Audience</Text>
            {audienceOptions.map(option => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.audienceOption,
                  selectedAudience === option.id && styles.selectedAudience
                ]}
                onPress={() => setSelectedAudience(option.id)}
              >
                <Icon 
                  name={option.icon} 
                  size={24} 
                  color={selectedAudience === option.id ? '#0095f6' : '#000'} 
                />
                <Text style={[
                  styles.audienceLabel,
                  selectedAudience === option.id && styles.selectedAudienceText
                ]}>
                  {option.label}
                </Text>
                {selectedAudience === option.id && (
                  <Icon name="checkmark" size={24} color="#0095f6" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  shareButton: {
    color: '#0095f6',
    fontWeight: '600',
    fontSize: 16,
  },
  shareButtonDisabled: {
    opacity: 0.5,
  },
  postPreview: {
    padding: 16,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  captionInput: {
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 12,
  },
  section: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  platformsList: {
    marginBottom: 16,
  },
  platformItem: {
    alignItems: 'center',
    marginRight: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  selectedPlatform: {
    backgroundColor: '#0095f6',
    borderColor: '#0095f6',
  },
  platformName: {
    marginTop: 4,
    fontSize: 12,
  },
  selectedPlatformText: {
    color: '#fff',
  },
  audienceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedAudience: {
    backgroundColor: '#f0f8ff',
  },
  audienceLabel: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  selectedAudienceText: {
    color: '#0095f6',
    fontWeight: '600',
  },
});

export default ShareModal;