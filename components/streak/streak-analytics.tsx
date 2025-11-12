'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Target,
  Flame,
  Award,
  BarChart3,
  Clock,
  Users,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StreakAnalytics {
  currentStreak: number;
  longestStreak: number;
  totalCheckIns: number;
  completionRate: number;
  weeklyCompletionRate: number;
  monthlyCompletionRate: number;
  streakHistory: {
    date: string;
    completed: boolean;
    participantCount: number;
    totalParticipants: number;
  }[];
  weeklyProgress: {
    week: string;
    completionRate: number;
    totalCheckIns: number;
  }[];
  milestones: {
    id: string;
    title: string;
    description: string;
    achievedAt: string;
    icon: string;
  }[];
  insights: {
    type: 'strength' | 'improvement' | 'milestone';
    title: string;
    description: string;
  }[];
}

interface StreakAnalyticsProps {
  streakId: string;
  userId: string;
  timezone: string;
  className?: string;
}

const generateMockAnalytics = (streakId: string): StreakAnalytics => {
  const today = new Date();
  const streakHistory = [];

  // Generate last 90 days of history
  for (let i = 89; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    streakHistory.push({
      date: date.toISOString().split('T')[0],
      completed: Math.random() > 0.3, // 70% completion rate
      participantCount: Math.floor(Math.random() * 2) + 1,
      totalParticipants: 2,
    });
  }

  const currentStreak = streakHistory
    .slice()
    .reverse()
    .findIndex(day => !day.completed);

  const actualCurrentStreak = currentStreak === -1 ? streakHistory.length : currentStreak;

  const weeklyProgress = [];
  for (let i = 11; i >= 0; i--) {
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - (i * 7) - today.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const weekData = streakHistory.filter(day =>
      day.date >= weekStart.toISOString().split('T')[0] &&
      day.date <= weekEnd.toISOString().split('T')[0]
    );

    weeklyProgress.push({
      week: `Week ${12 - i}`,
      completionRate: weekData.length > 0
        ? (weekData.filter(d => d.completed).length / weekData.length) * 100
        : 0,
      totalCheckIns: weekData.filter(d => d.completed).length,
    });
  }

  const totalCheckIns = streakHistory.filter(d => d.completed).length;
  const completionRate = (totalCheckIns / streakHistory.length) * 100;
  const weeklyCompletionRate = weeklyProgress.slice(-4).reduce((acc, week) => acc + week.completionRate, 0) / Math.min(4, weeklyProgress.length);
  const monthlyCompletionRate = weeklyProgress.slice(-4).reduce((acc, week) => acc + week.completionRate, 0) / Math.min(4, weeklyProgress.length);

  const milestones = [
    {
      id: 'first-week',
      title: 'First Week Complete',
      description: 'Completed your first full week of check-ins',
      achievedAt: actualCurrentStreak >= 7 ? new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString() : '',
      icon: '🗓️'
    },
    {
      id: 'two-weeks',
      title: 'Two Week Streak',
      description: 'Maintained consistency for two full weeks',
      achievedAt: actualCurrentStreak >= 14 ? new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString() : '',
      icon: '🔥'
    },
    {
      id: 'thirty-days',
      title: '30 Day Warrior',
      description: 'An entire month of consistent progress',
      achievedAt: actualCurrentStreak >= 30 ? new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString() : '',
      icon: '💪'
    }
  ].filter(milestone => milestone.achievedAt);

  const insights = [];

  if (completionRate >= 80) {
    insights.push({
      type: 'strength' as const,
      title: 'Incredibly Consistent',
      description: `${Math.round(completionRate)}% completion rate shows amazing dedication!`
    });
  } else if (completionRate >= 60) {
    insights.push({
      type: 'strength' as const,
      title: 'Great Progress',
      description: `${Math.round(completionRate)}% completion rate - keep up the good work!`
    });
  }

  if (actualCurrentStreak >= 7) {
    insights.push({
      type: 'milestone' as const,
      title: 'Current Week Streak',
      description: `You're on a ${actualCurrentStreak}-day streak! Don't break the chain.`
    });
  }

  if (weeklyCompletionRate < 60) {
    insights.push({
      type: 'improvement' as const,
      title: 'Room for Growth',
      description: 'Try setting a daily reminder to boost your consistency'
    });
  }

  return {
    currentStreak: actualCurrentStreak,
    longestStreak: Math.max(actualCurrentStreak, Math.floor(Math.random() * 45) + 10),
    totalCheckIns,
    completionRate,
    weeklyCompletionRate,
    monthlyCompletionRate,
    streakHistory,
    weeklyProgress,
    milestones,
    insights
  };
};

