// ✅ Fixed and optimized version of your navigation setup
import React, {useEffect, useState} from 'react';
import {InteractionManager} from 'react-native';
import {NavigationContainer, CommonActions} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import {navigationRef} from '../Component/Route';

// Types

// Screens
import SplashScreen from '../Screens/Splash/SplashScreen';
import LoginScreen from '../Screens/Auth/LoginScreen';
import SignUpScreen from '../Screens/Auth/UserSignUpScreen';
import ForgotPasswordScreen from '../Screens/Auth/ForgotPasswordScreen';
import RoleSelectionScreen from '../Screens/Auth/RoleSelectionScreen';
import MainCategoryScreen from '../Screens/Auth/MainCategory';
import SubCategoryScreen from '../Screens/Auth/SubCategory';

import HomeScreen from '../Screens/Home/HomeScreen';
import NotificationsScreen from '../Screens/Home/NotificationsScreen';
import SearchScreen from '../Screens/Search/SearchScreen';
import SearchDetailScreen from '../Screens/Search/SearchDetailScreen';
import SubCateGoryDisplay from '../Screens/Search/SubCateGoryDisplay';
import TrendingDetailScreen from '../Screens/Search/TrendingDetailScreen';

import CreatePostScreen from '../Screens/Post/CreatePostScreen';
import UploadOptionsScreen from '../Screens/Post/UploadOptionsScreen';
import MediaPickerScreen from '../Screens/Post/Mediapicker';
import MediaFilterScreen from '../Screens/Post/MediaFilterScreen';
import PostScreen from '../Screens/Post/PostScreen';
import PostPreviewScreen from '../Screens/Post/PostPreviewScreen';
import PostDetailsScreen from '../Screens/Post/PostDetails';
import UploadPost from '../Screens/Post/UploadPost';
import StoryCameraScreen from '../Screens/Post/StoryCameraScreen';
import StoryPreviewScreen from '../Screens/Post/StoryPreviewScreen';
import ReelCameraScreen from '../Screens/Post/ReelCameraScreen';
import ReelPreviewScreen from '../Screens/Post/ReelPreviewScreen';
import ReelEditorScreen from '../Screens/Post/ReelEditorScreennew';

import VenderList from '../Screens/Vender/VenderList';
import VendorDetailScreen from '../Screens/Vender/VenderDetail';
import VendoerSubcategory from '../Screens/Vender/VendoerSubcategory';

import ProfileScreen from '../Screens/Profile/ProfileScreen';
import EditProfileScreen from '../Screens/Profile/EditProfile';
import MenuScreen from '../Screens/Profile/MenuScreen';
import CollectionDetailScreen from '../Screens/Profile/CollectionDetailScreen';
import CreateCollectionScreen from '../Screens/Profile/CreateCollectionScreen';
import ProfilePostDetailScreen from '../Screens/Profile/ProfilePostDetailScreen';
import UserProfileScreen from '../Screens/Profile/UserProfileScreen';
import FollowersFollowingScreen from '../Screens/Profile/FollowersFollowingScreen';

import Ionicons from 'react-native-vector-icons/Ionicons';

import CommentScreen from '../Screens/Comment/CommentScreen';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ChangePasswordScreen from '../Screens/Profile/ChangePassword';
import ChatListScreen from '../Screens/Home/ChatListScreen';
import ChatScreen from '../Screens/Home/ChatScreen';
import LocationListScreen from '../Screens/Location/LocationListScreen';
import MediaPicker from '../Screens/Post/Mediapicker';
import StoryUploadScreen from '../Screens/Post/StoryUploadScreen';

// Navigators
const Stack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();

const MainTabs = createBottomTabNavigator();

// const HomeStack = createNativeStackNavigator();
// const CreatePostStack = createNativeStackNavigator();
// const SearchStack = createNativeStackNavigator();
// const ProfileStack = createNativeStackNavigator();
// const VendorStack = createNativeStackNavigator();

function AuthStackScreen() {
  return (
    <AuthStack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName="Login">
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="SignUp" component={SignUpScreen} />
      <AuthStack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
      />
      <AuthStack.Screen name="RoleSelection" component={RoleSelectionScreen} />
      <AuthStack.Screen name="MainCategory" component={MainCategoryScreen} />
      <AuthStack.Screen name="SubCategory" component={SubCategoryScreen} />
    </AuthStack.Navigator>
  );
}

