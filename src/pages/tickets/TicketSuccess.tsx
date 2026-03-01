import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Loader2, XCircle, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import NavBar from '@/components/layout/NavBar';

type Status = 'loading' | 'success' | 'already_exists' | 'error';

const TicketSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) {
      navigate('/tickets');
      return;
    }

    const createTicket = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        const { data, error } = await supabase.functions.invoke('verify-and-create-ticket', {
          body: { sessionId, userEmail: session?.user?.email },
        });

        if (error) throw new Error(error.message);

        if (data?.message === 'Ticket already exists') {
          setStatus('already_exists');
        } else if (data?.success) {
          setStatus('success');
        } else {
          throw new Error(data?.error || 'Unknown error');
        }
      } catch (err: any) {
        console.error('Ticket creation error:', err);
        setErrorMessage(err.message || 'Something went wrong. Your payment may have been successful.');
        setStatus('error');
      }
    };

    createTicket();
  }, [sessionId, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <div className="pt-24 pb-16 flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md mx-auto px-6"
        >
          {status === 'loading' && (
            <>
              <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto mb-6" />
              <h1 className="text-2xl font-bold mb-2">Processing your ticket…</h1>
              <p className="text-muted-foreground">Confirming your payment and generating your QR code.</p>
            </>
          )}

          {(status === 'success' || status === 'already_exists') && (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              >
                <CheckCircle className="w-20 h-20 text-primary mx-auto mb-6" />
              </motion.div>
              <h1 className="text-3xl font-bold mb-3">
                {status === 'success' ? "You're in! 🔥" : "Ticket Ready! 🎟️"}
              </h1>
              <p className="text-muted-foreground mb-8">
                {status === 'success'
                  ? 'Your ticket has been created and your QR code is ready.'
                  : 'Your ticket is already set up and waiting for you.'}
              </p>
              <div className="flex flex-col gap-3">
                <Button
                  size="lg"
                  onClick={() => navigate('/my-tickets')}
                  className="flex items-center gap-2"
                >
                  <Ticket className="w-5 h-5" />
                  View My Tickets & QR Code
                </Button>
                <Button variant="outline" onClick={() => navigate('/')}>
                  Back to Home
                </Button>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="w-16 h-16 text-destructive mx-auto mb-6" />
              <h1 className="text-2xl font-bold mb-3">Something went wrong</h1>
              <p className="text-muted-foreground mb-2">{errorMessage}</p>
              <p className="text-sm text-muted-foreground mb-8">
                Your payment may still have gone through. Check "My Tickets" or use the recover button there.
              </p>
              <div className="flex flex-col gap-3">
                <Button onClick={() => navigate('/my-tickets')}>
                  Check My Tickets
                </Button>
                <Button variant="outline" onClick={() => navigate('/tickets')}>
                  Back to Tickets
                </Button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default TicketSuccess;
