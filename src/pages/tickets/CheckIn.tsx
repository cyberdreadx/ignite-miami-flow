// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, XCircle, Loader2, Ticket, LogIn } from 'lucide-react';
import NavBar from '@/components/layout/NavBar';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const CheckIn: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [ticket, setTicket] = useState<any>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      checkTicket();
    }
  }, [user, authLoading]);

  const checkTicket = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('tickets')
        .select('id, status, used_at, used_by, created_at, amount, qr_code')
        .eq('user_id', user!.id)
        .in('status', ['active', 'paid'])
        .is('used_at', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      setTicket(data);
    } catch (e) {
      setTicket(null);
    } finally {
      setLoading(false);
      setChecked(true);
    }
  };

  // --- Loading auth ---
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <NavBar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // --- Not logged in ---
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <NavBar />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-sm">
            <Ticket className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-3xl font-black mb-3">Check In</h1>
            <p className="text-muted-foreground mb-6">
              Log in to verify your ticket for entry.
            </p>
            <Button
              size="lg"
              className="w-full"
              onClick={() => navigate('/auth?redirect=/checkin')}
            >
              <LogIn className="w-5 h-5 mr-2" />
              Log In to Check In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // --- Valid ticket ---
  if (ticket) {
    return (
      <div className="min-h-screen bg-green-50 flex flex-col">
        <NavBar />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-sm w-full">
            <CheckCircle className="w-28 h-28 text-green-500 mx-auto mb-4" />
            <h1 className="text-6xl font-black text-green-600 mb-4">VALID</h1>
            <div className="bg-white rounded-2xl shadow-md p-6 text-left space-y-2">
              <p className="text-sm text-muted-foreground">Ticket ID</p>
              <p className="font-mono text-xs text-foreground break-all">{ticket.id}</p>
              <p className="text-sm text-muted-foreground pt-2">Purchased</p>
              <p className="font-semibold">{new Date(ticket.created_at).toLocaleDateString()}</p>
              <p className="text-sm text-muted-foreground pt-2">Amount Paid</p>
              <p className="font-semibold">${(ticket.amount / 100).toFixed(2)}</p>
            </div>
            <p className="mt-4 text-green-700 text-sm font-medium">Show this screen to staff 👆</p>
          </div>
        </div>
      </div>
    );
  }

  // --- No valid ticket ---
  return (
    <div className="min-h-screen bg-red-50 flex flex-col">
      <NavBar />
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <XCircle className="w-28 h-28 text-red-500 mx-auto mb-4" />
          <h1 className="text-5xl font-black text-red-600 mb-3">NO TICKET</h1>
          <p className="text-red-500 mb-6">No valid unused ticket found for your account.</p>
          <Button size="lg" className="w-full" onClick={() => navigate('/tickets')}>
            Buy a Ticket
          </Button>
        </div>
      </div>
    </div>
  );
};
