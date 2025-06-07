import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { RootState } from '../Store/store';
import { RootStackParamList, AuthStackParamList, MainTabParamList, HomeStackParamList } from './types';

// Auth Screens
import LoginScreen from '../Screens/Auth/LoginScreen';
import RegisterScreen from '../Screens/Auth/RegisterScreen';
import ForgotPasswordScreen from '../Screens/Auth/ForgotPasswordScreen';

// Main Screens
import HomeScreen from '../Screens/Home/HomeScreen';
import SearchScreen from '../Screens/Search/SearchScreen';
import CreatePostScreen from '../Screens/Post/CreatePostScreen';
import NotificationsScreen from '../Screens/Notifications/NotificationsScreen';
import ProfileScreen from '../Screens/Profile/ProfileScreen';
import PostDetailsScreen from '../Screens/Post/PostDetailsScreen';
import StoryViewerScreen from '../Screens/Story/StoryViewerScreen';
import CreateStoryScreen from '../Screens/Story/CreateStoryScreen';

// Icons
import { Ionicons } from 'react-native-vector-icons';

const Stack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainTabs = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();

const AuthStackNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
    <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </AuthStack.Navigator>
);

const HomeStackNavigator = () => (
  <HomeStack.Navigator screenOptions={{ headerShown: false }}>
    <HomeStack.Screen name="HomeScreen" component={HomeScreen} />
    <HomeStack.Screen name="PostDetails" component={PostDetailsScreen} />
    <HomeStack.Screen name="StoryViewer" component={StoryViewerScreen} />
    <HomeStack.Screen name="CreateStory" component={CreateStoryScreen} />
  </HomeStack.Navigator>
);

const MainTabNavigator = () => (
  <MainTabs.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        switch (route.name) {
          case 'Home':
            iconName = focused ? 'home' : 'home-outline';
            break;
          case 'Search':
            iconName = focused ? 'search' : 'search-outline';
            break;
          case 'CreatePost':
            iconName = focused ? 'add-circle' : 'add-circle-outline';
            break;
          case 'Notifications':
            iconName = focused ? 'heart' : 'heart-outline';
            break;
          case 'Profile':
            iconName = focused ? 'person' : 'person-outline';
            break;
          default:
            iconName = 'help-outline';
        }

        return <Ionicons name={iconName as any} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#000',
      tabBarInactiveTintColor: 'gray',
      headerShown: false,
    })}
  >
    <MainTabs.Screen name="Home" component={HomeStackNavigator} />
    <MainTabs.Screen name="Search" component={SearchScreen} />
    <MainTabs.Screen name="CreatePost" component={CreatePostScreen} />
    <MainTabs.Screen name="Notifications" component={NotificationsScreen} />
    <MainTabs.Screen name="Profile" component={ProfileScreen} />
  </MainTabs.Navigator>
);

const Navigation = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthStackNavigator} />
        ) : (
          <Stack.Screen name="Main" component={MainTabNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation; 