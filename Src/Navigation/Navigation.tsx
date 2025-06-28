import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList, AuthStackParamList, MainTabParamList, HomeStackParamList, CreatePostStackParamList, SearchStackParamList, ProfileStackParamList, VendorStackParamList } from './types';
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
import VendorDetailScreen from '../Screens/Vender/VenderDetail';
// import ReelEditorScreen from '../Screens/Post/ReelEditorScreen';
import PostPreviewScreen from '../Screens/Post/PostPreviewScreen';
import ReelEditorScreen from '../Screens/Post/ReelEditorScreennew';
import ProfilePostDetailScreen from '../Screens/Profile/ProfilePostDetailScreen';
import UserProfileScreen from '../Screens/Profile/UserProfileScreen';
import CommentScreen from "../Screens/Comments/CommentScreen";
import SubCateGoryDisplay from '../Screens/Search/SubCateGoryDisplay';
import TrendingDetailScreen from '../Screens/TrendingDetailScreen';
// import VendorStackScreen from '../Screens/Vendor/VendorStack';
import { navigationRef } from '../Component/Route';
import FollowersFollowingScreen from '../Screens/Profile/FollowersFollowingScreen';
import UploadPost from '../Screens/Post/UploadPost';
import PreViewForPost from '../Screens/Post/PreViewForPost';

const Stack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainTabs = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const CreatePostStack = createNativeStackNavigator<CreatePostStackParamList>();
const SearchStack = createNativeStackNavigator<SearchStackParamList>();
const ProfileStackNavigator = createNativeStackNavigator<ProfileStackParamList>();
const VenderStack = createNativeStackNavigator<VendorStackParamList>();


function AuthStackScreen() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="SignUp" component={SignUpScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <AuthStack.Screen name="RoleSelection" component={RoleSelectionScreen}/>
    </AuthStack.Navigator>
  );
}

function VendorStackScreen() {
  return (
    <VenderStack.Navigator 
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        // Reverting to default presentation for stability
        // animation: 'slide_from_right',
        // presentation: 'card',
        // animationDuration: 200,
        // contentStyle: {
        //   backgroundColor: 'white'
        // }
      }}
    >
      <VenderStack.Screen 
        name="Vendor" 
        component={VenderList}
        options={{
          gestureEnabled: false,
          // animation: 'none' // Removed custom animation
        }}
      />
      <VenderStack.Screen 
        name="VenderDetail" 
        component={VendorDetailScreen}
        options={{
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          animation: 'slide_from_right',
          // Reverting to default presentation for stability
          // presentation: 'card' // Using default if not specified
        }}
      />
    </VenderStack.Navigator>
  );
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
      <SearchStack.Screen name="SearchDetail" component={SearchDetailScreen}/>
      <SearchStack.Screen name="TrendingDetailScreen" component={TrendingDetailScreen}/>
    </SearchStack.Navigator>
  );
}

