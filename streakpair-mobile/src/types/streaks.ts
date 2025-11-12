export interface Streak {
  id: string;
  title: string;
  description?: string;
  category: string;
  createdBy: string;
  status: 'active' | 'paused' | 'completed';
  type: 'duo' | 'squad' | 'tribe';
  maxParticipants: number;
  timezone: string;
  reminderTime?: string;
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  participants?: StreakParticipant[];
  _count?: {
    participants: number;
  };
}

export interface StreakParticipant {
  id: string;
  streakId: string;
  userId: string;
  role: 'owner' | 'participant';
  joinedAt: string;
  isActive: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

export interface CheckIn {
  id: string;
  streakId: string;
  userId: string;
  checkInDate: string;
  proofText?: string;
  proofImageUrl?: string;
  completedAt: string;
  verified: boolean;
  verifiedAt?: string;
  verifiedBy?: string;
  user?: {
    id: string;
    name: string;
    image?: string;
  };
}

export interface Invitation {
  id: string;
  streakId: string;
  senderId: string;
  recipientEmail: string;
  recipientUserId?: string;
  token: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  message?: string;
  expiresAt: string;
  acceptedAt?: string;
  declinedAt?: string;
  createdAt: string;
  streak?: Streak;
  sender?: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

export interface CreateStreakData {
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

export interface CheckInData {
  proofText?: string;
  proofImage?: string;
}

export interface StreakAnalytics {
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
  totalCheckIns: number;
  weeklyAverage: number;
  monthlyAverage: number;
  recentActivity: CheckIn[];
  milestones: Milestone[];
}

export interface Milestone {
  id: string;
  type: 'streak_length' | 'consistency' | 'total_check_ins';
  value: number;
  description: string;
  achievedAt: string;
}