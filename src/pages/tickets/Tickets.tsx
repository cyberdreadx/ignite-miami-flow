import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Ticket, Users, CheckCircle, Heart, Music, Sparkles, Clock, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams, useNavigate } from 'react-router-dom';
import NavBar from '@/components/layout/NavBar';
import { useWaiver } from '@/hooks/useWaiver';
import { WaiverModal } from '@/components/tickets/WaiverModal';
import { WaiverBanner } from '@/components/tickets/WaiverBanner';

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
  // Dynamic pricing: $15 at the door (8pm+ on Tuesdays), $10 advance
  const getMinTicketPrice = () => {
    const now = new Date();
    const isTuesday = now.getDay() === 2; // 0=Sun, 2=Tue
    const hour = now.getHours();
    return isTuesday && hour >= 20 ? 15 : 10;
  };
  const minTicketPrice = getMinTicketPrice();
  const isAtTheDoor = minTicketPrice === 15;

  const [ticketAmount, setTicketAmount] = useState(() => getMinTicketPrice());
  const [ticketInputValue, setTicketInputValue] = useState(() => String(getMinTicketPrice()));
  const [djDonationAmount, setDjDonationAmount] = useState(5);
  const [djDonationInput, setDjDonationInput] = useState('5');
  const [causeDonationAmount, setCauseDonationAmount] = useState(5);
  const [causeDonationInput, setCauseDonationInput] = useState('5');
  const [affiliateCode, setAffiliateCode] = useState('');
  const [affiliateCodeValid, setAffiliateCodeValid] = useState(false);
  const [validatingCode, setValidatingCode] = useState(false);
  const [processingTicket, setProcessingTicket] = useState(false);
  const [processingPass, setProcessingPass] = useState(false);
  const [processingDjDonation, setProcessingDjDonation] = useState(false);
  const [processingCauseDonation, setProcessingCauseDonation] = useState(false);
  const [showWaiverModal, setShowWaiverModal] = useState(false);
  const [pendingPurchaseType, setPendingPurchaseType] = useState<'ticket' | 'pass' | 'dj_donation' | 'cause_donation' | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { hasCompletedWaiver, loading: waiverLoading, markWaiverCompleted } = useWaiver();

  useEffect(() => {
    if (!user && !loading) {
      navigate('/auth?redirect=/tickets');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      setAffiliateCode(refCode);
      validateAffiliateCode(refCode);
    }
  }, [searchParams]);

  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    const subscription = searchParams.get('subscription');
    const donation = searchParams.get('donation');
    const donationType = searchParams.get('donation_type');
    const sessionId = searchParams.get('session_id');

    if (success === 'true' && donation === 'true') {
      toast({
        title: donationType === 'dj' ? 'DJ Donation Sent! 🎧' : 'Donation Sent! ❤️',
        description: donationType === 'dj' 
          ? 'Thank you for supporting our DJs!' 
          : 'Thank you for supporting the SkateBurn community!',
      });
    } else if (success === 'true') {
      toast({
        title: 'Payment Successful! 🎉',
        description: 'Your ticket is ready! Check "My Tickets" to view your QR code.',
        action: <Button variant="outline" size="sm" onClick={() => navigate('/my-tickets')}>View Tickets</Button>
      });
    } else if (canceled === 'true') {
      toast({
        title: 'Payment Canceled',
        description: 'Your payment was canceled.',
        variant: 'destructive',
      });
    } else if (subscription === 'success') {
      toast({
        title: 'Monthly Pass Active! 🎟️',
        description: 'Check "My Tickets" for your pass.',
        action: <Button variant="outline" size="sm" onClick={() => navigate('/my-tickets')}>View Tickets</Button>
      });
    } else if (subscription === 'canceled') {
      toast({
        title: 'Subscription Canceled',
        description: 'Your monthly pass subscription was canceled.',
        variant: 'destructive',
      });
    }
  }, [searchParams, toast, navigate]);

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
    } finally {
      setLoading(false);
    }
  };

  const checkWaiverAndProceed = (purchaseType: 'ticket' | 'pass' | 'dj_donation' | 'cause_donation') => {
    if (!user) {
      toast({ title: 'Sign in required', description: 'Please sign in first.', variant: 'destructive' });
      return;
    }
    if (!hasCompletedWaiver && !waiverLoading) {
      setPendingPurchaseType(purchaseType);
      setShowWaiverModal(true);
      return;
    }
    executePurchase(purchaseType);
  };

  const handleWaiverCompleted = async () => {
    const success = await markWaiverCompleted();
    if (success && pendingPurchaseType) {
      setShowWaiverModal(false);
      executePurchase(pendingPurchaseType);
      setPendingPurchaseType(null);
    }
    return success;
  };

  const executePurchase = (type: string) => {
    if (type === 'ticket') proceedWithTicketPurchase();
    else if (type === 'pass') proceedWithPassPurchase();
    else if (type === 'dj_donation') proceedWithDonation('dj', djDonationAmount);
    else if (type === 'cause_donation') proceedWithDonation('cause', causeDonationAmount);
  };

  const validateAffiliateCode = async (code: string) => {
    if (!code.trim()) { setAffiliateCodeValid(false); return; }
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
      } else {
        setAffiliateCodeValid(true);
        toast({ title: 'Code applied!', description: 'Your purchase will support this affiliate.' });
      }
    } catch { setAffiliateCodeValid(false); }
    finally { setValidatingCode(false); }
  };

  const openCheckoutUrl = (url: string) => {
    try {
      const w = window.open(url, '_blank');
      if (!w || w.closed) window.location.href = url;
    } catch {
      window.location.href = url;
    }
  };

  const proceedWithTicketPurchase = async () => {
    setProcessingTicket(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-ticket-payment', {
        body: { amount: ticketAmount * 100, affiliateCode: affiliateCode.trim() || null },
      });
      if (error) throw error;
      if (!data?.url) throw new Error('No payment URL');
      openCheckoutUrl(data.url);
    } catch (error: any) {
      toast({ title: 'Payment Error', description: error.message || 'Failed to create payment', variant: 'destructive' });
    } finally { setProcessingTicket(false); }
  };

  const proceedWithPassPurchase = async () => {
    setProcessingPass(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-monthly-subscription', { body: {} });
      if (error) throw error;
      openCheckoutUrl(data.url);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to create subscription', variant: 'destructive' });
    } finally { setProcessingPass(false); }
  };

  const proceedWithDonation = async (type: 'dj' | 'cause', amount: number) => {
    const setProcessing = type === 'dj' ? setProcessingDjDonation : setProcessingCauseDonation;
    setProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-donation-payment', {
        body: { amount: amount * 100, donationType: type },
      });
      if (error) throw error;
      if (!data?.url) throw new Error('No payment URL');
      openCheckoutUrl(data.url);
    } catch (error: any) {
      toast({ title: 'Donation Error', description: error.message || 'Failed to process donation', variant: 'destructive' });
    } finally { setProcessing(false); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const quickAmounts = isAtTheDoor ? [15, 20, 25, 50] : [10, 15, 20, 25, 50];
  const donationQuickAmounts = [5, 10, 20, 50];

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <WaiverBanner />
          
          {/* Header */}
          <motion.div 
            className="text-center mb-10 pt-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-2">
              Get Your Tickets
            </h1>
            <p className="text-muted-foreground text-base md:text-lg">
              Single events or unlimited monthly access
            </p>
          </motion.div>

          {/* Ticket Options */}
          <div className="grid md:grid-cols-2 gap-4 mb-12">
            
            {/* Single Event Ticket */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="h-full border-border/50 bg-card hover:border-primary/30 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Ticket className="w-4 h-4 text-primary" />
                    <Badge variant="outline" className="text-xs">Single Event</Badge>
                  </div>
                  <CardTitle className="text-xl">Event Ticket</CardTitle>
                  <CardDescription className="text-sm">
                    {isAtTheDoor
                      ? <span className="text-destructive font-medium">At-the-door price: $15 minimum</span>
                      : 'Sliding scale starting at $10 · $15 at the door (8pm)'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Quick amount buttons */}
                  <div className="flex gap-2 flex-wrap">
                    {quickAmounts.map((amt) => (
                      <Button
                        key={amt}
                        variant={ticketAmount === amt ? "default" : "outline"}
                        size="sm"
                        onClick={() => { setTicketAmount(amt); setTicketInputValue(String(amt)); }}
                        className="text-sm"
                      >
                        ${amt}
                      </Button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-muted-foreground">$</span>
                    <Input
                      type="number"
                      value={ticketInputValue}
                      onChange={(e) => setTicketInputValue(e.target.value)}
                      onBlur={(e) => {
                        const v = parseInt(e.target.value);
                        if (isNaN(v) || v < minTicketPrice) { setTicketAmount(minTicketPrice); setTicketInputValue(String(minTicketPrice)); }
                        else { setTicketAmount(v); setTicketInputValue(String(v)); }
                      }}
                      min={minTicketPrice}
                      className="text-lg font-semibold"
                    />
                  </div>

                  {/* Affiliate code */}
                  <div className="space-y-2 pt-2 border-t border-border/50">
                    <Label className="text-xs text-muted-foreground">Affiliate code</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="CODE"
                        value={affiliateCode}
                        onChange={(e) => { setAffiliateCode(e.target.value.toUpperCase()); setAffiliateCodeValid(false); }}
                        className="font-mono text-sm"
                      />
                      <Button 
                        variant="outline" size="sm"
                        onClick={() => validateAffiliateCode(affiliateCode)}
                        disabled={validatingCode || !affiliateCode.trim()}
                      >
                        {validatingCode ? '...' : 'Apply'}
                      </Button>
                    </div>
                    {affiliateCodeValid && (
                      <div className="flex items-center gap-1 text-xs text-success">
                        <CheckCircle className="w-3 h-3" />
                        Code applied
                      </div>
                    )}
                  </div>

                  <Button 
                    onClick={() => checkWaiverAndProceed('ticket')}
                    disabled={processingTicket || !user}
                    className="w-full py-5 text-base font-semibold"
                    size="lg"
                  >
                    {processingTicket ? 'Processing...' : `Get Ticket · $${ticketAmount}`}
                  </Button>
                  
                  {!user && (
                    <p className="text-xs text-muted-foreground text-center">
                      <Button variant="link" className="text-xs p-0 h-auto" onClick={() => navigate('/auth?redirect=/tickets')}>Sign in</Button> to purchase
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Monthly Pass */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Card className="h-full border-primary/20 bg-card relative">
                <div className="absolute top-3 right-3">
                  <Badge className="bg-primary text-primary-foreground text-xs">Best Value</Badge>
                </div>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-primary" />
                    <Badge variant="outline" className="text-xs">Monthly</Badge>
                  </div>
                  <CardTitle className="text-xl">Monthly Pass</CardTitle>
                  <CardDescription className="text-sm">
                    Unlimited access to all events
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-4">
                    <div className="text-4xl font-bold text-primary">$36</div>
                    <div className="text-sm text-muted-foreground mt-1">per month</div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    {['Unlimited event access', 'Member-only sessions', 'Community Discord', 'Priority booking'].map((perk) => (
                      <div key={perk} className="flex items-center gap-2 text-muted-foreground">
                        <div className="w-1 h-1 bg-primary rounded-full flex-shrink-0" />
                        {perk}
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    onClick={() => checkWaiverAndProceed('pass')}
                    disabled={processingPass || !user}
                    className="w-full py-5 text-base font-semibold"
                    size="lg"
                  >
                    {processingPass ? 'Processing...' : 'Get Monthly Pass'}
                  </Button>
                  
                  {!user && (
                    <p className="text-xs text-muted-foreground text-center">
                      <Button variant="link" className="text-xs p-0 h-auto" onClick={() => navigate('/auth?redirect=/tickets')}>Sign in</Button> to subscribe
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Upcoming Events */}
          {events.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-12"
            >
              <h2 className="font-display text-2xl font-bold mb-4">Upcoming Events</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {events.map((event) => (
                  <Card key={event.id} className="bg-card border-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base line-clamp-1">{event.title}</CardTitle>
                      {event.subtitle && <CardDescription className="text-xs">{event.subtitle}</CardDescription>}
                    </CardHeader>
                    <CardContent className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {event.time}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {event.location}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {/* Donation Section — Two Piles */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <div className="text-center mb-6">
              <h2 className="font-display text-2xl font-bold text-foreground mb-1">
                Support the Community
              </h2>
              <p className="text-muted-foreground text-sm">
                Show love to the people who make SkateBurn happen
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {/* DJ Donation */}
              <Card className="border-border/50 bg-card">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Music className="w-4 h-4 text-primary" />
                    <Badge variant="outline" className="text-xs">DJ Fund</Badge>
                  </div>
                  <CardTitle className="text-lg">Support Our DJs</CardTitle>
                  <CardDescription className="text-sm">
                    Tip the DJs who bring the energy every Tuesday
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2 flex-wrap">
                    {donationQuickAmounts.map((amt) => (
                      <Button
                        key={amt}
                        variant={djDonationAmount === amt ? "default" : "outline"}
                        size="sm"
                        onClick={() => { setDjDonationAmount(amt); setDjDonationInput(String(amt)); }}
                        className="text-sm"
                      >
                        ${amt}
                      </Button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-muted-foreground">$</span>
                    <Input
                      type="number"
                      value={djDonationInput}
                      onChange={(e) => setDjDonationInput(e.target.value)}
                      onBlur={(e) => {
                        const v = parseInt(e.target.value);
                        if (isNaN(v) || v < 1) { setDjDonationAmount(1); setDjDonationInput('1'); }
                        else { setDjDonationAmount(v); setDjDonationInput(String(v)); }
                      }}
                      min="1"
                      className="text-lg font-semibold"
                    />
                  </div>
                  <Button 
                    onClick={() => checkWaiverAndProceed('dj_donation')}
                    disabled={processingDjDonation || !user}
                    className="w-full py-5 font-semibold"
                    size="lg"
                  >
                    {processingDjDonation ? 'Processing...' : `Tip DJ · $${djDonationAmount}`}
                  </Button>
                </CardContent>
              </Card>

              {/* Community/Cause Donation */}
              <Card className="border-border/50 bg-card">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <Badge variant="outline" className="text-xs">Community</Badge>
                  </div>
                  <CardTitle className="text-lg">Support the Cause</CardTitle>
                  <CardDescription className="text-sm">
                    Help grow SkateBurn and keep the community thriving
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2 flex-wrap">
                    {donationQuickAmounts.map((amt) => (
                      <Button
                        key={amt}
                        variant={causeDonationAmount === amt ? "default" : "outline"}
                        size="sm"
                        onClick={() => { setCauseDonationAmount(amt); setCauseDonationInput(String(amt)); }}
                        className="text-sm"
                      >
                        ${amt}
                      </Button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-muted-foreground">$</span>
                    <Input
                      type="number"
                      value={causeDonationInput}
                      onChange={(e) => setCauseDonationInput(e.target.value)}
                      onBlur={(e) => {
                        const v = parseInt(e.target.value);
                        if (isNaN(v) || v < 1) { setCauseDonationAmount(1); setCauseDonationInput('1'); }
                        else { setCauseDonationAmount(v); setCauseDonationInput(String(v)); }
                      }}
                      min="1"
                      className="text-lg font-semibold"
                    />
                  </div>
                  <Button 
                    onClick={() => checkWaiverAndProceed('cause_donation')}
                    disabled={processingCauseDonation || !user}
                    className="w-full py-5 font-semibold"
                    size="lg"
                  >
                    {processingCauseDonation ? 'Processing...' : `Donate · $${causeDonationAmount}`}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {!user && (
              <p className="text-xs text-muted-foreground text-center mt-4">
                <Button variant="link" className="text-xs p-0 h-auto" onClick={() => navigate('/auth?redirect=/tickets')}>Sign in</Button> to donate
              </p>
            )}
          </motion.div>
        </div>
      </div>

      <WaiverModal
        isOpen={showWaiverModal}
        onClose={() => { setShowWaiverModal(false); setPendingPurchaseType(null); }}
        onWaiverCompleted={handleWaiverCompleted}
      />
    </div>
  );
};

export default Tickets;
