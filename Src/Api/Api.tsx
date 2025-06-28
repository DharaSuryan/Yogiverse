// apiService.js (modified)
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Types
interface ApiResponse {
  data: any;
  status: number;
  message: string;
  user?: any;
  token?: string;
}
interface Location {
  id: number;
  name: string;
  country_name?: string;
}
interface UserData {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  phone_no?: string;
  country?: string;
  state?: string;
  city?: string;
  business_name?: string;
  main_categories?: string[];
  role?: string;
}
interface LoginCredentials {
  username: string;
  password: string;
}

// API Configuration
export const BASE_URL = 'https://pashuahar.com/';  // Your local API endpoint

export const API_INTERNET_CONNECTION_CAPTION_EN =
  'Sorry, No Internet connectivity detected. Please reconnect and try again';

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add token to all requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Call your refresh token endpoint
        const response = await axios.post('YOUR_REFRESH_TOKEN_ENDPOINT', {
          refreshToken,
        });

        const { accessToken, newRefreshToken } = response.data;

        // Store new tokens
        await Promise.all([
          AsyncStorage.setItem('accessToken', accessToken),
          AsyncStorage.setItem('refreshToken', newRefreshToken),
        ]);

        // Update the failed request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh token fails, logout user
        await logoutUser();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const registerUser  = async (formData: FormData): Promise<ApiResponse> => {
  return api.post('/vendor_register/', formData);
};
export const loginUser = async (credentials: { username: string; password: string }): Promise<ApiResponse> => {
  try {
    const response = await api.post('/login/', credentials);
    return {
      data: response.data,
      status: response.status,
      message: 'Login successful',
      user: response.data.user,
      token: response.data.token
    };
  } catch (error) {
    throw error;
  }
};
export const logoutUser = async () => {
  try {
    await Promise.all([
      AsyncStorage.removeItem('accessToken'),
      AsyncStorage.removeItem('refreshToken'),
      AsyncStorage.removeItem('userData'),
    ]);
  } catch (error) {
    console.error('Logout Error:', error);
    throw error;
  }
};
export const getProfile = async (): Promise<ApiResponse> => {
  console.log("get ");
  
  const response = await api.get(`/profile/`); // ✅ adjust if endpoint differs
  return {
    data: response.data,
    status: response.status,
    message: 'Profile fetched successfully',
  };
};

// Fetch posts for the logged-in user
export const getUserPosts = async (): Promise<ApiResponse> => {
  const response = await api.get('/posts/');
  return {
    data: response.data,
    status: response.status,
    message: 'Posts fetched successfully',
  };
};

// Fetch reels for the logged-in user
export const getUserReels = async (): Promise<ApiResponse> => {
  const response = await api.get('/reels/');
  return {
    data: response.data,
    status: response.status,
    message: 'Reels fetched successfully',
  };
};

// Fetch following count for the logged-in user
export const getFollowingCount = async (): Promise<ApiResponse> => {
  const response = await api.get('/follower/following');
  return {
    data: response.data,
    status: response.status,
    message: 'Following count fetched successfully',
  };
};

// Fetch followers count for the logged-in user
export const getFollowersCount = async (): Promise<ApiResponse> => {
  const response = await api.get('/follower/followers');
  console.log("here ....",response?.data?.data);
  
  return {
    data: response.data,
    status: response.status,
    message: 'Followers count fetched successfully',
  };
};

// Post creation API
export const postPosts = async ({ formData }: { formData: FormData }): Promise<ApiResponse> => {
  const response = await api.post('/posts/', formData);
  return {
    data: response.data,
    status: response.status,
    message: 'Post created successfully',
  };
};

// Story creation API
export const postStories = async ({ formData }: { formData: FormData }): Promise<ApiResponse> => {
  console.log("formData inside postStories",formData);
  
  const response = await api.post('/stories/', formData);
  return {
    data: response.data,
    status: response.status,
    message: 'Story created successfully',
  };
};

export const fetchCountries = async (page = 1, limit = 10): Promise<ApiResponse> => {
  try {
    const response = await api.get('/helper_app/countries/', { params: { page, limit } });
    console.log("response",response);
    
    return {
      data: response.data,
      status: response.status,
      message: 'Countries fetched successfully'
    };
  } catch (error) {
    throw error;
  }
};

export const fetchStates = async (countryId: number, page = 1, limit = 10): Promise<ApiResponse> => {
  try {
    const response = await api.get('/helper_app/states/', { params: { countryId, page, limit } });
    return {
      data: response.data,
      status: response.status,
      message: 'States fetched successfully'
    };
  } catch (error) {
    throw error;
  }
};

export const fetchCities = async (stateId: number, page = 1, limit = 10): Promise<ApiResponse> => {
  try {
    const response = await api.get('/helper_app/cities/', { params: { stateId, page, limit } });

    return {
      data: response.data,
      status: response.status,
      message: 'Cities fetched successfully'
    };
  } catch (error) {
    throw error;
  }
};

const _REQUEST2SERVER_Authorization_Post_FCM = async (url: string, params: any = null) => {
  const token = await AsyncStorage.getItem('emp_token');
  var config = {
    method: 'post',
    url: BASE_URL + url,
    headers: {
      Accept: 'application/json',
      Authorization: 'token ' + token,
     
    },
    data: params,
  };
  return await new Promise(function (resolve, reject) {
    console.log('config--->', config);
    axios(config)
      .then((data) => {
        if (data.data.status) resolve(data.data);
        else reject(data.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};
export const onAddDevicesAPICall = (params: any) => {
  return _REQUEST2SERVER_Authorization_Post_FCM(`/fcm-token/`, params);
};

const registerFCMToken = async (token: string) => {
  try {
    const authToken = await AsyncStorage.getItem('authToken'); // Get your auth token
    if (!authToken) {
      console.log('No auth token available');
      return;
    }

    const response = await axios.post('http://192.168.1.160:9001/fcm-token/', 
      { token },
      {
        headers: {
          'Accept': 'application/json',
          'Authorization': `token ${authToken}`
        }
      }
    );
    console.log('FCM token registered successfully');
  } catch (error) {
    console.error('Error registering FCM token:', error);
  }
};

export default api;

type VendorListNavigationProp = NativeStackNavigationProp<VendorStackParamList, 'VendorList'>;

export type VendorStackParamList = {
  VendorList: undefined;
  VendorDetail: { vendorId: string };
};
