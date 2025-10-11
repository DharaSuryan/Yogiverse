import AsyncStorage from '@react-native-async-storage/async-storage';

export class TokenHelper {
  // Get token with proper validation
  static async getAccessToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      console.log('TokenHelper - Raw token:', token);
      console.log('TokenHelper - Token length:', token?.length);
      console.log('TokenHelper - Token type:', typeof token);
      
      if (!token) {
        console.log('TokenHelper - No token found');
        return null;
      }
      
      const trimmedToken = token.trim();
      console.log('TokenHelper - Trimmed token length:', trimmedToken.length);
      
      // Validate JWT token format (should have 3 parts separated by dots)
      const parts = trimmedToken.split('.');
      if (parts.length !== 3) {
        console.log('TokenHelper - Invalid JWT format, parts:', parts.length);
        return null;
      }
      
      return trimmedToken;
    } catch (error) {
      console.log('TokenHelper - Error getting token:', error);
      return null;
    }
  }
  
  // Store token with validation
  static async setAccessToken(token: string): Promise<boolean> {
    try {
      if (!token || typeof token !== 'string') {
        console.log('TokenHelper - Invalid token provided');
        return false;
      }
      
      const trimmedToken = token.trim();
      console.log('TokenHelper - Storing token, length:', trimmedToken.length);
      
      await AsyncStorage.setItem('accessToken', trimmedToken);
      console.log('TokenHelper - Token stored successfully');
      return true;
    } catch (error) {
      console.log('TokenHelper - Error storing token:', error);
      return false;
    }
  }
  
  // Clear all tokens
  static async clearTokens(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem('accessToken'),
        AsyncStorage.removeItem('refreshToken'),
        AsyncStorage.removeItem('userData'),
      ]);
      console.log('TokenHelper - All tokens cleared');
    } catch (error) {
      console.log('TokenHelper - Error clearing tokens:', error);
    }
  }
  
  // Verify token is valid
  static async verifyToken(): Promise<boolean> {
    try {
      const token = await this.getAccessToken();
      if (!token) {
        return false;
      }
      
      // Check if token is expired (basic check)
      const parts = token.split('.');
      if (parts.length !== 3) {
        return false;
      }
      
      try {
        const payload = JSON.parse(atob(parts[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        
        if (payload.exp && payload.exp < currentTime) {
          console.log('TokenHelper - Token is expired');
          return false;
        }
        
        console.log('TokenHelper - Token is valid');
        return true;
      } catch (parseError) {
        console.log('TokenHelper - Error parsing token payload:', parseError);
        return false;
      }
    } catch (error) {
      console.log('TokenHelper - Error verifying token:', error);
      return false;
    }
  }
}

