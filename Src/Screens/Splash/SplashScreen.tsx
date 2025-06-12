import React, { useEffect } from 'react';
import { View, Image, Animated, Dimensions, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../Store/slices/authSlice';
import styles from './Style';

const SplashScreen = () => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const fadeAnim = new Animated.Value(0);
    const insets = useSafeAreaInsets();

    const checkLoginStatus = async () => {
        try {
            const accessToken = await AsyncStorage.getItem('accessToken');
            const userData = await AsyncStorage.getItem('userData');
            if (accessToken && userData) {
                dispatch(loginSuccess({
                    user: JSON.parse(userData),
                    token: accessToken,
                    refreshToken: await AsyncStorage.getItem('refreshToken') || '',
                }));
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Main' }],
                });
            } else {
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Auth' }],
                });
            }
        } catch (error) {
            navigation.reset({
                index: 0,
                routes: [{ name: 'Auth' }],
            });
        }
    };

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start();

        const timer = setTimeout(() => {
            checkLoginStatus();
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    return (
        <SafeAreaView style={styles.container}>
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
                <Animated.Text style={[styles.title, { opacity: fadeAnim }]}>
                    YOGIVERSE
                </Animated.Text>
                <Animated.Text style={[styles.subtitle, { opacity: fadeAnim }]}>
                    Body, Mind, and Spirit
                </Animated.Text>
            </Animated.View>
        </SafeAreaView>
    );
};

export default SplashScreen;
