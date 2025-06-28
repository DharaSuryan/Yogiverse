import React from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import HomeScreen from '../Screens/Home/HomeScreen';
import SearchScreen from '../Screens/Search/SearchScreen';
import ReelsScreen from '../Screens/Reels/ReelsScreen';
import ProfileScreen from '../Screens/Profile/ProfileScreen';
import { UserProfileScreen } from '../Screens/Profile/UserProfileScreen';
import StoryNavigator from './StoryNavigator';
import CreatePostNavigator from './CreatePostNavigator';
import LoginScreen from '../Screens/Auth/LoginScreen';
import SignUpScreen from '../Screens/Auth/UserSignUpScreen';
import SplashScreen from '../Screens/Splash/SplashScreen';
import SearchDetailScreen from '../Screens/Search/SearchDetailScreen';
import CommentScreen from '../Screens/Comment/CommentScreen';
import SubCateGoryDisplay from 'Src/Screens/Search/SubCateGoryDisplay';
import MainCategoryScreen from '../Screens/Auth/MainCategory';
import SubCategoryScreen from '../Screens/Auth/SubCategory';

export type AppStackParamList = {
  Splash: undefined;
  LoginScreen: undefined;
  SignUpScreen: { role: 'user' | 'vendor' };
  MainCategory: {
    signupData: any;
  };
  SubCategory: {
    signupData: any;
  };
  MainTabs: undefined;
  StoryNavigator: undefined;
  UserProfile: undefined;
  CommentScreen: undefined;
  SubCateGoryDisplay: undefined;
  SearchDetail: undefined;
  Home: undefined;
  Search: undefined;
  Reels: undefined;
  Post: undefined;
  Profile: undefined;
  Login: any;
};

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<AppStackParamList>();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          } else if (route.name === 'Search') {
            iconName = focused ? 'search' : 'search-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          } else if (route.name === 'Reels') {
            iconName = focused ? 'movie-open' : 'movie-outline';
            return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
          } else if (route.name === 'Post') {
            iconName = 'add-circle';
            return <Ionicons name={iconName} size={size} color={color} />;
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          }
        },
        tabBarActiveTintColor: '#000',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
        tabBarShowLabel: false,
      })}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Reels" component={ReelsScreen} />
      <Tab.Screen name="Post" component={CreatePostNavigator} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Splash"
        screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
        <Stack.Screen name="MainCategory" component={MainCategoryScreen} />
        <Stack.Screen name="SubCategory" component={SubCategoryScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="StoryNavigator" component={StoryNavigator} />
        <Stack.Screen name="UserProfile" component={UserProfileScreen} />
        <Stack.Screen name="CommentScreen" component={CommentScreen} />
        <Stack.Screen name="SubCateGoryDisplay" component={SubCateGoryDisplay} />


        {/* <Stack.Screen name="SearchDetail" component={SearchDetailScreen}/> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
export const navigationRef = createNavigationContainerRef();



export default AppNavigator;