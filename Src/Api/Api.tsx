// apiService.js (modified)
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
interface ApiResponse {
  user: any;
  token: string;
  data: any;
  status: number;
  message: string;
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
const BASE_URL = 'http://192.168.1.160:9001';  // Your local API endpoint
const apiRequest = async (method: string, endpoint: string, data?: any) => {
  try {
    const isFormData = (typeof data === 'object') && (data instanceof FormData);
    const headers: any = {
      Accept: 'application/json',
      'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
    };
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      data,
      headers,
      timeout: 30000,
    };
    const response = await axios(config);
    return response;
  } catch (error: any) {
    console.error('API Request Error:', error);
    throw error;
  }
};
export const registerUser  = async (formData: FormData): Promise<ApiResponse> => {
  return apiRequest('post', '/vendor_register/', formData);
};
export const loginUser  = async (credentials: LoginCredentials): Promise<ApiResponse> => {
  try {
    return await apiRequest('post', '/login/', credentials);
  } catch (error: any) {
    console.error('Login User Error:', error);
    throw error;
  }
};
export const logoutUser  = async () => {
  try {
    await AsyncStorage.removeItem('authToken');
  } catch (error) {
    console.error('Logout Error:', error);
    throw error;
  }
};
export const fetchCountries = async (page: number = 1, limit: number = 10) => {
  try {
    console.log('Fetching countries... Page:', page, 'Limit:', limit);
    const response = await apiRequest('get', `/helper_app/countries/?page=${page}&limit=${limit}`);
    
    console.log('Raw Countries Response:', {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data
    });
    
    if (!response || !response.data) {
      throw new Error('No response received from server');
    }

    // Log the exact structure of the response data
    console.log('Response Data Structure:', {
      isArray: Array.isArray(response.data),
      hasResults: response.data.results ? true : false,
      dataType: typeof response.data,
      keys: Object.keys(response.data)
    });

    return {
      data: response.data,
      status: response.status,
      message: 'Success'
    };
  } catch (error: any) {
    console.error('Fetch Countries Error:', error);
    throw error;
  }
};

export const fetchStates = async (countryId: number, page = 1, limit = 10): Promise<ApiResponse> => {
  try {
    const response = await apiRequest('get', `/helper_app/states/${countryId}/`);
    return {
      data: response.data,
      status: response.status,
      message: 'Success'
    };
  } catch (error: any) {
    console.error('Fetch States Error:', error);
    throw error;
  }
};

export const fetchCities = async (stateId: number, page = 1, limit = 10): Promise<ApiResponse> => {
  try {
    const response = await apiRequest('get', `/helper_app/cities/${stateId}/`);
    return {
      data: response.data,
      status: response.status,
      message: 'Success'
    };
  } catch (error: any) {
    console.error('Fetch Cities Error:', error);
    throw error;
  }
};
export { apiRequest };
