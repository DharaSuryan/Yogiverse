import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

// Calculate responsive sizes
const getResponsiveSize = (size: number) => {
  const baseWidth = 375; // Base width (iPhone X width)
  const scale = width / baseWidth;
  const newSize = size * scale;
  return Math.round(newSize);
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: getResponsiveSize(20),
    },
    image: {
        width: Math.min(width * 0.8, 400),
        height: Math.min(width * 0.8, 400),
        marginBottom: getResponsiveSize(20),
        borderRadius: getResponsiveSize(20),
    },
    title: {
        fontSize: getResponsiveSize(48),
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: getResponsiveSize(10),
        letterSpacing: getResponsiveSize(8),
        textAlign: 'center',
        fontFamily: Platform.OS === 'ios' ? 'Noteworthy-Light' : 'normal',
    },
    subtitle: {
        fontSize: getResponsiveSize(20),
        color: '#666666',
        fontStyle: 'italic',
        letterSpacing: getResponsiveSize(1),
        textAlign: 'center',
        marginHorizontal: getResponsiveSize(20),
        fontFamily: Platform.OS === 'ios' ? 'Noteworthy-Light' : 'normal',
    },
});

export default styles; 