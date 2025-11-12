import Constants from 'expo-constants';

export const ENVIRONMENT = {
  API_BASE_URL: Constants.expoConfig?.extra?.apiBaseUrl || process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000',
  IS_DEVELOPMENT: process.env.EXPO_PUBLIC_ENVIRONMENT === 'development',
  IS_PRODUCTION: process.env.EXPO_PUBLIC_ENVIRONMENT === 'production',
};