import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Slider from '@react-native-community/slider';
import { Image as RNImage } from 'react-native';
import {
  Brightness,
  Contrast,
  Grayscale,
  Sepia,
  Saturate,
  HueRotate,
  Invert,
  Blur,
} from 'react-native-image-filter-kit';

const FILTERS = [
  { key: 'none', label: 'None' },
  { key: 'grayscale', label: 'Grayscale' },
  { key: 'sepia', label: 'Sepia' },
  { key: 'saturate', label: 'Saturation', slider: true, min: 0, max: 3, step: 0.01, default: 1 },
  { key: 'hue', label: 'Hue', slider: true, min: 0, max: Math.PI * 2, step: 0.01, default: 0 },
  { key: 'invert', label: 'Negative' },
  { key: 'blur', label: 'Blur', slider: true, min: 0, max: 10, step: 0.1, default: 0 },
];

const applyFilterComponent = (filter, filterValues, brightness, contrast, asset) => {
  let image = (
    <RNImage
      source={{ uri: asset.uri }}
      style={styles.media}
      resizeMode="cover"
    />
  );
  switch (filter) {
    case 'grayscale':
      image = <Grayscale image={image} />;
      break;
    case 'sepia':
      image = <Sepia image={image} />;
      break;
    case 'saturate':
      image = <Saturate amount={filterValues.saturate} image={image} />;
      break;
    case 'hue':
      image = <HueRotate amount={filterValues.hue} image={image} />;
      break;
    case 'invert':
      image = <Invert image={image} />;
      break;
    case 'blur':
      image = <Blur radius={filterValues.blur} image={image} />;
      break;
    default:
      break;
  }
  // Always apply brightness and contrast last
  image = <Brightness amount={brightness} image={<Contrast amount={contrast} image={image} />} />;
  return image;
};

type PreViewForPostRouteParams = {
  media: any[];
  onPreviewDone?: (data: { filteredMedia: any; caption: string }) => void;
};

const PreViewForPost = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<Record<string, PreViewForPostRouteParams>, string>>();
  const media = (route.params && (route.params as any).media) || [];
  const onPreviewDone = (route.params && (route.params as any).onPreviewDone) || undefined;
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [caption, setCaption] = useState('');
  const [brightness, setBrightness] = useState(1); // 1 is neutral
  const [contrast, setContrast] = useState(1); // 1 is neutral
  // Dynamic filter values
  const [saturate, setSaturate] = useState(1);
  const [hue, setHue] = useState(0);
  const [blur, setBlur] = useState(0);

  const asset = media && media[0]; // Only one media for now

  const handleNext = () => {
    if (!asset) {
      Alert.alert('No media selected');
      return;
    }
    if (onPreviewDone) {
      onPreviewDone({
        filteredMedia: {
          ...asset,
          filter: selectedFilter,
          brightness,
          contrast,
          saturate,
          hue,
          blur,
        },
        caption,
      });
    }
    navigation.goBack();
  };

  // For slider filters, show the slider only if the filter is selected
  const renderFilterSlider = () => {
    const filterObj = FILTERS.find(f => f.key === selectedFilter);
    if (!filterObj || !filterObj.slider) return null;
    let value = 1, setValue = () => {}, label = '', min = 0, max = 2, step = 0.01, displayValue = '';
    if (selectedFilter === 'saturate') {
      value = saturate; setValue = setSaturate; label = 'Saturation'; min = 0; max = 3; step = 0.01; displayValue = saturate.toFixed(2);
    } else if (selectedFilter === 'hue') {
      value = hue; setValue = setHue; label = 'Hue'; min = 0; max = Math.PI * 2; step = 0.01; displayValue = hue.toFixed(2);
    } else if (selectedFilter === 'blur') {
      value = blur; setValue = setBlur; label = 'Blur'; min = 0; max = 10; step = 0.1; displayValue = blur.toFixed(1);
    }
    return (
      <View style={styles.sliderContainer}>
        <Text style={styles.sliderLabel}>{label}</Text>
        <Slider
          minimumValue={min}
          maximumValue={max}
          value={value}
          onValueChange={setValue}
          step={step}
          style={styles.slider}
        />
        <Text style={styles.sliderValue}>{displayValue}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Preview</Text>
        <View style={{ width: 24 }} />
      </View>
      <View style={styles.mediaContainer}>
        {asset ? (
          asset.type?.startsWith('video') ? (
            <View style={[styles.media, { backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }] }>
              <Text style={{ color: '#fff', fontSize: 16 }}>Video preview</Text>
            </View>
          ) : (
            applyFilterComponent(selectedFilter, { saturate, hue, blur }, brightness, contrast, asset)
          )
        ) : (
          <Text>No media selected</Text>
        )}
      </View>
      <View style={styles.filterBar}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterButton, selectedFilter === f.key && styles.filterButtonActive]}
            onPress={() => setSelectedFilter(f.key)}
          >
            <Text style={styles.filterText}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {renderFilterSlider()}
      {/* Brightness Slider */}
      <View style={styles.sliderContainer}>
        <Text style={styles.sliderLabel}>Brightness</Text>
        <Slider
          minimumValue={0}
          maximumValue={2}
          value={brightness}
          onValueChange={setBrightness}
          step={0.01}
          style={styles.slider}
        />
        <Text style={styles.sliderValue}>{brightness.toFixed(2)}</Text>
      </View>
      {/* Contrast Slider */}
      <View style={styles.sliderContainer}>
        <Text style={styles.sliderLabel}>Contrast</Text>
        <Slider
          minimumValue={0}
          maximumValue={2}
          value={contrast}
          onValueChange={setContrast}
          step={0.01}
          style={styles.slider}
        />
        <Text style={styles.sliderValue}>{contrast.toFixed(2)}</Text>
      </View>
      <View style={styles.captionContainer}>
        <TextInput
          style={styles.captionInput}
          placeholder="Write a caption..."
          value={caption}
          onChangeText={setCaption}
          multiline
        />
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
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
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  mediaContainer: {
    width: '100%',
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  media: {
    width: '100%',
    height: 400,
  },
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  filterButton: {
    backgroundColor: '#eee',
    borderRadius: 8,
    padding: 8,
    marginHorizontal: 5,
  },
  filterButtonActive: {
    backgroundColor: '#0095f6',
  },
  filterText: {
    color: '#333',
    fontWeight: '500',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 10,
  },
  sliderLabel: {
    width: 80,
    fontSize: 14,
    color: '#333',
  },
  slider: {
    flex: 1,
    marginHorizontal: 10,
  },
  sliderValue: {
    width: 40,
    textAlign: 'right',
    color: '#333',
  },
  captionContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  captionInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    minHeight: 100,
    backgroundColor: '#fff',
  },
  buttonContainer: {
    padding: 16,
  },
  nextButton: {
    backgroundColor: '#0095f6',
    padding: 12,
    borderRadius: 5,
  },
  nextButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default PreViewForPost; 