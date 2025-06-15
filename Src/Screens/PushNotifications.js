import {Platform, View, AppState} from 'react-native';
import PushNotification, {Importance} from 'react-native-push-notification';
import React, {useContext, useEffect} from 'react';

import PushNotificationIOS from '@react-native-community/push-notification-ios';
import messaging from '@react-native-firebase/messaging';
import InternetPermission from '../Screens/InternetPermission';
import APIWebCall from '../Api/Api';

PushNotification.createChannel({
  channelId: 'yogi-notification-channel-id', // (required)
  channelName: 'Arty Learning', // (required)
  channelDescription: 'Notifications for new messages and updates.', // (optional) default: undefined.
  playSound: true, // (optional) default: true
  soundName: 'default', // (optional) See `soundName` parameter of `localNotification` function
  importance: Importance.HIGH, // (optional) default: Importance.HIGH. Int value of the Android notification importance
  vibrate: true, // (optional) default: true. Creates the default vibration patten if true.
});

const PushNotifications = ({props, navigation}) => {
  const registerTokenAPICall = async (fcmToken) => {
    console.log('fcmToken', fcmToken);
    var isInternetGranted = await InternetPermission.checkInternetPermissions();
    if (isInternetGranted == true) {
      var data = new FormData();
      data.append('token', fcmToken);
      data.append('device_type', Platform.OS === 'ios' ? 'ios' : 'android');
      onAddDevicesAPICall(data);
    }
  };

  const onAddDevicesAPICall = (data) => {
    APIWebCall.onAddDevicesAPICall(data)
      .then(async (response) => {
        var response_api = response;
      })
      .catch((err) => {
        console.log('errrrrrrrrrrrrrrrrrr', err);
      })
      .finally(() => {});
  };

  async function requestUserPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      const fcmToken = await messaging().getToken();

      //console.log('fcmmmmmm777777777777', fcmToken);

      registerTokenAPICall(fcmToken);
      // await PushNotification.configure({
      //   onNotification: function (notification) {

      //     // onNotificationReceive(notification);

      //     if (Platform.OS == 'ios') {
      //       // notification.finish(PushNotificationIOS.FetchResult.NoData);
      //     }

      //     if (notification.userInteraction) {
      //       //When user click on notification then he is here

      //       onPressNotification(notification.data);
      //     }
      //   },
      //   permissions: {
      //     alert: true,
      //     badge: true,
      //     sound: true,
      //   },
      //   popInitialNotification: true,
      //   requestPermissions: true,
      // });

      await PushNotification.configure({
        onNotification: function (notification) {
          // onNotificationReceive(notification);

          if (Platform.OS == 'ios') {
            // if (
            //   notification.foreground &&
            //   (notification.userInteraction || notification.remote)
            // ) {
            //   PushNotification.localNotification(notification);
            // }
            // notification.finish(PushNotificationIOS.FetchResult.NoData);
          }

          if (notification.userInteraction) {
            //When user click on notification then he is here
            onPressNotification(notification.data);
          }
          //  dispatch(vendorHome(VendorInfoParam, true, false));
        },
        permissions: {
          alert: true,
          badge: true,
          sound: true,
        },
        popInitialNotification: true,
        requestPermissions: true,
      });
    }
  }

  const onPressNotification = async (data) => {
    navigation.navigate('ChatScreen', {
      chat_id: data.chat_id,
      group_name: data.group_name,
      group_members: data.group_members,
      //chat_number: item.id,
    });
    // if (
  };

  useEffect(() => {
    requestUserPermission();

    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      console.warn('remoteMessage', remoteMessage);
      if (Platform.OS == 'ios') {
        // PushNotificationIOS.addNotificationRequest({
        //   id: remoteMessage.messageId,
        //   body: remoteMessage.notification.body,
        //   title: remoteMessage.notification.title,
        //   userInfo: remoteMessage.data,
        // });
      } else {
        PushNotification.localNotification({
          /* Android Only Properties */
          channelId: 'yogi-notification-channel-id', // (required) channelId, if the channel doesn't exist, notification will not trigger.
          // showWhen: true, // (optional) default: true
          // autoCancel: true, // (optional) default: true
          smallIcon: 'ic_notification', // (optional) default: "ic_notification" with fallback for "ic_launcher". Use "" for default small icon.
          vibrate: true, // (optional) default: true
          vibration: 300, // vibration length in milliseconds, ignored if vibrate=false, default: 1000
          // color: '#154293',
          // ongoing: false, // (optional) set whether this is an "ongoing" notification
          priority: Importance.HIGH, // (optional) set notification priority, default: high
          // visibility: 'private', // (optional) set notification visibility, default: private
          ignoreInForeground: false, // (optional) if true, the notification will not be visible when the app is in the foreground (useful for parity with how iOS notifications appear). should be used in combine with `com.dieam.reactnativepushnotification.notification_foreground` setting
          onlyAlertOnce: false, // (optional) alert will open only once with sound and notify, default: false
          /* iOS only properties */
          category: '', // (optional) default: empty string
          /* iOS and Android properties */
          // id: 0, // (optional) Valid unique 32 bit integer specified as string. default: Autogenerated Unique ID
          title: remoteMessage.data.title, // (optional)
          message: remoteMessage.data.body, // (required)
          userInfo: remoteMessage.data, // (optional) default: {} (using null throws a JSON value '<null>' error)
          // largeIconUrl: remoteMessage.notification?.android?.imageUrl,
          // bigPictureUrl: remoteMessage.notification?.android?.imageUrl,
          playSound: true, // (optional) default: true
          soundName: 'default', // (optional) Sound to play when the notification is shown. Value of 'default' plays the default sound. It can be set to a custom sound such as 'android.resource://com.xyz/raw/my_sound'. It will look for the 'my_sound' audio file in 'res/raw' directory and play it. default: 'default' (default sound is played)
        });
      }
      return unsubscribe;
    });

    messaging().onNotificationOpenedApp((remoteMessage) => {
      onPressNotification(remoteMessage.data);
    });

    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      onPressNotification(remoteMessage.data);
    });
  }, []);

  return null;
};

export default PushNotifications;
