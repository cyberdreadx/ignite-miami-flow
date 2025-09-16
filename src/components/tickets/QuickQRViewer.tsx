import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { QrCode, ExternalLink, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const QuickQRViewer: React.FC = () => {
  const [qrToken, setQrToken] = useState('');
  const { toast } = useToast();

  const generateQRUrl = (token: string) => {
    return `${window.location.origin}/verify?token=${token}`;
  };

  const copyUrl = () => {
    if (!qrToken.trim()) return;
    
    const url = generateQRUrl(qrToken);
    navigator.clipboard.writeText(url);
    toast({
      title: "URL Copied",
      description: "QR verification URL copied to clipboard",
    });
  };

  const openQRPage = () => {
    if (!qrToken.trim()) return;
    
    const url = generateQRUrl(qrToken);
    window.open(url, '_blank');
  };

  const openValidationPage = () => {
    window.open('/validate', '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="w-5 h-5" />
          Quick QR Access
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">QR Code Token</label>
          <div className="flex gap-2">
            <Input
              placeholder="Enter QR code token..."
              value={qrToken}
              onChange={(e) => setQrToken(e.target.value)}
              className="flex-1"
            />
            <Button
              variant="outline"
              onClick={copyUrl}
              disabled={!qrToken.trim()}
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              onClick={openQRPage}
              disabled={!qrToken.trim()}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View
            </Button>
          </div>
        </div>

        <div className="border-t pt-4">
          <p className="text-sm text-muted-foreground mb-3">
            Quick access to validation tools:
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={openValidationPage}
              className="flex-1"
            >
              <QrCode className="w-4 h-4 mr-2" />
              QR Scanner
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open('/my-tickets', '_blank')}
              className="flex-1"
            >
              View All Tickets
            </Button>
          </div>
        </div>

        {qrToken.trim() && (
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Generated URL:</p>
            <code className="text-xs break-all">
              {generateQRUrl(qrToken)}
            </code>
          </div>
        )}
      </CardContent>
    </Card>
  );
};