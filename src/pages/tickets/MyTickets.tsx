import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { QRCodeDisplay } from '@/components/tickets/QRCodeDisplay';
import { EnhancedQRCodeDisplay } from '@/components/tickets/EnhancedQRCodeDisplay';
import { Loader2, Ticket, Calendar, CreditCard } from 'lucide-react';
import NavBar from '@/components/layout/NavBar';

interface UserTicket {
  id: string;
  event_id: string;
  amount: number;
  status: string;
  valid_until: string;
  created_at: string;
  used_at?: string | null;
  used_by?: string | null;
  qr_code_token?: string;
}

interface UserSubscription {
  id: string;
  status: string;
  current_period_end: string;
  created_at: string;
  qr_code_token?: string;
}

interface UserMediaPass {
  id: string;
  pass_type: string;
  photographer_name: string;
  instagram_handle: string;
  status: string;
  valid_until: string;
  created_at: string;
  qr_code_token?: string;
}

export const MyTickets: React.FC = () => {
  const [tickets, setTickets] = useState<UserTicket[]>([]);
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [mediaPasses, setMediaPasses] = useState<UserMediaPass[]>([]);
  const [loading, setLoading] = useState(true);
  const [recovering, setRecovering] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{type: 'ticket' | 'subscription' | 'media_pass', id: string} | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchUserTickets = async () => {
    if (!user) return;

    try {
      const [ticketsResponse, subscriptionsResponse, mediaPassesResponse] = await Promise.all([
        supabase
          .from('tickets')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .rpc('get_my_media_passes')
      ]);

      if (ticketsResponse.error) throw ticketsResponse.error;
      if (subscriptionsResponse.error) throw subscriptionsResponse.error;
      if (mediaPassesResponse.error) throw mediaPassesResponse.error;

      setTickets(ticketsResponse.data || []);
      setSubscriptions(subscriptionsResponse.data || []);
      setMediaPasses(mediaPassesResponse.data || []);
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

  const handleManageSubscription = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });
      
      if (error) {
        throw new Error(error.message);
      }

      if (data.url) {
        // Open Stripe Customer Portal in new tab
        window.open(data.url, '_blank');
      } else {
        throw new Error("No portal URL received");
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Portal Access Failed",
        description: error instanceof Error ? error.message : "Could not open subscription management portal. Please try again.",
        variant: "destructive",
      });
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
    if (ticket.used_at) return false; // Can't use QR code if already used
    if (!ticket.valid_until) return true;
    return new Date(ticket.valid_until) > new Date();
  };

  const isValidSubscription = (subscription: UserSubscription) => {
    if (subscription.status !== 'active') return false;
    if (!subscription.current_period_end) return true;
    return new Date(subscription.current_period_end) > new Date();
  };

  const isValidMediaPass = (mediaPass: UserMediaPass) => {
    if (mediaPass.status !== 'paid') return false;
    if (!mediaPass.valid_until) return true;
    return new Date(mediaPass.valid_until) > new Date();
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
      <div className="pt-20 sm:pt-24 pb-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold">My Tickets & Passes</h1>
              <Button 
                onClick={handleRecoverTickets}
                disabled={recovering}
                variant="outline"
                className="flex items-center justify-center gap-2 w-full sm:w-auto"
                size="sm"
              >
                {recovering && <Loader2 className="w-4 h-4 animate-spin" />}
                <span className="text-sm">Check for Missing Tickets</span>
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
                    <EnhancedQRCodeDisplay
                      ticketId={selectedItem.type === 'ticket' ? selectedItem.id : undefined}
                      subscriptionId={selectedItem.type === 'subscription' ? selectedItem.id : undefined}
                      mediaPassId={selectedItem.type === 'media_pass' ? selectedItem.id : undefined}
                      type={selectedItem.type}
                      existingToken={
                        selectedItem.type === 'ticket' ? 
                          tickets.find(t => t.id === selectedItem.id)?.qr_code_token || undefined :
                        selectedItem.type === 'subscription' ?
                          subscriptions.find(s => s.id === selectedItem.id)?.qr_code_token || undefined :
                          mediaPasses.find(m => m.id === selectedItem.id)?.qr_code_token || undefined
                      }
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
                    <div className="space-y-4">
                      {subscriptions.map((subscription) => (
                        <Card key={subscription.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                              <div className="flex-1 space-y-2">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                  <h3 className="font-semibold text-base">Monthly Pass</h3>
                                  {getStatusBadge(subscription.status)}
                                </div>
                                <div className="space-y-1 text-sm">
                                  <p className="text-muted-foreground">
                                    Valid until: {new Date(subscription.current_period_end).toLocaleDateString()}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Purchased: {new Date(subscription.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                               <div className="flex flex-col sm:flex-row gap-2">
                                {isValidSubscription(subscription) && (
                                  <Button
                                    onClick={() => setSelectedItem({type: 'subscription', id: subscription.id})}
                                    variant={selectedItem?.id === subscription.id ? 'default' : 'outline'}
                                    className="w-full sm:w-auto text-sm"
                                    size="sm"
                                  >
                                    Show QR Code
                                  </Button>
                                )}
                                <Button
                                  onClick={handleManageSubscription}
                                  variant="outline"
                                  className="w-full sm:w-auto text-sm"
                                  size="sm"
                                >
                                  Manage Subscription
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Media Passes */}
                {mediaPasses.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      📸 Media Passes
                    </h2>
                    <div className="space-y-4">
                      {mediaPasses.map((mediaPass) => (
                        <Card key={mediaPass.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                              <div className="flex-1 space-y-2">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                  <h3 className="font-semibold text-base">{mediaPass.pass_type} Media Pass</h3>
                                  {getStatusBadge(mediaPass.status)}
                                </div>
                                <div className="space-y-1 text-sm">
                                  <p className="text-muted-foreground">
                                    Photographer: {mediaPass.photographer_name}
                                  </p>
                                  {mediaPass.instagram_handle && (
                                    <p className="text-muted-foreground">
                                      Instagram: @{mediaPass.instagram_handle}
                                    </p>
                                  )}
                                  {mediaPass.valid_until && (
                                    <p className="text-muted-foreground">
                                      Valid until: {new Date(mediaPass.valid_until).toLocaleDateString()}
                                    </p>
                                  )}
                                  <p className="text-xs text-muted-foreground">
                                    Purchased: {new Date(mediaPass.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex flex-col sm:flex-row gap-2">
                                {isValidMediaPass(mediaPass) && (
                                  <Button
                                    onClick={() => setSelectedItem({type: 'media_pass', id: mediaPass.id})}
                                    variant={selectedItem?.id === mediaPass.id ? 'default' : 'outline'}
                                    className="w-full sm:w-auto text-sm"
                                    size="sm"
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
                {tickets.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Ticket className="w-5 h-5" />
                      Event Tickets
                    </h2>
                    <div className="space-y-4">
                      {tickets.map((ticket) => (
                        <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                              <div className="flex-1 space-y-2">
                                 <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                   <h3 className="font-semibold text-base">Event Ticket</h3>
                                   {getStatusBadge(ticket.status)}
                                   {ticket.used_at && (
                                     <Badge variant="secondary" className="text-xs">
                                       Used
                                     </Badge>
                                   )}
                                 </div>
                                <div className="space-y-1 text-sm">
                                  <p className="text-muted-foreground">
                                    Amount: ${(ticket.amount / 100).toFixed(2)}
                                  </p>
                                  {ticket.valid_until && (
                                    <p className="text-muted-foreground">
                                      Valid until: {new Date(ticket.valid_until).toLocaleDateString()}
                                    </p>
                                  )}
                                   <p className="text-xs text-muted-foreground">
                                     Purchased: {new Date(ticket.created_at).toLocaleDateString()}
                                   </p>
                                   {ticket.used_at && (
                                     <p className="text-xs text-orange-600">
                                       Used: {new Date(ticket.used_at).toLocaleString()} {ticket.used_by && `by ${ticket.used_by}`}
                                     </p>
                                   )}
                                 </div>
                              </div>
                              <div className="flex flex-col sm:flex-row gap-2">
                                {isValidTicket(ticket) && (
                                  <Button
                                    onClick={() => setSelectedItem({type: 'ticket', id: ticket.id})}
                                    variant={selectedItem?.id === ticket.id ? 'default' : 'outline'}
                                    className="w-full sm:w-auto text-sm"
                                    size="sm"
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

                {tickets.length === 0 && subscriptions.length === 0 && mediaPasses.length === 0 && (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No tickets yet</h3>
                    <p className="text-muted-foreground mb-4">Purchase tickets to see them here</p>
                    <div className="space-y-2">
                      <Button onClick={() => window.location.href = '/tickets'}>
                        Buy Tickets
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        If you purchased tickets but don't see them, try the "Check for Missing Tickets" button above.
                        <br />
                        If your ticket was incorrectly marked as used, contact an admin for assistance.
                      </p>
                    </div>
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