import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Image,
  TextInput,
} from 'react-native';
// import Carousel from 'react-native-snap-carousel';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CreatePostStackParamList } from '../../Navigation/types';
import { Ionicons } from 'react-native-vector-icons';

interface PostPreviewScreenProps {
  route: {
    params: {
      images: string[];
    };
  };
}

const PostPreviewScreen: React.FC<PostPreviewScreenProps> = ({ route }) => {
  const navigation = useNavigation<NativeStackNavigationProp<
    CreatePostStackParamList,
    'PostPreview'
  >>();
  const { images } = route.params;
  const [caption, setCaption] = useState('');

  const handlePost = () => {
    navigation.navigate('Post', { 
      media: images.map(uri => ({ uri, type: 'image' as const }))
    });
  };

  const handleFilter = () => {
    navigation.navigate('MediaFilter', { 
      media: images.map(uri => ({ uri, type: 'image' as const }))
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleFilter}>
          <Text style={styles.filterButtonText}>Filter</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.carouselContainer}>
        {/* <Carousel
          data={images.map(uri => ({ uri, type: 'image' as const }))}
          renderItem={({ item }: { item: { uri: string; type: 'image' } }) => (
            <View style={styles.carouselItem}>
              <Image
                source={{ uri: item.uri }}
                style={styles.carouselMedia}
                resizeMode="cover"
              />
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

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.postButton} onPress={handlePost}>
          <Text style={styles.postButtonText}>Next</Text>
        </TouchableOpacity>
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
  filterButtonText: {
    color: '#000',
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
  buttonContainer: {
    padding: 16,
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
  captionInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    minHeight: 100,
  },
  buttonContainer: {
    padding: 16,
  },
  postButton: {
    backgroundColor: '#0095f6',
    padding: 12,
    borderRadius: 5,
  },
  postButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PostPreviewScreen;