'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Calendar, Users, Clock, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

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

interface Participant {
  id: string;
  name?: string;
  email: string;
  image?: string;
  hasCheckedInToday?: boolean;
  streakDays?: number;
}

interface StreakCardProps {
  streak: Streak & {
    participants: Participant[];
    todayCheckIns?: {
      userId: string;
      hasCheckedIn: boolean;
      completedAt?: string;
    }[];
    userRole?: string;
  };
  userHasCheckedInToday?: boolean;
  canCheckIn?: boolean;
  onCheckIn?: (streakId: string) => void;
  className?: string;
}

export function StreakCard({
  streak,
  userHasCheckedInToday = false,
  canCheckIn = true,
  onCheckIn,
  className,
}: StreakCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckIn = async () => {
    if (!onCheckIn) return;

    setIsLoading(true);
    try {
      await onCheckIn(streak.id);
    } finally {
      setIsLoading(false);
    }
  };

  const checkedInCount = streak.todayCheckIns?.filter(ci => ci.hasCheckedIn).length || 0;
  const totalParticipants = streak.participants?.length || 0;
  const checkInProgress = totalParticipants > 0 ? (checkedInCount / totalParticipants) * 100 : 0;

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      fitness: 'bg-green-100 text-green-800',
      learning: 'bg-blue-100 text-blue-800',
      wellness: 'bg-purple-100 text-purple-800',
      productivity: 'bg-yellow-100 text-yellow-800',
      general: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || colors.general;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      duo: 'bg-pink-100 text-pink-800',
      squad: 'bg-indigo-100 text-indigo-800',
      tribe: 'bg-orange-100 text-orange-800',
    };
    return colors[type] || colors.duo;
  };

  return (
    <Card className={cn('relative overflow-hidden', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-lg font-semibold">
                <Link
                  href={`/streaks/${streak.id}`}
                  className="hover:text-primary transition-colors"
                >
                  {streak.title}
                </Link>
              </CardTitle>
              <Badge variant="secondary" className={getCategoryColor(streak.category)}>
                {streak.category}
              </Badge>
              <Badge variant="outline" className={getTypeColor(streak.type)}>
                {streak.type}
              </Badge>
            </div>
            {streak.description && (
              <CardDescription className="text-sm">
                {streak.description}
              </CardDescription>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{checkedInCount}/{totalParticipants} checked in</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{streak.timezone}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress bar for today's check-ins */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Today's Progress</span>
            <span>{Math.round(checkInProgress)}%</span>
          </div>
          <Progress value={checkInProgress} className="h-2" />
        </div>

        {/* Participants list */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Participants</h4>
            <span className="text-xs text-muted-foreground">
              {totalParticipants}/{streak.max_participants}
            </span>
          </div>
          <div className="flex -space-x-2">
            {streak.participants?.slice(0, 6).map((participant) => (
              <Avatar key={participant.id} className="h-8 w-8 border-2 border-background">
                <AvatarImage src={participant.image} alt={participant.name || participant.email || 'User'} />
                <AvatarFallback className="text-xs">
                  {((participant.name || participant.email || 'U').charAt(0) || 'U').toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ))}
            {totalParticipants > 6 && (
              <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                <span className="text-xs text-muted-foreground">
                  +{totalParticipants - 6}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Check-in status and button */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            {userHasCheckedInToday ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm font-medium">Checked in today</span>
              </div>
            ) : canCheckIn ? (
              <div className="flex items-center gap-2 text-orange-600">
                <XCircle className="h-5 w-5" />
                <span className="text-sm font-medium">Check in needed</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-gray-500">
                <Clock className="h-5 w-5" />
                <span className="text-sm">Check-in window closed</span>
              </div>
            )}
          </div>

          {canCheckIn && !userHasCheckedInToday && onCheckIn && (
            <Button
              onClick={handleCheckIn}
              disabled={isLoading}
              size="sm"
            >
              {isLoading ? 'Checking in...' : 'Check In'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}