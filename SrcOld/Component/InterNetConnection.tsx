import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const NoInternet = ({ onRetry }: { onRetry?: () => void }) => (
  <View style={styles.container}>
    <Ionicons name="wifi-off" size={64} color="#ccc" />
    <Text style={styles.title}>No Internet Connection</Text>
    <Text style={styles.subtitle}>
      Please check your network settings and try again.
    </Text>
    {onRetry && (
      <TouchableOpacity style={styles.button} onPress={onRetry}>
        <Text style={styles.buttonText}>Retry</Text>
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 16,
    color: '#333'
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
    color: '#555',
    textAlign: 'center'
  },
  button: {
    marginTop: 24,
    backgroundColor: '#bea063',
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 8
  },
  buttonText: {
    color: '#fff',
    fontSize: 16
  }
});

export default NoInternet;
