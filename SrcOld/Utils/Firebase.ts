import NotifService from "./NotifService";

import notifee, { AndroidImportance, AndroidStyle } from '@notifee/react-native';

let notif: NotifService
export const setupPushNotification = async () => {

    notif = new NotifService(
        onRegister,
        onNotif,
    );

    //  notif.requestPermissions()
}

const onRegister = (token: any) => {
    console.log("FcmToken", token)

}

const onNotif = (notification: any) => {
    console.log("notif", notification)

   

        handleNotif(notification)
    
}

const handleNotif = (notification: any) => {
    console.log("this one is calling......1" , notification);


    const data = notification.data
    if (!notification.userInteraction) {
        if (data) {
            let allowToShow = true
            if (data.send_time) {

                const currentTime = Math.round(new Date().getTime() / 1000)

                const diff = currentTime - data.send_time

                allowToShow = diff < 180
            }

            // console.log("allowToShow", allowToShow,data?.type);


            if (allowToShow) {
                let message;
               
                notif.localNotif({
                    importance: "high",
                    message: data?.message || data?.text || notification?.notification?.body,
                    title: data.title ,
                    userInfo: data,
                    soundName: data.sound || "default",
                    id: notification.id
                })

            }
            // if (AppState.currentState == "background" || AppState.currentState == "inactive")
            handlePerm(notification)
        }
    } else {
        handleRedirection(notification)
    }
}


const handlePerm = async (notification: any) => {
    console.log("notification...from handlePerm method....", notification);

    if (notification && notification.data) {
        const { type, data, text } = notification.data
        console.log("this one is request..... from firebase", type);

       
           
               




           
               


           

            

}
}
export const handleRedirection = (notification: any) => {
    console.log("this one is calling......2" , notification);

    if (notification && notification.data) {
        const { title, data } = notification.data;
        console.log("this one is request..... from firebase", title);

        // Handle redirection based on the type
        switch (title) {
            case 'chat':
                // Navigate to chat screen
                break;
            case 'event':
                // Navigate to event details
                break;
            case 'offer':
                // Navigate to offer details
                break;
            case "New Follow Request":
                
            default:
                // Default action or no action
                break;
        }
    }
    
    
}


export const sendNotification = async (notification: any) => {
    notif.localNotif(notification)
}


export const sendActionNotification = async (notification: any) => {
    notif.localNotifWithAction(notification)
}


export const clearNotification = async (id: any) => {
    notif.cancelNotif(id)
}


    // PushNotificationHandler.js

export const PushNotificationHandler = async (remoteMessage:any) => {
  try {
    const { title, body, image } = remoteMessage.data || {};

    await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
      importance: AndroidImportance.HIGH,
    });

    await notifee.displayNotification({
      title: title || 'Notification',
      body: body || 'You have a new message',
      android: {
        channelId: 'default',
        smallIcon: 'ic_notification_icon', // ensure this exists
        importance: AndroidImportance.HIGH,
        style: image
          ? {
              type: AndroidStyle.BIGPICTURE,
              picture: image,
            }
          : undefined,
        pressAction: { id: 'default' },
      },
    });
  } catch (e) {
    console.log("PushNotificationHandler Error:", e);
  }
};



