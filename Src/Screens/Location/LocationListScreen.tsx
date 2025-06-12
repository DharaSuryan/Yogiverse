import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { fetchCountries, fetchStates } from '../../Api/Api';
import Icon from 'react-native-vector-icons/Ionicons';

interface Location {
  id: number;
  name: string;
  country_name?: string;
}

const ITEMS_PER_PAGE = 20;

const LocationListScreen = () => {
  const navigation = useNavigation();
  const [view, setView] = useState<'countries' | 'states'>('countries');
  const [selectedCountry, setSelectedCountry] = useState<Location | null>(null);
  const [data, setData] = useState<Location[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, [view, selectedCountry]);

  const loadData = async (isRefreshing = false) => {
    if (loading || (!hasMore && !isRefreshing)) return;

    try {
      setLoading(true);
      let response;

      if (view === 'countries') {
        response = await fetchCountries(isRefreshing ? 1 : page, ITEMS_PER_PAGE);
      } else if (selectedCountry) {
        response = await fetchStates(selectedCountry.id, isRefreshing ? 1 : page, ITEMS_PER_PAGE);
      }

      if (!response || !response.data) {
        throw new Error('No data received');
      }

      const newData = Array.isArray(response.data) ? response.data : 
                     response.data.results ? response.data.results : [];

      if (newData.length === 0) {
        setHasMore(false);
      } else {
        setData(prev => isRefreshing ? newData : [...prev, ...newData]);
        setPage(prev => isRefreshing ? 2 : prev + 1);
        setHasMore(true);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    loadData(true);
  };

  const handleItemPress = (item: Location) => {
    if (view === 'countries') {
      setSelectedCountry(item);
      setView('states');
      setData([]);
      setPage(1);
      setHasMore(true);
    }
  };

  const filteredData = data.filter(item => {
    const searchTerm = searchQuery.toLowerCase();
    const itemName = (item.name || item.country_name || '').toLowerCase();
    return itemName.includes(searchTerm);
  });

  const renderItem = ({ item }: { item: Location }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => handleItemPress(item)}
    >
      <Text style={styles.itemText}>{item.name || item.country_name}</Text>
      {view === 'countries' && (
        <Icon name="chevron-forward" size={20} color="#666" />
      )}
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          if (view === 'states') {
            setView('countries');
            setSelectedCountry(null);
            setData([]);
            setPage(1);
            setHasMore(true);
          } else {
            navigation.goBack();
          }
        }}
      >
        <Icon name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>
      <Text style={styles.title}>
        {view === 'countries' ? 'Countries' : `${selectedCountry?.name} States`}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <TextInput
        style={styles.searchInput}
        placeholder={`Search ${view}...`}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        onEndReached={() => loadData()}
        onEndReachedThreshold={0.5}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        ListFooterComponent={() =>
          loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#0000ff" />
            </View>
          ) : null
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {loading ? 'Loading...' : 'No data found'}
            </Text>
          </View>
        )}
      />
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
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  searchInput: {
    margin: 15,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    fontSize: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemText: {
    fontSize: 16,
    color: '#333',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

export default LocationListScreen; 