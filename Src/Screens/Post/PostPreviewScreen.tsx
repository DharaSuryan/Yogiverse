import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { ColorMatrix } from 'react-native-color-matrix-image-filters';
import Ionicons from 'react-native-vector-icons/Ionicons';

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

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Header with back arrow */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#bea063" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Preview</Text>
        <View style={{width: 28}} />
      </View>
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
        <Text style={[styles.postButtonText, { color: '#fff' }]}>Post</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    // justifyContent: 'center',
    padding: 16,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    marginBottom: 8,
  },
  backButton: {
    padding: 4,
    marginLeft: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#bea063',
    textAlign: 'center',
    flex: 1,
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
    color: '#bea063',
    fontSize: 14,
    marginBottom: 2,
  },
  caption: {
    color: '#222',
    fontSize: 16,
    marginBottom: 10,
  },
  locationLabel: {
    color: '#bea063',
    fontSize: 14,
    marginBottom: 2,
  },
  location: {
    color: '#222',
    fontSize: 16,
    marginBottom: 10,
  },
  postButton: {
    backgroundColor: '#bea063',
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 60,
    alignSelf: 'center',
  },
  postButtonText: {
    color: '#bea063',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PostPreviewScreen;