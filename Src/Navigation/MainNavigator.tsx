import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import Icon from 'react-native-vector-icons/Ionicons';
import HomeScreen from '../Screens/Home/HomeScreen';
import SearchScreen from '../Screens/Search/SearchDetailScreen';
import CreatePostScreen from '../Screens/Post/CreatePostScreen';
import ProfileScreen from '../Screens/Profile/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainNavigator = () => {
  return (
    <Tab.Navigator
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
            // case 'Notifications':
            //   iconName = focused ? 'heart' : 'heart-outline';
            //   break;
            case 'Profile':
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
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen 
        name="Search" 
        component={SearchScreen}
        options={{
          tabBarLabel: 'Search',
        }}
      />
      <Tab.Screen 
        name="CreatePost" 
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
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator; 