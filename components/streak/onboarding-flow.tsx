'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Circle, ArrowRight, ArrowLeft, Users, Target, Calendar, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'secondary';
  };
}

interface OnboardingFlowProps {
  userId: string;
  userName?: string;
  steps: OnboardingStep[];
  onComplete?: () => void;
  className?: string;
}

export function OnboardingFlow({
  userId,
  userName,
  steps,
  onComplete,
  className,
}: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const progress = ((completedSteps.length) / steps.length) * 100;

  const handleStepComplete = (stepId: string) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }

    // Move to next step
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Onboarding complete
      onComplete?.();
    }
  };

  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  const isStepCompleted = (stepId: string) => completedSteps.includes(stepId);
  const isStepActive = (index: number) => index === currentStep;

  if (steps.length === 0) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Target className="h-5 w-5" />
          Welcome to StreakPair{userName ? `, ${userName}` : ''}!
        </CardTitle>
        <CardDescription>
          Let's get you set up and ready to build better habits together
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Onboarding Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-center space-x-2">
          {steps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => goToStep(index)}
              className={cn(
                'w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all',
                isStepCompleted(step.id)
                  ? 'bg-primary border-primary text-primary-foreground'
                  : isStepActive(index)
                  ? 'border-primary text-primary'
                  : 'border-muted text-muted-foreground'
              )}
            >
              {isStepCompleted(step.id) ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <Circle className="h-4 w-4" />
              )}
            </button>
          ))}
        </div>

        {/* Current Step Content */}
        <div className="space-y-4">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className={cn(
                'w-16 h-16 rounded-full flex items-center justify-center',
                isStepActive(currentStep) ? 'bg-primary/10 text-primary' : 'bg-muted'
              )}>
                {steps[currentStep].icon}
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {steps[currentStep].title}
            </h3>
            <p className="text-muted-foreground">
              {steps[currentStep].description}
            </p>
          </div>

          {/* Step Action */}
          {steps[currentStep].action && (
            <Button
              onClick={() => {
                steps[currentStep].action!.onClick();
                handleStepComplete(steps[currentStep].id);
              }}
              variant={steps[currentStep].action?.variant || 'default'}
              className="w-full"
            >
              {steps[currentStep].action?.label}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => goToStep(currentStep - 1)}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => goToStep(currentStep + 1)}
              disabled={currentStep === steps.length - 1}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Tips */}
        <Alert>
          <AlertDescription>
            💡 <strong>Pro tip:</strong> StreakPair works best when you invite a friend or partner
            who shares your goals. The accountability and mutual encouragement make all the difference!
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

// Predefined onboarding steps for new users
export const getDefaultOnboardingSteps = (): OnboardingStep[] => [
  {
    id: 'welcome',
    title: 'Welcome to StreakPair!',
    description: 'StreakPair helps you build lasting habits through shared accountability. When you and your partner check in daily, you keep each other motivated!',
    icon: <Users className="h-8 w-8" />,
  },
  {
    id: 'create-first-streak',
    title: 'Create Your First Streak',
    description: 'Start by creating a streak for a habit you want to build. It could be exercise, meditation, learning, or any daily habit!',
    icon: <Target className="h-8 w-8" />,
    action: {
      label: 'Create Your First Streak',
      onClick: () => {
        // This would open the create streak modal
        console.log('Open create streak modal');
      },
    },
  },
  {
    id: 'invite-partner',
    title: 'Invite Your Accountability Partner',
    description: 'The magic happens when you invite someone to join your streak. Send them an invitation and start building habits together!',
    icon: <Mail className="h-8 w-8" />,
    action: {
      label: 'Invite Someone',
      onClick: () => {
        // This would open the invite modal
        console.log('Open invite modal');
      },
    },
  },
  {
    id: 'daily-checkin',
    title: 'Daily Check-ins',
    description: 'Every day, you and your partner will check in to mark your progress. You can add text or photo proof to show you completed your habit!',
    icon: <Calendar className="h-8 w-8" />,
  },
  {
    id: 'ready',
    title: 'You\'re All Set!',
    description: 'You now know the basics of StreakPair. Remember, consistency is key, and having a partner makes all the difference!',
    icon: <CheckCircle className="h-8 w-8" />,
    action: {
      label: 'Go to Dashboard',
      onClick: () => {
        window.location.href = '/dashboard';
      },
    },
  },
];