function MainTabScreen() {
  return (
    <MainTabs.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarIcon: ({focused, color, size}) => {
          let iconName;
          console.log('oute.name', route.name);
          if (route.name === 'Vendor') {
            // Use MaterialCommunityIcons for meditation
            return (
              <MaterialCommunityIcons
                name="meditation"
                size={size}
                color={color}
              />
            );
          }
          switch (route.name) {
            case 'HomeTab':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'SearchTab':
              iconName = focused ? 'search' : 'search-outline';
              break;
            case 'UploadOptions':
              iconName = focused ? 'add-circle' : 'add-circle-outline';
              break;
            case 'Vendor':
              iconName = focused ? 'meditation' : 'meditation-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          // @ts-ignore
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#bea063',
        tabBarInactiveTintColor: '#8e8e8e',
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 60,
          paddingBottom: 10,
          paddingTop: 5,
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0',
        },
      })}
      initialRouteName="HomeTab">
      {/* <MainTabs.Screen name="HomeTab" component={HomeStackScreen} />
      <MainTabs.Screen name="SearchTab" component={SearchStackScreen} />
      <MainTabs.Screen name="CreatePostTab" component={CreatePostStackScreen} />
      <MainTabs.Screen name="VendorTab" component={VendorStackScreen} />
      <MainTabs.Screen name="ProfileTab" component={ProfileStackScreen} /> */}

      <MainTabs.Screen name="HomeTab" component={HomeScreen} />
      <MainTabs.Screen name="SearchTab" component={SearchScreen} />
      <MainTabs.Screen name="UploadOptions" component={UploadOptionsScreen} />
      <MainTabs.Screen name="Vendor" component={VenderList} />
      <MainTabs.Screen name="Profile" component={ProfileScreen} />
    </MainTabs.Navigator>
  );
}

// function HomeStackScreen() {
//   return (
//     <HomeStack.Navigator screenOptions={{headerShown: false}}>
//       <HomeStack.Screen name="Home" component={HomeScreen} />
//       <HomeStack.Screen name="PostDetails" component={PostScreen} />
//       <HomeStack.Screen name="Notifications" component={NotificationsScreen} />
//     </HomeStack.Navigator>
//   );
// }

// function SearchStackScreen() {
//   return (
//     <SearchStack.Navigator screenOptions={{headerShown: false}}>
//       <SearchStack.Screen name="Search" component={SearchScreen} />
//       <SearchStack.Screen name="SearchDetail" component={SearchDetailScreen} />
//       <SearchStack.Screen
//         name="TrendingDetailScreen"
//         component={TrendingDetailScreen}
//       />
//       <SearchStack.Screen
//         name="SubCateGoryDisplay"
//         component={SubCateGoryDisplay}
//       />
//     </SearchStack.Navigator>
//   );
// }

// function ProfileStackScreen() {
//   return (
//     <ProfileStack.Navigator screenOptions={{headerShown: false}}>
//       <ProfileStack.Screen name="Profile" component={ProfileScreen} />
//       <ProfileStack.Screen name="Menu" component={MenuScreen} />
//       <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
//       <ProfileStack.Screen
//         name="CollectionDetailScreen"
//         component={CollectionDetailScreen}
//       />
//       <ProfileStack.Screen
//         name="CreateCollectionScreen"
//         component={CreateCollectionScreen}
//       />
//       <ProfileStack.Screen
//         name="ProfilePostDetailScreen"
//         component={ProfilePostDetailScreen}
//       />
//     </ProfileStack.Navigator>
//   );
// }

// function VendorStackScreen() {
//   return (
//     <VendorStack.Navigator screenOptions={{headerShown: false}}>
//       <VendorStack.Screen name="Vendor" component={VenderList} />
//       <VendorStack.Screen name="VenderDetail" component={VendorDetailScreen} />
//       <VendorStack.Screen
//         name="VendoerSubcategory"
//         component={VendoerSubcategory}
//       />
//     </VendorStack.Navigator>
//   );
// }

