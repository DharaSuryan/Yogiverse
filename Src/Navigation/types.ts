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
  Search: NavigatorScreenParams<SearchStackParamList>;
  CreatePost: undefined;
  Notifications: undefined;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
};

export type HomeStackParamList = {
  HomeScreen: undefined;
  PostDetails: { postId: string };
  StoryViewer: { stories: Story[]; initialIndex: number };
  CreateStory: undefined;
};

export type SearchStackParamList = {
  SearchMain: undefined;
  UserProfile: { userId: string };
  HashtagPosts: { hashtag: string };
  LocationPosts: { location: string };
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