'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle, Users, Target, Calendar, ArrowRight, Confetti } from 'lucide-react';

interface StreakData {
  id: string;
  title: string;
  description?: string;
  category: string;
  type: string;
  timezone: string;
  participants: {
    id: string;
    name?: string;
    email: string;
    image?: string;
    role: string;
  }[];
}

export default function WelcomePage() {
  const params = useParams();
  const router = useRouter();
  const streakId = params.id as string;

  const [streak, setStreak] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);
  const [confetti, setConfetti] = useState(true);

  useEffect(() => {
    fetchStreakDetails();

    // Hide confetti after 5 seconds
    const timer = setTimeout(() => setConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, [streakId]);

  const fetchStreakDetails = async () => {
    try {
      const response = await fetch(`/api/streaks/${streakId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch streak details');
      }
      const data = await response.json();
      setStreak(data);
    } catch (error) {
      console.error('Error fetching streak details:', error);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!streak) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-6">
            <h1 className="text-xl font-semibold mb-2">Streak Not Found</h1>
            <p className="text-muted-foreground mb-4">This streak could not be found.</p>
            <Button asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-muted/30 p-4">
      {/* Confetti animation */}
      {confetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-20px`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            >
              <Confetti className="h-6 w-6 text-primary opacity-70" />
            </div>
          ))}
        </div>
      )}

      <div className="max-w-2xl mx-auto pt-16">
        <Card className="text-center">
          <CardHeader className="pb-6">
            <div className="mx-auto mb-6 w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-3xl mb-2">Welcome to the Streak! 🎉</CardTitle>
            <CardDescription className="text-lg">
              You've successfully joined <strong>{streak.title}</strong>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Success Message */}
            <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                You're all set!
              </h3>
              <p className="text-green-700">
                You're now part of this accountability streak. Remember to check in daily to keep the momentum going!
              </p>
            </div>

            {/* Streak Details */}
            <div className="space-y-4 text-left">
              <h4 className="font-semibold text-lg">Your Streak Details</h4>

              <div className="p-4 rounded-lg border bg-card">
                <div className="space-y-3">
                  <div>
                    <h5 className="font-medium text-lg">{streak.title}</h5>
                    {streak.description && (
                      <p className="text-muted-foreground text-sm mt-1">
                        {streak.description}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge className={getCategoryColor(streak.category)}>
                      {streak.category}
                    </Badge>
                    <Badge className={getTypeColor(streak.type)}>
                      {streak.type}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Daily check-ins in {streak.timezone} timezone</span>
                  </div>
                </div>
              </div>

              {/* Team Members */}
              <div>
                <h5 className="font-medium mb-3">Your Accountability Team</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {streak.participants.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={participant.image} />
                        <AvatarFallback>
                          {(participant.name || participant.email).charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <p className="font-medium text-sm">
                          {participant.name || participant.email}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {participant.role}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* What's Next */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">What's Next?</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg border">
                  <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h5 className="font-medium mb-1">Daily Check-ins</h5>
                  <p className="text-sm text-muted-foreground">
                    Log your progress every day to maintain your streak
                  </p>
                </div>
                <div className="text-center p-4 rounded-lg border">
                  <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h5 className="font-medium mb-1">Stay Connected</h5>
                  <p className="text-sm text-muted-foreground">
                    Support your teammates and keep each other motivated
                  </p>
                </div>
                <div className="text-center p-4 rounded-lg border">
                  <Target className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h5 className="font-medium mb-1">Track Progress</h5>
                  <p className="text-sm text-muted-foreground">
                    Monitor your streak history and celebrate milestones
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <Button asChild className="w-full" size="lg">
                <Link href={`/streaks/${streakId}`}>
                  Go to Your Streak
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>

              <Button asChild variant="outline" className="w-full">
                <Link href="/dashboard">
                  View All Streaks
                </Link>
              </Button>
            </div>

            {/* Tips */}
            <div className="p-4 bg-muted/50 rounded-lg text-left">
              <h5 className="font-medium mb-2 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Pro Tips for Success
              </h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Set a daily reminder to check in at the same time each day</li>
                <li>• Be honest about your progress - it's about growth, not perfection</li>
                <li>• Encourage your partners when they check in regularly</li>
                <li>• If you miss a day, get back on track immediately - don't let one slip break your motivation!</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}