// function CreatePostStackScreen() {
//   return (
//     <CreatePostStack.Navigator screenOptions={{headerShown: false}}>
//       <CreatePostStack.Screen
//         name="UploadOptions"
//         component={UploadOptionsScreen}
//       />
//       <CreatePostStack.Screen
//         name="MediaPicker"
//         component={MediaPickerScreen}
//       />
//       <CreatePostStack.Screen
//         name="MediaFilter"
//         component={MediaFilterScreen}
//       />
//       <CreatePostStack.Screen
//         name="StoryCamera"
//         component={StoryCameraScreen}
//       />
//       <CreatePostStack.Screen
//         name="StoryPreview"
//         component={StoryPreviewScreen}
//       />
//       <CreatePostStack.Screen name="ReelCamera" component={ReelCameraScreen} />
//       <CreatePostStack.Screen
//         name="ReelPreview"
//         component={ReelPreviewScreen}
//       />
//       <CreatePostStack.Screen name="ReelEditor" component={ReelEditorScreen} />
//       <CreatePostStack.Screen
//         name="PostPreview"
//         component={PostPreviewScreen}
//       />
//       <CreatePostStack.Screen
//         name="PostDetails"
//         component={PostDetailsScreen}
//       />
//       <CreatePostStack.Screen name="Post" component={PostScreen} />
//       <CreatePostStack.Screen name="UploadPost" component={UploadPost} />
//     </CreatePostStack.Navigator>
//   );
// }
// tabBarIcon: ({ focused, color, size }) => {
//           let iconName = focused
//             ? route.name.toLowerCase()
//             : `${route.name.toLowerCase()}-outline`;
//           if (route.name === "CreatePostTab")
//             iconName = focused ? "add-circle" : "add-circle-outline";
//           if (route.name === "VendorTab")
//             iconName = focused ? "meditation" : "meditation-outline";
//           return <Icon name={iconName} size={size} color={color} />;
//         },

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
        AsyncStorage.getItem('userData'),
      ]);
      setIsAuthenticated(!!(accessToken && userData));
    } catch (e) {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return null;

  return (
    <NavigationContainer ref={navigationRef} detachInactiveScreens={false}>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="SplashScreen" component={SplashScreen} />
        <Stack.Screen name="MainTab" component={MainTabScreen} />
        <Stack.Screen name="Auth" component={AuthStackScreen} />
        {/* <Stack.Screen name="CommentScreen" component={CommentScreen} /> */}
        <Stack.Screen name="CommentScreen" component={CommentScreen} />
        <Stack.Screen name="PostDetails" component={PostScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        {/* <Stack.Screen name="Profile" component={ProfileScreen} /> */}
        <Stack.Screen name="Menu" component={MenuScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen
          name="CollectionDetailScreen"
          component={CollectionDetailScreen}
        />
        <Stack.Screen
          name="CreateCollectionScreen"
          component={CreateCollectionScreen}
        />
        <Stack.Screen
          name="ProfilePostDetailScreen"
          component={ProfilePostDetailScreen}
        />
        <Stack.Screen name="Vendor" component={VenderList} />
        <Stack.Screen name="VenderDetail" component={VendorDetailScreen} />
        <Stack.Screen
          name="VendoerSubcategory"
          component={VendoerSubcategory}
        />
        <Stack.Screen name="UploadOptions" component={UploadOptionsScreen} />
        <Stack.Screen name="MediaPicker" component={MediaPickerScreen} />
        <Stack.Screen name="MediaFilter" component={MediaFilterScreen} />
        <Stack.Screen name="StoryCamera" component={StoryCameraScreen} />
        <Stack.Screen name="StoryPreview" component={StoryPreviewScreen} />
        <Stack.Screen name="ReelCamera" component={ReelCameraScreen} />
        <Stack.Screen name="ReelPreview" component={ReelPreviewScreen} />
        <Stack.Screen name="ReelEditor" component={ReelEditorScreen} />
        <Stack.Screen name="PostPreview" component={PostPreviewScreen} />
        <Stack.Screen name="Post" component={PostScreen} />
        <Stack.Screen name="UploadPost" component={UploadPost} />
        {/* <Stack.Screen name="StoryCreation" component={StoryCreation} />
        <Stack.Screen name="StoryViewerScreen" component={StoryViewerScreen} /> */}
        <Stack.Screen name="UserProfile" component={UserProfileScreen} />
        <Stack.Screen
          name="FollowersFollowingScreen"
          component={FollowersFollowingScreen}
        />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
        <Stack.Screen
          name="SubCateGoryDisplay"
          component={SubCateGoryDisplay}
        />
      </Stack.Navigator>
      <Stack.Screen name="ChatListScreen" component={ChatListScreen} />
      <Stack.Screen name="ChatScreen" component={ChatScreen} />
      <Stack.Screen name="MediaPicker" component={MediaPicker} />
      <Stack.Screen name="StoryUpload" component={StoryUploadScreen} />
      <Stack.Screen name="ReelEditorScreen" component={ReelEditorScreen} />
      {/* <Stack.Screen name="StoryCreation" component={StoryCreation} /> */}
      <Stack.Screen
        name="UploadPost"
        component={require('../Screens/Post/UploadPost').default}
      />
    </NavigationContainer>
  );
};

export default Navigation;
