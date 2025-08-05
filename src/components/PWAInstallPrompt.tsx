import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Download, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if already installed or user dismissed
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
    
    setIsIOS(isIOSDevice);
    setIsStandalone(isInStandaloneMode);

    // Don't show if already installed or user dismissed
    if (dismissed || isInStandaloneMode) {
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      
      // Show prompt after a short delay for better UX
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS, show manual instruction prompt
    if (isIOSDevice && !isInStandaloneMode && !dismissed) {
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        toast({
          title: "App Installing! 🔥",
          description: "SkateBurn is being added to your home screen.",
        });
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  const handleRemindLater = () => {
    setShowPrompt(false);
    // Set temporary dismiss (will show again in next session)
    sessionStorage.setItem('pwa-install-remind-later', 'true');
  };

  if (!showPrompt || isStandalone) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-4"
      >
        <motion.div
          initial={{ y: 100, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 100, opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          <Card className="w-full max-w-md bg-background/95 backdrop-blur-lg border-primary/20 shadow-2xl">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-fire flex items-center justify-center">
                    <span className="text-2xl">🔥</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Install SkateBurn</h3>
                    <p className="text-sm text-muted-foreground">Get the full experience</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3 text-sm">
                  <Smartphone className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Access like a native app</p>
                    <p className="text-muted-foreground">Launch directly from your home screen</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-sm">
                  <Download className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Works offline</p>
                    <p className="text-muted-foreground">Stay connected even without internet</p>
                  </div>
                </div>
              </div>

              {isIOS ? (
                <div className="mt-6 space-y-3">
                  <p className="text-sm text-muted-foreground">
                    To install: Tap the <strong>Share</strong> button in Safari, then select <strong>"Add to Home Screen"</strong>
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleRemindLater}
                      variant="outline"
                      className="flex-1"
                    >
                      Maybe Later
                    </Button>
                    <Button
                      onClick={handleDismiss}
                      variant="ghost"
                      className="flex-1"
                    >
                      Got It
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-6 flex space-x-2">
                  <Button
                    onClick={handleRemindLater}
                    variant="outline"
                    className="flex-1"
                  >
                    Maybe Later
                  </Button>
                  <Button
                    onClick={handleInstall}
                    className="flex-1 bg-gradient-fire hover:opacity-90"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Install App
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PWAInstallPrompt;