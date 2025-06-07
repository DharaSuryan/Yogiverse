import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  SafeAreaView,
  Dimensions,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { StoryStackParamList } from '../../Navigation/StoryNavigator';
import LinearGradient from 'react-native-linear-gradient';
import { CommonActions } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

interface StoryEditorScreenProps {
  navigation: NativeStackNavigationProp<StoryStackParamList>;
  route: RouteProp<StoryStackParamList, 'StoryEditor'>;
}

const StoryEditorScreen: React.FC<StoryEditorScreenProps> = ({
  navigation,
  route,
}) => {
  const { imageUri } = route.params;
  const [caption, setCaption] = useState('');
  const [activeTab, setActiveTab] = useState<'text' | 'draw' | 'sticker'>('text');

  useEffect(() => {
    return () => {
      // Cleanup function
      setCaption('');
      setActiveTab('text');
    };
  }, []);

  const handleClose = () => {
    // Reset to home when closing from editor
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'StoryHome' }],
      })
    );
  };

  const handleNext = () => {
    navigation.navigate('StoryPreview', { 
      imageUri,
      caption: caption || '', // Ensure caption is never undefined
    });
  };

  const renderToolbar = () => (
    <View style={styles.toolbar}>
      <TouchableOpacity 
        style={[styles.toolButton, activeTab === 'text' && styles.activeToolButton]} 
        onPress={() => setActiveTab('text')}>
        <Ionicons name="text" size={24} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.toolButton, activeTab === 'draw' && styles.activeToolButton]}
        onPress={() => setActiveTab('draw')}>
        <Ionicons name="brush" size={24} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.toolButton, activeTab === 'sticker' && styles.activeToolButton]}
        onPress={() => setActiveTab('sticker')}>
        <Ionicons name="happy" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={handleClose}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.headerButton}
        >
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Story</Text>
        <TouchableOpacity 
          onPress={handleNext}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.headerButton}
        >
          <Text style={styles.nextButton}>Next</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUri }} style={styles.image} />
        <LinearGradient
          colors={['rgba(0,0,0,0.4)', 'transparent', 'transparent', 'rgba(0,0,0,0.4)']}
          style={styles.gradient}
        />
      </View>

      {renderToolbar()}

      <View style={styles.bottomTools}>
        {activeTab === 'text' && (
          <TextInput
            style={styles.captionInput}
            placeholder="Type something..."
            placeholderTextColor="rgba(255,255,255,0.7)"
            value={caption}
            onChangeText={setCaption}
            multiline
          />
        )}
        {activeTab === 'draw' && (
          <ScrollView horizontal style={styles.colorPicker} showsHorizontalScrollIndicator={false}>
            {['#fff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'].map(color => (
              <TouchableOpacity
                key={color}
                style={[styles.colorButton, { backgroundColor: color }]}
              />
            ))}
          </ScrollView>
        )}
        {activeTab === 'sticker' && (
          <ScrollView horizontal style={styles.stickerPicker} showsHorizontalScrollIndicator={false}>
            {['😊', '❤️', '🌟', '🎉', '👍', '🔥'].map(sticker => (
              <TouchableOpacity key={sticker} style={styles.stickerButton}>
                <Text style={styles.stickerText}>{sticker}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
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
    height: 56,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  nextButton: {
    color: '#0095F6',
    fontSize: 16,
    fontWeight: '600',
  },
  imageContainer: {
    width: width,
    height: height * 0.7,
    backgroundColor: '#222',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  toolButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeToolButton: {
    backgroundColor: '#0095F6',
  },
  bottomTools: {
    flex: 1,
    padding: 15,
  },
  captionInput: {
    color: '#fff',
    fontSize: 16,
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    minHeight: 100,
  },
  colorPicker: {
    flexDirection: 'row',
    paddingVertical: 10,
  },
  colorButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginHorizontal: 5,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  stickerPicker: {
    flexDirection: 'row',
    paddingVertical: 10,
  },
  stickerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  stickerText: {
    fontSize: 24,
  },
});

export default StoryEditorScreen; 