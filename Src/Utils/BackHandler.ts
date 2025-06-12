import { BackHandler } from 'react-native';
import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';

export const useBackHandler = (onBackPress?: () => boolean) => {
  const navigation = useNavigation();

  useEffect(() => {
    const backAction = () => {
      if (onBackPress) {
        return onBackPress();
      }
      
      if (navigation.canGoBack()) {
        navigation.goBack();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [navigation, onBackPress]);
}; 