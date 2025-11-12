import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AuthState, User } from '@/types';
import { authService } from '@/services';
import { AppError, handleApiError } from '@/utils/errors';
import * as SecureStore from 'expo-secure-store';

interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

const secureStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(name);
    } catch (error) {
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(name, value);
    } catch (error) {
      console.warn('Failed to save to secure store:', error);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(name);
    } catch (error) {
      console.warn('Failed to remove from secure store:', error);
    }
  },
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,

      // Actions
      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true });

          const authData = await authService.login({ email, password });

          set({
            user: authData.user,
            session: authData.session,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          const appError = handleApiError(error);
          set({ isLoading: false });
          throw appError;
        }
      },

      signup: async (name: string, email: string, password: string) => {
        try {
          set({ isLoading: true });

          const authData = await authService.signup({ name, email, password });

          set({
            user: authData.user,
            session: authData.session,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          const appError = handleApiError(error);
          set({ isLoading: false });
          throw appError;
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true });
          await authService.logout();

          set({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
          });
        } catch (error) {
          // Even if logout fails on backend, clear local state
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      refreshToken: async () => {
        try {
          const authData = await authService.refreshToken();

          if (authData) {
            set({
              user: authData.user,
              session: authData.session,
              isAuthenticated: true,
            });
          } else {
            set({
              user: null,
              session: null,
              isAuthenticated: false,
            });
          }
        } catch (error) {
          set({
            user: null,
            session: null,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      getCurrentUser: async () => {
        try {
          set({ isLoading: true });
          const user = await authService.getCurrentUser();

          if (user) {
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            set({
              user: null,
              session: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } catch (error) {
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
          });
          throw error;
        }
      },

      clearError: () => {
        // This would clear any error state if we had it
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Validate authentication state on app startup
          if (state.isAuthenticated && state.user) {
            // Optionally verify with backend
            authService.getCurrentUser().catch(() => {
              // If verification fails, clear auth state
              state.user = null;
              state.session = null;
              state.isAuthenticated = false;
            });
          }
        }
      },
    }
  )
);