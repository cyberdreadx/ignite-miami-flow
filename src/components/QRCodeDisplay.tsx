import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, QrCode, Download } from 'lucide-react';

interface QRCodeDisplayProps {
  ticketId?: string;
  subscriptionId?: string;
  type: 'ticket' | 'subscription';
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ 
  ticketId, 
  subscriptionId, 
  type 
}) => {
  const [qrCodeData, setQrCodeData] = useState<string>('');
  const [qrCodeToken, setQrCodeToken] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const { toast } = useToast();

  const generateQRCode = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-qr-code', {
        body: {
          ticket_id: ticketId,
          subscription_id: subscriptionId
        }
      });

      if (error) throw error;

      setQrCodeData(data.qr_code_data);
      setQrCodeToken(data.qr_code_token);

      // Generate QR code URL that links to the public verification page
      const publicUrl = `${window.location.origin}/ticket?token=${encodeURIComponent(data.qr_code_token)}`;
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(publicUrl)}`;
      setQrCodeUrl(qrUrl);

      toast({
        title: "QR Code Generated",
        description: "Your QR code is ready for use at the door.",
      });

    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: "Error",
        description: "Failed to generate QR code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.href = qrCodeUrl;
      link.download = `qr-code-${type}-${qrCodeToken}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  useEffect(() => {
    if ((ticketId || subscriptionId) && !qrCodeData) {
      generateQRCode();
    }
  }, [ticketId, subscriptionId]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="w-5 h-5" />
          {type === 'ticket' ? 'Event Ticket' : 'Monthly Pass'} QR Code
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        {loading ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-sm text-muted-foreground">Generating QR code...</p>
          </div>
        ) : qrCodeUrl ? (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg inline-block">
              <img 
                src={qrCodeUrl} 
                alt="QR Code" 
                className="w-64 h-64 mx-auto"
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Show this QR code at the door for entry
              </p>
              <p className="text-xs text-muted-foreground break-all">
                Token: {qrCodeToken}
              </p>
            </div>
            <Button 
              onClick={downloadQRCode}
              variant="outline"
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Download QR Code
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Generate a QR code for easy entry at events
            </p>
            <Button onClick={generateQRCode} className="w-full">
              <QrCode className="w-4 h-4 mr-2" />
              Generate QR Code
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};