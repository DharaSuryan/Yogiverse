import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Post } from '../../Types';

interface Comment {
  id: string;
  userId: string;
  username: string;
  text: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
  replies?: Comment[];
  mentionedUsers: string[];
}

interface PostState {
  posts: Post[];
  loading: boolean;
  error: string | null;
  currentPost: Post | null;
}

const initialState: PostState = {
  posts: [],
  loading: false,
  error: null,
  currentPost: null,
};

// Mock API call - replace with actual API call
const fetchPostsAPI = async (): Promise<Post[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return mock data
  return [
    {
      id: '1',
      userId: 'user1',
      username: 'john_doe',
      userProfilePicture: 'https://picsum.photos/200',
      image: 'https://picsum.photos/400',
      caption: 'Beautiful sunset! 🌅',
      likes: 120,
      comments: [
        {
          id: 'c1',
          userId: 'user2',
          username: 'jane_smith',
          userProfilePicture: 'https://picsum.photos/201',
          text: 'Amazing view!',
          likes: 5,
          timestamp: '2h',
          isLiked: false,
          replies: [],
          mentionedUsers: [],
        },
      ],
      timestamp: '2h',
      isLiked: false,
      isSaved: false,
    },
    {
      id: '2',
      userId: 'user2',
      username: 'jane_smith',
      userProfilePicture: 'https://picsum.photos/201',
      image: 'https://picsum.photos/401',
      caption: 'Morning coffee ☕️',
      likes: 85,
      comments: [
        {
          id: 'c2',
          userId: 'user1',
          username: 'john_doe',
          userProfilePicture: 'https://picsum.photos/200',
          text: 'Looks delicious!',
          likes: 3,
          timestamp: '1h',
          isLiked: false,
          replies: [],
          mentionedUsers: [],
        },
      ],
      timestamp: '1h',
      isLiked: true,
      isSaved: false,
    },
  ];
};

export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async (_, { rejectWithValue }) => {
    try {
      const posts = await fetchPostsAPI();
      return posts;
    } catch (error) {
      return rejectWithValue('Failed to fetch posts');
    }
  }
);

const postSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    addPost: (state, action) => {
      state.posts.unshift(action.payload);
    },
    deletePost: (state, action) => {
      state.posts = state.posts.filter(post => post.id !== action.payload);
    },
    likePost: (state, action) => {
      const post = state.posts.find(p => p.id === action.payload);
      if (post) {
        post.isLiked = !post.isLiked;
        post.likes += post.isLiked ? 1 : -1;
      }
    },
    savePost: (state, action) => {
      const post = state.posts.find(p => p.id === action.payload);
      if (post) {
        post.isSaved = !post.isSaved;
      }
    },
    addComment: (state, action) => {
      const { postId, comment } = action.payload;
      const post = state.posts.find(p => p.id === postId);
      if (post) {
        post.comments.push(comment);
      }
    },
    likeComment: (state, action) => {
      const { postId, commentId } = action.payload;
      const post = state.posts.find(p => p.id === postId);
      if (post) {
        const comment = post.comments.find(c => c.id === commentId);
        if (comment) {
          comment.likes += 1;
        }
      }
    },
    setCurrentPost: (state, action) => {
      state.currentPost = action.payload;
    },
    updatePost: (state, action) => {
      const index = state.posts.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.posts[index] = action.payload;
      }
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchPosts.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  addPost,
  deletePost,
  likePost,
  savePost,
  addComment,
  likeComment,
  setCurrentPost,
  updatePost,
} = postSlice.actions;

export default postSlice.reducer; 