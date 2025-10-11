import { BackHandler } from 'react-native';
import { useEffect } from 'react';
import { useNavigation, CommonActions } from '@react-navigation/native';

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

// Safe navigation utility to prevent "cannot remove child index" errors
export const safeNavigate = (navigation: any, screenName: string, params?: any) => {
  try {
    if (navigation.canGoBack()) {
      navigation.navigate(screenName, params);
    } else {
      // Use reset if we can't navigate normally
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            {
              name: screenName,
              params: params,
            },
          ],
        })
      );
    }
  } catch (error) {
    console.error('Navigation error:', error);
    // Fallback to reset navigation
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'MainTab' }],
      })
    );
  }
};

// Safe go back utility
export const safeGoBack = (navigation: any, fallbackScreen?: string) => {
  try {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else if (fallbackScreen) {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            {
              name: fallbackScreen,
            },
          ],
        })
      );
    } else {
      // Default fallback to MainTab
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'MainTab' }],
        })
      );
    }
  } catch (error) {
    console.error('Go back error:', error);
    // Emergency fallback
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'MainTab' }],
      })
    );
  }
}; 