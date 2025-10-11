import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Comment {
  id: string;
  postId: string;
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
}

interface CommentState {
  comments: { [key: string]: Comment[] }; // postId -> comments
  loading: boolean;
  error: string | null;
  replyingTo: Comment | null;
}

const initialState: CommentState = {
  comments: {},
  loading: false,
  error: null,
  replyingTo: null,
};

const commentSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    fetchCommentsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchCommentsSuccess: (state, action: PayloadAction<{ postId: string; comments: Comment[] }>) => {
      state.loading = false;
      state.comments[action.payload.postId] = action.payload.comments;
      state.error = null;
    },
    fetchCommentsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    addComment: (state, action: PayloadAction<{ postId: string; comment: Comment }>) => {
      const { postId, comment } = action.payload;
      if (!state.comments[postId]) {
        state.comments[postId] = [];
      }
      state.comments[postId].unshift(comment);
    },
    deleteComment: (state, action: PayloadAction<{ postId: string; commentId: string }>) => {
      const { postId, commentId } = action.payload;
      if (state.comments[postId]) {
        state.comments[postId] = state.comments[postId].filter(
          comment => comment.id !== commentId
        );
      }
    },
    toggleLike: (state, action: PayloadAction<{ postId: string; commentId: string }>) => {
      const { postId, commentId } = action.payload;
      const comment = state.comments[postId]?.find(c => c.id === commentId);
      if (comment) {
        comment.isLiked = !comment.isLiked;
        comment.likes += comment.isLiked ? 1 : -1;
      }
    },
    setReplyingTo: (state, action: PayloadAction<Comment | null>) => {
      state.replyingTo = action.payload;
    },
    addReply: (state, action: PayloadAction<{ postId: string; parentCommentId: string; reply: Comment }>) => {
      const { postId, parentCommentId, reply } = action.payload;
      const parentComment = state.comments[postId]?.find(c => c.id === parentCommentId);
      if (parentComment) {
        parentComment.replies.push(reply);
      }
    },
    updateComment: (state, action: PayloadAction<{ postId: string; commentId: string; text: string }>) => {
      const { postId, commentId, text } = action.payload;
      const comment = state.comments[postId]?.find(c => c.id === commentId);
      if (comment) {
        comment.text = text;
      }
    },
  },
});

export const {
  fetchCommentsStart,
  fetchCommentsSuccess,
  fetchCommentsFailure,
  addComment,
  deleteComment,
  toggleLike,
  setReplyingTo,
  addReply,
  updateComment,
} = commentSlice.actions;

export default commentSlice.reducer; 