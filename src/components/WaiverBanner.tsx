import React, { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { FileText, X } from 'lucide-react';
import { useWaiver } from '@/hooks/useWaiver';
import { useAuth } from '@/hooks/useAuth';
import { WaiverModal } from './WaiverModal';

export const WaiverBanner: React.FC = () => {
  const { user } = useAuth();
  const { hasCompletedWaiver, loading, markWaiverCompleted } = useWaiver();
  const [showWaiverModal, setShowWaiverModal] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show banner if user is not logged in, waiver is completed, or banner is dismissed
  if (!user || loading || hasCompletedWaiver || isDismissed) {
    return null;
  }

  const handleWaiverCompleted = async () => {
    const success = await markWaiverCompleted();
    if (success) {
      setShowWaiverModal(false);
    }
    return success;
  };

  return (
    <>
      <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/50 dark:border-yellow-800 mb-4">
        <FileText className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="flex items-center justify-between w-full">
          <div className="flex-1">
            <span className="font-medium text-yellow-800 dark:text-yellow-200">
              Safety Waiver Required
            </span>
            <span className="text-yellow-700 dark:text-yellow-300 ml-2">
              Complete your Skateburn waiver to participate in events and purchase tickets.
            </span>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowWaiverModal(true)}
              className="border-yellow-300 text-yellow-800 hover:bg-yellow-100 dark:border-yellow-700 dark:text-yellow-200 dark:hover:bg-yellow-900"
            >
              Complete Waiver
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDismissed(true)}
              className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-200"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </AlertDescription>
      </Alert>

      <WaiverModal
        isOpen={showWaiverModal}
        onClose={() => setShowWaiverModal(false)}
        onWaiverCompleted={handleWaiverCompleted}
      />
    </>
  );
};