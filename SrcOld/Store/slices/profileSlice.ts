import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  bio: string;
  profilePicture: string;
  followers: number;
  following: number;
  posts: number;
  isFollowing: boolean;
  isPrivate: boolean;
  highlights: {
    id: string;
    title: string;
    coverImage: string;
  }[];
}

interface ProfileState {
  currentProfile: UserProfile | null;
  visitedProfiles: { [key: string]: UserProfile };
  loading: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  currentProfile: null,
  visitedProfiles: {},
  loading: false,
  error: null,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    fetchProfileStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchProfileSuccess: (state, action: PayloadAction<UserProfile>) => {
      state.loading = false;
      state.currentProfile = action.payload;
      state.visitedProfiles[action.payload.id] = action.payload;
      state.error = null;
    },
    fetchProfileFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.currentProfile) {
        state.currentProfile = { ...state.currentProfile, ...action.payload };
        state.visitedProfiles[state.currentProfile.id] = state.currentProfile;
      }
    },
    toggleFollow: (state, action: PayloadAction<string>) => {
      const profile = state.visitedProfiles[action.payload];
      if (profile) {
        profile.isFollowing = !profile.isFollowing;
        profile.followers += profile.isFollowing ? 1 : -1;
      }
    },
    addHighlight: (state, action: PayloadAction<{ id: string; title: string; coverImage: string }>) => {
      if (state.currentProfile) {
        state.currentProfile.highlights.push(action.payload);
      }
    },
    removeHighlight: (state, action: PayloadAction<string>) => {
      if (state.currentProfile) {
        state.currentProfile.highlights = state.currentProfile.highlights.filter(
          highlight => highlight.id !== action.payload
        );
      }
    },
    setProfilePrivacy: (state, action: PayloadAction<boolean>) => {
      if (state.currentProfile) {
        state.currentProfile.isPrivate = action.payload;
      }
    },
  },
});

export const {
  fetchProfileStart,
  fetchProfileSuccess,
  fetchProfileFailure,
  updateProfile,
  toggleFollow,
  addHighlight,
  removeHighlight,
  setProfilePrivacy,
} = profileSlice.actions;

export default profileSlice.reducer; 