// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/contexts/UserRoleContext';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, User, Calendar, AlertCircle } from 'lucide-react';
import NavBar from '@/components/layout/NavBar';
import { useToast } from '@/hooks/use-toast';

export const VerifyTicket: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [ticket, setTicket] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { hasRole } = useUserRoles();
  const { toast } = useToast();

  const qrToken = searchParams.get('token') || searchParams.get('qr_code_token') || '';
  const canMarkAsUsed = user && (hasRole('admin') || hasRole('moderator'));

  useEffect(() => {
    if (!qrToken) {
      setError('No QR token provided');
      setLoading(false);
      return;
    }
    fetchTicket();
  }, [qrToken]);

  const fetchTicket = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('id, user_id, amount, status, created_at, used_at, used_by, qr_code')
        .eq('qr_code', qrToken)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        setError('Ticket not found');
        setLoading(false);
        return;
      }

      setTicket(data);

      // Fetch profile separately
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('user_id', data.user_id)
        .maybeSingle();

      setProfile(profileData);
    } catch (err: any) {
      setError(err.message || 'Failed to verify ticket');
    } finally {
      setLoading(false);
    }
  };

  const markAsUsed = async () => {
    if (!ticket || !user) return;
    setMarking(true);
    try {
      const { error } = await supabase
        .from('tickets')
        .update({
          used_at: new Date().toISOString(),
          used_by: profile?.full_name || user.email || 'Door Staff'
        })
        .eq('id', ticket.id);

      if (error) throw error;

      setTicket((prev: any) => ({ ...prev, used_at: new Date().toISOString(), used_by: user.email }));
      toast({ title: '✅ Ticket marked as used' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setMarking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <NavBar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-red-50 flex flex-col">
        <NavBar />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <XCircle className="w-24 h-24 text-red-500 mx-auto mb-4" />
            <h1 className="text-5xl font-black text-red-600 mb-3">INVALID</h1>
            <p className="text-red-500 text-lg">{error || 'Ticket not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  const isAlreadyUsed = !!ticket.used_at;
  const isValid = (ticket.status === 'active' || ticket.status === 'paid') && !isAlreadyUsed;
  const holderName = profile?.full_name || profile?.email || 'Unknown';

  if (isAlreadyUsed) {
    return (
      <div className="min-h-screen bg-yellow-50 flex flex-col">
        <NavBar />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <AlertCircle className="w-24 h-24 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-4xl font-black text-yellow-600 mb-3">ALREADY USED</h1>
            <p className="text-yellow-700 text-lg mb-2">{holderName}</p>
            <p className="text-yellow-600 text-sm">
              Used on {new Date(ticket.used_at).toLocaleString()}
              {ticket.used_by && ` by ${ticket.used_by}`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="min-h-screen bg-red-50 flex flex-col">
        <NavBar />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <XCircle className="w-24 h-24 text-red-500 mx-auto mb-4" />
            <h1 className="text-5xl font-black text-red-600 mb-3">INVALID</h1>
            <p className="text-red-500 text-lg">Ticket status: {ticket.status}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 flex flex-col">
      <NavBar />
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-sm w-full">
          <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-4" />
          <h1 className="text-5xl font-black text-green-600 mb-6">APPROVED</h1>

          <div className="bg-white rounded-2xl shadow-md p-6 mb-6 text-left space-y-3">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-muted-foreground shrink-0" />
              <span className="font-semibold text-lg">{holderName}</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground text-sm">
                Purchased {new Date(ticket.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground text-sm">Amount:</span>
              <span className="font-semibold">${(ticket.amount / 100).toFixed(2)}</span>
            </div>
          </div>

          {canMarkAsUsed && (
            <Button
              onClick={markAsUsed}
              disabled={marking}
              size="lg"
              className="w-full text-lg py-6 bg-green-600 hover:bg-green-700"
            >
              {marking ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <CheckCircle className="w-5 h-5 mr-2" />
              )}
              Mark as Used & Let In
            </Button>
          )}

          {!canMarkAsUsed && (
            <p className="text-sm text-muted-foreground mt-2">
              Log in as admin or moderator to check in this ticket
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
