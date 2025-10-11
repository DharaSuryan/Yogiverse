import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRoute, useNavigation } from '@react-navigation/native';
import LocationPicker, { LocationOption } from '../../Components/LocationPicker';

const EditPostScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { post, onUpdated } = route.params || {};

  const [editCaption, setEditCaption] = useState<string>(post?.caption || '');
  const [editLocation, setEditLocation] = useState<LocationOption | null>(
    post?.location ? { display_name: post.location, lat: '', lon: '' } : null,
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!post) return;
    setLoading(true);
    try {
      const authToken = await AsyncStorage.getItem('accessToken');
      const headers = {
        Accept: 'application/json',
        Authorization: `Bearer ${authToken}`,
      };

      const postId = post.id;
      const editUrl = post.type === 'reel'
        ? `https://pashuahar.com/reels/${postId}/`
        : `https://pashuahar.com/posts/${postId}/`;

      await axios.patch(
        editUrl,
        {
          caption: editCaption,
          location: editLocation ? editLocation.display_name : '',
        },
        { headers },
      );

      if (typeof onUpdated === 'function') {
        onUpdated({
          id: postId,
          caption: editCaption,
          location: editLocation ? editLocation.display_name : '',
        });
      }

      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', 'Failed to update.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 6, marginRight: 8 }}>
          <Text style={{ color: '#bea063', fontSize: 16 }}>Back</Text>
        </TouchableOpacity>
        <Text style={{ color: '#bea063', fontWeight: 'bold', fontSize: 18 }}>Edit {post?.type === 'reel' ? 'Reel' : 'Post'}</Text>
      </View>

      <View style={{ padding: 16 }}>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: '#ddd',
            borderRadius: 6,
            padding: 12,
            minHeight: 120,
            textAlignVertical: 'top',
            color: 'black',
          }}
          placeholderTextColor={'#bea063'}
          placeholder="Enter caption..."
          value={editCaption}
          onChangeText={setEditCaption}
          multiline
        />

        <LocationPicker
          value={editLocation}
          onChange={setEditLocation}
          style={{ marginTop: 12 }}
          isFromUserProfile={true}
        />

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          style={{
            marginTop: 16,
            backgroundColor: '#bea063',
            borderRadius: 6,
            paddingVertical: 12,
            alignItems: 'center',
          }}>
          {loading ? (
            <ActivityIndicator size={20} color="#fff" />
          ) : (
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>Update</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default EditPostScreen;


