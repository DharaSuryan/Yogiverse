import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import UploadOptionsScreen from '../Screens/Post/UploadOptionsScreen';
import StoryReelsSelectionScreen from '../Screens/Post/StoryReelsSelectionScreen';
import MediaPicker from '../Screens/Post/Mediapicker';
import MediaFilterScreen from '../Screens/Post/MediaFilterScreen';
import StoryCameraScreen from '../Screens/Post/StoryCameraScreen';
import StoryPreviewScreen from '../Screens/Post/StoryPreviewScreen';
import ReelCameraScreen from '../Screens/Post/ReelCameraScreen';
import ReelPreviewScreen from '../Screens/Post/ReelPreviewScreen';
// import ReelEditorScreen from '../Screens/Post/ReelEditorScreen';
import ReelEditorScreen from '../Screens/Post/ReelEditorScreennew';
import PostPreviewScreen from '../Screens/Post/PostPreviewScreen';
import PostDetails from '../Screens/Post/PostDetails';
import UploadPost from '../Screens/Post/UploadPost';
import StoryUploadScreen from '../Screens/Post/StoryUploadScreen';
import { CreatePostStackParamList } from './types';

const Stack = createNativeStackNavigator<CreatePostStackParamList>();

const CreatePostNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 200,
        contentStyle: { backgroundColor: '#000000' },
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        fullScreenGestureEnabled: true,
      }}
    >
      <Stack.Screen 
        name="UploadOptions" 
        component={UploadOptionsScreen}
        options={{
          animation: 'fade',
        }}
      />
      <Stack.Screen 
        name="StoryReelsSelection" 
        component={StoryReelsSelectionScreen}
        options={{
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen 
        name="MediaPicker" 
        component={MediaPicker}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen 
        name="MediaFilter" 
        component={MediaFilterScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen 
        name="StoryCamera" 
        component={StoryCameraScreen}
        options={{
          animation: 'fade',
          gestureEnabled: false,
        }}
      />
      <Stack.Screen 
        name="StoryPreview" 
        component={StoryPreviewScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen 
        name="ReelCamera" 
        component={ReelCameraScreen}
        options={{
          animation: 'fade',
          gestureEnabled: false,
        }}
      />
      <Stack.Screen 
        name="ReelPreview" 
        component={ReelPreviewScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen 
        name="ReelEditor" 
        component={ReelEditorScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen 
        name="PostPreview" 
        component={PostPreviewScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen 
        name="PostDetails" 
        component={PostDetails}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen 
        name="UploadPost" 
        component={UploadPost}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen 
        name="StoryUpload" 
        component={StoryUploadScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
    </Stack.Navigator>
  );
};

export default CreatePostNavigator; 