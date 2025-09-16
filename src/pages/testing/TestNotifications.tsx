import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { toast as sonnerToast } from 'sonner';
import NavBar from '@/components/layout/NavBar';
import { Bell, CheckCircle, XCircle, AlertTriangle, Info, Shield, Monitor } from 'lucide-react';

const TestNotifications = () => {
  const { toast } = useToast();
  const [permissionStatus, setPermissionStatus] = useState<string>('unknown');
  const [isPWA, setIsPWA] = useState(false);
  const [browserInfo, setBrowserInfo] = useState<string>('');

  useEffect(() => {
    // Check notification permission
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }

    // Check if running as PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsPWA(isStandalone);

    // Get browser info
    setBrowserInfo(navigator.userAgent.split(' ').slice(0, 3).join(' '));
  }, []);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
      
      if (permission === 'granted') {
        toast({
          title: 'Permission Granted!',
          description: 'Notifications are now enabled.',
        });
      } else {
        toast({
          title: 'Permission Denied',
          description: 'Notifications are blocked.',
          variant: 'destructive',
        });
      }
    }
  };

  const testBrowserNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('SkateBurn Test', {
        body: 'This is a browser notification test.',
        icon: '/favicon.ico',
      });
    } else {
      toast({
        title: 'Browser Notifications Unavailable',
        description: 'Permission not granted or not supported.',
        variant: 'destructive',
      });
    }
  };

  const testBasicToast = () => {
    console.log('Testing basic toast...');
    toast({
      title: 'Basic Toast',
      description: 'This is a basic toast notification.',
    });
  };

  const testSuccessToast = () => {
    console.log('Testing success toast...');
    toast({
      title: 'Success!',
      description: 'This is a success notification.',
      variant: 'default',
    });
  };

  const testErrorToast = () => {
    console.log('Testing error toast...');
    toast({
      title: 'Error!',
      description: 'This is an error notification.',
      variant: 'destructive',
    });
  };

  const testSonnerToast = () => {
    console.log('Testing Sonner toast...');
    sonnerToast.success('Sonner Toast Works!', {
      description: 'This is using the Sonner toast system.',
    });
  };

  const testSonnerError = () => {
    console.log('Testing Sonner error...');
    sonnerToast.error('Sonner Error Toast', {
      description: 'This is an error using Sonner.',
    });
  };

  const testSonnerInfo = () => {
    console.log('Testing Sonner info...');
    sonnerToast.info('Sonner Info Toast', {
      description: 'This is an info message using Sonner.',
    });
  };

  const testSonnerWarning = () => {
    console.log('Testing Sonner warning...');
    sonnerToast.warning('Sonner Warning Toast', {
      description: 'This is a warning using Sonner.',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <div className="pt-24 pb-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Notification System Diagnostics</h1>
            <p className="text-muted-foreground">
              Test different types of notifications and check system status.
            </p>
          </div>

          {/* System Status */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Notification Permission</p>
                  <Badge variant={permissionStatus === 'granted' ? 'default' : 'destructive'}>
                    {permissionStatus}
                  </Badge>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">PWA Mode</p>
                  <Badge variant={isPWA ? 'default' : 'secondary'}>
                    {isPWA ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Browser</p>
                  <Badge variant="outline">
                    {browserInfo}
                  </Badge>
                </div>
              </div>
              
              {permissionStatus !== 'granted' && (
                <div className="text-center pt-4">
                  <Button onClick={requestNotificationPermission}>
                    <Shield className="h-4 w-4 mr-2" />
                    Request Notification Permission
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Regular Toast Tests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Standard Toast System
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={testBasicToast} className="w-full">
                  Test Basic Toast
                </Button>
                <Button onClick={testSuccessToast} className="w-full">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Test Success Toast
                </Button>
                <Button onClick={testErrorToast} variant="destructive" className="w-full">
                  <XCircle className="h-4 w-4 mr-2" />
                  Test Error Toast
                </Button>
              </CardContent>
            </Card>

            {/* Sonner Toast Tests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Sonner Toast System
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={testSonnerToast} className="w-full">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Test Sonner Success
                </Button>
                <Button onClick={testSonnerError} variant="destructive" className="w-full">
                  <XCircle className="h-4 w-4 mr-2" />
                  Test Sonner Error
                </Button>
                <Button onClick={testSonnerInfo} variant="outline" className="w-full">
                  <Info className="h-4 w-4 mr-2" />
                  Test Sonner Info
                </Button>
                <Button onClick={testSonnerWarning} variant="secondary" className="w-full">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Test Sonner Warning
                </Button>
              </CardContent>
            </Card>

            {/* Browser Notifications */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Browser Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={testBrowserNotification} 
                  disabled={permissionStatus !== 'granted'}
                  className="w-full"
                >
                  Test Browser Notification
                </Button>
                {permissionStatus !== 'granted' && (
                  <p className="text-sm text-muted-foreground mt-2 text-center">
                    Browser notification permission required
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Instructions */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Troubleshooting Guide</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• <strong>Standard toasts</strong> should appear in the bottom-right corner</p>
                <p>• <strong>Sonner toasts</strong> should appear at the top of the screen</p>
                <p>• Check browser console (F12) for JavaScript errors</p>
                <p>• Ensure notifications aren't blocked by browser settings</p>
                <p>• Try refreshing the page if toasts don't appear</p>
                <p>• Some browsers block notifications in incognito/private mode</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TestNotifications;