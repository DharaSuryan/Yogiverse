import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { navigate } from '../../Component/Route';

export default function CreateCollectionScreen() {
  const navigation = useNavigation();
  const [collectionName, setCollectionName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateCollection = async () => {
    if (!collectionName.trim()) {
      Alert.alert('Error', 'Please enter a collection name');
      return;
    }

    setLoading(true);
    try {
      const authToken = await AsyncStorage.getItem('accessToken');
      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      };
      
      const payload = {
        name: collectionName.trim()
      };
      
      const response = await axios.post(
        'https://pashuahar.com/collections/',
        payload,
        { headers }
      );
      
      console.log('Collection created:', response.data);
      
      Alert.alert(
        'Success',
        'Collection created successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate back to saved collections screen
              navigation.goBack();
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('Error creating collection:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create collection';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (collectionName.trim()) {
      Alert.alert(
        'Discard Changes',
        'Are you sure you want to discard this collection?',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Collection</Text>
          <TouchableOpacity 
            onPress={handleCreateCollection}
            disabled={loading || !collectionName.trim()}
          >
            <Text style={[
              styles.createButton,
              (!collectionName.trim() || loading) && styles.createButtonDisabled
            ]}>
              {loading ? 'Creating...' : 'Create'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={collectionName}
              onChangeText={setCollectionName}
              placeholder="Collection name"
              placeholderTextColor="#999"
              autoFocus
              maxLength={50}
              returnKeyType="done"
              onSubmitEditing={handleCreateCollection}
            />
            <Text style={styles.characterCount}>
              {collectionName.length}/50
            </Text>
          </View>

          <View style={styles.infoContainer}>
            <Icon name="information-circle-outline" size={20} color="#666" />
            <Text style={styles.infoText}>
              Create a collection to organize and save your favorite posts
            </Text>
          </View>
        </View>

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#bea063" />
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  cancelButton: {
    fontSize: 16,
    color: '#666',
  },
  createButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#bea063',
  },
  createButtonDisabled: {
    color: '#ccc',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#f9f9f9',
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 5,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 