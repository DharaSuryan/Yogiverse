import React, { useRef } from 'react';
import { View, StyleSheet, Alert, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import VideoTrim from 'react-native-video-trim';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';

// Define the expected route params type
interface ReelEditorScreenRouteParams {
  media: { uri: string; type: string };
  onTrimFinish?: (uri: string) => void;
}

type ReelEditorScreenRoute = RouteProp<{ ReelEditor: ReelEditorScreenRouteParams }, 'ReelEditor'>;

const ReelEditorScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<ReelEditorScreenRoute>();
  const { media } = route.params || {};
  const trimmerRef = useRef<any>(null);

  const handleTrim = (trimmedUri: string) => {
    if (trimmedUri) {
      (navigation as any).navigate('ReelPreview', { trimmedUri });
    } else {
      Alert.alert('Error', 'Failed to trim video.');
    }
  };

  // Custom "Save" button triggers the trim
  const handleDone = () => {
    trimmerRef.current?.onTrim();
  };

  if (!media || !media.uri) {
    return (
      <View style={styles.container}>
        <Text style={{ color: '#fff', textAlign: 'center', marginTop: 40 }}>No video found to edit.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={56}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Reel</Text>
          <TouchableOpacity onPress={handleDone}>
            <Text style={styles.doneButton}>Save</Text>
          </TouchableOpacity>
        </View>
        {/* Trimmer */}
        <View style={styles.trimmerContainer}>
          {/* @ts-ignore: VideoTrim may not have proper types for JSX */}
          <VideoTrim
            ref={trimmerRef}
            source={media.uri}
            onFinish={handleTrim}
            onError={(err: any) => Alert.alert('Trim error', err?.message || String(err))}
            themeColor="#bea063"
            // If supported by the library, add a prop to hide the default end button:
            // hideEndButton={true}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    zIndex: 10,
    elevation: 2,
    position: 'relative',
  },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#000' },
  doneButton: { color: '#bea063', fontWeight: '600', fontSize: 16 },
  trimmerContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 32, // Add padding for device nav bar
    backgroundColor: '#000',
  },
});

export default ReelEditorScreen; 