import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, ExternalLink, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WaiverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWaiverCompleted: () => void;
}

export const WaiverModal: React.FC<WaiverModalProps> = ({
  isOpen,
  onClose,
  onWaiverCompleted
}) => {
  const [isWaiverSigned, setIsWaiverSigned] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleOpenWaiver = () => {
    window.open('https://tally.so/r/mY71ZB', '_blank', 'noopener,noreferrer');
  };

  const handleConfirmWaiverSigned = async () => {
    setLoading(true);
    try {
      await onWaiverCompleted();
      setIsWaiverSigned(true);
      
      toast({
        title: 'Waiver Completed! ✅',
        description: 'You can now proceed with your ticket purchase.',
        variant: 'default',
      });
      
      // Close modal after a brief delay
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to record waiver completion. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Waiver Required
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert>
            <AlertDescription>
              Before purchasing tickets, you must complete our safety waiver. This is required for all participants.
            </AlertDescription>
          </Alert>

          {!isWaiverSigned ? (
            <div className="space-y-4">
              <Button 
                onClick={handleOpenWaiver}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Waiver Form
              </Button>
              
              <p className="text-sm text-muted-foreground text-center">
                After completing the waiver, click the button below to continue.
              </p>
              
              <Button 
                onClick={handleConfirmWaiverSigned}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? 'Saving...' : 'I have completed the waiver'}
              </Button>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
              <p className="text-lg font-semibold text-green-700">
                Waiver Completed!
              </p>
              <p className="text-sm text-muted-foreground">
                You can now proceed with your ticket purchase.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};