import { NavigatorScreenParams } from '@react-navigation/native';
import { Story } from '../Types';

export type RootStackParamList = {
  SplashScreen: undefined;
  Auth: NavigatorScreenParams<AuthStackParamList>;
  MainTab: NavigatorScreenParams<MainTabParamList>;
  RoleSelection: undefined;
  Profile: undefined;
  HighlightViewer: { highlightId: string };
  PostDetails: { postId: string };
  StoryCreation: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  RoleSelection: undefined;
};

export type MainTabParamList = {
  Home: NavigatorScreenParams<HomeStackParamList>;
  Search: NavigatorScreenParams<SearchStackParamList>;
  CreatePost: NavigatorScreenParams<CreatePostStackParamList>;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
  Vendor: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  PostDetails: { postId: string };
  Notifications: undefined;
};

export type SearchStackParamList = {
  Search: undefined;
  SearchDetail: undefined;
};

export type CreatePostStackParamList = {
  CreatePost: undefined;
  MediaPicker: undefined;
  MediaFilter: { media: any };
  UploadOptions: undefined;
  StoryCamera: undefined;
  StoryPreview: { imageUri: string };
  ReelCamera: undefined;
  ReelPreview: { videoUri: string };
};

export type ProfileStackParamList = {
  Profile: undefined;
  Menu: undefined;
  HighlightViewer: { highlightId: string };
};

export type CreatePostPreviewStackParamList = {
  PostPreviewScreen: { images: string[] };
  // ...other screens
};

export type CreateSearchDetailStackParamList = {
  SearchDetailScreen:any;
  // ...other screens
};

export type VendorStackParamList = {
  VendorHome: undefined;
  VendorList: undefined;
};