import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle, XCircle, Scan, User, Calendar, DollarSign } from 'lucide-react';
import NavBar from '@/components/NavBar';

interface ValidationResult {
  valid: boolean;
  reason?: string;
  type?: 'ticket' | 'subscription';
  ticket_info?: any;
  subscription_info?: any;
  used_at?: string;
  used_by?: string;
}

export const ValidateTicket: React.FC = () => {
  const [qrToken, setQrToken] = useState('');
  const [validatorName, setValidatorName] = useState('');
  const [validating, setValidating] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const { toast } = useToast();

  const validateQRCode = async () => {
    if (!qrToken.trim()) {
      toast({
        title: "Error",
        description: "Please enter a QR code token",
        variant: "destructive",
      });
      return;
    }

    setValidating(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('validate-qr-code', {
        body: {
          qr_code_token: qrToken.trim(),
          validator_name: validatorName || 'Door Staff'
        }
      });

      if (error) throw error;

      setResult(data);

      if (data.valid) {
        toast({
          title: "✅ Valid Entry",
          description: `${data.type === 'ticket' ? 'Ticket' : 'Monthly Pass'} is valid for entry`,
        });
      } else {
        toast({
          title: "❌ Invalid Entry",
          description: data.reason || "QR code is not valid",
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('Validation error:', error);
      toast({
        title: "Error",
        description: "Failed to validate QR code. Please try again.",
        variant: "destructive",
      });
      setResult({
        valid: false,
        reason: "System error - please try again"
      });
    } finally {
      setValidating(false);
    }
  };

  const resetForm = () => {
    setQrToken('');
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <div className="pt-24 pb-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-8">
              <Scan className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h1 className="text-3xl font-bold mb-2">Ticket Validation</h1>
              <p className="text-muted-foreground">
                Scan or enter QR codes to validate entry at the door
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Validate Entry</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="validator">Validator Name (Optional)</Label>
                  <Input
                    id="validator"
                    placeholder="Your name"
                    value={validatorName}
                    onChange={(e) => setValidatorName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="qr-token">QR Code Token</Label>
                  <Input
                    id="qr-token"
                    placeholder="Enter or scan QR code token"
                    value={qrToken}
                    onChange={(e) => setQrToken(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && validateQRCode()}
                  />
                </div>

                <div className="flex gap-4">
                  <Button 
                    onClick={validateQRCode}
                    disabled={validating || !qrToken.trim()}
                    className="flex-1"
                  >
                    {validating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Validating...
                      </>
                    ) : (
                      <>
                        <Scan className="w-4 h-4 mr-2" />
                        Validate
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    onClick={resetForm}
                    variant="outline"
                  >
                    Reset
                  </Button>
                </div>

                {/* Validation Result */}
                {result && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-6"
                  >
                    <Card className={`border-2 ${result.valid ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          {result.valid ? (
                            <CheckCircle className="w-8 h-8 text-green-600" />
                          ) : (
                            <XCircle className="w-8 h-8 text-red-600" />
                          )}
                          <div>
                            <h3 className={`text-lg font-bold ${result.valid ? 'text-green-800' : 'text-red-800'}`}>
                              {result.valid ? 'ENTRY APPROVED' : 'ENTRY DENIED'}
                            </h3>
                            <p className={`text-sm ${result.valid ? 'text-green-700' : 'text-red-700'}`}>
                              {result.reason || (result.valid ? 'Valid for entry' : 'Invalid entry')}
                            </p>
                          </div>
                        </div>

                        {result.valid && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Badge variant="default" className="text-xs">
                                {result.type?.toUpperCase()}
                              </Badge>
                            </div>

                            {result.ticket_info && (
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4" />
                                  <span>Name: {result.ticket_info.user_name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <DollarSign className="w-4 h-4" />
                                  <span>Amount: ${(result.ticket_info.amount / 100).toFixed(2)}</span>
                                </div>
                                {result.ticket_info.valid_until && (
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    <span>Valid until: {new Date(result.ticket_info.valid_until).toLocaleDateString()}</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {result.subscription_info && (
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4" />
                                  <span>Name: {result.subscription_info.user_name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4" />
                                  <span>Valid until: {new Date(result.subscription_info.current_period_end).toLocaleDateString()}</span>
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                  MONTHLY PASS
                                </Badge>
                              </div>
                            )}
                          </div>
                        )}

                        {!result.valid && result.used_at && (
                          <div className="mt-3 text-sm text-red-700">
                            <p>Already used on: {new Date(result.used_at).toLocaleString()}</p>
                            {result.used_by && <p>Validated by: {result.used_by}</p>}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};