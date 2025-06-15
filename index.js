/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import PushNotifications from './Src/Screens/PushNotifications';
AppRegistry.registerComponent(appName, () => App);
AppRegistry.registerHeadlessTask(
  'RNFirebaseBackgroundMessage',
  () => PushNotifications,
);