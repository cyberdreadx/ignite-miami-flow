import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  QrCode, 
  Ticket, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Copy,
  ExternalLink,
  Database
} from 'lucide-react';

interface UserTicket {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  valid_until: string;
  qr_code_token: string | null;
}

export const DatabaseQRManager: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState<UserTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<UserTicket | null>(null);
  const [generatedToken, setGeneratedToken] = useState<string>('');
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchUserTickets = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('id, amount, status, created_at, valid_until, qr_code_token')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch tickets',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserTickets();
  }, [user]);

  const generateQRToken = async () => {
    setLoading(true);
    try {
      // Generate a new QR token using the database function
      const { data: token, error } = await supabase.rpc('generate_qr_token');
      
      if (error) throw error;
      
      setGeneratedToken(token);
      toast({
        title: 'QR Token Generated',
        description: 'New QR token generated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Generation Failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const assignTokenToTicket = async (ticketId: string, token: string) => {
    setLoading(true);
    try {
      // Update the ticket with the QR token
      const { error } = await supabase
        .from('tickets')
        .update({ qr_code_token: token })
        .eq('id', ticketId)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: 'QR Code Assigned',
        description: 'QR code successfully assigned to ticket',
      });

      // Refresh tickets
      await fetchUserTickets();
      setGeneratedToken('');
    } catch (error: any) {
      toast({
        title: 'Assignment Failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const testQRToken = async (token: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('verify_qr_token', { token });
      
      if (error) throw error;

      const result = Array.isArray(data) ? data[0] : data;
      
      toast({
        title: 'QR Test Result',
        description: result?.is_valid ? 'QR code is valid' : 'QR code is invalid',
        variant: result?.is_valid ? 'default' : 'destructive'
      });
    } catch (error: any) {
      toast({
        title: 'Test Failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const copyQRUrl = (token: string) => {
    const url = `${window.location.origin}/verify?token=${token}`;
    navigator.clipboard.writeText(url);
    toast({
      title: 'URL Copied',
      description: 'QR verification URL copied to clipboard',
    });
  };

  const openQRPage = (token: string) => {
    const url = `${window.location.origin}/verify?token=${token}`;
    window.open(url, '_blank');
  };

  if (!user) {
    return (
      <Alert>
        <AlertDescription>
          Please sign in to access QR code management.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Alert>
        <Database className="h-4 w-4" />
        <AlertDescription>
          <strong>Database-Based QR Management</strong> - This uses database functions directly, 
          bypassing the need for Edge Functions.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Generate QR Token
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={generateQRToken} disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <QrCode className="w-4 h-4 mr-2" />
              )}
              Generate New Token
            </Button>
          </div>

          {generatedToken && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Generated Token:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-2 bg-background rounded text-sm">
                  {generatedToken}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyQRUrl(generatedToken)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => testQRToken(generatedToken)}
                >
                  Test
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="w-5 h-5" />
            Your Tickets
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={fetchUserTickets} variant="outline" disabled={loading}>
            <Loader2 className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Tickets
          </Button>

          <div className="space-y-3">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">${(ticket.amount / 100).toFixed(2)}</Badge>
                      <Badge variant={ticket.status === 'paid' ? 'default' : 'secondary'}>
                        {ticket.status}
                      </Badge>
                      <Badge variant={ticket.qr_code_token ? 'default' : 'destructive'}>
                        {ticket.qr_code_token ? 'Has QR' : 'No QR'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Created: {new Date(ticket.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {ticket.qr_code_token ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <code className="flex-1 p-2 bg-muted rounded text-xs">
                        {ticket.qr_code_token}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyQRUrl(ticket.qr_code_token!)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openQRPage(ticket.qr_code_token!)}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => testQRToken(ticket.qr_code_token!)}
                      >
                        Test
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {generatedToken ? (
                      <Button
                        size="sm"
                        onClick={() => assignTokenToTicket(ticket.id, generatedToken)}
                        disabled={loading}
                      >
                        Assign Generated Token
                      </Button>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Generate a token above to assign to this ticket
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};