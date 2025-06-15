import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Navigation/types';

type SplashNavProp = NativeStackNavigationProp<RootStackParamList, 'SplashScreen'>;

const SplashScreen = () => {
  const navigation = useNavigation<SplashNavProp>();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const [accessToken, userData] = await Promise.all([
          AsyncStorage.getItem('accessToken'),
          AsyncStorage.getItem('userData'),
        ]);

        const isLoggedIn = !!(accessToken && userData);

        setTimeout(() => {
          if (isLoggedIn) {
            navigation.reset({
              index: 0,
              routes: [{ name: 'MainTab' }],
            });
          } else {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Auth' }],
            });
          }
        }, 1500); // 1.5 sec splash delay
      } catch (error) {
        console.error('Splash auth check error:', error);
        navigation.reset({
          index: 0,
          routes: [{ name: 'Auth' }],
        });
      }
    };

    checkAuth();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.logoText}>Yogiverse</Text>
      {/* <ActivityIndicator size="large" color="#bea063" style={{ marginTop: 20 }} /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#bea063',
  },
});

export default SplashScreen;
