import { apiClient } from './client';
import {
  Streak,
  CreateStreakRequest,
  UpdateStreakRequest,
  CheckIn,
  CreateCheckInRequest,
  Invitation,
  StreakAnalytics,
} from '@/types';

class StreaksService {
  async getStreaks(): Promise<Streak[]> {
    try {
      const response = await apiClient.get<Streak[]>('/api/streaks');
      return response.data || [];
    } catch (error) {
      throw error;
    }
  }

  async getStreak(id: string): Promise<Streak | null> {
    try {
      const response = await apiClient.get<Streak>(`/api/streaks/${id}`);
      return response.data || null;
    } catch (error) {
      throw error;
    }
  }

  async createStreak(data: CreateStreakRequest): Promise<Streak> {
    try {
      const response = await apiClient.post<Streak>('/api/streaks', data);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Failed to create streak');
    } catch (error) {
      throw error;
    }
  }

  async updateStreak(id: string, data: UpdateStreakRequest): Promise<Streak> {
    try {
      const response = await apiClient.put<Streak>(`/api/streaks/${id}`, data);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Failed to update streak');
    } catch (error) {
      throw error;
    }
  }

  async deleteStreak(id: string): Promise<void> {
    try {
      await apiClient.delete(`/api/streaks/${id}`);
    } catch (error) {
      throw error;
    }
  }

  async joinStreak(inviteToken: string): Promise<Streak> {
    try {
      const response = await apiClient.post<Streak>('/api/streaks/join', { token: inviteToken });
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Failed to join streak');
    } catch (error) {
      throw error;
    }
  }

  async leaveStreak(id: string): Promise<void> {
    try {
      await apiClient.post(`/api/streaks/${id}/leave`);
    } catch (error) {
      throw error;
    }
  }

  // Check-in related methods
  async getCheckIns(streakId: string): Promise<CheckIn[]> {
    try {
      const response = await apiClient.get<CheckIn[]>(`/api/streaks/${streakId}/check-ins`);
      return response.data || [];
    } catch (error) {
      throw error;
    }
  }

  async createCheckIn(streakId: string, data: CreateCheckInRequest): Promise<CheckIn> {
    try {
      const formData = new FormData();

      if (data.proofText) {
        formData.append('proofText', data.proofText);
      }

      if (data.proofImage) {
        // For React Native, we need to handle the file differently
        const fileInfo = {
          uri: data.proofImage,
          type: 'image/jpeg', // You might want to determine this dynamically
          name: 'proof.jpg',
        };
        formData.append('proofImage', fileInfo as any);
      }

      const response = await apiClient.upload<CheckIn>(`/api/streaks/${streakId}/check-ins`, formData);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Failed to create check-in');
    } catch (error) {
      throw error;
    }
  }

  async getTodayCheckIn(streakId: string): Promise<CheckIn | null> {
    try {
      const response = await apiClient.get<CheckIn>(`/api/streaks/${streakId}/check-ins/today`);
      return response.data || null;
    } catch (error) {
      throw error;
    }
  }

  async getStreakAnalytics(streakId: string, timeRange?: 'week' | 'month' | 'all'): Promise<StreakAnalytics> {
    try {
      const params = timeRange ? { timeRange } : {};
      const response = await apiClient.get<StreakAnalytics>(`/api/streaks/${streakId}/analytics`, { params });

      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Failed to get streak analytics');
    } catch (error) {
      throw error;
    }
  }

  // Invitation related methods
  async getInvitations(): Promise<Invitation[]> {
    try {
      const response = await apiClient.get<Invitation[]>('/api/invitations');
      return response.data || [];
    } catch (error) {
      throw error;
    }
  }

  async sendInvitation(streakId: string, recipientEmail: string, message?: string): Promise<Invitation> {
    try {
      const response = await apiClient.post<Invitation>('/api/invitations', {
        streakId,
        recipientEmail,
        message,
      });

      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Failed to send invitation');
    } catch (error) {
      throw error;
    }
  }

  async acceptInvitation(token: string): Promise<Streak> {
    try {
      const response = await apiClient.post<Streak>('/api/invitations/accept', { token });

      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Failed to accept invitation');
    } catch (error) {
      throw error;
    }
  }

  async declineInvitation(token: string): Promise<void> {
    try {
      await apiClient.post('/api/invitations/decline', { token });
    } catch (error) {
      throw error;
    }
  }

  // Export and sharing methods
  async exportStreakData(streakId: string, format: 'csv' | 'json' | 'pdf'): Promise<string> {
    try {
      const response = await apiClient.get<{ url: string }>(`/api/streaks/${streakId}/export`, {
        params: { format },
      });

      if (response.success && response.data?.url) {
        return response.data.url;
      }
      throw new Error('Failed to export streak data');
    } catch (error) {
      throw error;
    }
  }

  async getStreakShareLink(streakId: string): Promise<string> {
    try {
      const response = await apiClient.get<{ shareUrl: string }>(`/api/streaks/${streakId}/share`);

      if (response.success && response.data?.shareUrl) {
        return response.data.shareUrl;
      }
      throw new Error('Failed to get share link');
    } catch (error) {
      throw error;
    }
  }
}

export const streaksService = new StreaksService();