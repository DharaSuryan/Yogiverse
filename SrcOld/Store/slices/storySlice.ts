import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Story } from '../../Types';

interface StoryState {
  stories: Story[];
  loading: boolean;
  error: string | null;
}

const initialState: StoryState = {
  stories: [],
  loading: false,
  error: null,
};

const storySlice = createSlice({
  name: 'stories',
  initialState,
  reducers: {
    addStory: (state, action: PayloadAction<Story>) => {
      state.stories.push(action.payload);
    },
    markStoryAsViewed: (state, action: PayloadAction<string>) => {
      const story = state.stories.find(s => s.id === action.payload);
      if (story) {
        if (!story.viewedBy) {
          story.viewedBy = [];
        }
        if (!story.viewedBy.includes('current-user-id')) {
          story.viewedBy.push('current-user-id');
        }
      }
    },
    deleteStory: (state, action: PayloadAction<string>) => {
      state.stories = state.stories.filter(story => story.id !== action.payload);
    },
  },
});

export const { addStory, markStoryAsViewed, deleteStory } = storySlice.actions;
export default storySlice.reducer; 