function ProfileStackScreen() {
  return (
    <ProfileStackNavigator.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStackNavigator.Screen name="Profile" component={ProfileScreen} />
        <ProfileStackNavigator.Screen name="Menu" component={MenuScreen} />
            {/* <Stack.Screen name="HighlightViewer" component={HighlightViewer} /> */}
      <Stack.Screen name="ProfilePostDetailScreen" component={ProfilePostDetailScreen} />
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
      <CreatePostStack.Screen 
        name="CreatePostHome" 
        component={CreatePostScreen}
        options={{
          gestureEnabled: false
        }}
      />
      <CreatePostStack.Screen 
        name="UploadOptions" 
        component={UploadOptionsScreen}
        options={{
          gestureEnabled: true,
          gestureDirection: 'vertical'
        }}
      />
      <CreatePostStack.Screen 
        name="MediaPicker" 
        component={MediaPickerScreen}
        options={{
          gestureEnabled: true,
          gestureDirection: 'vertical'
        }}
      />
      <CreatePostStack.Screen 
        name="MediaFilter" 
        component={MediaFilterScreen}
        options={{
          gestureEnabled: true,
          gestureDirection: 'vertical'
        }}
      />
      <CreatePostStack.Screen 
        name="StoryCamera" 
        component={StoryCameraScreen}
        options={{
          gestureEnabled: false,
          animation: 'slide_from_right'
        }}
      />
      <CreatePostStack.Screen 
        name="StoryPreview" 
        component={StoryPreviewScreen}
        options={{
          gestureEnabled: true,
          gestureDirection: 'vertical'
        }}
      />
      <CreatePostStack.Screen 
        name="ReelCamera" 
        component={ReelCameraScreen}
        options={{
          gestureEnabled: false,
          animation: 'slide_from_right'
        }}
      />
      <CreatePostStack.Screen 
        name="ReelPreview" 
        component={ReelPreviewScreen}
        options={{
          gestureEnabled: true,
          gestureDirection: 'vertical'
        }}
      />
      <CreatePostStack.Screen 
        name="ReelEditor" 
        component={ReelEditorScreen}
        options={{
          gestureEnabled: true,
          gestureDirection: 'vertical'
        }}
      />
      <CreatePostStack.Screen 
        name="PostPreview" 
        component={PostPreviewScreen}
        options={{
          gestureEnabled: true,
          gestureDirection: 'vertical'
        }}
      />
      <CreatePostStack.Screen 
        name="PostDetails" 
        component={PostDetailsScreen}
        options={{
          gestureEnabled: true,
          gestureDirection: 'vertical'
        }}
      />
      <CreatePostStack.Screen 
        name="Post" 
        component={PostScreen}
        options={{
          gestureEnabled: true,
          gestureDirection: 'vertical'
        }}
      />
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

          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'SearchTab') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'CreatePostTab') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'VendorTab') {
            iconName = focused ? 'business' : 'business-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#bea063',
        tabBarInactiveTintColor: '#8e8e8e',
        // tabBarShowLabel: true,
        tabBarStyle: {
          height: 60,
          paddingBottom: 10,
          paddingTop: 5,
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
    >
      <MainTabs.Screen 
        name="HomeTab" 
        component={HomeStackScreen}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <MainTabs.Screen 
        name="SearchTab" 
        component={SearchStackScreen}
        options={{
          // tabBarLabel: 'Search',
        }}
      />
      <MainTabs.Screen 
        name="CreatePostTab" 
        component={CreatePostStackScreen}
        options={{
          tabBarLabel: 'Post',
        }}
      />
      <MainTabs.Screen 
        name="VendorTab" 
        component={VendorStackScreen}
        options={{
          tabBarLabel: 'Yogic',
        }}
      />
      <MainTabs.Screen 
        name="ProfileTab" 
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
    <NavigationContainer 
    onStateChange={(state) => {

      const currentRouteName = navigationRef.current.getCurrentRoute().name;

      
      navigationRef.current.previousRouteName = currentRouteName;
  }}
    ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="SplashScreen" component={SplashScreen} />
        <Stack.Screen name="MainTab" component={MainTabScreen} />
        <Stack.Screen name="Auth" component={AuthStackScreen} />
        <Stack.Screen name="UserProfile" component={UserProfileScreen} />
        <Stack.Screen name="CommentScreen" component={CommentScreen} />
        <Stack.Screen name="SubCateGoryDisplay" component={SubCateGoryDisplay} />
        <Stack.Screen name="ProfilePostDetailScreen" component={ProfilePostDetailScreen} />
        <Stack.Screen name="CreatePostHome" component={CreatePostScreen} />
        <Stack.Screen name="Post" component={PostScreen} />
        <Stack.Screen name="PostDetails" component={PostDetailsScreen} />
        <Stack.Screen name="PostPreview" component={PostPreviewScreen} />
        <Stack.Screen name="ReelEditor" component={ReelEditorScreen} />
        <Stack.Screen name="ReelPreview" component={ReelPreviewScreen} />
        <Stack.Screen name="ReelCamera" component={ReelCameraScreen} />
        <Stack.Screen name="ProfileStack" component={ProfileStackScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="RoleSelection" component={RoleSelectionScreen}/>
        <Stack.Screen name="FollowersFollowingScreen" component={FollowersFollowingScreen} />
        <Stack.Screen name="UploadPost" component={UploadPost} />
        <Stack.Screen name="UploadOptionsScreen" component={UploadOptionsScreen} />
        <Stack.Screen name="PreViewForPost" component={PreViewForPost} />
        <Stack.Screen name="StoryCreation" component={StoryCreation} /> 
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation; 