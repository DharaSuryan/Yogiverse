import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  FlatList,
  Dimensions,
  Image,
} from 'react-native';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute,CompositeNavigationProp } from '@react-navigation/native';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootStackParamList, MainTabParamList } from '../../Navigation/types';

const PostScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
   const { media } = route.params;
    const [caption, setCaption] = useState('');
  
    const handlePost = async () => {
      try {
        // Here you would implement the logic to upload the reel
        // to your backend server
        const formData = new FormData();
        formData.append('video', {
          uri,
          type: 'video/mp4',
          name: 'reel.mp4',
        });
        formData.append('caption', caption);
  
        // Example API call
        // await api.post('/reels', formData);
        
  navigation.navigate('MainTab', {
    screen: 'HomeTab',
    params: {
      screen: 'Home',
    },
  });
      } catch (error) {
        console.error('Error uploading reel:', error);
      }
    };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        {/* <Text style={styles.title}>Preview Reel</Text> */}
        <TouchableOpacity onPress={handlePost}>
          <Text style={styles.postButton}>Post</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mediaSlider}>
  <FlatList
    horizontal
    pagingEnabled
    data={media}
    keyExtractor={(item, index) => index.toString()}
    renderItem={({ item }) =>
      item.type === 'video' ? (
        <Video
          key={item.uri}
          source={{ uri: item.uri }}
          style={styles.mediaItem}
          resizeMode="cover"
          repeat
        />
      ) : (
        <Image
          key={item.uri}
          source={{ uri: item.uri }}
          style={styles.mediaItem}
          resizeMode="contain"
        />
      )
    }
  />
</View>

     <View style={styles.captionContainer}>
            <TextInput
              style={styles.captionInput}
              placeholder="Write a caption..."
              value={caption}
              onChangeText={setCaption}
              multiline
            />
          </View>
    
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  postButton: {
    color: '#0095f6',
    fontWeight: '600',
  },
  videoContainer: {
    width: '100%',
    height: '50%',
    backgroundColor: '#000',
  },
  video: {
    flex: 1,
  },
  captionContainer: {
    padding: 16,
  },
  captionInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    minHeight: 100,
  },
  filterButton: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
  },
  filterButtonText: {
    color: '#000',
  },
  mediaSlider: {
  width: '100%',
  height: '50%',
  backgroundColor: '#000',
},
mediaItem: {
  width: Dimensions.get('window').width,
  height: '100%',
},
});


export default PostScreen;