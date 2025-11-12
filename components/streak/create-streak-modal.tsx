'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Users, Target, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreateStreakModalProps {
  onCreateStreak?: (data: {
    title: string;
    description?: string;
    category: string;
    type: string;
    maxParticipants: number;
    timezone: string;
    reminderTime?: string;
  }) => Promise<void>;
  trigger?: React.ReactNode;
  className?: string;
}

const categories = [
  { value: 'fitness', label: 'Fitness & Health', icon: '💪', description: 'Exercise, nutrition, wellness goals' },
  { value: 'learning', label: 'Learning & Education', icon: '📚', description: 'Study, skills, knowledge building' },
  { value: 'wellness', label: 'Mental Wellness', icon: '🧘', description: 'Meditation, mindfulness, self-care' },
  { value: 'productivity', label: 'Productivity', icon: '🎯', description: 'Work habits, time management, goals' },
  { value: 'creativity', label: 'Creativity', icon: '🎨', description: 'Art, writing, creative projects' },
  { value: 'relationships', label: 'Relationships', icon: '❤️', description: 'Connection, communication, quality time' },
  { value: 'finance', label: 'Finance', icon: '💰', description: 'Budgeting, saving, financial goals' },
  { value: 'general', label: 'General', icon: '🌟', description: 'Other habits and goals' },
];

const streakTypes = [
  { value: 'duo', label: 'Duo', maxParticipants: 2, description: 'Perfect for you and one partner' },
  { value: 'squad', label: 'Squad', maxParticipants: 5, description: 'Great for small groups of 3-5' },
  { value: 'tribe', label: 'Tribe', maxParticipants: 15, description: 'For larger teams of 6-15' },
];

const timezones = [
  { value: 'UTC', label: 'UTC (GMT+0)' },
  { value: 'America/New_York', label: 'Eastern Time (GMT-5)' },
  { value: 'America/Chicago', label: 'Central Time (GMT-6)' },
  { value: 'America/Denver', label: 'Mountain Time (GMT-7)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (GMT-8)' },
  { value: 'Europe/London', label: 'London (GMT+0)' },
  { value: 'Europe/Paris', label: 'Paris (GMT+1)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (GMT+9)' },
  { value: 'Australia/Sydney', label: 'Sydney (GMT+10)' },
];

export function CreateStreakModal({
  onCreateStreak,
  trigger,
  className,
}: CreateStreakModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('general');
  const [type, setType] = useState('duo');
  const [maxParticipants, setMaxParticipants] = useState(2);
  const [timezone, setTimezone] = useState('UTC');
  const [reminderTime, setReminderTime] = useState('');

  const selectedType = streakTypes.find(t => t.value === type);
  const selectedCategory = categories.find(c => c.value === category);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onCreateStreak) return;

    // Validation
    if (!title.trim()) {
      setError('Please enter a streak title');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await onCreateStreak({
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        type,
        maxParticipants,
        timezone,
        reminderTime: reminderTime.trim() || undefined,
      });

      // Reset form
      setTitle('');
      setDescription('');
      setCategory('general');
      setType('duo');
      setMaxParticipants(2);
      setTimezone('UTC');
      setReminderTime('');
      setIsOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create streak');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTypeChange = (newType: string) => {
    setType(newType);
    const selected = streakTypes.find(t => t.value === newType);
    if (selected) {
      setMaxParticipants(selected.maxParticipants);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Reset form when dialog closes
      setTitle('');
      setDescription('');
      setCategory('general');
      setType('duo');
      setMaxParticipants(2);
      setTimezone('UTC');
      setReminderTime('');
      setError('');
    }
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className={className}>
            <Plus className="h-4 w-4 mr-2" />
            Create Streak
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Streak</DialogTitle>
          <DialogDescription>
            Start a new habit streak with your accountability partner(s)
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Basic Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Streak Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Daily Workout, Morning Meditation"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                required
              />
              <p className="text-xs text-muted-foreground">
                {title.length}/100 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="What's this streak about? What are you trying to achieve?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">
                {description.length}/500 characters
              </p>
            </div>
          </div>

          {/* Category Selection */}
          <div className="space-y-3">
            <Label>Category</Label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={cn(
                    'p-3 rounded-lg border text-left transition-all',
                    category === cat.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted/50'
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{cat.icon}</span>
                    <span className="font-medium text-sm">{cat.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{cat.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Type Selection */}
          <div className="space-y-3">
            <Label>Streak Type</Label>
            <div className="space-y-2">
              {streakTypes.map((streakType) => (
                <button
                  key={streakType.value}
                  type="button"
                  onClick={() => handleTypeChange(streakType.value)}
                  className={cn(
                    'w-full p-3 rounded-lg border text-left transition-all',
                    type === streakType.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted/50'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="h-4 w-4" />
                        <span className="font-medium">{streakType.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{streakType.description}</p>
                    </div>
                    <Badge variant="outline">
                      {streakType.maxParticipants} max
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Daily check-ins reset at midnight in this timezone
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminder-time">Daily Reminder (Optional)</Label>
              <Input
                id="reminder-time"
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Get reminded to check in at this time each day
              </p>
            </div>
          </div>

          {/* Preview */}
          {(title || selectedCategory || selectedType) && (
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Preview
              </h4>
              <div className="space-y-2 text-sm">
                {title && <p><strong>Title:</strong> {title}</p>}
                {selectedCategory && (
                  <p>
                    <strong>Category:</strong>{' '}
                    <span className="inline-flex items-center gap-1">
                      {selectedCategory.icon} {selectedCategory.label}
                    </span>
                  </p>
                )}
                {selectedType && (
                  <p>
                    <strong>Type:</strong> {selectedType.label} ({selectedType.maxParticipants} max)
                  </p>
                )}
                {timezone && <p><strong>Timezone:</strong> {timezones.find(tz => tz.value === timezone)?.label}</p>}
                {reminderTime && <p><strong>Reminder:</strong> {reminderTime}</p>}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !title.trim()}
            >
              {isLoading ? 'Creating...' : 'Create Streak'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}