import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';

interface LocationOption {
  display_name: string;
  lat: string;
  lon: string;
  [key: string]: any;
}

const LocationConfirmScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<{ params: { location: LocationOption; onConfirm?: (location: LocationOption) => void } }, 'params'>>();
  const { location, onConfirm } = route.params;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm(location);
    }
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Confirm Location</Text>
      <Text style={styles.locationName}>{location.display_name.split(',')[0]}</Text>
      {location.display_name.split(',').length > 1 && (
        <Text style={styles.locationAddress}>{location.display_name.split(',').slice(1).join(',').trim()}</Text>
      )}
      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
        <Text style={styles.confirmButtonText}>Confirm</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181A20',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  locationName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
  },
  locationAddress: {
    color: '#B0B3B8',
    fontSize: 15,
    marginBottom: 32,
    textAlign: 'center',
  },
  confirmButton: {
    backgroundColor: '#0095f6',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 40,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LocationConfirmScreen; 