'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Clock, Trophy, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Participant {
  id: string;
  name?: string;
  email: string;
  image?: string;
  hasCheckedInToday: boolean;
  streakDays: number;
  lastCheckInDate: string | null;
  role?: string;
}

interface PartnerStatusProps {
  participants: Participant[];
  userRole?: string;
  userId: string;
  className?: string;
}

export function PartnerStatus({
  participants,
  userRole,
  userId,
  className,
}: PartnerStatusProps) {
  const currentUser = participants.find(p => p.id === userId);
  const otherParticipants = participants.filter(p => p.id !== userId);

  const getStreakColor = (days: number) => {
    if (days >= 30) return 'text-purple-600 bg-purple-50';
    if (days >= 14) return 'text-blue-600 bg-blue-50';
    if (days >= 7) return 'text-green-600 bg-green-50';
    if (days >= 3) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getStreakIcon = (days: number) => {
    if (days >= 30) return <Trophy className="h-4 w-4" />;
    if (days >= 7) return <Flame className="h-4 w-4" />;
    return <Clock className="h-4 w-4" />;
  };

  const checkedInCount = participants.filter(p => p.hasCheckedInToday).length;
  const totalParticipants = participants.length;
  const completionRate = (checkedInCount / totalParticipants) * 100;

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              Team Status
            </CardTitle>
            <CardDescription>
              How everyone is doing today
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className={cn(
              'text-sm',
              completionRate === 100
                ? 'bg-green-100 text-green-800 border-green-200'
                : completionRate >= 50
                ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                : 'bg-red-100 text-red-800 border-red-200'
            )}
          >
            {checkedInCount}/{totalParticipants} checked in
          </Badge>
        </div>

        {/* Overall progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Today's Completion</span>
            <span>{Math.round(completionRate)}%</span>
          </div>
          <Progress value={completionRate} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current user status */}
        {currentUser && (
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={currentUser.image} />
                  <AvatarFallback>
                    {currentUser.name?.charAt(0) || currentUser.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">You</span>
                    {currentUser.role && (
                      <Badge variant="secondary" className="text-xs">
                        {currentUser.role}
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {currentUser.hasCheckedInToday ? (
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-3 w-3" />
                        Checked in today
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-orange-600">
                        <XCircle className="h-3 w-3" />
                        Need to check in
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Badge className={cn('flex items-center gap-1', getStreakColor(currentUser.streakDays))}>
                  {getStreakIcon(currentUser.streakDays)}
                  {currentUser.streakDays} days
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Other participants */}
        {otherParticipants.map((participant) => (
          <div
            key={participant.id}
            className="flex items-center justify-between p-3 rounded-lg border bg-card"
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={participant.image} />
                <AvatarFallback>
                  {participant.name?.charAt(0) || participant.email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {participant.name || participant.email}
                  </span>
                  {participant.role && participant.role !== 'participant' && (
                    <Badge variant="secondary" className="text-xs">
                      {participant.role}
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {participant.hasCheckedInToday ? (
                    <span className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-3 w-3" />
                      Checked in today
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-gray-500">
                      <XCircle className="h-3 w-3" />
                      Not checked in yet
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <Badge className={cn('flex items-center gap-1', getStreakColor(participant.streakDays))}>
                {getStreakIcon(participant.streakDays)}
                {participant.streakDays} days
              </Badge>
              {participant.lastCheckInDate && (
                <div className="text-xs text-muted-foreground mt-1">
                  Last: {new Date(participant.lastCheckInDate).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Team encouragement message */}
        <div className="text-center p-4 rounded-lg bg-muted/50">
          {completionRate === 100 ? (
            <div className="space-y-2">
              <Trophy className="h-8 w-8 mx-auto text-yellow-600" />
              <p className="text-sm font-medium text-green-700">
                🎉 Perfect day! Everyone checked in!
              </p>
              <p className="text-xs text-muted-foreground">
                Great teamwork keeping the streak alive!
              </p>
            </div>
          ) : completionRate >= 75 ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-blue-700">
                Almost there! {totalParticipants - checkedInCount} more to go.
              </p>
              <p className="text-xs text-muted-foreground">
                Keep up the great work!
              </p>
            </div>
          ) : completionRate >= 50 ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-yellow-700">
                Halfway there! {totalParticipants - checkedInCount} still need to check in.
              </p>
              <p className="text-xs text-muted-foreground">
                You've got this!
              </p>
            </div>
          ) : checkedInCount > 0 ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-orange-700">
                {checkedInCount} person{checkedInCount !== 1 ? 's have' : ' has'} checked in so far.
              </p>
              <p className="text-xs text-muted-foreground">
                Let's get everyone motivated!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">
                No one has checked in yet today.
              </p>
              <p className="text-xs text-muted-foreground">
                Be the first to get started!
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}