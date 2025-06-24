import axios from 'axios';
import { BASE_URL } from './Api';

// Types
interface MediaFile {
  uri: string;
  type: string;
  name: string;
}

interface MediaMetadata {
  is_video: boolean;
}

interface PostData {
  allow_comments: boolean;
  hide_like_count: boolean;
  media_files: MediaFile[];
  media_metadata: MediaMetadata[];
}

interface ReelData {
  is_draft: boolean;
  allow_comments: boolean;
  hide_like_count: boolean;
  duration: number;
  video_file: MediaFile;
}

interface StoryData {
  media_file: MediaFile;
  hide_like_count: boolean;
}

interface PostFormData {
  allow_comments: string;
  hide_like_count: string;
  media_files: MediaFile[];
  media_metadata: string[];
}

interface ReelFormData {
  allow_comments: string;
  hide_like_count: string;
  is_draft: string;
  duration: string;
  media_files: MediaFile[];
}

interface StoryFormData {
  hide_like_count: string;
  isTemporary: string;
  media_files: MediaFile[];
}

export const PostApi = {
  // Post creation
  createPost: async (formData: FormData) => {
    return axios.post(`${BASE_URL}/posts/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Reel creation
  createReel: async (formData: FormData) => {
    return axios.post(`${BASE_URL}/reels/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Story creation
  createStory: async (formData: FormData) => {
    return axios.post(`${BASE_URL}/stories/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
} as const;
