import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useUserRoles } from '@/hooks/useUserRoles';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { 
  CheckCircle, 
  XCircle, 
  Ticket, 
  User, 
  Calendar, 
  DollarSign,
  Hash,
  Clock,
  AlertTriangle,
  Loader2,
  CreditCard,
  Camera
} from 'lucide-react';
import NavBar from '@/components/NavBar';

interface TicketDetails {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  created_at: string;
  valid_until: string | null;
  used_at: string | null;
  used_by: string | null;
  qr_code_token: string;
  user_email: string;
  user_name: string;
}

interface SubscriptionInfo {
  id: string;
  status: string;
  user_name: string;
  current_period_end: string | null;
  created_at: string;
}

interface MediaPassInfo {
  id: string;
  pass_type: string;
  photographer_name: string;
  instagram_handle: string;
  amount: number;
  user_name: string;
  created_at: string;
  valid_until: string | null;
  status: string;
}

export const VerifyTicket: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [ticket, setTicket] = useState<TicketDetails | null>(null);
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [mediaPassInfo, setMediaPassInfo] = useState<MediaPassInfo | null>(null);
  const [verificationType, setVerificationType] = useState<'ticket' | 'subscription' | 'media_pass' | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [reason, setReason] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();
  const { hasRole } = useUserRoles();
  
  const { toast } = useToast();
  
  // Get QR token from URL params
  const qrToken = searchParams.get('token');
  
  const canMarkAsUsed = user && (hasRole('admin') || hasRole('moderator'));

  const fetchVerificationDetails = async () => {
    if (!qrToken) {
      setError('No QR token provided');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('verify-ticket-public', {
        body: { qr_token: qrToken }
      });

      if (error) {
        throw new Error(error.message);
      }

      // Handle ticket verification
      if (data.success && data.ticket) {
        setVerificationType('ticket');
        setTicket(data.ticket);
        setIsValid(true);
      }
      // Handle subscription verification
      else if (data.type === 'subscription') {
        setVerificationType('subscription');
        setSubscriptionInfo(data.subscription_info);
        setIsValid(data.valid);
        setReason(data.reason);
      }
      // Handle media pass verification
      else if (data.type === 'media_pass') {
        setVerificationType('media_pass');
        setMediaPassInfo(data.media_pass_info);
        setIsValid(data.valid);
        setReason(data.reason);
      }
      // Handle error cases
      else {
        setError(data.error || 'QR code not found');
      }
    } catch (err) {
      console.error('Error fetching verification details:', err);
      setError(err instanceof Error ? err.message : 'Failed to verify QR code');
    } finally {
      setLoading(false);
    }
  };

  const markTicketAsUsed = async () => {
    if (!ticket || !user) return;
    
    setMarking(true);
    try {
      const { error } = await supabase
        .from('tickets')
        .update({
          used_at: new Date().toISOString(),
          used_by: user.email || user.id
        })
        .eq('id', ticket.id);

      if (error) {
        throw error;
      }

      // Update local state
      setTicket(prev => prev ? {
        ...prev,
        used_at: new Date().toISOString(),
        used_by: user.email || user.id
      } : null);

      toast({
        title: "Ticket Marked as Used ✅",
        description: `Ticket checked off by ${user.email}`,
      });
    } catch (err) {
      console.error('Error marking ticket as used:', err);
      toast({
        title: "Error",
        description: "Failed to mark ticket as used. Please try again.",
        variant: "destructive",
      });
    } finally {
      setMarking(false);
    }
  };

  useEffect(() => {
    fetchVerificationDetails();
  }, [qrToken]);

  const getVerificationTitle = () => {
    switch (verificationType) {
      case 'ticket':
        return 'Ticket Verification';
      case 'subscription':
        return 'Monthly Pass Verification';
      case 'media_pass':
        return 'Media Pass Verification';
      default:
        return 'QR Code Verification';
    }
  };

  const getStatusInfo = () => {
    if (verificationType === 'ticket' && ticket) {
      if (ticket.used_at) {
        return { 
          icon: CheckCircle, 
          text: 'Already Used', 
          variant: 'secondary' as const,
          details: `Used on ${new Date(ticket.used_at).toLocaleString()}${ticket.used_by ? ` by ${ticket.used_by}` : ''}`
        };
      }
      
      if (ticket.status !== 'paid') {
        return { icon: XCircle, text: 'Not Paid', variant: 'destructive' as const };
      }
      
      if (ticket.valid_until && new Date(ticket.valid_until) <= new Date()) {
        return { icon: XCircle, text: 'Expired', variant: 'destructive' as const };
      }
      
      return { icon: CheckCircle, text: 'Valid Entry', variant: 'default' as const };
    }

    // For subscriptions and media passes
    if (isValid === true) {
      return { icon: CheckCircle, text: 'Valid Entry', variant: 'default' as const };
    } else if (isValid === false) {
      return { 
        icon: XCircle, 
        text: 'Invalid Entry', 
        variant: 'destructive' as const,
        details: reason || undefined
      };
    }

    return { icon: XCircle, text: 'Unknown', variant: 'destructive' as const };
  };

  const isTicketValid = () => {
    if (verificationType !== 'ticket' || !ticket) return false;
    if (ticket.status !== 'paid') return false;
    if (ticket.used_at) return false; // Already used
    if (!ticket.valid_until) return true;
    return new Date(ticket.valid_until) > new Date();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar />
        <div className="pt-24 pb-8">
          <div className="container mx-auto px-4 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Verifying QR code...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar />
        <div className="pt-24 pb-8">
          <div className="container mx-auto px-4 text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2 text-red-600">INVALID ENTRY</h1>
            <p className="text-muted-foreground mb-4">{error}</p>
            <p className="text-sm text-muted-foreground">This is an official SkateBurn ticket verification page</p>
          </div>
        </div>
      </div>
    );
  }

  if (!ticket && !subscriptionInfo && !mediaPassInfo) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar />
        <div className="pt-24 pb-8">
          <div className="container mx-auto px-4 text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2 text-red-600">INVALID ENTRY</h1>
            <p className="text-muted-foreground mb-4">The QR code is invalid or has been deactivated.</p>
            <p className="text-sm text-muted-foreground">This is an official SkateBurn ticket verification page</p>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <div className="pt-24 pb-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-8">
            <StatusIcon className={`w-16 h-16 mx-auto mb-4 ${
              statusInfo.variant === 'default' ? 'text-green-500' :
              statusInfo.variant === 'destructive' ? 'text-red-500' :
              'text-yellow-500'
            }`} />
            <h1 className="text-3xl font-bold mb-2">{getVerificationTitle()}</h1>
            
            {statusInfo.variant === 'destructive' ? (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-4">
                <h2 className="text-2xl font-bold text-red-600 mb-2">INVALID ENTRY</h2>
                {statusInfo.details && (
                  <p className="text-red-600">{statusInfo.details}</p>
                )}
              </div>
            ) : (
              <Badge variant={statusInfo.variant} className="text-lg px-4 py-2 mb-4">
                {statusInfo.text}
              </Badge>
            )}
            
            {statusInfo.details && statusInfo.variant !== 'destructive' && (
              <p className="text-sm text-muted-foreground mt-2">{statusInfo.details}</p>
            )}
          </div>

          {/* Ticket Details */}
          {verificationType === 'ticket' && ticket && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ticket className="w-5 h-5" />
                  Ticket Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">QR Token:</span>
                    <span className="font-mono text-sm">{ticket.qr_code_token}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Amount:</span>
                    <span className="font-semibold">${(ticket.amount / 100).toFixed(2)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Holder:</span>
                    <span>{ticket.user_name}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Purchased:</span>
                    <span>{formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}</span>
                  </div>
                  
                  {ticket.valid_until && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Valid Until:</span>
                      <span>{new Date(ticket.valid_until).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Subscription Details */}
          {verificationType === 'subscription' && subscriptionInfo && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Monthly Pass Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Holder:</span>
                    <span>{subscriptionInfo.user_name}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <span className="capitalize">{subscriptionInfo.status}</span>
                  </div>
                  
                  {subscriptionInfo.current_period_end && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Valid Until:</span>
                      <span>{new Date(subscriptionInfo.current_period_end).toLocaleDateString()}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Started:</span>
                    <span>{formatDistanceToNow(new Date(subscriptionInfo.created_at), { addSuffix: true })}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Media Pass Details */}
          {verificationType === 'media_pass' && mediaPassInfo && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Media Pass Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Photographer:</span>
                    <span>{mediaPassInfo.photographer_name}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Instagram:</span>
                    <span>@{mediaPassInfo.instagram_handle}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Amount:</span>
                    <span className="font-semibold">${(mediaPassInfo.amount / 100).toFixed(2)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Pass Type:</span>
                    <span className="capitalize">{mediaPassInfo.pass_type}</span>
                  </div>
                  
                  {mediaPassInfo.valid_until && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Valid Until:</span>
                      <span>{new Date(mediaPassInfo.valid_until).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Moderator Actions for Tickets */}
          {canMarkAsUsed && verificationType === 'ticket' && isTicketValid() && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-semibold mb-4">Moderator Actions</h3>
                <Button
                  onClick={markTicketAsUsed}
                  disabled={marking}
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  {marking && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Mark as Used ✓
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  This will mark the ticket as used and prevent future entry
                </p>
              </CardContent>
            </Card>
          )}

          {!canMarkAsUsed && user && verificationType === 'ticket' && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  You don't have permission to mark tickets as used. Contact an admin if you need moderator access.
                </p>
              </CardContent>
            </Card>
          )}

          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">This is an official SkateBurn ticket verification page</p>
          </div>
        </div>
      </div>
    </div>
  );
};