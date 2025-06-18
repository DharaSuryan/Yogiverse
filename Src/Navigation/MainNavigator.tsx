import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabParamList, SearchStackParamList } from './types';
import Icon from 'react-native-vector-icons/Ionicons';
import HomeScreen from '../Screens/Home/HomeScreen';
import SearchScreen from '../Screens/Search/SearchScreen';
import SearchDetailScreen from '../Screens/Search/SearchDetailScreen';
import CreatePostScreen from '../Screens/Post/CreatePostScreen';
import ProfileScreen from '../Screens/Profile/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();
const SearchStack = createNativeStackNavigator<SearchStackParamList>();

const SearchNavigator = () => {
  return (
    <SearchStack.Navigator screenOptions={{ headerShown: false }}>
      <SearchStack.Screen name="Search" component={SearchScreen} />
      <SearchStack.Screen name="SearchDetail" component={SearchDetailScreen} />
    </SearchStack.Navigator>
  );
};

const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'HomeTab':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'SearchTab':
              iconName = focused ? 'search' : 'search-outline';
              break;
            case 'CreatePostTab':
              iconName = focused ? 'add-circle' : 'add-circle-outline';
              break;
            // case 'Notifications':
            //   iconName = focused ? 'heart' : 'heart-outline';
            //   break;
            case 'ProfileTab':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help-outline';
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
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen 
        name="SearchTab" 
        component={SearchNavigator}
        options={{
          tabBarLabel: 'Search',
        }}
      />
      <Tab.Screen 
        name="CreatePostTab" 
        component={CreatePostScreen}
        options={{
          tabBarLabel: 'Post',
        }}
      />
      {/* <Tab.Screen 
        name="Notifications" 
        component={NotificationsScreen}
        options={{
          tabBarLabel: 'Notifications',
        }}
      /> */}
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator; 