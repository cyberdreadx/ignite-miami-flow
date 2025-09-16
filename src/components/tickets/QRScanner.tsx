import { useState, useEffect } from 'react';
import { Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import QrScanner from 'react-qr-scanner';

interface QRScannerProps {
  onScan: (data: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const QRScanner = ({ onScan, isOpen, onClose }: QRScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>('');

  const handleScan = (data: any) => {
    if (data) {
      console.log('QR code scanned:', data.text);
      onScan(data.text);
      toast.success('QR code scanned successfully!');
    }
  };

  const handleError = (err: any) => {
    console.error('QR Scanner error:', err);
    setError('Camera access denied or not available');
    toast.error('Camera access denied or not available');
  };

  const startScanning = () => {
    setIsScanning(true);
    setError('');
  };

  const stopScanning = () => {
    setIsScanning(false);
    setError('');
  };

  const handleClose = () => {
    console.log('Closing scanner...');
    stopScanning();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }} modal={true}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Scan QR Code
          </DialogTitle>
          <DialogDescription>
            Position your camera over a QR code to scan it automatically
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
              {error}
            </div>
          )}
          
          {!isScanning ? (
            <div className="text-center py-8">
              <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                Click the button below to start scanning QR codes
              </p>
              <Button onClick={startScanning} disabled={!!error}>
                Start Camera
              </Button>
            </div>
          ) : (
            <div className="relative bg-black rounded-lg overflow-hidden">
              <QrScanner
                delay={300}
                onScan={handleScan}
                onError={handleError}
                style={{ width: '100%', height: '300px' }}
                facingMode="environment"
              />
              <div className="absolute inset-0 border-2 border-primary rounded-lg pointer-events-none">
                <div className="absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 border-primary"></div>
                <div className="absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 border-primary"></div>
                <div className="absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 border-primary"></div>
                <div className="absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 border-primary"></div>
              </div>
              <div className="absolute bottom-2 left-2 right-2 text-center">
                <p className="text-white text-sm bg-black/50 rounded px-2 py-1">
                  Point camera at QR code
                </p>
              </div>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              <X className="w-4 h-4 mr-2" />
              {isScanning ? 'Stop & Close' : 'Cancel'}
            </Button>
            {isScanning && (
              <Button onClick={stopScanning} variant="secondary" className="flex-1">
                Stop Camera
              </Button>
            )}
          </div>
          
          <p className="text-xs text-muted-foreground text-center">
            {isScanning 
              ? "Position the QR code within the frame to scan" 
              : "Camera access is required to scan QR codes"
            }
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRScanner;