import { apiClient } from './client';
import { LoginCredentials, SignupCredentials, AuthResponse, User } from '@/types';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user_data';

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/api/auth/login', credentials);

      if (response.success && response.data) {
        await this.storeAuthData(response.data);
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async signup(credentials: SignupCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/api/auth/signup', credentials);

      if (response.success && response.data) {
        await this.storeAuthData(response.data);
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      // Call backend logout endpoint to invalidate session
      await apiClient.post('/api/auth/logout');
    } catch (error) {
      // Even if backend call fails, we should clear local storage
      console.warn('Backend logout failed:', error);
    } finally {
      await this.clearAuthData();
    }
  }

  async refreshToken(): Promise<AuthResponse | null> {
    try {
      const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiClient.post<AuthResponse>('/api/auth/refresh', {
        refreshToken,
      });

      if (response.success && response.data) {
        await this.storeAuthData(response.data);
      }

      return response.data;
    } catch (error) {
      // Refresh failed, clear auth data
      await this.clearAuthData();
      throw error;
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      await apiClient.post('/api/auth/forgot-password', { email });
    } catch (error) {
      throw error;
    }
  }

  async updatePassword(token: string, password: string): Promise<void> {
    try {
      await apiClient.post('/api/auth/reset-password', { token, password });
    } catch (error) {
      throw error;
    }
  }

  async verifyEmail(token: string): Promise<void> {
    try {
      await apiClient.post('/api/auth/verify-email', { token });
    } catch (error) {
      throw error;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await apiClient.get<{ user: User }>('/api/auth/me');
      return response.data?.user || null;
    } catch (error) {
      // If we can't get the current user, we might need to refresh the token
      try {
        const authData = await this.refreshToken();
        return authData?.user || null;
      } catch (refreshError) {
        // Refresh also failed, clear auth data
        await this.clearAuthData();
        return null;
      }
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (!token) return false;

      // Verify token is still valid by checking current user
      const user = await this.getCurrentUser();
      return user !== null;
    } catch (error) {
      return false;
    }
  }

  async getStoredUser(): Promise<User | null> {
    try {
      const userData = await SecureStore.getItemAsync(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      return null;
    }
  }

  private async storeAuthData(authData: AuthResponse): Promise<void> {
    try {
      if (authData.session?.token) {
        await SecureStore.setItemAsync(TOKEN_KEY, authData.session.token);
      }

      if (authData.user) {
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(authData.user));
      }
    } catch (error) {
      console.error('Failed to store auth data:', error);
      throw error;
    }
  }

  private async clearAuthData(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);
    } catch (error) {
      console.error('Failed to clear auth data:', error);
    }
  }

  // Method to handle biometric authentication
  async setupBiometricAuth(): Promise<boolean> {
    try {
      // This would integrate with expo-local-authentication
      // For now, return true to indicate it's available
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const authService = new AuthService();