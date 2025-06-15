import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList, AuthStackParamList, MainTabParamList, HomeStackParamList, CreatePostStackParamList, SearchStackParamList, ProfileStackParamList } from './types';
import Icon from 'react-native-vector-icons/Ionicons';
import SplashScreen from '../Screens/Splash/SplashScreen';
import LoginScreen from '../Screens/Auth/LoginScreen';

import MainNavigator from './MainNavigator';

// Auth Screens
import ForgotPasswordScreen from '../Screens/Auth/ForgotPasswordScreen';

// Main Screens
import HomeScreen from '../Screens/Home/HomeScreen';
import SearchScreen from '../Screens/Search/SearchScreen';
import CreatePostScreen from '../Screens/Post/CreatePostScreen';


import NotificationsScreen from '../Screens/Home/NotificationsScreen';
import ProfileScreen from '../Screens/Profile/ProfileScreen';
import PostDetailsScreen from '../Screens/Post/PostDetails';
import StoryViewerScreen from '../Screens/Story/StoryViewerScreen';
import MediaPickerScreen from '../Screens/Post/Mediapicker';
import RoleSelectionScreen from '../Screens/Auth/RoleSelectionScreen';
import SignUpScreen from '../Screens/Auth/UserSignUpScreen';
import { SearchBar } from 'react-native-screens';
import SearchDetailScreen from '../Screens/Search/SearchDetailScreen';
import MenuScreen from '../Screens/Profile/MenuScreen';
import MediaFilterScreen from '../Screens/Post/MediaFilterScreen';
import UploadOptionsScreen from '../Screens/Post/UploadOptionsScreen';
import StoryCameraScreen from '../Screens/Post/StoryCameraScreen';
import StoryPreviewScreen from '../Screens/Post/StoryPreviewScreen';
import ReelCameraScreen from '../Screens/Post/ReelCameraScreen';
import ReelPreviewScreen from '../Screens/Post/ReelPreviewScreen';
import PostScreen from '../Screens/Post/PostScreen';
import VenderList from '../Screens/Vender/VenderList';
import StoryCreation from '../Screens/Story/StoryCreation';
import ProfileStack from './ProfileStack';
import HighlightViewer from '../Screens/Profile/HighlightViewer';
// import VendorStackScreen from '../Screens/Vendor/VendorStack';

const Stack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainTabs = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const CreatePostStack = createNativeStackNavigator<CreatePostStackParamList>();
const SearchStack = createNativeStackNavigator<SearchStackParamList>();
const ProfileStackNavigator = createNativeStackNavigator<ProfileStackParamList>();
const VenderStack = createNativeStackNavigator()

function AuthStackScreen() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="SignUp" component={SignUpScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </AuthStack.Navigator>
  );
}

function VendorStackScreen (){
  return(
    <VenderStack.Navigator screenOptions={{headerShown:false}}>
      <VenderStack.Screen name="VenderList" component={VenderList}/>
      
    </VenderStack.Navigator>
  )
}

function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen name="PostDetails" component={PostScreen} />
      <HomeStack.Screen name = "Notifications" component={NotificationsScreen}/>
    </HomeStack.Navigator>
  );
}

function SearchStackScreen() {
  return (
    <SearchStack.Navigator screenOptions={{ headerShown: false }}>
      <SearchStack.Screen name="Search" component={SearchScreen} />
    </SearchStack.Navigator>
  );
}

function ProfileStackScreen() {
  return (
    <ProfileStackNavigator.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStackNavigator.Screen name="Profile" component={ProfileScreen} />
        <ProfileStackNavigator.Screen name="Menu" component={MenuScreen} />
            {/* <Stack.Screen name="HighlightViewer" component={HighlightViewer} /> */}
      {/* <Stack.Screen name="PostDetails" component={PostDetails} /> */}
      {/* <Stack.Screen name="StoryCreation" component={StoryCreation} /> */}
    </ProfileStackNavigator.Navigator>
  );
}

function CreatePostStackScreen() {
  return (
    <CreatePostStack.Navigator
      screenOptions={{
        headerShown: false,
        presentation: 'modal',
        animation: 'slide_from_bottom',
      }}
    >
      <CreatePostStack.Screen name="CreatePost" component={CreatePostScreen} />
      <CreatePostStack.Screen name="UploadOptions" component={UploadOptionsScreen} />
      <CreatePostStack.Screen name="MediaPicker" component={MediaPickerScreen} />
      <CreatePostStack.Screen name="PostDetails" component={PostDetailsScreen} />
      <CreatePostStack.Screen name="CreateStory" component={StoryCameraScreen} />
      <CreatePostStack.Screen name="CreateReel" component={ReelCameraScreen} />
      <CreatePostStack.Screen name="ReelPreview" component={ReelPreviewScreen} />
      <CreatePostStack.Screen name="StoryPreview" component={StoryPreviewScreen} />
      <CreatePostStack.Screen name="PostScreen" component={PostScreen} />
    </CreatePostStack.Navigator>
  );
}

function MainTabScreen() {
  return (
    <MainTabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = 'help-outline';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Search') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'CreatePost') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Vendor') {
            iconName = focused ? 'business' : 'business-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0095f6',
        tabBarInactiveTintColor: '#8e8e8e',
        tabBarShowLabel: true,
        tabBarStyle: {
          height: 60,
          paddingBottom: 10,
          paddingTop: 5,
        },
      })}
    >
      <MainTabs.Screen 
        name="Home" 
        component={HomeStackScreen}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <MainTabs.Screen 
        name="Search" 
        component={SearchStackScreen}
        options={{
          tabBarLabel: 'Search',
        }}
      />
      <MainTabs.Screen 
        name="CreatePost" 
        component={CreatePostStackScreen}
        options={{
          tabBarLabel: 'Post',
        }}
      />
      <MainTabs.Screen 
        name="Vendor" 
        component={VendorStackScreen}
        options={{
          tabBarLabel: 'Vendor',
        }}
      />
      <MainTabs.Screen 
        name="Profile" 
        component={ProfileStackScreen}
        options={{
          tabBarLabel: 'Profile',
        }}
      />
    </MainTabs.Navigator>
  );
}

const Navigation = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const [accessToken, userData] = await Promise.all([
        AsyncStorage.getItem('accessToken'),
        AsyncStorage.getItem('userData')
      ]);
      
      // Check if both token and user data exist
      const hasValidAuth = !!(accessToken && userData);
      console.log('Auth check:', { hasToken: !!accessToken, hasUserData: !!userData });
      
      setIsAuthenticated(hasValidAuth);
    } catch (error) {
      console.error('Error checking auth:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return null;
  }

  return (
  
  
    
       <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="SplashScreen" component={SplashScreen} />
        <Stack.Screen name="MainTab" component={MainTabScreen} />
        <Stack.Screen name="Auth" component={AuthStackScreen} />
        <Stack.Screen name="StoryCreation" component={StoryCreation} />
      </Stack.Navigator>
    </NavigationContainer>
  
  );
};

export default Navigation; 