import { NavigatorScreenParams } from '@react-navigation/native';
import { Story } from '../Types';

export type RootStackParamList = {
  SplashScreen: undefined;
  Auth: NavigatorScreenParams<AuthStackParamList>;
  MainTab: NavigatorScreenParams<MainTabParamList>;
  RoleSelection: undefined;
  Profile: undefined;
  UserProfile: { userId: string };
  HighlightViewer: { highlightId: string };
  PostDetails: { postId: string };
  StoryCreation: undefined;
  ProfilePostDetailScreen: any;
  CreatePostHome: any;
  Post: any;
  PostPreview: any;
  ReelEditor: any;
  ReelPreview: any;
  ReelCamera: any;
  ProfileStack: any;
  Login: any;
  SignUp: any;
  ForgotPassword: any;
  FollowersFollowingScreen: { type: 'followers' | 'following'; userId: string; username: string };
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
  CreatePostTab: NavigatorScreenParams<CreatePostStackParamList>;
  VendorTab: NavigatorScreenParams<VendorStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

export type HomeStackParamList = {
  Home: undefined;
  PostDetails: { postId: string };
  Notifications: undefined;
};

export type SearchStackParamList = {
  Search: undefined;
  SearchDetail: { id: string };
  SubCateGoryDisplay: { item: any };
  TrendingDetailScreen: { post: any };
};

export type CreatePostStackParamList = {
  UploadOptions: undefined;
  StoryReelsSelection: undefined;
  MediaPicker: { 
    type: 'post' | 'reel' | 'story';
    maxSelection?: number;
  };
  MediaFilter: { 
    media: {
      uri: string;
      type: string;
    }[];
  };
  StoryCamera: undefined;
  StoryPreview: { 
    uri: string;
    type?: 'image' | 'video';
    caption?: string;
  };
  ReelCamera: undefined;
  ReelPreview: { 
    uri: string;
    caption?: string;
  };
  ReelEditor: { 
    media: {
      uri: string;
      type: string;
    };
  };
  PostPreview: { 
    images: string[];
    caption?: string;
  };
  PostDetails: { 
    postId: string;
  };
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
  Vendor: undefined;
  VenderDetail: { vendorId: string };
};