export function StreakAnalytics({
  streakId,
  userId,
  timezone,
  className
}: StreakAnalyticsProps) {
  const [analytics, setAnalytics] = useState<StreakAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('all');

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/streaks/${streakId}/analytics?timeRange=${timeRange}`);
        if (!response.ok) {
          throw new Error('Failed to fetch analytics');
        }
        const data = await response.json();
        setAnalytics(data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
        // Fallback to mock data if API fails
        const mockData = generateMockAnalytics(streakId);
        setAnalytics(mockData);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [streakId, timeRange]);

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Loading analytics...</span>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center text-muted-foreground">
            <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Analytics not available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getCompletionColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCompletionLevel = (rate: number) => {
    if (rate >= 80) return 'Excellent';
    if (rate >= 60) return 'Good';
    if (rate >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Streak Analytics
          </h3>
          <p className="text-sm text-muted-foreground">
            Track your progress and celebrate your achievements
          </p>
        </div>
        <div className="flex gap-1">
          {(['week', 'month', 'all'] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
              className="capitalize"
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold">{analytics.currentStreak}</p>
                <p className="text-xs text-muted-foreground">days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Longest Streak</p>
                <p className="text-2xl font-bold">{analytics.longestStreak}</p>
                <p className="text-xs text-muted-foreground">days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className={cn('text-2xl font-bold', getCompletionColor(analytics.completionRate))}>
                  {Math.round(analytics.completionRate)}%
                </p>
                <p className="text-xs text-muted-foreground">{getCompletionLevel(analytics.completionRate)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Check-ins</p>
                <p className="text-2xl font-bold">{analytics.totalCheckIns}</p>
                <p className="text-xs text-muted-foreground">all time</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Performance Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Completion</span>
                <span className={getCompletionColor(analytics.completionRate)}>
                  {Math.round(analytics.completionRate)}%
                </span>
              </div>
              <Progress value={analytics.completionRate} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Weekly Average</span>
                <span className={getCompletionColor(analytics.weeklyCompletionRate)}>
                  {Math.round(analytics.weeklyCompletionRate)}%
                </span>
              </div>
              <Progress value={analytics.weeklyCompletionRate} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Monthly Average</span>
                <span className={getCompletionColor(analytics.monthlyCompletionRate)}>
                  {Math.round(analytics.monthlyCompletionRate)}%
                </span>
              </div>
              <Progress value={analytics.monthlyCompletionRate} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Weekly Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.weeklyProgress.slice(-8).reverse().map((week) => (
                <div key={week.week} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{week.week}</span>
                    <span>{week.totalCheckIns}/7 days</span>
                  </div>
                  <Progress value={week.completionRate} className="h-1" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      {analytics.insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Insights & Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {analytics.insights.map((insight, index) => (
                <div
                  key={index}
                  className={cn(
                    'p-3 rounded-lg border',
                    insight.type === 'strength' && 'bg-green-50 border-green-200',
                    insight.type === 'improvement' && 'bg-yellow-50 border-yellow-200',
                    insight.type === 'milestone' && 'bg-purple-50 border-purple-200'
                  )}
                >
                  <h4 className="font-medium text-sm mb-1">{insight.title}</h4>
                  <p className="text-xs text-muted-foreground">{insight.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Milestones */}
      {analytics.milestones.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="h-4 w-4" />
              Milestones Achieved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {analytics.milestones.map((milestone) => (
                <div key={milestone.id} className="text-center p-4 rounded-lg border bg-gradient-to-br from-purple-50 to-pink-50">
                  <div className="text-2xl mb-2">{milestone.icon}</div>
                  <h4 className="font-medium text-sm mb-1">{milestone.title}</h4>
                  <p className="text-xs text-muted-foreground mb-2">{milestone.description}</p>
                  <Badge variant="secondary" className="text-xs">
                    {new Date(milestone.achievedAt).toLocaleDateString()}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}