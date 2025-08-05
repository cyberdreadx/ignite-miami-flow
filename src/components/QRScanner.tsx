import { useState, useRef, useEffect } from 'react';
import { Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface QRScannerProps {
  onScan: (data: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const QRScanner = ({ onScan, isOpen, onClose }: QRScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Cleanup on unmount or when dialog closes
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    console.log('Starting camera...');
    setError('');
    
    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported on this device');
      }

      const constraints = {
        video: {
          facingMode: 'environment', // Use back camera
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      };

      console.log('Requesting camera access with constraints:', constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Camera access granted, stream:', stream);
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        console.log('Video srcObject set');
        setIsScanning(true);
        
        // Force play after a short delay for iOS
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.play().catch(e => {
              console.error('Error playing video:', e);
            });
          }
        }, 100);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to access camera';
      setError(errorMessage);
      toast.error(`Camera Error: ${errorMessage}`);
    }
  };

  const stopCamera = () => {
    console.log('Stopping camera...');
    
    // Stop all tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        console.log('Stopping track:', track.kind);
        track.stop();
      });
      streamRef.current = null;
    }
    
    // Clear video element
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.pause();
    }
    
    setIsScanning(false);
    setError('');
    console.log('Camera stopped');
  };

  const handleClose = () => {
    console.log('Closing scanner...');
    stopCamera();
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
              <Button onClick={startCamera} disabled={!!error}>
                Start Camera
              </Button>
            </div>
          ) : (
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                webkit-playsinline="true"
                controls={false}
                className="w-full h-64 object-cover"
                style={{ 
                  transform: 'scaleX(-1)',
                  WebkitTransform: 'scaleX(-1)'
                }}
                onLoadedMetadata={() => {
                  console.log('Video metadata loaded, attempting play...');
                  if (videoRef.current) {
                    videoRef.current.play().catch(e => {
                      console.error('Error playing video:', e);
                    });
                  }
                }}
                onCanPlay={() => {
                  console.log('Video can play');
                }}
                onError={(e) => {
                  console.error('Video error:', e);
                }}
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
              <Button onClick={stopCamera} variant="secondary" className="flex-1">
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