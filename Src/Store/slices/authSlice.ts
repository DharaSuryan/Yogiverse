import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginSuccess, logout, setToken, setLoading } from '../actions/authActions';

interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

// Initialize auth state from AsyncStorage
export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async () => {
    try {
      const [token, refreshToken, userData] = await Promise.all([
        AsyncStorage.getItem('accessToken'),
        AsyncStorage.getItem('refreshToken'),
        AsyncStorage.getItem('userData')
      ]);

      // If we have a token but no refresh token, try to get a new refresh token
      if (token && !refreshToken) {
        try {
          // You would need to implement this API call to your backend
          // const response = await refreshTokenAPI(token);
          // if (response.refreshToken) {
          //   await AsyncStorage.setItem('refreshToken', response.refreshToken);
          //   refreshToken = response.refreshToken;
          // }
        } catch (error) {
          console.error('Error refreshing token:', error);
        }
      }

      return {
        token,
        refreshToken,
        user: userData ? JSON.parse(userData) : null,
        isAuthenticated: !!(token && userData)
      };
    } catch (error) {
      console.error('Error initializing auth:', error);
      return {
        token: null,
        refreshToken: null,
        user: null,
        isAuthenticated: false
      };
    }
  }
);

const initialState: AuthState = {
  token: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,
  loading: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.user = action.payload.user;
        state.isAuthenticated = action.payload.isAuthenticated;
        state.loading = false;
      })
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
      })
      .addCase(setToken, (state, action) => {
        state.token = action.payload;
        state.isAuthenticated = true;
        // Store token with no expiration
        AsyncStorage.setItem('accessToken', action.payload);
      })
      .addCase(loginSuccess, (state, action) => {
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.loading = false;
        
        // Store tokens and user data with no expiration
        Promise.all([
          AsyncStorage.setItem('accessToken', action.payload.token),
          AsyncStorage.setItem('refreshToken', action.payload.refreshToken),
          AsyncStorage.setItem('userData', JSON.stringify(action.payload.user))
        ]).catch(error => {
          console.error('Error storing auth data:', error);
        });
      })
      .addCase(logout, (state) => {
        state.token = null;
        state.refreshToken = null;
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        
        // Clear stored data
        Promise.all([
          AsyncStorage.removeItem('accessToken'),
          AsyncStorage.removeItem('refreshToken'),
          AsyncStorage.removeItem('userData')
        ]).catch(error => {
          console.error('Error clearing auth data:', error);
        });
      })
      .addCase(setLoading, (state, action) => {
        state.loading = action.payload;
      });
  },
});

export default authSlice.reducer; 