
// apiService.js (modified)
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

const API_BASE_URL = 'http://192.168.1.160:9001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to automatically add the token to the headers
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


const apiRequest = async (url, method, data = null, config = {}) => {
  try {
    const response = await api({
      method: method,
      url: url,
      data: data,
      ...config,
    });
    console.log("response.data",response.data);
    
    return response.data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

export const registerUser = (userData) => {
    console.log("user data",userData);
  return apiRequest('/vendor_register', 'post', userData);
  
  
};

export const loginUser = async (credentials) => {
  try {
    const response = await apiRequest('/login', 'post', credentials);
    await AsyncStorage.setItem('authToken', response.token); 
    return response;
  } catch (error) {
    throw error;
  }
};

export const logoutUser = async () => {
  try {
   
    await AsyncStorage.removeItem('authToken');
  
  } catch (error) {
    console.error('Logout Error:', error);
    throw error;
  }
};
export const fetchCountries = async () => {
  return apiRequest('/helper_app/countries/', 'get');
};

export const fetchStates = async () => {
  return apiRequest('/helper_app/states/', 'get');
};

export const fetchCities = async (stateId) => {
  return apiRequest(`/helper_app/cities/${stateId}/`, 'get');
};

export default apiRequest;
