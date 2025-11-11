'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Mail, Send, Users, Calendar, Clock, CheckCircle, XCircle, Copy, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Invitation {
  id: string;
  streak: {
    id: string;
    title: string;
    type: string;
    maxParticipants: number;
  };
  sender?: {
    id: string;
    name?: string;
    email: string;
    image?: string;
  };
  recipientEmail: string;
  message?: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  createdAt: string;
  expiresAt: string;
}

interface InvitationManagerProps {
  userId: string;
  streaks: Array<{
    id: string;
    title: string;
    type: string;
    maxParticipants: number;
    participant_count: number;
  }>;
  onInvitationSent?: () => void;
  className?: string;
}

export function InvitationManager({
  userId,
  streaks,
  onInvitationSent,
  className,
}: InvitationManagerProps) {
  const [sentInvitations, setSentInvitations] = useState<Invitation[]>([]);
  const [receivedInvitations, setReceivedInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [showSendDialog, setShowSendDialog] = useState(false);

  // Form state
  const [selectedStreakId, setSelectedStreakId] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      // Fetch sent invitations
      const sentResponse = await fetch('/api/invitations/sent');
      if (sentResponse.ok) {
        const sentData = await sentResponse.json();
        setSentInvitations(sentData);
      }

      // Fetch received invitations
      const receivedResponse = await fetch('/api/invitations/received');
      if (receivedResponse.ok) {
        const receivedData = await receivedResponse.json();
        setReceivedInvitations(receivedData);
      }
    } catch (err) {
      setError('Failed to load invitations');
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvitation = async () => {
    if (!selectedStreakId || !recipientEmail) {
      setError('Please select a streak and enter a recipient email');
      return;
    }

    setSending(true);
    setError('');

    try {
      const response = await fetch('/api/invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          streakId: selectedStreakId,
          recipientEmail,
          message: message.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send invitation');
      }

      // Reset form
      setSelectedStreakId('');
      setRecipientEmail('');
      setMessage('');
      setShowSendDialog(false);

      // Refresh invitations
      await fetchInvitations();
      onInvitationSent?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation');
    } finally {
      setSending(false);
    }
  };

  const copyInvitationLink = (token: string) => {
    const link = `${window.location.origin}/invite/${token}`;
    navigator.clipboard.writeText(link);
    // You could show a toast here
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-3 w-3" />;
      case 'accepted':
        return <CheckCircle className="h-3 w-3" />;
      case 'declined':
        return <XCircle className="h-3 w-3" />;
      case 'expired':
        return <Clock className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const InvitationCard = ({ invitation, type }: { invitation: Invitation; type: 'sent' | 'received' }) => (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium">{invitation.streak.title}</h4>
              <p className="text-sm text-muted-foreground">
                {type === 'sent' ? `Sent to: ${invitation.recipientEmail}` : `From: ${invitation.sender?.name || invitation.sender?.email}`}
              </p>
            </div>
            <Badge className={cn('flex items-center gap-1', getStatusColor(invitation.status))}>
              {getStatusIcon(invitation.status)}
              <span className="capitalize">{invitation.status}</span>
            </Badge>
          </div>

          {invitation.message && (
            <p className="text-sm italic text-muted-foreground bg-muted/50 p-2 rounded">
              "{invitation.message}"
            </p>
          )}

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Sent: {new Date(invitation.createdAt).toLocaleDateString()}</span>
            <span>Expires: {new Date(invitation.expiresAt).toLocaleDateString()}</span>
          </div>

          {type === 'sent' && invitation.status === 'pending' && (
            <div className="flex gap-2 pt-2 border-t">
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyInvitationLink(invitation.id)}
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy Link
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {/* Resend functionality */}}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Resend
              </Button>
            </div>
          )}

          {type === 'received' && invitation.status === 'pending' && (
            <div className="flex gap-2 pt-2 border-t">
              <Button size="sm" asChild>
                <a href={`/invite/${invitation.id}`}>
                  View Invitation
                </a>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading invitations...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Invitations
            </CardTitle>
            <CardDescription>
              Manage your streak invitations
            </CardDescription>
          </div>
          <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
            <DialogTrigger asChild>
              <Button>
                <Send className="h-4 w-4 mr-2" />
                Send Invitation
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send Streak Invitation</DialogTitle>
                <DialogDescription>
                  Invite someone to join your streak and build habits together
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="streak">Select Streak</Label>
                  <select
                    id="streak"
                    value={selectedStreakId}
                    onChange={(e) => setSelectedStreakId(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="">Choose a streak...</option>
                    {streaks
                      .filter(streak => streak.participant_count < streak.maxParticipants)
                      .map((streak) => (
                        <option key={streak.id} value={streak.id}>
                          {streak.title} ({streak.participant_count}/{streak.maxParticipants} members)
                        </option>
                      ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Recipient Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="friend@example.com"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Personal Message (Optional)</Label>
                  <Textarea
                    id="message"
                    placeholder="Hey! I'd love for you to join my streak..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    maxLength={500}
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowSendDialog(false)}
                  disabled={sending}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSendInvitation}
                  disabled={sending || !selectedStreakId || !recipientEmail}
                >
                  {sending ? 'Sending...' : 'Send Invitation'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="sent" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sent">Sent ({sentInvitations.length})</TabsTrigger>
            <TabsTrigger value="received">Received ({receivedInvitations.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="sent" className="space-y-3">
            {sentInvitations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No invitations sent yet</p>
                <p className="text-xs">Send your first invitation to get started!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sentInvitations.map((invitation) => (
                  <InvitationCard key={invitation.id} invitation={invitation} type="sent" />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="received" className="space-y-3">
            {receivedInvitations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No pending invitations</p>
                <p className="text-xs">You'll see invitations from others here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {receivedInvitations.map((invitation) => (
                  <InvitationCard key={invitation.id} invitation={invitation} type="received" />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}