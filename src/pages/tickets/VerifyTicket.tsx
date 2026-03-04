// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, User, Calendar, AlertCircle } from 'lucide-react';
import NavBar from '@/components/layout/NavBar';
import { useToast } from '@/hooks/use-toast';

export const VerifyTicket: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const qrToken = searchParams.get('token') || searchParams.get('qr_code_token') || '';

  useEffect(() => {
    if (!qrToken) {
      setError('No QR token provided');
      setLoading(false);
      return;
    }
    verifyTicket();
  }, [qrToken]);

  const verifyTicket = async () => {
    setLoading(true);
    try {
      // Use edge function with service role — works even if visitor is not logged in
      const { data, error: fnError } = await supabase.functions.invoke('validate-qr-code', {
        body: { qr_code_token: qrToken, validator_name: 'Door Scan', mark_as_used: false }
      });

      if (fnError) throw fnError;
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to verify ticket');
    } finally {
      setLoading(false);
    }
  };

  const markAsUsed = async () => {
    setMarking(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('validate-qr-code', {
        body: { qr_code_token: qrToken, validator_name: 'Door Staff', mark_as_used: true }
      });

      if (fnError) throw fnError;

      if (data?.valid) {
        setResult({ ...data, justMarked: true });
        toast({ title: '✅ Ticket marked as used — let them in!' });
      } else {
        toast({ title: 'Error', description: data?.reason || 'Failed to mark ticket', variant: 'destructive' });
      }
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

  if (error || !result) {
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

  if (!result.valid) {
    const isUsed = result.used_at || result.reason?.toLowerCase().includes('already used');
    return (
      <div className={`min-h-screen flex flex-col ${isUsed ? 'bg-yellow-50' : 'bg-red-50'}`}>
        <NavBar />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            {isUsed ? (
              <>
                <AlertCircle className="w-24 h-24 text-yellow-500 mx-auto mb-4" />
                <h1 className="text-4xl font-black text-yellow-600 mb-3">ALREADY USED</h1>
                {result.used_at && (
                  <p className="text-yellow-600 text-sm">
                    Used on {new Date(result.used_at).toLocaleString()}
                    {result.used_by && ` by ${result.used_by}`}
                  </p>
                )}
              </>
            ) : (
              <>
                <XCircle className="w-24 h-24 text-red-500 mx-auto mb-4" />
                <h1 className="text-5xl font-black text-red-600 mb-3">INVALID</h1>
                <p className="text-red-500 text-lg">{result.reason}</p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  const info = result.ticket_info || result.subscription_info;
  const isSubscription = result.type === 'subscription';

  return (
    <div className="min-h-screen bg-green-50 flex flex-col">
      <NavBar />
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-sm w-full">
          <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-4" />
          <h1 className="text-5xl font-black text-green-600 mb-6">
            {result.justMarked ? 'LET IN ✓' : 'APPROVED'}
          </h1>

          {info && (
            <div className="bg-white rounded-2xl shadow-md p-6 mb-6 text-left space-y-3">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-muted-foreground shrink-0" />
                <span className="font-semibold text-lg">{info.user_name || 'Unknown'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground text-sm">
                  {isSubscription ? 'Monthly Pass' : 'Event Ticket'}
                  {info.created_at && ` — Purchased ${new Date(info.created_at).toLocaleDateString()}`}
                </span>
              </div>
            </div>
          )}

          {!result.justMarked && (
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
        </div>
      </div>
    </div>
  );
};
