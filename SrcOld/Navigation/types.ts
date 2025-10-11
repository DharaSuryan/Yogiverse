import { NavigatorScreenParams } from '@react-navigation/native';
import { Story } from '../Types/index';

export type RootStackParamList = {
  SplashScreen: undefined;
  Auth: NavigatorScreenParams<AuthStackParamList>;
  MainTab: NavigatorScreenParams<MainTabParamList>;
  RoleSelection: undefined;
  Profile: undefined;
  UserProfile: { userId: string };
  EditProfile: { data: any };
  HighlightViewer: { highlightId: string; userId: string };
  PostDetails: { postId: string };
  StoryCreation: undefined;
  StoryViewerScreen: { story: Story };
  SavedCollectionsScreen: undefined;
  CreateCollectionScreen: undefined;
  CollectionDetailScreen: { 
    collectionId: string; 
    collectionName: string; 
    postToSave?: { content_type: string; object_id: string; }
  };
  CollectionPostDetail: { post: any };
  CommentScreen: { content_type: string; object_id: string };
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
  SubCateGoryDisplay: { item: any };
  PostFullView: { post: any };
  ReelFullView: { reel: any };
  UploadOptionsScreen: undefined;
  PostDetailScreen: { postId: string };
  ChatListScreen: undefined;
  ChatScreen: {
    chatId: string;
    chat: any;
    is_single_chat: boolean;
    chat_name: string;
    group_icon?: string;
    group_members: any;
    userid: string | number;
  };
  UploadPost: any;
  LocationConfirmScreen: {
    location: {
      display_name: string;
      lat: string;
      lon: string;
      [key: string]: any;
    };
    onConfirm?: (location: any) => void;
  };
  LocationPickerScreen: { selected?: any; returnTo?: string };
};

export type AuthStackParamList = {
  Login: undefined;
  SignUp: { role: 'user' | 'vendor' };
  ForgotPassword: undefined;
  RoleSelection: undefined;
  MainCategory: { signupData: any };
  SubCategory: { signupData: any; role: 'user' | 'vendor' };
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
  CreatePostHome: undefined;
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
  Postss: { postId: string };
  UploadPost: any;
  StoryUpload: undefined;
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