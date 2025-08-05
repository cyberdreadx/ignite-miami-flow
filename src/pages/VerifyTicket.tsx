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
  Loader2
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

export const VerifyTicket: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [ticket, setTicket] = useState<TicketDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();
  const { hasRole } = useUserRoles();
  
  const { toast } = useToast();
  
  // Get QR token from URL params
  const qrToken = searchParams.get('token');
  
  const canMarkAsUsed = user && (hasRole('admin') || hasRole('moderator'));

  const fetchTicketDetails = async () => {
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

      if (data.success && data.ticket) {
        setTicket(data.ticket);
      } else {
        setError(data.error || 'Ticket not found');
      }
    } catch (err) {
      console.error('Error fetching ticket:', err);
      setError(err instanceof Error ? err.message : 'Failed to verify ticket');
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
    fetchTicketDetails();
  }, [qrToken]);

  const isTicketValid = () => {
    if (!ticket) return false;
    if (ticket.status !== 'paid') return false;
    if (ticket.used_at) return false; // Already used
    if (!ticket.valid_until) return true;
    return new Date(ticket.valid_until) > new Date();
  };

  const getStatusInfo = () => {
    if (!ticket) return { icon: XCircle, text: 'Unknown', variant: 'destructive' as const };
    
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
    
    return { icon: CheckCircle, text: 'Valid', variant: 'default' as const };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar />
        <div className="pt-24 pb-8">
          <div className="container mx-auto px-4 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Verifying ticket...</p>
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
            <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Verification Failed</h1>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar />
        <div className="pt-24 pb-8">
          <div className="container mx-auto px-4 text-center">
            <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Ticket Not Found</h1>
            <p className="text-muted-foreground">The QR code may be invalid or expired.</p>
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
            <h1 className="text-3xl font-bold mb-2">Ticket Verification</h1>
            <Badge variant={statusInfo.variant} className="text-lg px-4 py-2">
              {statusInfo.text}
            </Badge>
            {statusInfo.details && (
              <p className="text-sm text-muted-foreground mt-2">{statusInfo.details}</p>
            )}
          </div>

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

          {canMarkAsUsed && isTicketValid() && (
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

          {!canMarkAsUsed && user && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  You don't have permission to mark tickets as used. Contact an admin if you need moderator access.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};