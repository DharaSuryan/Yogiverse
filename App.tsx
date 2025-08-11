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
import { SafeAreaView } from 'react-native';
import NotifService from './Src/Utils/NotifService';

// const notifService = new NotifService(
//   ({ token }) => {
//     // Save token to AsyncStorage or Redux if needed
//     // AsyncStorage.setItem('fcmToken', token);
//     console.log('FCM Token:', token);
//   },
//   (message) => {
//     console.log("yes comes here message", message);

//     // Show local notification in foreground only if notification payload exists
//     if (message?.notification && (message?.notification?.title || message?.notification?.body)) {
//       notifService.localNotif({
//         title: message?.notification?.title,
//         body: message?.notification?.body,
//         image: message?.notification?.android?.imageUrl,
//         channelId: 'default',
//         soundName: 'default'
//       });
//     }
//     // If you want to show notification for data-only messages, you can add logic here:
//     // if (message?.data && message?.data?.type) {
//     //   notifService.localNotif({
//     //     title: 'Notification',
//     //     body: JSON.stringify(message.data),
//     //     channelId: 'default',
//     //     soundName: 'default'
//     //   });
//     // }
//   }
// );

const App = () => {
  // useEffect(() => {
  //   // Register FCM token
  //   registerFCMToken();

  //   // Setup FCM listeners
  //   const unsubscribe = setupFCMListeners();

  //   // Cleanup
  //   return () => {
  //     unsubscribe();
  //   };
  // }, []);

  return (
    <Provider store={store}>
      <SafeAreaView style={{flex: 1}}>
        <Navigation />
      </SafeAreaView>
    </Provider>
  );
};

export default App;



