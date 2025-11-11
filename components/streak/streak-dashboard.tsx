'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, RefreshCw, Loader2 } from 'lucide-react';

import { StreakCard } from './streak-card';
import { CheckInButton } from './check-in-button';
import { StreakHistory } from './streak-history';
import { PartnerStatus } from './partner-status';

interface Streak {
  id: string;
  title: string;
  description?: string;
  category: string;
  status: string;
  type: string;
  participant_count: number;
  max_participants: number;
  timezone: string;
  created_at: string;
  updated_at: string;
}

interface StreakDetails extends Streak {
  participants: {
    id: string;
    name?: string;
    email: string;
    image?: string;
    role: string;
  }[];
  todayCheckIns: {
    userId: string;
    hasCheckedIn: boolean;
    completedAt?: string;
  }[];
  userRole: string;
}

interface StreakDashboardProps {
  userId: string;
  className?: string;
}

export function StreakDashboard({ userId, className }: StreakDashboardProps) {
  const [streaks, setStreaks] = useState<Streak[]>([]);
  const [selectedStreak, setSelectedStreak] = useState<StreakDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchStreaks = async () => {
    try {
      const response = await fetch('/api/streaks');
      if (!response.ok) {
        throw new Error('Failed to fetch streaks');
      }
      const data = await response.json();
      setStreaks(data);

      // Select first streak if none selected
      if (data.length > 0 && !selectedStreak) {
        await fetchStreakDetails(data[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load streaks');
    } finally {
      setLoading(false);
    }
  };

  const fetchStreakDetails = async (streakId: string) => {
    try {
      const response = await fetch(`/api/streaks/${streakId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch streak details');
      }
      const data = await response.json();
      setSelectedStreak(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load streak details');
    }
  };

  const fetchCheckInStatus = async (streakId: string) => {
    try {
      const response = await fetch(`/api/streaks/${streakId}/check-in`);
      if (!response.ok) {
        throw new Error('Failed to fetch check-in status');
      }
      const data = await response.json();

      if (selectedStreak && selectedStreak.id === streakId) {
        setSelectedStreak({
          ...selectedStreak,
          todayCheckIns: data,
        });
      }
    } catch (err) {
      console.error('Failed to fetch check-in status:', err);
    }
  };

  const handleCheckIn = async (streakId: string, data: { proofText?: string; proofImageUrl?: string }) => {
    try {
      const response = await fetch(`/api/streaks/${streakId}/check-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Check-in failed');
      }

      // Refresh data
      await fetchCheckInStatus(streakId);
      await fetchStreaks();
    } catch (err) {
      throw err;
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchStreaks();
      if (selectedStreak) {
        await fetchStreakDetails(selectedStreak.id);
        await fetchCheckInStatus(selectedStreak.id);
      }
    } finally {
      setRefreshing(false);
    }
  };

  const handleStreakSelect = async (streakId: string) => {
    await fetchStreakDetails(streakId);
    await fetchCheckInStatus(streakId);
  };

  useEffect(() => {
    fetchStreaks();
  }, []);

  const getUserCheckInStatus = (streakId: string) => {
    return selectedStreak?.todayCheckIns?.find(ci => ci.userId === userId)?.hasCheckedIn || false;
  };

  const canUserCheckIn = (streak: Streak) => {
    // This would typically check timezone and midnight cutoff
    // For now, we'll assume they can check in if they haven't already
    return !getUserCheckInStatus(streak.id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading streaks...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (streaks.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <div className="space-y-4">
            <div className="text-6xl">🔥</div>
            <div>
              <h3 className="text-lg font-semibold">No streaks yet</h3>
              <p className="text-muted-foreground">
                Create your first streak to start building habits with a partner!
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Streak
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Streaks</h1>
          <p className="text-muted-foreground">
            Keep your habits going with daily check-ins
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Streak
          </Button>
        </div>
      </div>

      {/* Streak Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {streaks.map((streak) => (
          <StreakCard
            key={streak.id}
            streak={{
              ...streak,
              participants: selectedStreak?.participants || [],
              todayCheckIns: selectedStreak?.todayCheckIns || [],
              userRole: selectedStreak?.userRole || 'participant',
            }}
            userHasCheckedInToday={getUserCheckInStatus(streak.id)}
            canCheckIn={canUserCheckIn(streak)}
            onCheckIn={() => handleStreakSelect(streak.id)}
            onClick={() => handleStreakSelect(streak.id)}
            className={cn(
              'cursor-pointer transition-all hover:shadow-md',
              selectedStreak?.id === streak.id && 'ring-2 ring-primary'
            )}
          />
        ))}
      </div>

      {/* Selected Streak Details */}
      {selectedStreak && (
        <Tabs defaultValue="status" className="space-y-6">
          <TabsList>
            <TabsTrigger value="status">Team Status</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="status" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PartnerStatus
                participants={selectedStreak.participants.map(p => ({
                  ...p,
                  hasCheckedInToday: selectedStreak.todayCheckIns?.find(ci => ci.userId === p.id)?.hasCheckedIn || false,
                  streakDays: 0, // This would come from the streak status API
                  lastCheckInDate: null, // This would come from the streak status API
                }))}
                userRole={selectedStreak.userRole}
                userId={userId}
              />

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Check in for today or manage your streak
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Today's check-in</span>
                    <CheckInButton
                      streakId={selectedStreak.id}
                      streakTitle={selectedStreak.title}
                      hasCheckedInToday={getUserCheckInStatus(selectedStreak.id)}
                      canCheckIn={canUserCheckIn(selectedStreak)}
                      onCheckIn={(data) => handleCheckIn(selectedStreak.id, data)}
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Your streak lives in {selectedStreak.timezone} timezone
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <StreakHistory
              checkIns={[]} // This would come from the check-ins history API
              participants={selectedStreak.participants}
              timezone={selectedStreak.timezone}
            />
          </TabsContent>

          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>{selectedStreak.title}</CardTitle>
                <CardDescription>{selectedStreak.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Category:</span>
                      <p>{selectedStreak.category}</p>
                    </div>
                    <div>
                      <span className="font-medium">Type:</span>
                      <p>{selectedStreak.type}</p>
                    </div>
                    <div>
                      <span className="font-medium">Participants:</span>
                      <p>{selectedStreak.participants.length}/{selectedStreak.max_participants}</p>
                    </div>
                    <div>
                      <span className="font-medium">Timezone:</span>
                      <p>{selectedStreak.timezone}</p>
                    </div>
                    <div>
                      <span className="font-medium">Created:</span>
                      <p>{new Date(selectedStreak.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="font-medium">Your Role:</span>
                      <p>{selectedStreak.userRole}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}