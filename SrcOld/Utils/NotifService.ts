import notifee, { AndroidImportance, AndroidStyle, EventType, NotificationIOS } from '@notifee/react-native';
// import messaging from '@react-native-firebase/messaging'; // Commented out - Firebase removed
import { AppState, Platform } from 'react-native';
import { PERMISSIONS, check, request } from 'react-native-permissions';
import { handleRedirection } from './Firebase';
import { NavigationContainerRef } from '@react-navigation/native';

export default class NotifService {
    lastId = 0;
    lastChannelCounter = 0;
    navigationRef: NavigationContainerRef<any> | null = null;

    constructor(onRegister: any, onNotification: any) {
        this.lastId = 0;
        this.lastChannelCounter = 0;
        // messaging().registerDeviceForRemoteMessages(); // Commented out - Firebase removed

        // Firebase messaging calls commented out - Firebase removed
        // if (Platform.OS == "ios") {
        //     messaging().requestPermission().then((res: any) => {
        //         if (res === messaging.AuthorizationStatus.AUTHORIZED ||
        //             res === messaging.AuthorizationStatus.PROVISIONAL
        //         ) {
        //             messaging().getToken().then((token) => {
        //                 onRegister({ token });
        //             }).catch((e) => {});
        //         }
        //     });
        // } else {
        //     if (+Platform.Version >= 33) {
        //         check(PERMISSIONS.ANDROID.POST_NOTIFICATIONS).then((checkResult) => {
        //             if (checkResult == "denied") {
        //                 request(PERMISSIONS.ANDROID.POST_NOTIFICATIONS).then(() => {});
        //             }
        //         }).catch(() => {});
        //     }
        //     messaging().getToken().then((token) => {
        //         onRegister({ token });
        //     }).catch(() => {});
        // }

        // messaging().onTokenRefresh((token) => {
        //     onRegister({ token });
        // });

        // messaging().onMessage((message) => {
        //     console.log("onMessage", message);
        //     
        //     onNotification(message);
        // });

        // messaging().setBackgroundMessageHandler(async (message) => {
        //     console.log("here in background message handler", message);
        //     
        //     onNotification(message);
        // });

        notifee.onForegroundEvent(({ type, detail }) => {
            console.log("onForegroundEvent", type, detail);
            switch (type) {
                case EventType.DISMISSED:
                    break;
                case EventType.PRESS:
                    // Navigate to Notifications screen when notification is pressed
                    if (this.navigationRef) {
                        this.navigationRef.navigate('Notifications' as never);
                    }
                    // Optionally, handleRedirection(detail.notification);
                    break;
            }
        });

        notifee.onBackgroundEvent(async ({ type, detail }) => {
            const { notification, pressAction } = detail;
            if (type == EventType.PRESS) {
                // Navigate to Notifications screen when notification is pressed in background
                if (this.navigationRef) {
                    this.navigationRef.navigate('Notifications' as never);
                }
                notifee.cancelAllNotifications();
            }
        });

        notifee.getBadgeCount().then((number: any) => {
            if (number > 0) {
                notifee.setBadgeCount(0);
            }
        });

        this.createOrUpdateChannel();
    }

    setNavigationRef(ref: NavigationContainerRef<any>) {
        this.navigationRef = ref;
    }

    createOrUpdateChannel() {
        this.lastChannelCounter++;
        notifee.createChannel({
            id: "default",
            name: "Notifications",
            importance: AndroidImportance.HIGH,
            vibration: true
        });
    }

    localNotif(notification: any) {
        // Debug log
        console.log("localNotiflocalNotif", notification);
        

        if(false){

        }
        else {

        console.log("localNotiflocalNotif", notification?.body, notification?.title, notification?.image);

        // Defensive: fallback to notification.body and notification.title if missing
        const title = notification?.title || notification?.notification?.title || "Notification";
        const body = notification?.body || notification?.notification?.body || "You have a new notification";
        // Try to get image from notification.image or notification.notification.android.imageUrl
        const image =
            notification?.image ||
            notification?.notification?.android?.imageUrl ||
            notification?.notification?.imageUrl ||
            "@drawable/ic_notification_icon"; // Fallback to a default icon if no image is provided
            undefined;

        this.lastId++;
        notifee.displayNotification({
            title,
            body,
            android: {
                channelId: notification.channelId || "default",
                smallIcon: '@drawable/src_assets_role',
                color:"#bea063", // Replace with your desired color
                importance: AndroidImportance.HIGH,
                style: image
                    ? {
                        type: AndroidStyle.BIGPICTURE,
                        picture: image,
                    }
                    : undefined,
                pressAction: { id: 'default' },
                sound: notification.soundName || 'default'
            },
            ios: { sound: notification.soundName || 'default' }
        });
    }
    }

    async cancelNotif(id: any) {
        await notifee.cancelNotification(id);
    }

    async cancelAll() {
        await notifee.cancelAllNotifications();
    }
}
