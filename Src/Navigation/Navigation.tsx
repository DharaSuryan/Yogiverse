import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { RootState } from '../Store/store';
import { RootStackParamList, AuthStackParamList, MainTabParamList, HomeStackParamList, CreatePostStackParamList, CreateSearchStackParamList } from './types';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Auth Screens
import LoginScreen from '../Screens/Auth/LoginScreen';
import ForgotPasswordScreen from '../Screens/Auth/ForgotPasswordScreen';

// Main Screens
import HomeScreen from '../Screens/Home/HomeScreen';
import SearchScreen from '../Screens/Search/SearchScreen';
import CreatePostScreen from '../Screens/Post/CreatePostScreen';

import NotificationsScreen from '../Screens/Notifications/NotificationsScreen';
import ProfileScreen from '../Screens/Profile/ProfileScreen';

import StoryViewerScreen from '../Screens/Story/StoryViewerScreen';
import MediaPickerScreen from '../Screens/Post/Mediapicker';
import RoleSelectionScreen from '../Screens/Auth/RoleSelectionScreen';
import SignUpScreen from '../Screens/Auth/UserSignUpScreen';
import { SearchBar } from 'react-native-screens';
import SearchDetailScreen from '../Screens/Search/SearchDetailScreen';
import MenuScreen from '../Screens/Profile/MenuScreen';
import MediaFilterScreen from '../Screens/Post/MediaFilterScreen';
import UploadOptionsScreen from '../Screens/Post/UploadOptionsScreen';
// import StoryCameraScreen from '../Screens/Post/StoryCameraScreen';
import StoryPreviewScreen from '../Screens/Post/StoryPreviewScreen';
import ReelCameraScreen from '../Screens/Post/ReelCameraScreen';
import ReelPreviewScreen from '../Screens/Post/ReelPreviewScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainTabs = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const CreatePostStack = createNativeStackNavigator<CreatePostStackParamList>();
const SearchStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

const CreatePostStackNavigator = () => (
  <CreatePostStack.Navigator screenOptions={{ headerShown: false }}>
    <CreatePostStack.Screen name="UploadOptions" component={UploadOptionsScreen} />
    <CreatePostStack.Screen name="MediaPicker" component={MediaPickerScreen} />
    <CreatePostStack.Screen name="PostDetails" component={CreatePostScreen} />
    <CreatePostStack.Screen name="MediaFilterScreen" component={MediaFilterScreen} />

    {/* <CreatePostStack.Screen name="StoryCamera" component={StoryCameraScreen} /> */}
    <CreatePostStack.Screen name="StoryPreview" component={StoryPreviewScreen} />
    <CreatePostStack.Screen name="ReelCamera" component={ReelCameraScreen} />
    <CreatePostStack.Screen name="ReelPreview" component={ReelPreviewScreen} />
  </CreatePostStack.Navigator>
);

const SearchStackNavigator = () => (
  <SearchStack.Navigator screenOptions={{ headerShown: false }}>
    <SearchStack.Screen name="SearchScreen" component={SearchScreen} />
    <SearchStack.Screen name="SearchDetail" component={SearchDetailScreen} />
  </SearchStack.Navigator>
);

const AuthStackNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Signup" component={SignUpScreen} />
    <AuthStack.Screen name="RoleSelection" component={RoleSelectionScreen}/>
    <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </AuthStack.Navigator>
);

const HomeStackNavigator = () => (
  <HomeStack.Navigator screenOptions={{ headerShown: false }}>
    <HomeStack.Screen name="HomeScreen" component={HomeScreen} />

    <HomeStack.Screen name="StoryViewer" component={StoryViewerScreen} />
  
  </HomeStack.Navigator>
);

const ProfileStackNavigator = () => (
  <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
    <ProfileStack.Screen name="ProfileScreen" component={ProfileScreen} />
    <ProfileStack.Screen name="MenuScreen" component={MenuScreen} />
  </ProfileStack.Navigator>
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

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#000',
      tabBarInactiveTintColor: 'gray',
      headerShown: false,
    })}
  >
    <MainTabs.Screen name="Home" component={HomeStackNavigator} />
    <MainTabs.Screen name="Search" component={SearchStackNavigator} />
    <MainTabs.Screen name="CreatePost" component={CreatePostStackNavigator} />
    <MainTabs.Screen name="Notifications" component={NotificationsScreen} />
    <MainTabs.Screen name="Profile" component={ProfileStackNavigator} />
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
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            {/* <Stack.Screen name="CreatePost" component={CreatePostScreen} />
            <Stack.Screen name="CreateReel" component={CreateReelScreen} />
            <Stack.Screen name="CreateStory" component={CreateStoryScreen} /> */}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation; 