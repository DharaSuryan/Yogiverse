import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Image, StatusBar, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Navigation/types';
import Video from 'react-native-video';
import { registerFCMToken } from '../../Utils/NotificationConfig';
import messaging from '@react-native-firebase/messaging'; // Import messaging for FCM token handling  
type SplashNavProp = NativeStackNavigationProp<RootStackParamList, 'SplashScreen'>;

const { width, height } = Dimensions.get('window');
const SplashScreen = () => {
  const navigation = useNavigation<SplashNavProp>();

  useEffect(() => {
    registerFCMToken()
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
        }, 4000); // 1.5 sec splash delay
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
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      {/* <Image source={require('../../Assets/SplashScreen.jpeg')}  resizeMode={'contain'} style={{flex: 1, // Make ImageBackground cover the whole screen
    justifyContent: 'center', // Center content vertically
    alignItems: 'center',} }/> */}
      {/* <Text style={styles.logoText}>Yogiverse</Text> */}
      {/* <ActivityIndicator size="large" color="#bea063" style={{ marginTop: 20 }} /> */}
      <Video
        source={require('../../Assets/SplashVideo.mp4')} // Replace with your video path
        style={styles.backgroundVideo}
        resizeMode="cover"
        repeat={false}
        muted
        //  fullscreen={true}
        onEnd={() => {}} // optional
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#bea063',
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: undefined,
    height: undefined,
  },
});

export default SplashScreen;
