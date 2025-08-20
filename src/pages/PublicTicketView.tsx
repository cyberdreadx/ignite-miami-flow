import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/contexts/UserRoleContext';
import { Loader2, CheckCircle, XCircle, User, Calendar, DollarSign, Ticket, CreditCard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface TicketDetails {
  valid: boolean;
  reason?: string;
  type?: 'ticket' | 'subscription';
  ticket_info?: {
    id: string;
    amount: number;
    event_id?: string;
    user_name: string;
    created_at: string;
    valid_until?: string;
    used_at?: string;
    used_by?: string;
  };
  subscription_info?: {
    id: string;
    status: string;
    user_name: string;
    current_period_end: string;
    created_at: string;
  };
}

export const PublicTicketView: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [ticketDetails, setTicketDetails] = useState<TicketDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [markingAsUsed, setMarkingAsUsed] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { roles, isAdmin, hasRole, loading: rolesLoading } = useUserRoles();

  const token = searchParams.get('token');

  const isModeratorOrAdmin = isAdmin || hasRole('moderator');

  useEffect(() => {
    const fetchTicketDetails = async () => {
      if (!token) {
        setError('No ticket token provided');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('verify-ticket-public', {
          body: { qr_code_token: token }
        });

        if (error) throw error;
        setTicketDetails(data);
      } catch (err) {
        console.error('Error fetching ticket details:', err);
        setError('Failed to load ticket details');
      } finally {
        setLoading(false);
      }
    };

    fetchTicketDetails();
  }, [token]);

  const markTicketAsUsed = async () => {
    if (!ticketDetails?.ticket_info?.id || !isModeratorOrAdmin) return;

    setMarkingAsUsed(true);
    try {
      const { error } = await supabase.functions.invoke('validate-qr-code', {
        body: {
          qr_code_token: token,
          validator_name: user?.email || 'Door Staff'
        }
      });

      if (error) throw error;

      // Update local state to reflect the ticket is now used
      setTicketDetails(prev => prev ? {
        ...prev,
        valid: false,
        reason: "This ticket has been used for entry",
        ticket_info: prev.ticket_info ? {
          ...prev.ticket_info,
          used_at: new Date().toISOString(),
          used_by: user?.email || 'Door Staff'
        } : undefined
      } : null);

      toast({
        title: "Ticket Marked as Used",
        description: "The ticket has been successfully marked as used.",
      });
    } catch (err) {
      console.error('Error marking ticket as used:', err);
      toast({
        title: "Error",
        description: "Failed to mark ticket as used. Please try again.",
        variant: "destructive",
      });
    } finally {
      setMarkingAsUsed(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading ticket details...</p>
        </div>
      </div>
    );
  }

  if (error || !ticketDetails) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-6 text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Invalid Ticket</h2>
            <p className="text-muted-foreground">{error || 'This ticket could not be found.'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              {ticketDetails.type === 'ticket' ? (
                <Ticket className="w-12 h-12 text-primary" />
              ) : (
                <CreditCard className="w-12 h-12 text-primary" />
              )}
            </div>
            <h1 className="text-2xl font-bold">SkateBurn</h1>
            <p className="text-muted-foreground">
              {ticketDetails.type === 'ticket' ? 'Event Ticket' : 'Monthly Pass'} Verification
            </p>
          </div>

          <Card className={`border-2 ${
            ticketDetails.valid ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
          }`}>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-2">
                {ticketDetails.valid ? (
                  <CheckCircle className="w-8 h-8 text-green-600" />
                ) : (
                  <XCircle className="w-8 h-8 text-red-600" />
                )}
              </div>
              <CardTitle className={`text-xl ${
                ticketDetails.valid ? 'text-green-800' : 'text-red-800'
              }`}>
                {ticketDetails.valid ? 'VALID ENTRY' : 'INVALID ENTRY'}
              </CardTitle>
              {ticketDetails.reason && (
                <p className={`text-sm ${
                  ticketDetails.valid ? 'text-green-700' : 'text-red-700'
                }`}>
                  {ticketDetails.reason}
                </p>
              )}
            </CardHeader>

            <CardContent className="space-y-4">
              {ticketDetails.valid && (
                <>
                  <div className="flex justify-center">
                    <Badge variant="default" className="text-sm">
                      {ticketDetails.type === 'ticket' ? 'EVENT TICKET' : 'MONTHLY PASS'}
                    </Badge>
                  </div>

                  {ticketDetails.ticket_info && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                        <User className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{ticketDetails.ticket_info.user_name}</p>
                          <p className="text-sm text-muted-foreground">Ticket Holder</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                        <DollarSign className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">${ticketDetails.ticket_info.amount ? (ticketDetails.ticket_info.amount / 100).toFixed(2) : '0.00'}</p>
                          <p className="text-sm text-muted-foreground">Ticket Price</p>
                        </div>
                      </div>

                      {ticketDetails.ticket_info.valid_until && (
                        <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                          <Calendar className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">
                              {ticketDetails.ticket_info.valid_until ? new Date(ticketDetails.ticket_info.valid_until).toLocaleDateString() : 'No expiration'}
                            </p>
                            <p className="text-sm text-muted-foreground">Valid Until</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                        <Calendar className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            {ticketDetails.ticket_info.created_at ? new Date(ticketDetails.ticket_info.created_at).toLocaleDateString() : 'Unknown'}
                          </p>
                          <p className="text-sm text-muted-foreground">Purchase Date</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {ticketDetails.subscription_info && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                        <User className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{ticketDetails.subscription_info.user_name}</p>
                          <p className="text-sm text-muted-foreground">Pass Holder</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                        <Calendar className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            {ticketDetails.subscription_info.current_period_end ? new Date(ticketDetails.subscription_info.current_period_end).toLocaleDateString() : 'Unknown'}
                          </p>
                          <p className="text-sm text-muted-foreground">Valid Until</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                        <Calendar className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            {ticketDetails.subscription_info.created_at ? new Date(ticketDetails.subscription_info.created_at).toLocaleDateString() : 'Unknown'}
                          </p>
                          <p className="text-sm text-muted-foreground">Purchase Date</p>
                        </div>
                      </div>

                      <div className="text-center">
                        <Badge variant="secondary" className="text-sm">
                          UNLIMITED ACCESS
                        </Badge>
                      </div>
                    </div>
                  )}
                </>
              )}

              {!ticketDetails.valid && ticketDetails.ticket_info?.used_at && (
                <div className="p-3 bg-background rounded-lg">
                  <p className="text-sm text-red-700 text-center">
                    This ticket was already used on {ticketDetails.ticket_info.used_at ? new Date(ticketDetails.ticket_info.used_at).toLocaleDateString() : 'Unknown date'}
                    {ticketDetails.ticket_info.used_by && ` by ${ticketDetails.ticket_info.used_by}`}
                  </p>
                </div>
              )}

              {/* Moderator Actions */}
              {user && isModeratorOrAdmin && ticketDetails.valid && ticketDetails.type === 'ticket' && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h3 className="font-semibold text-yellow-800 mb-2">Moderator Actions</h3>
                  <Button 
                    onClick={markTicketAsUsed}
                    disabled={markingAsUsed}
                    variant="destructive"
                    className="w-full"
                  >
                    {markingAsUsed ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Marking as Used...
                      </>
                    ) : (
                      'Mark as Used'
                    )}
                  </Button>
                  <p className="text-xs text-yellow-700 mt-2">
                    This will mark the ticket as used and prevent future entries.
                  </p>
                </div>
              )}
              
              {/* Login prompt for staff */}
              {!user && ticketDetails.valid && ticketDetails.type === 'ticket' && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">Staff Access</h3>
                  <p className="text-sm text-blue-700 mb-3">
                    Are you a moderator or admin? Log in to access ticket verification controls.
                  </p>
                  <Button 
                    onClick={() => window.location.href = '/auth'}
                    variant="outline"
                    className="w-full"
                  >
                    Staff Login
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="text-center mt-6">
            <p className="text-xs text-muted-foreground">
              This is an official SkateBurn ticket verification page
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};