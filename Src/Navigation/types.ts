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
  CreatePost: undefined;
  StoryViewerScreen: { story: Story };
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
  PostDetails: { 
    postId: string;
    media?: Array<{ uri: string; type: 'image' | 'video' }>;
  };
  Notifications: undefined;
};

export type SearchStackParamList = {
  Search: undefined;
  SearchDetail: { id: string };
  SubCateGoryDisplay: { item: any };
};

export type CreatePostStackParamList = {
  UploadOptions: undefined;
  StoryReelsSelection: undefined;
  MediaPicker: { 
    type: 'post' | 'reel' | 'story';
    maxSelection?: number;
  };
  MediaFilter: { 
    media: Array<{ uri: string; type: 'image' | 'video' }>;
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
  Post: { 
    media: Array<{ uri: string; type: 'image' | 'video' }>;
  };
  PostDetails: { 
    postId: string;
    media?: Array<{ uri: string; type: 'image' | 'video' }>;
  };
  UploadPost: { isFromStory?: boolean };
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