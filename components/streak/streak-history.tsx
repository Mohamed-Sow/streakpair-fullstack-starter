'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronLeft, ChevronRight, CheckCircle, XCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDateForDisplay } from '@/lib/utils/timezone';

interface CheckIn {
  id: string;
  userId: string;
  checkInDate: string;
  completedAt: string;
  proofText?: string;
  proofImageUrl?: string;
  user?: {
    id: string;
    name?: string;
    email: string;
    image?: string;
  };
}

interface StreakHistoryProps {
  checkIns: CheckIn[];
  participants: {
    id: string;
    name?: string;
    email: string;
    image?: string;
  }[];
  timezone: string;
  className?: string;
}

interface DayHistory {
  date: string;
  checkIns: CheckIn[];
  participants: string[];
}

export function StreakHistory({
  checkIns,
  participants,
  timezone,
  className,
}: StreakHistoryProps) {
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

  // Group check-ins by date
  const groupByDate = (checkIns: CheckIn[]): DayHistory[] => {
    const grouped: Record<string, DayHistory> = {};

    checkIns.forEach(checkIn => {
      if (!grouped[checkIn.checkInDate]) {
        grouped[checkIn.checkInDate] = {
          date: checkIn.checkInDate,
          checkIns: [],
          participants: [],
        };
      }
      grouped[checkIn.checkInDate].checkIns.push(checkIn);
      if (!grouped[checkIn.checkInDate].participants.includes(checkIn.userId)) {
        grouped[checkIn.checkInDate].participants.push(checkIn.userId);
      }
    });

    return Object.values(grouped).sort((a, b) => b.date.localeCompare(a.date));
  };

  // Get the current week's dates
  const getWeekDates = (offset: number = 0) => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + (offset * 7));
    startOfWeek.setHours(0, 0, 0, 0);

    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDates.push(date.toISOString().split('T')[0]);
    }

    return weekDates;
  };

  const weekDates = getWeekDates(currentWeekOffset);
  const dayHistory = groupByDate(checkIns);

  const getDayData = (date: string) => {
    return dayHistory.find(day => day.date === date);
  };

  const getDayStatus = (date: string) => {
    const dayData = getDayData(date);
    if (!dayData) return 'none';
    if (dayData.participants.length === participants.length) return 'complete';
    if (dayData.participants.length > 0) return 'partial';
    return 'none';
  };

  const getDayColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'bg-green-500 text-white';
      case 'partial':
        return 'bg-yellow-500 text-white';
      default:
        return 'bg-gray-100 text-gray-400';
    }
  };

  const getWeekTitle = () => {
    if (currentWeekOffset === 0) return 'This Week';
    if (currentWeekOffset === -1) return 'Last Week';
    if (currentWeekOffset === 1) return 'Next Week';
    return `Week ${currentWeekOffset > 0 ? '+' : ''}${currentWeekOffset}`;
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Streak History
            </CardTitle>
            <CardDescription>
              Daily check-in history for this streak
            </CardDescription>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentWeekOffset(currentWeekOffset - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium px-2">
              {getWeekTitle()}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentWeekOffset(currentWeekOffset + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Week View */}
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day, index) => {
            const date = weekDates[index];
            const dayData = getDayData(date);
            const status = getDayStatus(date);
            const isToday = date === new Date().toISOString().split('T')[0];

            return (
              <div key={date} className="text-center">
                <div className="text-xs text-muted-foreground mb-1">
                  {day}
                </div>
                <div
                  className={cn(
                    'aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-medium cursor-pointer transition-colors',
                    getDayColor(status),
                    isToday && 'ring-2 ring-primary ring-offset-2'
                  )}
                >
                  <div>{new Date(date).getDate()}</div>
                  {dayData && (
                    <div className="text-xs mt-1">
                      {dayData.participants.length}/{participants.length}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Complete</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>Partial</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-100 border rounded"></div>
            <span>None</span>
          </div>
        </div>

        {/* Recent Check-ins */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Recent Check-ins</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {dayHistory.slice(0, 10).map((day) => (
              <div
                key={day.date}
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
              >
                <div className="space-y-1">
                  <div className="text-sm font-medium">
                    {formatDateForDisplay(day.date, timezone)}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-1">
                      {day.checkIns.slice(0, 3).map((checkIn) => (
                        <Avatar key={checkIn.id} className="h-6 w-6 border-2 border-background">
                          <AvatarImage src={checkIn.user?.image} />
                          <AvatarFallback className="text-xs">
                            {checkIn.user?.name?.charAt(0) ||
                             checkIn.user?.email.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {day.participants.length} of {participants.length} checked in
                    </span>
                  </div>
                </div>
                <Badge
                  variant={day.participants.length === participants.length ? 'default' : 'secondary'}
                  className={cn(
                    day.participants.length === participants.length && 'bg-green-100 text-green-800'
                  )}
                >
                  {day.participants.length === participants.length ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Complete
                    </>
                  ) : (
                    <>
                      <Clock className="h-3 w-3 mr-1" />
                      Partial
                    </>
                  )}
                </Badge>
              </div>
            ))}
            {dayHistory.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No check-ins yet</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}