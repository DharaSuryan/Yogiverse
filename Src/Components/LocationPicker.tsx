import React, { useEffect, useState } from 'react';
import {
  View,
  TextInput,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../Navigation/types';

interface LocationOption {
  display_name: string;
  lat: string;
  lon: string;
  [key: string]: any;
}

interface LocationPickerProps {
  value: LocationOption | null;
  onChange: (location: LocationOption) => void;
  style?: object;
  isFromUserProfile?: boolean;
}

const LocationPicker: React.FC<LocationPickerProps> = ({ value, onChange, style, isFromUserProfile }) => {
  const [locationInput, setLocationInput] = useState(value ? value.display_name : '');
  const [locationOptions, setLocationOptions] = useState<LocationOption[]>([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    if (!locationInput.trim()) {
      setLocationOptions([]);
      setLocationLoading(false);
      return;
    }

    const controller = new AbortController();
    setLocationLoading(true);

    const timeout = setTimeout(() => {
      fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationInput)}&addressdetails=1&limit=7`,
        {
          signal: controller.signal,
          headers: {
            'User-Agent': 'YogiverseApp/1.0 (contact@yogiverse.com)',
            'Accept-Language': 'en',
          },
        }
      )
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          setLocationOptions(data || []);
          setLocationLoading(false);
        })
        .catch(err => {
            setLocationOptions([]);
            setLocationLoading(false);
          console.error('Location fetch error:', err);
        });
    }, 500);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [locationInput]);

  const handleSelect = (item: LocationOption) => {
    setLocationInput(item.display_name);
    setShowOptions(false);
    onChange(item);
  };

  const screenHeight = Dimensions.get('window').height;
  const pickerHeight = isFromUserProfile ? screenHeight * 0.5 : screenHeight;
  return (
    <View style={[styles.container, style, isFromUserProfile ? { height: pickerHeight, maxHeight: pickerHeight } : { flex: 1 }]}> 
      <TextInput
        placeholder="Search for a location"
        placeholderTextColor="#bea063"
        value={locationInput}
        onChangeText={text => {
          setLocationInput(text);
          setShowOptions(true);
        }}
        style={styles.input}
        onFocus={() => setShowOptions(true)}
      />
      {locationLoading && <ActivityIndicator size="small" color="#bea063" style={{marginVertical: 8}} />}
      {!locationLoading && showOptions && locationOptions.length === 0 && locationInput.trim().length === 0 && (
        <Text style={{ color: '#bea063', textAlign: 'center', marginVertical: 12 }}>
          Start typing to search for locations...
        </Text>
      )}
      {showOptions && locationOptions.length > 0 && (
        <FlatList
          data={locationOptions}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleSelect(item)}>
              <View style={styles.itemContainer}>
                <Text style={styles.itemTitle}>{item.display_name.split(',')[0]}</Text>
                {item.display_name.split(',').length > 1 && (
                  <Text style={styles.itemSubtitle}>{item.display_name.split(',').slice(1).join(',').trim()}</Text>
                )}
              </View>
            </TouchableOpacity>
          )}
          style={styles.list}
        />
      )}
    </View>
  );
};

export default LocationPicker;

export type { LocationOption };

const styles = StyleSheet.create({
  container: {
    width: '100%',
    zIndex: 10,
    backgroundColor: '#fff',
    padding: 16,
    flex: 1,
  },
  input: {
    borderWidth: 0,
    padding: 12,
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    color: '#bea063',
    fontSize: 16,
  },
  itemContainer: {
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderBottomWidth: 0,
    marginBottom: 2,
  },
  itemTitle: {
    color: '#bea063',
    fontSize: 16,
    fontWeight: '500',
  },
  itemSubtitle: {
    color: '#bea063',
    fontSize: 13,
    marginTop: 2,
  },
  list: {
    maxHeight: 320,
    backgroundColor: '#fff',
    borderWidth: 0,
    borderRadius: 12,
  },
}); 