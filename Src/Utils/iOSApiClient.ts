import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export class iOSApiClient {
  private static instance: AxiosInstance;
  private static baseURL = 'https://pashuahar.com';

  // Create axios instance with iOS-specific configuration
  static getInstance(): AxiosInstance {
    if (!this.instance) {
      this.instance = axios.create({
        baseURL: this.baseURL,
        timeout: 30000, // Increased timeout for iOS
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'User-Agent': Platform.OS === 'ios' ? 'Yogiverse-iOS/1.0' : 'Yogiverse-Android/1.0',
          'Cache-Control': 'no-cache',
        },
        // iOS-specific configuration
        validateStatus: (status) => status >= 200 && status < 300,
        // Handle SSL issues
        httpsAgent: Platform.OS === 'ios' ? {
          rejectUnauthorized: false, // Only for development - remove in production
        } : undefined,
      });

      // Add request interceptor for authentication
      this.instance.interceptors.request.use(
        async (config) => {
          try {
            const token = await AsyncStorage.getItem('accessToken');
            if (token) {
              config.headers.Authorization = `Bearer ${token.trim()}`;
              console.log('iOSApiClient - Token added to request');
            } else {
              console.log('iOSApiClient - No token found');
            }
          } catch (error) {
            console.log('iOSApiClient - Error getting token:', error);
          }
          return config;
        },
        (error) => {
          console.log('iOSApiClient - Request interceptor error:', error);
          return Promise.reject(error);
        }
      );

      // Add response interceptor for better error handling
      this.instance.interceptors.response.use(
        (response) => {
          console.log('iOSApiClient - Response received:', response.status);
          return response;
        },
        (error) => {
          console.log('iOSApiClient - API Error:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            url: error.config?.url,
            headers: error.config?.headers,
          });
          
          // Handle specific iOS networking errors
          if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
            console.log('iOSApiClient - Network error detected, this might be an SSL/TLS issue');
          }
          
          return Promise.reject(error);
        }
      );
    }

    return this.instance;
  }

  // Make API call with proper error handling
  static async makeRequest<T = any>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const api = this.getInstance();
      console.log(`iOSApiClient - Making ${method} request to: ${endpoint}`);
      
      const response = await api.request({
        method,
        url: endpoint,
        data,
        ...config,
      });
      
      console.log(`iOSApiClient - Request successful:`, response.status);
      return response.data;
    } catch (error) {
      console.log(`iOSApiClient - Request failed:`, error);
      throw error;
    }
  }

  // Specific methods for your API endpoints
  static async fetchFollowersCount(): Promise<number> {
    try {
      const response = await this.makeRequest('/follower/followers');
      console.log('iOSApiClient - fetchFollowersCount response:', response);
      return response?.data?.count || 0;
    } catch (error) {
      console.log('iOSApiClient - Error in fetchFollowersCount:', error);
      return 0;
    }
  }

  static async fetchFollowingCount(): Promise<number> {
    try {
      const response = await this.makeRequest('/follower/following');
      console.log('iOSApiClient - fetchFollowingCount response:', response);
      return response?.data?.count || 0;
    } catch (error) {
      console.log('iOSApiClient - Error in fetchFollowingCount:', error);
      return 0;
    }
  }

  // Test API connectivity
  static async testConnection(): Promise<boolean> {
    try {
      console.log('iOSApiClient - Testing API connection...');
      const response = await this.makeRequest('/follower/followers');
      console.log('iOSApiClient - Connection test successful');
      return true;
    } catch (error) {
      console.log('iOSApiClient - Connection test failed:', error);
      return false;
    }
  }
}

