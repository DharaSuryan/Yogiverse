export interface User {
  id: string;
  username: string;
  email: string;
  profilePicture: string;
  bio?: string;
  followers: number;
  following: number;
  posts?: Post[];
  isVerified?: boolean;
}

export interface Comment {
  id: string;
  userId: string;
  username: string;
  userProfilePicture: string;
  text: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
  replies: Comment[];
  mentionedUsers: string[];
  replyTo?: string;
  createdAt: string;
  user: User;
}

export interface Post {
  id: string;
  userId: string;
  username: string;
  userProfilePicture: string;
  imageUrl: string;
  caption: string;
  likes: number;
  comments: Comment[];
  timestamp: string;
  isLiked: boolean;
  isSaved: boolean;
  location?: string;
  createdAt: string;
  user: User;
}

export interface Story {
  id: string;
  userId: string;
  username: string;
  userProfilePicture: string;
  mediaUrl: string;
  timestamp: string;
  duration: number;
  viewers: string[];
  isViewed: boolean;
  type: 'image' | 'video';
  location?: string;
  imageUrl: string;
  createdAt: string;
  expiresAt: string;
  user: User;
  viewedBy?: string[];
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention';
  userId: string;
  username: string;
  userProfilePicture: string;
  postId?: string;
  commentId?: string;
  timestamp: string;
  isRead: boolean;
  createdAt: string;
  read: boolean;
  user: User;
}

export interface Highlight {
  id: string;
  title: string;
  coverImage: string;
  stories: Story[];
}

export interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  bio: string;
  profilePicture: string;
  followers: number;
  following: number;
  posts: Post[];
  isFollowing: boolean;
  isPrivate: boolean;
  highlights: Highlight[];
}

export interface Hashtag {
  id: string;
  name: string;
  postCount: number;
  posts: Post[];
}

export interface Location {
  id: string;
  name: string;
  postCount: number;
  posts: Post[];
} 