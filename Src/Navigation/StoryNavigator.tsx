import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  StoryScreen,
  StoryEditorScreen,
  StoryPreviewScreen,
  StoryAddScreen,
} from '../Screens/Story';

export type StoryStackParamList = {
  StoryHome: undefined;
  StoryAdd: undefined;
  StoryEditor: {
    imageUri: string;
  };
  StoryPreview: {
    imageUri: string;
    caption: string;
  };
};

const Stack = createNativeStackNavigator<StoryStackParamList>();

const StoryNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="StoryHome"
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
      }}>
      <Stack.Screen 
        name="StoryHome" 
        component={StoryScreen}
        options={{
          animation: 'none'
        }}
      />
      <Stack.Group
        screenOptions={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
          gestureEnabled: true,
          gestureDirection: 'vertical',
          fullScreenGestureEnabled: true,
        }}>
        <Stack.Screen 
          name="StoryAdd" 
          component={StoryAddScreen}
        />
        <Stack.Screen 
          name="StoryEditor" 
          component={StoryEditorScreen}
        />
        <Stack.Screen 
          name="StoryPreview" 
          component={StoryPreviewScreen}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
};

export default StoryNavigator; 