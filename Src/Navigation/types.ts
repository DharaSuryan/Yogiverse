import { NavigatorScreenParams } from '@react-navigation/native';
import { Story } from '../Types';

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: NavigatorScreenParams<HomeStackParamList>;
  Search: undefined;
  CreatePost: undefined;
  Notifications: undefined;
  Profile: undefined;
};

export type HomeStackParamList = {
  HomeScreen: undefined;
  PostDetails: { postId: string };
  StoryViewer: { stories: Story[]; initialIndex: number };
  CreateStory: undefined;
};

export type SearchStackParamList = {
  Search: undefined;
 SearchDetail:{id:any}
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  EditProfile: undefined;
  Settings: undefined;
  SavedPosts: undefined;
  Followers: { userId: string };
  Following: { userId: string };
  UserProfile: { userId: string };
  PostDetails: { postId: string };
}; 
export type CreatePostStackParamList = {
  MediaPicker: undefined;
  PostDetails: { image: string }; // ✅ image passed from MediaPicker
};
export type CreatePostPreviewStackParamList = {
  PostPreviewScreen: { images: string[] };
  // ...other screens
};
export type CreateSearchDetailStackParamList = {
  SearchDetailScreen:any;
  // ...other screens
};