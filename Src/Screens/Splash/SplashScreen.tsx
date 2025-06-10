import React, { useEffect } from 'react';
import { View, Image, Animated, Dimensions, StatusBar, SafeAreaView } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styles from './Style';

interface SplashScreenProps {
    navigation: NavigationProp<any>;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
    const fadeAnim = new Animated.Value(0);
    const insets = useSafeAreaInsets();

    useEffect(() => {
        // Start fade in animation
        Animated.sequence([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1500,
                useNativeDriver: true,
            }),
            Animated.delay(1000), // Show splash for 1 second
        ]).start(() => {
            // Navigate to Login screen after animation
            navigation.navigate('Main');
        });
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <Animated.View 
                style={[
                    styles.content,
                    { 
                        opacity: fadeAnim,
                        paddingTop: insets.top,
                        paddingBottom: insets.bottom,
                    }
                ]}
            >
                <Image
                    source={require('../../Assets/yoga.jpg')}
                    style={styles.image}
                    resizeMode="cover"
                />
                <Animated.Text 
                    style={[
                        styles.title,
                        { opacity: fadeAnim }
                    ]}
                >
                    YOGIVERSE
                </Animated.Text>
                <Animated.Text 
                    style={[
                        styles.subtitle,
                        { opacity: fadeAnim }
                    ]}
                >
                    Body, Mind, and Spirit
                </Animated.Text>
            </Animated.View>
        </SafeAreaView>
    );
};

export default SplashScreen; 