export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  success: false;
  error: string;
  message?: string;
  details?: any;
}

export interface CreateStreakRequest {
  title: string;
  description?: string;
  category: string;
  type: 'duo' | 'squad' | 'tribe';
  maxParticipants: number;
  timezone: string;
  reminderTime?: string;
  recipientEmails: string[];
  message?: string;
}

export interface CreateCheckInRequest {
  proofText?: string;
  proofImage?: File;
}

export interface UpdateStreakRequest {
  title?: string;
  description?: string;
  category?: string;
  status?: 'active' | 'paused' | 'completed';
  reminderTime?: string;
}