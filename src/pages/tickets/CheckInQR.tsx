// @ts-nocheck
import React, { useEffect, useRef } from 'react';
import NavBar from '@/components/layout/NavBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, QrCode } from 'lucide-react';

const CHECKIN_URL = `${window.location.origin}/checkin`;

export const CheckInQR: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Dynamically load qrcode library and draw QR
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js';
    script.onload = () => {
      if (canvasRef.current && (window as any).QRCode) {
        (window as any).QRCode.toCanvas(canvasRef.current, CHECKIN_URL, {
          width: 300,
          margin: 2,
          color: { dark: '#000000', light: '#ffffff' }
        });
      }
    };
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'checkin-qr.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <div className="pt-24 pb-8 px-4">
        <div className="max-w-md mx-auto text-center">
          <QrCode className="w-10 h-10 mx-auto mb-3 text-primary" />
          <h1 className="text-3xl font-black mb-2">Entrance QR Code</h1>
          <p className="text-muted-foreground mb-8">
            Display or print this at the entrance. Attendees scan it with their phone to show their ticket.
          </p>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Scan to Check In</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <canvas ref={canvasRef} className="rounded-xl border" />
              <p className="text-xs text-muted-foreground break-all">{CHECKIN_URL}</p>
              <Button onClick={download} variant="outline" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Download QR
              </Button>
            </CardContent>
          </Card>

          <div className="mt-6 text-sm text-muted-foreground space-y-1">
            <p>1. Attendee scans this QR with their phone camera</p>
            <p>2. They log in (or are already logged in)</p>
            <p>3. Green screen = valid ticket · Red = no ticket</p>
            <p>4. Staff glances at their screen to approve entry</p>
          </div>
        </div>
      </div>
    </div>
  );
};
