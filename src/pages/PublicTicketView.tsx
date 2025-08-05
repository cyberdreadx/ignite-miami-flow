import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

  const token = searchParams.get('token');

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
                          <p className="font-medium">${(ticketDetails.ticket_info.amount / 100).toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">Ticket Price</p>
                        </div>
                      </div>

                      {ticketDetails.ticket_info.valid_until && (
                        <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                          <Calendar className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">
                              {new Date(ticketDetails.ticket_info.valid_until).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-muted-foreground">Valid Until</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                        <Calendar className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            {new Date(ticketDetails.ticket_info.created_at).toLocaleDateString()}
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
                            {new Date(ticketDetails.subscription_info.current_period_end).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-muted-foreground">Valid Until</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                        <Calendar className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            {new Date(ticketDetails.subscription_info.created_at).toLocaleDateString()}
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
                    This ticket was already used on {new Date(ticketDetails.ticket_info.used_at).toLocaleDateString()}
                    {ticketDetails.ticket_info.used_by && ` by ${ticketDetails.ticket_info.used_by}`}
                  </p>
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