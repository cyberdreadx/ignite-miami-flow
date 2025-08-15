import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, MapPin, Clock, Ticket, Users, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';

import NavBar from '@/components/NavBar';
import { useWaiver } from '@/hooks/useWaiver';
import { WaiverModal } from '@/components/WaiverModal';
import { WaiverBanner } from '@/components/WaiverBanner';

interface Event {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  time: string;
  location: string;
  created_at: string;
}

const Tickets = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [slidingAmount, setSlidingAmount] = useState(10);
  const [inputValue, setInputValue] = useState('10');
  const [donationAmount, setDonationAmount] = useState(1);
  const [donationInputValue, setDonationInputValue] = useState('1');
  const [affiliateCode, setAffiliateCode] = useState('');
  const [affiliateCodeValid, setAffiliateCodeValid] = useState(false);
  const [validatingCode, setValidatingCode] = useState(false);
  const [processingTicket, setProcessingTicket] = useState(false);
  const [processingPass, setProcessingPass] = useState(false);
  const [processingDonation, setProcessingDonation] = useState(false);
  const [showWaiverModal, setShowWaiverModal] = useState(false);
  const [pendingPurchaseType, setPendingPurchaseType] = useState<'ticket' | 'pass' | 'donation' | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const { hasCompletedWaiver, loading: waiverLoading, markWaiverCompleted } = useWaiver();

  // Check for affiliate code in URL
  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      setAffiliateCode(refCode);
      validateAffiliateCode(refCode);
    }
  }, [searchParams]);

  // Check for payment success/cancel messages and handle ticket creation
  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    const subscription = searchParams.get('subscription');
    const donation = searchParams.get('donation');
    const sessionId = searchParams.get('session_id');

    const handleTicketCreation = async () => {
      if (success === 'true' && sessionId && user?.email) {
        try {
          // Call verification function to create ticket if it doesn't exist
          const { data, error } = await supabase.functions.invoke('verify-and-create-ticket', {
            body: { sessionId, userEmail: user.email }
          });

          if (error) {
            console.error('Error verifying payment:', error);
            toast({
              title: 'Payment Successful! ⚠️',
              description: 'Your payment went through but there was an issue creating your ticket. Please contact support.',
              variant: 'destructive',
            });
            return;
          }

          toast({
            title: 'Payment Successful! 🎉',
            description: 'Your ticket is ready! Check "My Tickets" to view your QR code for entry.',
            variant: 'default',
            action: <Button variant="outline" size="sm" onClick={() => window.location.href = '/my-tickets'}>View My Tickets</Button>
          });
        } catch (error) {
          console.error('Error creating ticket:', error);
          toast({
            title: 'Payment Successful! ⚠️',
            description: 'Your payment went through but there was an issue creating your ticket. Please contact support.',
            variant: 'destructive',
          });
        }
      } else if (success === 'true') {
        toast({
          title: 'Payment Successful! 🎉',
          description: 'Your ticket is ready! Check "My Tickets" to view your QR code for entry.',
          variant: 'default',
          action: <Button variant="outline" size="sm" onClick={() => window.location.href = '/my-tickets'}>View My Tickets</Button>
        });
      }
    };

    if (success === 'true' && donation === 'true') {
      toast({
        title: 'Donation Successful! ❤️',
        description: 'Thank you for supporting our performers! Your generosity helps keep our community thriving.',
        variant: 'default',
      });
    } else if (success === 'true') {
      handleTicketCreation();
    } else if (canceled === 'true' && donation === 'true') {
      toast({
        title: 'Donation Canceled',
        description: 'Your donation was canceled.',
        variant: 'destructive',
      });
    } else if (canceled === 'true') {
      toast({
        title: 'Payment Canceled',
        description: 'Your ticket purchase was canceled.',
        variant: 'destructive',
      });
    } else if (subscription === 'success') {
      toast({
        title: 'Monthly Pass Active! 🎟️',
        description: 'Your monthly pass is ready! Check "My Tickets" to view your QR code.',
        variant: 'default',
        action: <Button variant="outline" size="sm" onClick={() => window.location.href = '/my-tickets'}>View My Tickets</Button>
      });
    } else if (subscription === 'canceled') {
      toast({
        title: 'Subscription Canceled',
        description: 'Your monthly pass subscription was canceled.',
        variant: 'destructive',
      });
    }
  }, [searchParams, toast]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: 'Error',
        description: 'Failed to load events',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const checkWaiverAndProceed = (purchaseType: 'ticket' | 'pass' | 'donation') => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: purchaseType === 'donation' ? 'Please sign in to make a donation' : 'Please sign in to purchase tickets',
        variant: 'destructive',
      });
      return;
    }

    if (!hasCompletedWaiver && !waiverLoading) {
      setPendingPurchaseType(purchaseType);
      setShowWaiverModal(true);
      return;
    }

    if (purchaseType === 'ticket') {
      proceedWithTicketPurchase();
    } else if (purchaseType === 'pass') {
      proceedWithPassPurchase();
    } else if (purchaseType === 'donation') {
      proceedWithDonation();
    }
  };

  const handleWaiverCompleted = async () => {
    const success = await markWaiverCompleted();
    if (success && pendingPurchaseType) {
      setShowWaiverModal(false);
      if (pendingPurchaseType === 'ticket') {
        proceedWithTicketPurchase();
      } else if (pendingPurchaseType === 'pass') {
        proceedWithPassPurchase();
      } else if (pendingPurchaseType === 'donation') {
        proceedWithDonation();
      }
      setPendingPurchaseType(null);
    }
    return success;
  };

  const validateAffiliateCode = async (code: string) => {
    if (!code.trim()) {
      setAffiliateCodeValid(false);
      return;
    }

    setValidatingCode(true);
    try {
      const { data, error } = await supabase
        .from('affiliate_codes')
        .select('id, code, is_active')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !data) {
        setAffiliateCodeValid(false);
        toast({
          title: 'Invalid Affiliate Code',
          description: 'The affiliate code you entered is not valid or has expired.',
          variant: 'destructive',
        });
      } else {
        setAffiliateCodeValid(true);
        toast({
          title: 'Affiliate Code Applied! 🎉',
          description: 'Your purchase will support this affiliate.',
        });
      }
    } catch (error) {
      console.error('Error validating affiliate code:', error);
      setAffiliateCodeValid(false);
    } finally {
      setValidatingCode(false);
    }
  };

  const handleAffiliateCodeChange = (value: string) => {
    setAffiliateCode(value);
    if (value.trim() === '') {
      setAffiliateCodeValid(false);
    }
  };

  const applyAffiliateCode = () => {
    validateAffiliateCode(affiliateCode);
  };

  const proceedWithTicketPurchase = async () => {
    setProcessingTicket(true);
    try {
      console.log('Invoking create-ticket-payment function...');
      const { data, error } = await supabase.functions.invoke('create-ticket-payment', {
        body: { 
          amount: slidingAmount * 100, // Convert to cents
          affiliateCode: affiliateCode.trim() || null
        },
      });

      console.log('Function response:', { data, error });
      
      if (error) {
        console.error('Function error:', error);
        throw error;
      }

      if (!data?.url) {
        console.error('No URL in response:', data);
        throw new Error('No payment URL received');
      }

      console.log('Redirecting to:', data.url);
      
      // Try to open in new tab, fallback to redirect if blocked
      try {
        const newWindow = window.open(data.url, '_blank');
        if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
          // Popup was blocked, use redirect instead
          console.log('Popup blocked, using redirect');
          window.location.href = data.url;
        } else {
          console.log('Opened in new tab successfully');
        }
      } catch (redirectError) {
        // Fallback to redirect if window.open fails
        console.log('Window.open failed, using redirect:', redirectError);
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating ticket payment:', error);
      toast({
        title: 'Payment Error',
        description: error.message || 'Failed to create payment session',
        variant: 'destructive',
      });
    } finally {
      setProcessingTicket(false);
    }
  };

  const proceedWithPassPurchase = async () => {
    setProcessingPass(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-monthly-subscription', {
        body: {},
      });

      if (error) throw error;

      // Try to open in new tab, fallback to redirect if blocked
      try {
        const newWindow = window.open(data.url, '_blank');
        if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
          // Popup was blocked, use redirect instead
          window.location.href = data.url;
        }
      } catch (error) {
        // Fallback to redirect if window.open fails
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      toast({
        title: 'Subscription Error',
        description: 'Failed to create subscription session',
        variant: 'destructive',
      });
    } finally {
      setProcessingPass(false);
    }
  };

  const proceedWithDonation = async () => {
    setProcessingDonation(true);
    try {
      console.log('Invoking create-donation-payment function...');
      const { data, error } = await supabase.functions.invoke('create-donation-payment', {
        body: { amount: donationAmount * 100 }, // Convert to cents
      });

      console.log('Function response:', { data, error });
      
      if (error) {
        console.error('Function error:', error);
        throw error;
      }

      if (!data?.url) {
        console.error('No URL in response:', data);
        throw new Error('No payment URL received');
      }

      console.log('Redirecting to:', data.url);
      
      // Try to open in new tab, fallback to redirect if blocked
      try {
        const newWindow = window.open(data.url, '_blank');
        if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
          // Popup was blocked, use redirect instead
          console.log('Popup blocked, using redirect');
          window.location.href = data.url;
        } else {
          console.log('Opened in new tab successfully');
        }
      } catch (redirectError) {
        // Fallback to redirect if window.open fails
        console.log('Window.open failed, using redirect:', redirectError);
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating donation payment:', error);
      toast({
        title: 'Donation Error',
        description: error.message || 'Failed to create donation session',
        variant: 'destructive',
      });
    } finally {
      setProcessingDonation(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <NavBar />
      <div className="pt-24 pb-8">
      <div className="container mx-auto px-4">
        <WaiverBanner />
        
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-4xl font-bold mb-3 bg-gradient-primary bg-clip-text text-transparent">
            Get Your Tickets
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join our skate community with single event tickets or monthly passes
          </p>
        </motion.div>

        {/* Ticket Options */}
        <div className="grid lg:grid-cols-2 gap-6 mb-12">
          {/* Single Event Ticket */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full border-2 hover:border-primary/20 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Ticket className="w-6 h-6 text-primary" />
                  <Badge variant="outline">Single Event</Badge>
                </div>
                <CardTitle className="text-2xl">Event Ticket</CardTitle>
                <CardDescription>
                  Support our community with a sliding scale donation starting at $10
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="amount">Amount (minimum $10)</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-2xl font-bold">$</span>
                      <Input
                        id="amount"
                        type="number"
                        value={inputValue}
                        onChange={(e) => {
                          setInputValue(e.target.value);
                        }}
                        onBlur={(e) => {
                          const value = e.target.value;
                          const numValue = parseInt(value);
                          if (value === '' || isNaN(numValue) || numValue < 10) {
                            setSlidingAmount(10);
                            setInputValue('10');
                          } else {
                            setSlidingAmount(numValue);
                            setInputValue(value);
                          }
                        }}
                        min="10"
                        step="1"
                        className="text-xl font-semibold"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Pay what you can, starting at $10
                    </p>
                  </div>
                </div>

                {/* Affiliate Code Section */}
                <div className="space-y-3 pt-4 border-t">
                  <Label htmlFor="affiliate-code">Have an affiliate code?</Label>
                  <div className="flex gap-2">
                    <Input
                      id="affiliate-code"
                      placeholder="Enter code"
                      value={affiliateCode}
                      onChange={(e) => handleAffiliateCodeChange(e.target.value.toUpperCase())}
                      className="font-mono"
                    />
                    <Button 
                      variant="outline" 
                      onClick={applyAffiliateCode}
                      disabled={validatingCode || !affiliateCode.trim()}
                    >
                      {validatingCode ? 'Checking...' : 'Apply'}
                    </Button>
                  </div>
                  {affiliateCodeValid && (
                    <Alert className="border-green-200 bg-green-50 text-green-800">
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Affiliate code applied! Your purchase will support this affiliate.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                {/* Price Summary */}
                <div className="space-y-2 pt-4 border-t">
                  {affiliateCodeValid && (
                    <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                      Supporting affiliate: {affiliateCode}
                    </div>
                  )}
                  
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>${slidingAmount.toFixed(2)}</span>
                  </div>
                </div>
                
                <Button 
                  onClick={() => checkWaiverAndProceed('ticket')}
                  disabled={processingTicket || !user}
                  className="w-full text-lg py-6"
                  size="lg"
                >
                  {processingTicket ? 'Processing...' : 'Get Ticket'}
                </Button>
                
                {!user && (
                  <p className="text-sm text-muted-foreground text-center">
                    Please sign in to purchase tickets
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Monthly Pass */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="h-full border-2 border-primary/20 bg-primary/5 relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <Badge className="bg-primary text-primary-foreground">Popular</Badge>
              </div>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-6 h-6 text-primary" />
                  <Badge variant="outline">Monthly</Badge>
                </div>
                <CardTitle className="text-2xl">Monthly Pass</CardTitle>
                <CardDescription>
                  Unlimited access to all events and exclusive member benefits
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">$36</div>
                  <div className="text-muted-foreground">per month</div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm">Unlimited event access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm">Member-only sessions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm">Community Discord access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm">Priority event booking</span>
                  </div>
                </div>
                
                <Button 
                  onClick={() => checkWaiverAndProceed('pass')}
                  disabled={processingPass || !user}
                  className="w-full text-lg py-6"
                  size="lg"
                >
                  {processingPass ? 'Processing...' : 'Get Monthly Pass'}
                </Button>
                
                {!user && (
                  <p className="text-sm text-muted-foreground text-center">
                    Please sign in to purchase a monthly pass
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Upcoming Events */}
        {events.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-3xl font-bold mb-6 text-center">Upcoming Events</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <Card key={event.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{event.title}</CardTitle>
                    {event.subtitle && (
                      <CardDescription>{event.subtitle}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{event.location}</span>
                    </div>
                    {event.description && (
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {event.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* Performer Donations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold mb-3 bg-gradient-primary bg-clip-text text-transparent">
              Support Our Performers
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Show love to the skaters and artists who make our community amazing
            </p>
          </div>
          
          <div className="max-w-md mx-auto">
            <Card className="border-2 hover:border-primary/20 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 text-primary">❤️</div>
                  <Badge variant="outline">Donation</Badge>
                </div>
                <CardTitle className="text-2xl">Support Performers</CardTitle>
                <CardDescription>
                  Help support the skaters and performers who bring energy to our events
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="donation-amount">Amount (minimum $1)</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-2xl font-bold">$</span>
                      <Input
                        id="donation-amount"
                        type="number"
                        value={donationInputValue}
                        onChange={(e) => {
                          setDonationInputValue(e.target.value);
                        }}
                        onBlur={(e) => {
                          const value = e.target.value;
                          const numValue = parseInt(value);
                          if (value === '' || isNaN(numValue) || numValue < 1) {
                            setDonationAmount(1);
                            setDonationInputValue('1');
                          } else {
                            setDonationAmount(numValue);
                            setDonationInputValue(value);
                          }
                        }}
                        min="1"
                        step="1"
                        className="text-xl font-semibold"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Every dollar helps support our amazing performers
                    </p>
                  </div>
                </div>
                
                <Button 
                  onClick={() => checkWaiverAndProceed('donation')}
                  disabled={processingDonation || !user}
                  className="w-full text-lg py-6"
                  size="lg"
                >
                  {processingDonation ? 'Processing...' : 'Send Donation'}
                </Button>
                
                {!user && (
                  <p className="text-sm text-muted-foreground text-center">
                    Please sign in to make a donation
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
      </div>

      {/* Waiver Modal */}
      <WaiverModal
        isOpen={showWaiverModal}
        onClose={() => {
          setShowWaiverModal(false);
          setPendingPurchaseType(null);
        }}
        onWaiverCompleted={handleWaiverCompleted}
      />
    </motion.div>
  );
};

export default Tickets;