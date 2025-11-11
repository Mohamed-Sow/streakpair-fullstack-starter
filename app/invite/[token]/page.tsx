'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Loader2, Mail, CheckCircle, XCircle, Clock, Users, Calendar, AlertTriangle } from 'lucide-react';

interface InvitationData {
  id: string;
  streak: {
    id: string;
    title: string;
    description?: string;
    category: string;
    type: string;
    maxParticipants: number;
    timezone: string;
    participants: {
      id: string;
      name?: string;
      email: string;
      image?: string;
      role: string;
    }[];
  };
  sender: {
    id: string;
    name?: string;
    email: string;
    image?: string;
  };
  recipientEmail: string;
  message?: string;
  status: string;
  expiresAt: string;
  createdAt: string;
}

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchInvitation();
  }, [token]);

  const fetchInvitation = async () => {
    try {
      // First check if user is authenticated
      const authResponse = await fetch('/api/auth/me');
      if (authResponse.ok) {
        const userData = await authResponse.json();
        setUser(userData);
      }

      // Fetch invitation details
      const response = await fetch(`/api/invitations/${token}`);
      if (!response.ok) {
        throw new Error('Invitation not found');
      }
      const data = await response.json();
      setInvitation(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!user) {
      // Redirect to sign up with invitation token
      router.push(`/auth/signup?token=${token}`);
      return;
    }

    setAccepting(true);
    setError('');

    try {
      const response = await fetch('/api/invitations/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to accept invitation');
      }

      const data = await response.json();
      router.push(`/streaks/${data.streak.id}?welcome=true`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept invitation');
    } finally {
      setAccepting(false);
    }
  };

  const handleDecline = async () => {
    // For now, we'll just redirect to home
    // In a real implementation, you might want to track declines
    router.push('/');
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600';
      case 'accepted':
        return 'text-green-600';
      case 'declined':
        return 'text-red-600';
      case 'expired':
        return 'text-gray-500';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'accepted':
        return <CheckCircle className="h-4 w-4" />;
      case 'declined':
        return <XCircle className="h-4 w-4" />;
      case 'expired':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-6">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-semibold mb-2">Invitation Not Found</h1>
            <p className="text-muted-foreground mb-4">
              {error || 'This invitation link is invalid or has expired.'}
            </p>
            <Button asChild>
              <Link href="/">Go Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isExpired = new Date(invitation.expiresAt) < new Date();
  const isAccepted = invitation.status === 'accepted';
  const isDeclined = invitation.status === 'declined';

  return (
    <div className="min-h-screen bg-muted/30 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">You're Invited!</CardTitle>
            <CardDescription>
              {invitation.sender.name || invitation.sender.email} has invited you to join a streak
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Status Badge */}
            <div className="flex justify-center">
              <Badge
                variant="outline"
                className={cn('flex items-center gap-2 px-3 py-1', getStatusColor(invitation.status))}
              >
                {getStatusIcon(invitation.status)}
                <span className="capitalize">{invitation.status}</span>
              </Badge>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Invitation Details */}
            <div className="space-y-4">
              {/* Streak Info */}
              <div className="p-4 rounded-lg border bg-card">
                <h3 className="font-semibold mb-3">Streak Details</h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-lg">{invitation.streak.title}</h4>
                    {invitation.streak.description && (
                      <p className="text-muted-foreground text-sm mt-1">
                        {invitation.streak.description}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge className={getCategoryColor(invitation.streak.category)}>
                      {invitation.streak.category}
                    </Badge>
                    <Badge className={getTypeColor(invitation.streak.type)}>
                      {invitation.streak.type}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{invitation.streak.participants.length}/{invitation.streak.maxParticipants} members</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{invitation.streak.timezone}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message from sender */}
              {invitation.message && (
                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-medium mb-2">Message from {invitation.sender.name || invitation.sender.email}</h4>
                  <p className="text-sm text-muted-foreground italic">
                    "{invitation.message}"
                  </p>
                </div>
              )}

              {/* Sender Info */}
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={invitation.sender.image} />
                    <AvatarFallback>
                      {(invitation.sender.name || invitation.sender.email).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {invitation.sender.name || invitation.sender.email}
                    </p>
                    <p className="text-sm text-muted-foreground">Invitation sent</p>
                  </div>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <p>{new Date(invitation.createdAt).toLocaleDateString()}</p>
                  <p>Expires: {new Date(invitation.expiresAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Action Buttons */}
              {!isAccepted && !isDeclined && !isExpired && (
                <div className="space-y-3">
                  {!user ? (
                    <Alert>
                      <AlertDescription>
                        You need to sign in or create an account to accept this invitation.
                      </AlertDescription>
                    </Alert>
                  ) : null}

                  <div className="flex gap-3">
                    <Button
                      onClick={handleAccept}
                      disabled={accepting || isExpired}
                      className="flex-1"
                    >
                      {accepting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Accepting...
                        </>
                      ) : user ? (
                        'Accept Invitation'
                      ) : (
                        'Sign Up to Accept'
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleDecline}
                      disabled={accepting}
                    >
                      Decline
                    </Button>
                  </div>
                </div>
              )}

              {/* Status Messages */}
              {isAccepted && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    You've already accepted this invitation. <Link href={`/streaks/${invitation.streak.id}`} className="underline">View your streak</Link>.
                  </AlertDescription>
                </Alert>
              )}

              {isDeclined && (
                <Alert>
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    You've declined this invitation.
                  </AlertDescription>
                </Alert>
              )}

              {isExpired && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    This invitation has expired. Please ask the sender to send a new one.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}