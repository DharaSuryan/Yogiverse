/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './Src/Store/store';
import Navigation from './Src/Navigation/Navigation';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { registerFCMToken, setupFCMListeners } from './Src/Utils/NotificationConfig';

const App = () => {
  useEffect(() => {
    // Register FCM token
    registerFCMToken();

    // Setup FCM listeners
    const unsubscribe = setupFCMListeners();

    // Cleanup
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <Navigation />
      </SafeAreaProvider>
    </Provider>
  );
};

export default App;

 

