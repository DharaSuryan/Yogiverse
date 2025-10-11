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
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

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

  const screenHeight = dimensions.height;
  const screenWidth = dimensions.width;
  const isIOS = Platform.OS === 'ios';
  
  // Calculate responsive dimensions
  const pickerHeight = isFromUserProfile 
    ? Math.min(screenHeight * 0.5, screenHeight - 200) 
    : screenHeight - (isIOS ? 100 : 80);
  
  const listMaxHeight = Math.min(320, screenHeight * 0.4);
  const isLandscape = screenWidth > screenHeight;

  return (
    <SafeAreaView style={[styles.safeArea, style]}>
      <View style={[
        styles.container, 
        isFromUserProfile 
          ? { height: pickerHeight, maxHeight: pickerHeight } 
          : { flex: 1 },
        isLandscape && styles.landscapeContainer
      ]}> 
        <TextInput
          placeholder="Search for a location"
          placeholderTextColor="#bea063"
          value={locationInput}
          onChangeText={text => {
            setLocationInput(text);
            setShowOptions(true);
          }}
          style={[styles.input, isLandscape && styles.landscapeInput]}
          onFocus={() => setShowOptions(true)}
        />
        {locationLoading && <ActivityIndicator size="small" color="#bea063" style={styles.loader} />}
        {!locationLoading && showOptions && locationOptions.length === 0 && locationInput.trim().length === 0 && (
          <Text style={styles.placeholderText}>
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
            style={[styles.list, { maxHeight: listMaxHeight }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default LocationPicker;

export type { LocationOption };

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    width: '100%',
    zIndex: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 8 : 16,
    paddingBottom: Platform.OS === 'ios' ? 16 : 16,
    flex: 1,
  },
  landscapeContainer: {
    paddingHorizontal: 20,
  },
  input: {
    borderWidth: 0,
    padding: 12,
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    color: '#bea063',
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  landscapeInput: {
    fontSize: 18,
    padding: 16,
  },
  loader: {
    marginVertical: 8,
  },
  placeholderText: {
    color: '#bea063', 
    textAlign: 'center', 
    marginVertical: 12,
    fontSize: 14,
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
    backgroundColor: '#fff',
    borderWidth: 0,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
}); 