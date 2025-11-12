import * as SecureStore from 'expo-secure-store';

export class SecureStorageService {
  private static instance: SecureStorageService;

  static getInstance(): SecureStorageService {
    if (!SecureStorageService.instance) {
      SecureStorageService.instance = new SecureStorageService();
    }
    return SecureStorageService.instance;
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error(`Failed to store item ${key}:`, error);
      throw new Error('Failed to store data securely');
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error(`Failed to retrieve item ${key}:`, error);
      return null;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error(`Failed to remove item ${key}:`, error);
      throw new Error('Failed to remove data securely');
    }
  }

  async clearAll(): Promise<void> {
    try {
      // Note: SecureStore doesn't have a clear all method
      // You would need to track keys and remove them individually
      const keys = ['auth_token', 'refresh_token', 'user_data', 'biometric_enabled'];

      for (const key of keys) {
        await this.removeItem(key);
      }
    } catch (error) {
      console.error('Failed to clear all secure storage:', error);
    }
  }
}

export const secureStorage = SecureStorageService.getInstance();