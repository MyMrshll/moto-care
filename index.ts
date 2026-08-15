import { registerRootComponent } from 'expo';
import { LogBox } from 'react-native';

// Suppress Expo Go SDK 53 expo-notifications notice in LogBox
LogBox.ignoreLogs([
  'expo-notifications: Android Push notifications',
  '`expo-notifications` functionality is not fully supported in Expo Go',
  'InternalError Metro has encountered an error',
]);

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);

