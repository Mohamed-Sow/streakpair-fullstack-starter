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
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Camera, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CheckInButtonProps {
  streakId: string;
  streakTitle: string;
  hasCheckedInToday?: boolean;
  canCheckIn?: boolean;
  onCheckIn?: (data: { proofText?: string; proofImageUrl?: string }) => Promise<void>;
  disabled?: boolean;
  className?: string;
}

export function CheckInButton({
  streakId,
  streakTitle,
  hasCheckedInToday = false,
  canCheckIn = true,
  onCheckIn,
  disabled = false,
  className,
}: CheckInButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [proofText, setProofText] = useState('');
  const [proofImageUrl, setProofImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File too large. Maximum size is 5MB.');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      setProofImageUrl(result.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!onCheckIn) return;

    // Validation
    if (!proofText && !proofImageUrl) {
      setError('Please provide either text proof or upload an image.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await onCheckIn({
        proofText: proofText.trim() || undefined,
        proofImageUrl: proofImageUrl || undefined,
      });

      // Reset form
      setProofText('');
      setProofImageUrl('');
      setIsOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Check-in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Reset form when dialog closes
      setProofText('');
      setProofImageUrl('');
      setError('');
    }
    setIsOpen(open);
  };

  if (hasCheckedInToday) {
    return (
      <Badge variant="secondary" className={cn('bg-green-100 text-green-800', className)}>
        <CheckCircle className="h-3 w-3 mr-1" />
        Checked In
      </Badge>
    );
  }

  if (!canCheckIn) {
    return (
      <Button variant="outline" disabled className={className}>
        Check-in Window Closed
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button disabled={disabled} className={className}>
          Check In
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Check in to "{streakTitle}"</DialogTitle>
          <DialogDescription>
            Share your progress for today. Either write a brief description or upload a photo as proof.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Text Proof */}
          <div className="space-y-2">
            <Label htmlFor="proof-text">Text Proof (Optional)</Label>
            <Textarea
              id="proof-text"
              placeholder="How did you do today? Share a quick update..."
              value={proofText}
              onChange={(e) => setProofText(e.target.value)}
              rows={3}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground">
              {proofText.length}/1000 characters
            </p>
          </div>

          {/* Image Proof */}
          <div className="space-y-2">
            <Label>Image Proof (Optional)</Label>
            <div className="space-y-3">
              {!proofImageUrl ? (
                <div>
                  <Input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                    className="hidden"
                    id="image-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('image-upload')?.click()}
                    disabled={isUploading}
                    className="w-full"
                  >
                    {isUploading ? (
                      <>
                        <Upload className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Camera className="h-4 w-4 mr-2" />
                        Upload Photo
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative rounded-lg overflow-hidden border">
                    <img
                      src={proofImageUrl}
                      alt="Check-in proof"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setProofImageUrl('')}
                  >
                    Remove Image
                  </Button>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Max file size: 5MB. Accepted formats: JPEG, PNG, WebP
            </p>
          </div>

          <Alert>
            <AlertDescription>
              <strong>Privacy:</strong> Your check-in will only be visible to other participants in this streak.
            </AlertDescription>
          </Alert>
        </div>

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
            type="button"
            onClick={handleCheckIn}
            disabled={isLoading || (!proofText && !proofImageUrl)}
          >
            {isLoading ? 'Checking in...' : 'Check In'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}