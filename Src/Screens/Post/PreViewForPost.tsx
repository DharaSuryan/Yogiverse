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
import { Canvas, Image as SkiaImage, useImage, Paint, BlurMask, ColorMatrix } from '@shopify/react-native-skia';

const FILTERS = [
  { key: 'none', label: 'None' },
  { key: 'grayscale', label: 'Grayscale' },
  { key: 'sepia', label: 'Sepia' },
  { key: 'saturate', label: 'Saturation', slider: true, min: 0, max: 3, step: 0.01, default: 1 },
  { key: 'hue', label: 'Hue', slider: true, min: 0, max: Math.PI * 2, step: 0.01, default: 0 },
  { key: 'invert', label: 'Negative' },
  { key: 'blur', label: 'Blur', slider: true, min: 0, max: 10, step: 0.1, default: 0 },
];

// Helper functions for color matrices
const grayscaleMatrix = () => [
  0.33, 0.34, 0.33, 0, 0,
  0.33, 0.34, 0.33, 0, 0,
  0.33, 0.34, 0.33, 0, 0,
  0, 0, 0, 1, 0
];
const sepiaMatrix = () => [
  0.393, 0.769, 0.189, 0, 0,
  0.349, 0.686, 0.168, 0, 0,
  0.272, 0.534, 0.131, 0, 0,
  0, 0, 0, 1, 0
];
const invertMatrix = () => [
  -1, 0, 0, 0, 255,
  0, -1, 0, 0, 255,
  0, 0, -1, 0, 255,
  0, 0, 0, 1, 0
];
const saturateMatrix = (s: number) => [
  0.213 + 0.787 * s, 0.715 - 0.715 * s, 0.072 - 0.072 * s, 0, 0,
  0.213 - 0.213 * s, 0.715 + 0.285 * s, 0.072 - 0.072 * s, 0, 0,
  0.213 - 0.213 * s, 0.715 - 0.715 * s, 0.072 + 0.928 * s, 0, 0,
  0, 0, 0, 1, 0
];
const hueMatrix = (angle: number) => {
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);
  const lumR = 0.213;
  const lumG = 0.715;
  const lumB = 0.072;
  return [
    lumR + cosA * (1 - lumR) + sinA * (-lumR),
    lumG + cosA * (-lumG) + sinA * (-lumG),
    lumB + cosA * (-lumB) + sinA * (1 - lumB),
    0, 0,
    lumR + cosA * (-lumR) + sinA * 0.143,
    lumG + cosA * (1 - lumG) + sinA * 0.14,
    lumB + cosA * (-lumB) + sinA * -0.283,
    0, 0,
    lumR + cosA * (-lumR) + sinA * (-(1 - lumR)),
    lumG + cosA * (-lumG) + sinA * lumG,
    lumB + cosA * (1 - lumB) + sinA * lumB,
    0, 0,
    0, 0, 0, 1, 0
  ];
};
const brightnessMatrix = (b: number) => [
  b, 0, 0, 0, 0,
  0, b, 0, 0, 0,
  0, 0, b, 0, 0,
  0, 0, 0, 1, 0
];
const contrastMatrix = (c: number) => {
  const t = 128 * (1 - c);
  return [
    c, 0, 0, 0, t,
    0, c, 0, 0, t,
    0, 0, c, 0, t,
    0, 0, 0, 1, 0
  ];
};

const applyFilterComponent = (
  filter: string,
  filterValues: { saturate: number; hue: number; blur: number },
  brightness: number,
  contrast: number,
  asset: any
) => {
  const image = useImage(asset?.uri || '');
  if (!image) return <View style={styles.media} />;

  // Compose color matrix
  let colorMatrix: number[] | undefined = undefined;
  if (filter === 'grayscale') colorMatrix = grayscaleMatrix();
  else if (filter === 'sepia') colorMatrix = sepiaMatrix();
  else if (filter === 'invert') colorMatrix = invertMatrix();
  else if (filter === 'saturate') colorMatrix = saturateMatrix(filterValues.saturate);
  else if (filter === 'hue') colorMatrix = hueMatrix(filterValues.hue);

  // Always apply brightness and contrast last
  let composedMatrix = brightnessMatrix(brightness);
  const contrastMat = contrastMatrix(contrast);
  // Multiply color matrices if needed
  if (colorMatrix) {
    // Skia does not support matrix multiplication directly, so we apply them in sequence
    // We'll nest ColorMatrix nodes
    return (
      <Canvas style={styles.media}>
        <ColorMatrix matrix={composedMatrix}>
          <ColorMatrix matrix={contrastMat}>
            <ColorMatrix matrix={colorMatrix}>
              {filter === 'blur' && filterValues.blur > 0 ? (
                <Paint>
                  <BlurMask blur={filterValues.blur} style="normal" />
                </Paint>
              ) : null}
              <SkiaImage image={image} fit="cover" width={400} height={400} />
            </ColorMatrix>
          </ColorMatrix>
        </ColorMatrix>
      </Canvas>
    );
  }
  // If only blur, brightness, contrast
  return (
    <Canvas style={styles.media}>
      <ColorMatrix matrix={composedMatrix}>
        <ColorMatrix matrix={contrastMat}>
          {filter === 'blur' && filterValues.blur > 0 ? (
            <Paint>
              <BlurMask blur={filterValues.blur} style="normal" />
            </Paint>
          ) : null}
          <SkiaImage image={image} fit="cover" width={400} height={400} />
        </ColorMatrix>
      </ColorMatrix>
    </Canvas>
  );
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
    let value = 1, setValue = (v: number) => {}, label = '', min = 0, max = 2, step = 0.01, displayValue = '';
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
          placeholderTextColor="#000000"

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