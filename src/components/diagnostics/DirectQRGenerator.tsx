import React, { useState } from 'react';
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
  CheckCircle, 
  XCircle, 
  Loader2,
  Copy,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';

export const DirectQRGenerator: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [ticketId, setTicketId] = useState('');
  const [generatedQR, setGeneratedQR] = useState<{
    token: string;
    url: string;
    ticketId: string;
  } | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const generateQRForTicket = async () => {
    if (!ticketId.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a ticket ID',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      // First, verify the ticket exists and belongs to the user
      const { data: ticket, error: ticketError } = await supabase
        .from('tickets')
        .select('id, status, qr_code_token, amount')
        .eq('id', ticketId)
        .eq('user_id', user?.id)
        .single();

      if (ticketError || !ticket) {
        throw new Error('Ticket not found or access denied');
      }

      if (ticket.qr_code_token) {
        // Ticket already has a QR code
        const url = `${window.location.origin}/verify?token=${ticket.qr_code_token}`;
        setGeneratedQR({
          token: ticket.qr_code_token,
          url,
          ticketId: ticket.id
        });
        
        toast({
          title: 'QR Code Retrieved',
          description: 'Ticket already has a QR code',
        });
        return;
      }

      // Generate new QR token
      const { data: token, error: tokenError } = await supabase.rpc('generate_qr_token');
      
      if (tokenError || !token) {
        throw new Error('Failed to generate QR token');
      }

      // Update ticket with QR token
      const { error: updateError } = await supabase
        .from('tickets')
        .update({ qr_code_token: token })
        .eq('id', ticketId)
        .eq('user_id', user?.id);

      if (updateError) {
        throw new Error('Failed to assign QR token to ticket');
      }

      const url = `${window.location.origin}/verify?token=${token}`;
      setGeneratedQR({
        token,
        url,
        ticketId: ticket.id
      });

      toast({
        title: 'QR Code Generated',
        description: 'QR code successfully generated and assigned',
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

  const testQRCode = async () => {
    if (!generatedQR) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('verify_qr_token', { 
        token: generatedQR.token 
      });
      
      if (error) throw error;

      const result = Array.isArray(data) ? data[0] : data;
      
      toast({
        title: 'QR Test Result',
        description: result?.is_valid ? 'QR code is valid ✅' : 'QR code is invalid ❌',
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

  const copyUrl = () => {
    if (!generatedQR) return;
    navigator.clipboard.writeText(generatedQR.url);
    toast({
      title: 'URL Copied',
      description: 'QR verification URL copied to clipboard',
    });
  };

  const openQRPage = () => {
    if (!generatedQR) return;
    window.open(generatedQR.url, '_blank');
  };

  if (!user) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Please sign in to generate QR codes.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="w-5 h-5" />
          Direct QR Code Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            This bypasses the Edge Function and generates QR codes directly using database functions.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <label className="text-sm font-medium">Ticket ID</label>
          <div className="flex gap-2">
            <Input
              placeholder="Enter ticket ID..."
              value={ticketId}
              onChange={(e) => setTicketId(e.target.value)}
              className="flex-1"
            />
            <Button onClick={generateQRForTicket} disabled={loading || !ticketId.trim()}>
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <QrCode className="w-4 h-4 mr-2" />
              )}
              Generate
            </Button>
          </div>
        </div>

        {generatedQR && (
          <div className="p-4 border rounded-lg bg-muted/50">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium">QR Code Generated</span>
                <Badge variant="outline">Ticket: {generatedQR.ticketId.substring(0, 8)}...</Badge>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">QR Token:</label>
                <code className="block p-2 bg-background rounded text-sm break-all">
                  {generatedQR.token}
                </code>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Verification URL:</label>
                <code className="block p-2 bg-background rounded text-sm break-all">
                  {generatedQR.url}
                </code>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={copyUrl}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy URL
                </Button>
                <Button size="sm" variant="outline" onClick={openQRPage}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Page
                </Button>
                <Button size="sm" onClick={testQRCode} disabled={loading}>
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  Test QR
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <p><strong>How to find your Ticket ID:</strong></p>
          <p>• Go to Admin → System Diagnostics → DB QR Manager</p>
          <p>• Or check your tickets in the database</p>
          <p>• Ticket IDs are UUIDs like: 123e4567-e89b-12d3-a456-426614174000</p>
        </div>
      </CardContent>
    </Card>
  );
};