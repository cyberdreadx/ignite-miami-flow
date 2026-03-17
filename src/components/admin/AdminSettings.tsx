import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/layout/card';
import { Button } from '@/components/ui/forms/button';
import { Input } from '@/components/ui/forms/input';
import { Label } from '@/components/ui/forms/label';
import { toast } from 'sonner';
import { KeyRound, Save, Eye, EyeOff, Loader2 } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCurrentPin();
  }, []);

  const fetchCurrentPin = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'staff_pin')
      .maybeSingle();
    if (data) setPin(data.value);
    setLoading(false);
  };

  const savePin = async () => {
    if (!pin.trim()) {
      toast.error('PIN cannot be empty');
      return;
    }
    if (pin.length < 4) {
      toast.error('PIN must be at least 4 characters');
      return;
    }
    if (pin !== confirmPin) {
      toast.error('PINs do not match');
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from('app_settings')
      .upsert({ key: 'staff_pin', value: pin.trim(), updated_at: new Date().toISOString() });

    setSaving(false);

    if (error) {
      toast.error('Failed to save PIN');
      console.error(error);
    } else {
      toast.success('Staff PIN updated successfully');
      setConfirmPin('');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-primary" />
            Door Scanner PIN
          </CardTitle>
          <CardDescription>
            Staff enter this PIN at <code className="text-xs bg-muted px-1 py-0.5 rounded">/validate</code> to access the door scanner. No account required.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pin">New PIN</Label>
            <div className="relative">
              <Input
                id="pin"
                type={showPin ? 'text' : 'password'}
                inputMode="numeric"
                placeholder="Enter new PIN (min 4 digits)"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-pin">Confirm PIN</Label>
            <Input
              id="confirm-pin"
              type={showPin ? 'text' : 'password'}
              inputMode="numeric"
              placeholder="Re-enter PIN to confirm"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && savePin()}
            />
          </div>

          {confirmPin && pin !== confirmPin && (
            <p className="text-destructive text-sm">PINs do not match</p>
          )}

          <Button onClick={savePin} disabled={saving || !pin || !confirmPin} className="w-full">
            {saving ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…</>
            ) : (
              <><Save className="w-4 h-4 mr-2" /> Save PIN</>
            )}
          </Button>

          <p className="text-xs text-muted-foreground">
            Tip: Use a 4–8 digit number your door staff can easily remember, e.g. the event night's last 4 digits of the year or a venue code.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
