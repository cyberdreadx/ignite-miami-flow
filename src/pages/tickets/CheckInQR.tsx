// @ts-nocheck
import React from 'react';
import NavBar from '@/components/layout/NavBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, QrCode } from 'lucide-react';

const CHECKIN_URL = `${window.location.origin}/checkin`;
const QR_API_URL = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(CHECKIN_URL)}&margin=10`;

export const CheckInQR: React.FC = () => {
  const download = () => {
    const link = document.createElement('a');
    link.download = 'checkin-qr.png';
    link.href = QR_API_URL;
    link.target = '_blank';
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
              <img
                src={QR_API_URL}
                alt="Check-in QR Code"
                className="rounded-xl border w-[300px] h-[300px]"
              />
              <p className="text-xs text-muted-foreground break-all">{CHECKIN_URL}</p>
              <Button onClick={download} variant="outline" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Download QR
              </Button>
            </CardContent>
          </Card>

          <div className="mt-6 text-sm text-muted-foreground space-y-1 text-left">
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
