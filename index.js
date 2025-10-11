/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import {setupPushNotification} from './Src/Utils/Firebase';
import PushNotifications from './Src/Screens/PushNotifications';
AppRegistry.registerComponent(appName, () => App);
setupPushNotification();
AppRegistry.registerHeadlessTask('MyHeadlessTaskName',() => PushNotifications);