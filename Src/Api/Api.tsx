// apiService.js (modified)
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
export const BASE_URL = 'http://192.168.1.107:8000';  // Your local API endpoint

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

export const fetchCountries = async (page = 1, limit = 10): Promise<ApiResponse> => {
  try {
    const response = await api.get('/helper_app/countries/', { params: { page, limit } });
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

const _REQUEST2SERVER_Authorization_Post_FCM = async (url, params = null) => {
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
export const onAddDevicesAPICall = (params) => {
  return _REQUEST2SERVER_Authorization_Post_FCM(`/fcm-token/`, params);
};
export default api;
