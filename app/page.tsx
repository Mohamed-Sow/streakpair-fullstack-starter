"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Target, TrendingUp, Zap, Calendar, Shield } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <ThemeToggle />
      </div>

      {/* Hero Section */}
      <div className="text-center py-16 sm:py-24 px-4">
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-r from-violet-600 to-pink-600 p-4 rounded-2xl shadow-lg">
            <Users className="w-12 h-12 text-white" />
          </div>
        </div>
        
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
          StreakPair
        </h1>
        
        <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto mb-4">
          Build better habits together
        </p>
        
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
          Stay accountable with a partner. Check in daily, share your progress, and keep each other motivated.
          When one of you checks in, you both win.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/sign-up">
            <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700">
              Get Started Free
            </Button>
          </Link>
          <Link href="/sign-in">
            <Button size="lg" variant="outline" className="text-lg px-8 py-6">
              Sign In
            </Button>
          </Link>
        </div>
      </div>

      <main className="container mx-auto px-4 sm:px-6 pb-16 max-w-6xl">
        {/* How It Works */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Simple, social, and effective. Build habits that stick with the power of partnership.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="flex justify-center mb-4">
              <div className="bg-violet-100 dark:bg-violet-900/30 p-3 rounded-full">
                <Users className="w-8 h-8 text-violet-600 dark:text-violet-400" />
              </div>
            </div>
            <h3 className="font-semibold text-lg mb-2">1. Find a Partner</h3>
            <p className="text-sm text-muted-foreground">
              Invite a friend, family member, or accountability buddy to join your streak
            </p>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="flex justify-center mb-4">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full">
                <Target className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <h3 className="font-semibold text-lg mb-2">2. Set Your Goal</h3>
            <p className="text-sm text-muted-foreground">
              Choose a habit you want to build together - fitness, reading, meditation, anything!
            </p>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="flex justify-center mb-4">
              <div className="bg-pink-100 dark:bg-pink-900/30 p-3 rounded-full">
                <Calendar className="w-8 h-8 text-pink-600 dark:text-pink-400" />
              </div>
            </div>
            <h3 className="font-semibold text-lg mb-2">3. Check In Daily</h3>
            <p className="text-sm text-muted-foreground">
              Both partners check in each day with proof. Keep the streak alive together!
            </p>
          </Card>
        </div>

        {/* Features */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why StreakPair?</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-16">
          <Card className="p-6 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/10 dark:to-purple-900/10 border-violet-200/50 dark:border-violet-700/30">
            <div className="flex items-start gap-4">
              <div className="bg-violet-100 dark:bg-violet-900/30 p-2 rounded-lg">
                <TrendingUp className="w-6 h-6 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Social Accountability</h3>
                <p className="text-sm text-muted-foreground">
                  When you know someone is counting on you, you&apos;re more likely to show up. 
                  StreakPair makes habit building a team sport.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 border-purple-200/50 dark:border-purple-700/30">
            <div className="flex items-start gap-4">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Proof Required</h3>
                <p className="text-sm text-muted-foreground">
                  Submit text or photo proof with each check-in. No cheating, just honest progress 
                  verified by your partner.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/10 dark:to-rose-900/10 border-pink-200/50 dark:border-pink-700/30">
            <div className="flex items-start gap-4">
              <div className="bg-pink-100 dark:bg-pink-900/30 p-2 rounded-lg">
                <Zap className="w-6 h-6 text-pink-600 dark:text-pink-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Streak Momentum</h3>
                <p className="text-sm text-muted-foreground">
                  Watch your streak grow day by day. The longer it gets, the more motivated 
                  you&apos;ll be to keep it going.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-900/10 dark:to-orange-900/10 border-rose-200/50 dark:border-rose-700/30">
            <div className="flex items-start gap-4">
              <div className="bg-rose-100 dark:bg-rose-900/30 p-2 rounded-lg">
                <Calendar className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Track Together</h3>
                <p className="text-sm text-muted-foreground">
                  See your partner&apos;s progress in real-time. Celebrate wins together and 
                  support each other through challenges.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className="p-8 sm:p-12 text-center bg-gradient-to-r from-violet-600 to-pink-600 border-0 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Build Better Habits?</h2>
          <p className="text-lg mb-8 opacity-90">
            Join StreakPair today and start your journey with a partner who&apos;s got your back.
          </p>
          <Link href="/sign-up">
            <Button size="lg" className="bg-white text-violet-600 hover:bg-gray-100 text-lg px-8 py-6">
              Start Your First Streak
            </Button>
          </Link>
        </Card>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-sm text-muted-foreground border-t">
        <p>&copy; 2024 StreakPair. Build habits that stick, together.</p>
      </footer>
    </div>
  );
}
