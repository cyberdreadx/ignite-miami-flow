// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle, XCircle, ScanLine, RotateCcw, Lock, Eye, ClipboardList } from 'lucide-react';
import QrScanner from 'react-qr-scanner';

type Phase = 'pin' | 'pin_checking' | 'scanning' | 'validating' | 'result';

interface ValidationResult {
  valid: boolean;
  reason?: string;
  type?: 'ticket' | 'subscription';
  ticket_info?: any;
  subscription_info?: any;
  used_at?: string;
  used_by?: string;
}

interface ScanEntry {
  id: number;
  name: string;
  valid: boolean;
  reason?: string;
  type?: string;
  preview: boolean;
  time: Date;
}

export const ValidateTicket: React.FC = () => {
  const [phase, setPhase] = useState<Phase>('pin');
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [validatorName, setValidatorName] = useState('Door Staff');
  const [previewMode, setPreviewMode] = useState(false);
  const [scanHistory, setScanHistory] = useState<ScanEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const scanCounterRef = useRef(0);
  const lastScannedRef = useRef<string>('');
  const cooldownRef = useRef<boolean>(false);

  // Auto-reset to scanning after result
  useEffect(() => {
    if (phase === 'result') {
      const timer = setTimeout(() => {
        setResult(null);
        setPhase('scanning');
        lastScannedRef.current = '';
        cooldownRef.current = false;
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  const handlePinSubmit = async () => {
    if (!pin.trim()) return;
    setPhase('pin_checking');
    setPinError('');
    try {
      const { data, error } = await supabase.functions.invoke('verify-staff-pin', {
        body: { pin: pin.trim() },
      });
      if (error) throw error;
      if (data?.valid) {
        setPhase('scanning');
      } else {
        setPinError('Incorrect PIN — try again');
        setPin('');
        setPhase('pin');
      }
    } catch {
      setPinError('Could not verify PIN — check connection');
      setPin('');
      setPhase('pin');
    }
  };

  const extractToken = (raw: string): string => {
    try {
      const url = new URL(raw);
      return url.searchParams.get('token') || url.searchParams.get('qr') || raw;
    } catch {
      return raw;
    }
  };

  const validateToken = async (raw: string) => {
    if (cooldownRef.current) return;
    const token = extractToken(raw.trim());
    if (!token || token === lastScannedRef.current) return;

    lastScannedRef.current = token;
    cooldownRef.current = true;
    setPhase('validating');

    try {
      const { data, error } = await supabase.functions.invoke('validate-qr-code', {
        body: { qr_code_token: token, validator_name: validatorName, mark_as_used: !previewMode }
      });
      if (error) throw error;
      setResult(data);
      // Append to history
      const info = data?.ticket_info || data?.subscription_info;
      scanCounterRef.current += 1;
      setScanHistory(prev => [{
        id: scanCounterRef.current,
        name: info?.user_name || 'Unknown',
        valid: !!data?.valid,
        reason: data?.reason,
        type: data?.type,
        preview: previewMode,
        time: new Date(),
      }, ...prev].slice(0, 10));
    } catch {
      setResult({ valid: false, reason: 'System error — try again' });
      scanCounterRef.current += 1;
      setScanHistory(prev => [{
        id: scanCounterRef.current,
        name: 'Unknown',
        valid: false,
        reason: 'System error',
        preview: previewMode,
        time: new Date(),
      }, ...prev].slice(0, 10));
    } finally {
      setPhase('result');
    }
  };

  const handleScan = (data: any) => {
    if (data?.text) validateToken(data.text);
  };

  const handleError = (err: any) => {
    console.error('Scanner error:', err);
  };

  // ─── PIN SCREEN ───────────────────────────────────────────────
  if (phase === 'pin' || phase === 'pin_checking') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <motion.div
          className="w-full max-w-sm text-center space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Lock className="w-12 h-12 mx-auto text-primary" />
          <div>
            <h1 className="text-2xl font-bold mb-1">Staff Access</h1>
            <p className="text-muted-foreground text-sm">Enter PIN to access door scanner</p>
          </div>

          <div className="space-y-3">
            <Input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Enter PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handlePinSubmit()}
              className="text-center text-2xl tracking-widest h-14"
              autoFocus
              disabled={phase === 'pin_checking'}
            />
            {pinError && <p className="text-destructive text-sm">{pinError}</p>}
            <Button
              className="w-full h-12 text-base"
              onClick={handlePinSubmit}
              disabled={phase === 'pin_checking' || !pin.trim()}
            >
              {phase === 'pin_checking' ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Checking…</>
              ) : 'Enter'}
            </Button>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Your name (shown in scan log)</p>
            <Input
              placeholder="Validator name"
              value={validatorName}
              onChange={(e) => setValidatorName(e.target.value)}
              className="text-center"
            />
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── VALIDATING ───────────────────────────────────────────────
  if (phase === 'validating') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto" />
          <p className="text-lg font-semibold text-muted-foreground">Checking ticket…</p>
        </div>
      </div>
    );
  }

  // ─── RESULT ───────────────────────────────────────────────────
  if (phase === 'result' && result) {
    const isValid = result.valid;
    const info = result.ticket_info || result.subscription_info;
    return (
      <AnimatePresence>
        <motion.div
          key="result"
          className={`min-h-screen flex flex-col items-center justify-center px-6 ${
            isValid ? 'bg-green-500' : 'bg-red-500'
          }`}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <div className="text-center text-white space-y-4 max-w-sm w-full">
            {isValid ? (
              <CheckCircle className="w-32 h-32 mx-auto drop-shadow-xl" />
            ) : (
              <XCircle className="w-32 h-32 mx-auto drop-shadow-xl" />
            )}

            <h1 className="text-6xl font-black tracking-tight drop-shadow-lg">
              {isValid ? 'LET IN' : 'DENIED'}
            </h1>

            {previewMode && (
              <div className="inline-flex items-center gap-1.5 bg-white/30 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest backdrop-blur-sm">
                <Eye className="w-3 h-3" /> Preview — ticket NOT marked used
              </div>
            )}

            {info && (
              <div className="bg-white/20 rounded-2xl p-4 text-left space-y-1 backdrop-blur-sm">
                {info.user_name && <p className="font-bold text-xl">{info.user_name}</p>}
                {result.type && (
                  <p className="text-sm uppercase tracking-widest opacity-80">
                    {result.type === 'subscription' ? 'Monthly Pass' : 'Event Ticket'}
                  </p>
                )}
              </div>
            )}

            {!isValid && result.reason && (
              <p className="text-xl font-semibold opacity-90">{result.reason}</p>
            )}

            <p className="text-sm opacity-70 animate-pulse">Auto-reset in 4 seconds…</p>

            <Button
              variant="outline"
              className="border-white text-white hover:bg-white/20 bg-transparent w-full"
              onClick={() => {
                setResult(null);
                setPhase('scanning');
                lastScannedRef.current = '';
                cooldownRef.current = false;
              }}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Scan Next
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // ─── SCANNING ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 bg-black/80 backdrop-blur z-10">
        <div className="flex items-center gap-2">
          <ScanLine className="w-5 h-5 text-primary" />
          <span className="text-white font-bold text-sm">Door Scanner</span>
          {previewMode && (
            <span className="text-xs bg-yellow-400 text-black font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
              Preview
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Preview mode toggle */}
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-colors ${
              previewMode
                ? 'bg-yellow-400 border-yellow-400 text-black font-bold'
                : 'border-white/30 text-white/60 hover:text-white'
            }`}
          >
            <Eye className="w-3 h-3" />
            {previewMode ? 'Preview ON' : 'Preview'}
          </button>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-colors ${
              showHistory
                ? 'bg-white/20 border-white/40 text-white'
                : 'border-white/30 text-white/60 hover:text-white'
            }`}
          >
            <ClipboardList className="w-3 h-3" />
            Log {scanHistory.length > 0 && `(${scanHistory.length})`}
          </button>
          <Button
            variant="ghost"
            size="sm"
            className="text-white/60 hover:text-white text-xs"
            onClick={() => setPhase('pin')}
          >
            <Lock className="w-3 h-3 mr-1" />
            Lock
          </Button>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden">
        <QrScanner
          delay={300}
          onScan={handleScan}
          onError={handleError}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          facingMode="environment"
        />

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-64 h-64">
            <div className="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-primary rounded-tl-sm" />
            <div className="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-primary rounded-tr-sm" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-primary rounded-bl-sm" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-primary rounded-br-sm" />
            <motion.div
              className="absolute left-0 right-0 h-0.5 bg-primary shadow-[0_0_8px_hsl(var(--primary))]"
              animate={{ top: ['10%', '90%', '10%'] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        </div>

        <div className="absolute bottom-6 left-0 right-0 text-center">
          <p className="text-white/70 text-sm bg-black/50 mx-auto inline-block px-4 py-2 rounded-full">
            Point camera at attendee's QR code
          </p>
        </div>
      </div>
    </div>
  );
};
