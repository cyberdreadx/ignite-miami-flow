import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { QRCodeDisplay } from '@/components/QRCodeDisplay';
import { Loader2, Ticket, Calendar, CreditCard } from 'lucide-react';
import NavBar from '@/components/NavBar';

interface UserTicket {
  id: string;
  event_id: string;
  amount: number;
  status: string;
  valid_until: string;
  created_at: string;
  qr_code_token?: string;
}

interface UserSubscription {
  id: string;
  status: string;
  current_period_end: string;
  created_at: string;
  qr_code_token?: string;
}

export const MyTickets: React.FC = () => {
  const [tickets, setTickets] = useState<UserTicket[]>([]);
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [recovering, setRecovering] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{type: 'ticket' | 'subscription', id: string} | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchUserTickets = async () => {
    if (!user) return;

    try {
      const [ticketsResponse, subscriptionsResponse] = await Promise.all([
        supabase
          .from('tickets')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
      ]);

      if (ticketsResponse.error) throw ticketsResponse.error;
      if (subscriptionsResponse.error) throw subscriptionsResponse.error;

      setTickets(ticketsResponse.data || []);
      setSubscriptions(subscriptionsResponse.data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast({
        title: "Error",
        description: "Failed to load your tickets. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRecoverTickets = async () => {
    if (!user) return;
    
    setRecovering(true);
    try {
      const { data, error } = await supabase.functions.invoke('recover-missing-tickets');
      
      if (error) {
        throw new Error(error.message);
      }

      if (data.success) {
        toast({
          title: data.ticketsCreated > 0 ? "Tickets Recovered! 🎉" : "All Caught Up! ✅",
          description: data.message,
          variant: "default",
        });
        
        // Refresh the tickets list if any were recovered
        if (data.ticketsCreated > 0) {
          await fetchUserTickets();
        }
      } else {
        throw new Error(data.error || "Failed to recover tickets");
      }
    } catch (error) {
      console.error('Error recovering tickets:', error);
      toast({
        title: "Recovery Failed",
        description: "Could not check for missing tickets. Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setRecovering(false);
    }
  };

  useEffect(() => {
    fetchUserTickets();
  }, [user]);

  const getStatusBadge = (status: string) => {
    const variants = {
      'paid': 'default',
      'pending': 'secondary',
      'active': 'default',
      'cancelled': 'destructive'
    } as const;
    
    return <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>{status}</Badge>;
  };

  const isValidTicket = (ticket: UserTicket) => {
    if (ticket.status !== 'paid') return false;
    if (!ticket.valid_until) return true;
    return new Date(ticket.valid_until) > new Date();
  };

  const isValidSubscription = (subscription: UserSubscription) => {
    if (subscription.status !== 'active') return false;
    if (!subscription.current_period_end) return true;
    return new Date(subscription.current_period_end) > new Date();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar />
        <div className="pt-24 pb-8">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold mb-4">My Tickets</h1>
            <p className="text-muted-foreground">Please sign in to view your tickets.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <div className="pt-24 pb-8">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            >
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold">My Tickets & Passes</h1>
              <Button 
                onClick={handleRecoverTickets}
                disabled={recovering}
                variant="outline"
                className="flex items-center gap-2"
              >
                {recovering && <Loader2 className="w-4 h-4 animate-spin" />}
                Check for Missing Tickets
              </Button>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : (
              <div className="space-y-8">
                {/* QR Code Display */}
                {selectedItem && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex justify-center"
                  >
                    <QRCodeDisplay
                      ticketId={selectedItem.type === 'ticket' ? selectedItem.id : undefined}
                      subscriptionId={selectedItem.type === 'subscription' ? selectedItem.id : undefined}
                      type={selectedItem.type}
                    />
                  </motion.div>
                )}

                {/* Active Subscriptions */}
                {subscriptions.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Monthly Passes
                    </h2>
                    <div className="grid gap-4">
                      {subscriptions.map((subscription) => (
                        <Card key={subscription.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold">Monthly Pass</h3>
                                  {getStatusBadge(subscription.status)}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  Valid until: {new Date(subscription.current_period_end).toLocaleDateString()}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Purchased: {new Date(subscription.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="space-y-2">
                                {isValidSubscription(subscription) && (
                                  <Button
                                    onClick={() => setSelectedItem({type: 'subscription', id: subscription.id})}
                                    variant={selectedItem?.id === subscription.id ? 'default' : 'outline'}
                                  >
                                    Show QR Code
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Individual Tickets */}
                {tickets.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Ticket className="w-5 h-5" />
                      Event Tickets
                    </h2>
                    <div className="grid gap-4">
                      {tickets.map((ticket) => (
                        <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold">Event Ticket</h3>
                                  {getStatusBadge(ticket.status)}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  Amount: ${(ticket.amount / 100).toFixed(2)}
                                </p>
                                {ticket.valid_until && (
                                  <p className="text-sm text-muted-foreground">
                                    Valid until: {new Date(ticket.valid_until).toLocaleDateString()}
                                  </p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                  Purchased: {new Date(ticket.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="space-y-2">
                                {isValidTicket(ticket) && (
                                  <Button
                                    onClick={() => setSelectedItem({type: 'ticket', id: ticket.id})}
                                    variant={selectedItem?.id === ticket.id ? 'default' : 'outline'}
                                  >
                                    Show QR Code
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {tickets.length === 0 && subscriptions.length === 0 && (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No tickets yet</h3>
                    <p className="text-muted-foreground mb-4">Purchase tickets to see them here</p>
                    <Button onClick={() => window.location.href = '/tickets'}>
                      Buy Tickets
                    </Button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};