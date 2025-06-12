import { NavigatorScreenParams } from '@react-navigation/native';
import { Story } from '../Types';

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  MainTab: NavigatorScreenParams<MainTabParamList>;
  RoleSelection: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  RoleSelection: undefined;
};

export type MainTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  SearchTab: NavigatorScreenParams<SearchStackParamList>;
  CreatePost: NavigatorScreenParams<CreatePostStackParamList>;
  NotificationsTab: undefined;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

export type HomeStackParamList = {
  Home: undefined;
  PostDetails: { postId: string };
  StoryViewer: { storyId: string };
};

export type SearchStackParamList = {
  Search: undefined;
  SearchDetail: { query: string };
};

export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  Settings: undefined;
};

export type CreatePostStackParamList = {
  CreatePost: undefined;
  UploadOptions: undefined;
  MediaPicker: undefined;
  MediaFilter: { media: { uri: string; type: string } };
  PostPreview: { media: { uri: string; type: string } };
  PostDetails: { media: { uri: string; type: string }[] };
  CreateStory: undefined;
  CreateReel: undefined;
  ReelPreview: { uri: string };
  PostScreen: undefined;
};

export type CreatePostPreviewStackParamList = {
  PostPreviewScreen: { images: string[] };
  // ...other screens
};

export type CreateSearchDetailStackParamList = {
  SearchDetailScreen:any;
  // ...other screens
};