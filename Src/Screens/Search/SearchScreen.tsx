import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  SafeAreaView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList } from '../../Navigation/types';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SearchGrid from '../../Components/SearchGrid';
import { Post } from '../../Types';

type SearchScreenProps = {
  navigation: NativeStackNavigationProp<MainTabParamList, 'Search'>;
};

const SearchScreen: React.FC<SearchScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    setIsSearching(text.length > 0);
  };

  const handleItemPress = (item: Post) => {
    navigation.navigate('PostDetails', { postId: item.id });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor="#666"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setIsSearching(false);
              }}
            >
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isSearching ? (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsText}>Search results for: {searchQuery}</Text>
          <SearchGrid onItemPress={handleItemPress} />
        </View>
      ) : (
        <View style={styles.exploreContainer}>
          <Text style={styles.exploreTitle}>Explore</Text>
          <SearchGrid onItemPress={handleItemPress} />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#dbdbdb',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 40,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  resultsContainer: {
    flex: 1,
    padding: 10,
  },
  resultsText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#666',
  },
  exploreContainer: {
    flex: 1,
    padding: 10,
  },
  exploreTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
  },
});

export default SearchScreen;