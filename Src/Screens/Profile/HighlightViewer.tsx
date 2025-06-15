import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

const HighlightViewer = ({ route, navigation }) => {
  const { highlightId } = route.params;
  const [selectedHighlight, setSelectedHighlight] = useState(highlightId);

  // Sample highlights data
  const highlights = [
    {
      id: '1',
      title: 'Yoga',
      cover: 'https://picsum.photos/300',
      stories: [
        { id: '1', media: 'https://picsum.photos/500' },
        { id: '2', media: 'https://picsum.photos/501' },
      ],
    },
    {
      id: '2',
      title: 'Meditation',
      cover: 'https://picsum.photos/301',
      stories: [
        { id: '3', media: 'https://picsum.photos/502' },
        { id: '4', media: 'https://picsum.photos/503' },
      ],
    },
  ];

  const renderHighlightItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.highlightItem,
        selectedHighlight === item.id && styles.selectedHighlight,
      ]}
      onPress={() => setSelectedHighlight(item.id)}
    >
      <Image source={{ uri: item.cover }} style={styles.highlightCover} />
      <Text style={styles.highlightTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  const currentHighlight = highlights.find(h => h.id === selectedHighlight);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{currentHighlight.title}</Text>
        <TouchableOpacity>
          <Icon name="ellipsis-horizontal" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={highlights}
        renderItem={renderHighlightItem}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.highlightsList}
      />

      <FlatList
        data={currentHighlight.stories}
        renderItem={({ item }) => (
          <View style={styles.storyContainer}>
            <Image source={{ uri: item.media }} style={styles.storyImage} />
          </View>
        )}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
      />
    </View>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  highlightsList: {
    padding: 16,
  },
  highlightItem: {
    marginRight: 16,
    alignItems: 'center',
  },
  selectedHighlight: {
    borderBottomWidth: 2,
    borderBottomColor: '#000',
  },
  highlightCover: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 4,
  },
  highlightTitle: {
    fontSize: 12,
    color: '#333',
  },
  storyContainer: {
    width: width,
    height: '100%',
  },
  storyImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
});

export default HighlightViewer; 