import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, QrCode, Download, RefreshCw, AlertTriangle } from 'lucide-react';

interface EnhancedQRCodeDisplayProps {
  ticketId?: string;
  subscriptionId?: string;
  mediaPassId?: string;
  type: 'ticket' | 'subscription' | 'media_pass';
  existingToken?: string;
}

export const EnhancedQRCodeDisplay: React.FC<EnhancedQRCodeDisplayProps> = ({ 
  ticketId, 
  subscriptionId, 
  mediaPassId,
  type,
  existingToken
}) => {
  const [qrCodeData, setQrCodeData] = useState<string>('');
  const [qrCodeToken, setQrCodeToken] = useState<string>(existingToken || '');
  const [loading, setLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();

  const generateQRCode = useCallback(async (isRetry = false) => {
    if (!isRetry) {
      setLoading(true);
      setError('');
    }
    
    try {
      const payload: any = {};
      
      if (ticketId) {
        payload.ticket_id = ticketId;
      } else if (subscriptionId) {
        payload.subscription_id = subscriptionId;
      } else if (mediaPassId) {
        payload.media_pass_id = mediaPassId;
      }

      console.log('Generating QR code with payload:', payload);

      const { data, error } = await supabase.functions.invoke('generate-qr-code', {
        body: payload
      });

      if (error) {
        console.error('QR generation error:', error);
        throw new Error(error.message || 'Failed to generate QR code');
      }

      if (!data || !data.qr_code_token) {
        throw new Error('Invalid response from QR code generation service');
      }

      setQrCodeData(data.qr_code_data || '');
      setQrCodeToken(data.qr_code_token);

      // Create the public verification URL
      const baseUrl = window.location.origin;
      const publicUrl = data.qr_code_url || `${baseUrl}/verify?token=${encodeURIComponent(data.qr_code_token)}`;
      
      // Generate QR code image URL with error correction
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&ecc=M&data=${encodeURIComponent(publicUrl)}`;
      setQrCodeUrl(qrUrl);

      setError('');
      setRetryCount(0);

      toast({
        title: "QR Code Generated Successfully",
        description: "Your QR code is ready for use at the door.",
      });

    } catch (error) {
      console.error('Error generating QR code:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate QR code';
      setError(errorMessage);
      
      if (retryCount < 2) {
        setRetryCount(prev => prev + 1);
        toast({
          title: "Retrying...",
          description: `Attempt ${retryCount + 2} of 3`,
        });
        setTimeout(() => generateQRCode(true), 2000);
      } else {
        toast({
          title: "QR Code Generation Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [ticketId, subscriptionId, mediaPassId, retryCount, toast]);

  const downloadQRCode = async () => {
    if (!qrCodeUrl) return;
    
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `qr-code-${type}-${qrCodeToken.substring(0, 8)}.png`;
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "QR Code Downloaded",
        description: "QR code saved to your device",
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: "Could not download QR code. Please try again.",
        variant: "destructive",
      });
    }
  };

  const testQRCode = async () => {
    if (!qrCodeToken) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('verify-ticket-public', {
        body: { qr_code_token: qrCodeToken }
      });

      if (error) throw error;

      if (data.valid !== false && (data.user_name || data.valid === true)) {
        toast({
          title: "QR Code Test Passed ✅",
          description: "QR code is working correctly",
        });
      } else {
        toast({
          title: "QR Code Test Failed ❌",
          description: data.reason || "QR code verification failed",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('QR test error:', error);
      toast({
        title: "Test Failed",
        description: "Could not test QR code",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if ((ticketId || subscriptionId || mediaPassId) && !qrCodeToken && !loading) {
      generateQRCode();
    }
  }, [ticketId, subscriptionId, mediaPassId, qrCodeToken, loading, generateQRCode]);

  const getTypeLabel = () => {
    switch (type) {
      case 'ticket': return 'Event Ticket';
      case 'subscription': return 'Monthly Pass';
      case 'media_pass': return 'Media Pass';
      default: return 'QR Code';
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="w-5 h-5" />
          {getTypeLabel()} QR Code
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-sm text-muted-foreground">
              {retryCount > 0 ? `Retrying... (${retryCount}/2)` : 'Generating QR code...'}
            </p>
          </div>
        ) : qrCodeUrl && qrCodeToken ? (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg inline-block shadow-sm">
              <img 
                src={qrCodeUrl} 
                alt="QR Code" 
                className="w-64 h-64 mx-auto"
                onError={() => {
                  setError('Failed to load QR code image');
                  toast({
                    title: "Image Load Failed",
                    description: "QR code image could not be displayed",
                    variant: "destructive",
                  });
                }}
              />
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Show this QR code at the door for entry
              </p>
              <p className="text-xs text-muted-foreground break-all font-mono bg-gray-100 p-2 rounded">
                Token: {qrCodeToken}
              </p>
            </div>
            
            <div className="flex flex-col gap-2">
              <Button 
                onClick={downloadQRCode}
                variant="outline"
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Download QR Code
              </Button>
              
              <Button 
                onClick={testQRCode}
                variant="outline"
                className="w-full"
                size="sm"
              >
                Test QR Code
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Generate a QR code for easy entry at events
            </p>
            <Button 
              onClick={() => generateQRCode()} 
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <QrCode className="w-4 h-4 mr-2" />
              )}
              {error ? 'Retry QR Generation' : 'Generate QR Code'}
            </Button>
            
            {error && (
              <Button 
                onClick={() => {
                  setError('');
                  setRetryCount(0);
                  generateQRCode();
                }}
                variant="outline" 
                className="w-full"
                size="sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};