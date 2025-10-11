import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Dimensions,
  Image,
} from 'react-native';
import Carousel from 'react-native-snap-carousel';
import Video from 'react-native-video';

import { useNavigation, useRoute, CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
// import { RootStackParamList, MainTabParamList, HomeStackParamList } from '../../Navigation/types';

const windowWidth = Dimensions.get('window').width;

interface PostScreenProps {
  route: {
    params: {
      media: Array<{ uri: string; type: 'image' | 'video' }>;
    };
  };
}

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
  postButton: {
    color: '#0095f6',
    fontWeight: '600',
  },
  carouselContainer: {
    flex: 1,
    backgroundColor: '#000',
    padding: 10,
  },
  carouselItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselMedia: {
    width: '100%',
    height: '100%',
  },
  captionContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  captionInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    minHeight: 100,
    backgroundColor: '#fff',
  },
});

const PostScreen = ({ route, navigation }) => {
  // const navigation = useNavigation<CompositeNavigationProp<
  //   NativeStackNavigationProp<RootStackParamList>,
  //   NativeStackNavigationProp<HomeStackParamList>
  // >>();
  const { media } = route.params;
  const [caption, setCaption] = useState('');

  const handlePost = async () => {
    try {
      const formData = new FormData();
      
      // Add media to form data
      media.forEach((item, index) => {
        formData.append(`media${index}`, {
          uri: item.uri,
          type: item.type === 'video' ? 'video/mp4' : 'image/jpeg',
          name: `media${index}.${item.type === 'video' ? 'mp4' : 'jpg'}`
        });
      });

      // Add caption
      if (caption) {
        formData.append('caption', caption);
      }

      // TODO: Implement actual API call here
      console.log('Posting with media:', media, 'and caption:', caption);
      
      // Navigate back to Home
      // Example API call
      // await api.post('/posts', formData);

      navigation.navigate('MainTab', {
        screen: 'HomeTab',
        params: {
          screen: 'Home',
        },
      });
    } catch (error) {
      console.error('Error posting:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handlePost}>
          <Text style={styles.postButton}>Post</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.carouselContainer}>
        {/* <Carousel
          data={media}
          renderItem={({ item }: { item: { uri: string; type: 'image' | 'video' } }) => (
            <View style={styles.carouselItem}>
              {item.type === 'video' ? (
                <Video
                  source={{ uri: item.uri }}
                  style={styles.carouselMedia}
                  resizeMode="cover"
                  repeat
                />
              ) : (
                <Image
                  source={{ uri: item.uri }}
                  style={styles.carouselMedia}
                  resizeMode="cover"
                />
              )}
            </View>
          )}
          sliderWidth={Dimensions.get('window').width}
          itemWidth={Dimensions.get('window').width}
          enableSnap={true}
          loop={false}
          activeSlideAlignment="start"
          autoplay={false}
          autoplayDelay={5000}
          autoplayInterval={3000}
        /> */}
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

export default PostScreen;
