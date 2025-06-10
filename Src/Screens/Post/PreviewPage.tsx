import React, { useState } from 'react';
import { View, TextInput, Button, Image, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';

export default function PostDetailsScreen() {
  const { image } = useRoute().params;
  const [caption, setCaption] = useState('');

  return (
    <View style={styles.container}>
      <Image source={{ uri: image }} style={styles.imagePreview} />
      <TextInput
        placeholder="Write a caption..."
        value={caption}
        onChangeText={setCaption}
        style={styles.captionInput}
      />
      {/* Optional: Add tags, location, music etc. */}
      <TouchableOpacity style={styles.shareButton}>
        <Text style={styles.shareText}>Share</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  imagePreview: { width: '100%', height: 200, borderRadius: 8 },
  captionInput: { borderColor: '#ccc', borderWidth: 1, marginTop: 16, padding: 10, borderRadius: 8 },
  shareButton: { backgroundColor: '#3498db', marginTop: 20, padding: 12, borderRadius: 8 },
  shareText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
});
