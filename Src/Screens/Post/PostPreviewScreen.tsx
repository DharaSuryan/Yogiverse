import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { ColorMatrix } from 'react-native-color-matrix-image-filters';

const screenWidth = Dimensions.get('window').width;

const FILTERS = [
  { key: 'normal', matrix: undefined },
  { key: 'grayscale', matrix: require('react-native-color-matrix-image-filters').grayscale() },
  { key: 'sepia', matrix: require('react-native-color-matrix-image-filters').sepia() },
  { key: 'brightness', matrix: require('react-native-color-matrix-image-filters').brightness(1.5) },
  { key: 'contrast', matrix: require('react-native-color-matrix-image-filters').contrast(2) },
];

const PostPreviewScreen = ({ route, navigation }) => {
  const { media, caption, location, zoomScales, selectedFilters, onPost } = route.params;
  console.log("media s....",media);
  
  // Support filter/zoom from either media array or selectedFilters/zoomScales
  const getFilter = (item) => {
    if (item.filter) return item.filter;
    if (selectedFilters && selectedFilters[item.uri]) return selectedFilters[item.uri];
    return 'normal';
  };
  const getZoom = (item) => {
    if (item.zoom) return item.zoom;
    if (zoomScales && zoomScales[item.uri]) return zoomScales[item.uri];
    return 1;
  };

  const handlePost = () => {
    if (onPost) onPost();
  };

  return (
    <View style={styles.container}>
      <ScrollView horizontal pagingEnabled style={styles.mediaScroll}>
        {media.map((item, idx) => {
          console.log("ites m....",item)
          
          const filterKey = getFilter(item);
          const filterObj = FILTERS.find(f => f.key === filterKey);
          const FilterWrapper = filterObj && filterObj.matrix
            ? (props) => <ColorMatrix matrix={filterObj.matrix}>{props.children}</ColorMatrix>
            : React.Fragment;
          return (
            <View key={item.uri} style={styles.mediaItem}>
              <FilterWrapper>
                <Image
                  source={{ uri: item.uri }}
                  style={{
                    width: screenWidth * 0.9,
                    height: screenWidth * 0.9,
                    resizeMode: 'contain',
                    transform: [{ scale: getZoom(item) }],
                  }}
                />
              </FilterWrapper>
            </View>
          );
        })}
      </ScrollView>
      <View style={styles.infoContainer}>
        <Text style={styles.captionLabel}>Caption:</Text>
        <Text style={styles.caption}>{caption}</Text>
        <Text style={styles.locationLabel}>Location:</Text>
        <Text style={styles.location}>{location?.display_name || 'None'}</Text>
      </View>
      <TouchableOpacity style={styles.postButton} onPress={handlePost}>
        <Text style={styles.postButtonText}>Post</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  mediaScroll: {
    maxHeight: screenWidth * 0.95,
    marginBottom: 24,
  },
  mediaItem: {
    width: screenWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContainer: {
    width: '100%',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  captionLabel: {
    color: '#888',
    fontSize: 14,
    marginBottom: 2,
  },
  caption: {
    color: '#222',
    fontSize: 16,
    marginBottom: 10,
  },
  locationLabel: {
    color: '#888',
    fontSize: 14,
    marginBottom: 2,
  },
  location: {
    color: '#222',
    fontSize: 16,
    marginBottom: 10,
  },
  postButton: {
    backgroundColor: '#0095f6',
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 60,
    alignSelf: 'center',
  },
  postButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PostPreviewScreen;