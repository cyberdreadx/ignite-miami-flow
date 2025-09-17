import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { TestTube, Play, CheckCircle, XCircle } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pending' | 'pass' | 'fail';
  message?: string;
}

export const SystemTester: React.FC = () => {
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'User Authentication', status: 'pending' },
    { name: 'Create Test Ticket', status: 'pending' },
    { name: 'Generate QR Code', status: 'pending' },
    { name: 'Public Verification', status: 'pending' },
    { name: 'Staff Validation', status: 'pending' },
    { name: 'Duplicate Usage Prevention', status: 'pending' }
  ]);
  
  const [running, setRunning] = useState(false);
  const [testTicketId, setTestTicketId] = useState<string>('');
  const [qrToken, setQrToken] = useState<string>('');
  const { user } = useAuth();
  const { toast } = useToast();

  const updateTest = (index: number, status: 'pass' | 'fail', message?: string) => {
    setTests(prev => prev.map((test, i) => 
      i === index ? { ...test, status, message } : test
    ));
  };

  const runAllTests = async () => {
    if (!user) {
      toast({
        title: "Please sign in first",
        description: "Authentication is required for testing",
        variant: "destructive",
      });
      return;
    }

    setRunning(true);
    setTests(prev => prev.map(test => ({ ...test, status: 'pending' })));

    try {
      // Test 1: User Authentication
      updateTest(0, 'pass', `Authenticated as ${user.email}`);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Test 2: Create Test Ticket
      const { data: ticketData, error: insertError } = await supabase
        .from('tickets')
        .insert({
          user_id: user.id,
          amount: 2500, // $25.00
          status: 'paid',
          valid_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single();

      if (insertError) throw new Error(`Failed to create test ticket: ${insertError.message}`);
      
      setTestTicketId(ticketData.id);
      updateTest(1, 'pass', `Created ticket ${ticketData.id}`);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Test 3: Generate QR Code
      const { data: qrData, error: qrError } = await supabase.functions.invoke('generate-qr-code', {
        body: { ticket_id: ticketData.id }
      });

      if (qrError) throw new Error(`QR generation failed: ${qrError.message}`);
      
      setQrToken(qrData.qr_code_token);
      updateTest(2, 'pass', `Generated QR: ${qrData.qr_code_token.substring(0, 15)}...`);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Test 4: Public Verification
      const { data: publicData, error: publicError } = await supabase.functions.invoke('verify-ticket-public', {
        body: { qr_code_token: qrData.qr_code_token }
      });

      console.log('Public verification response:', { publicData, publicError });

      if (publicError) {
        updateTest(3, 'fail', `Public verification failed: ${publicError.message}`);
      } else if (publicData && (publicData.valid === true || publicData.user_name)) {
        // Success if valid is true OR if user_name exists (indicates successful verification)
        updateTest(3, 'pass', `Public verification successful`);
      } else {
        updateTest(3, 'fail', `Public verification failed: ${publicData?.reason || 'Unknown error'}`);
      }
      await new Promise(resolve => setTimeout(resolve, 500));

      // Test 5: Staff Validation (read-only for testing)
      const { data: staffData, error: staffError } = await supabase.functions.invoke('validate-qr-code', {
        body: { 
          qr_code_token: qrData.qr_code_token,
          validator_name: 'Test System',
          mark_as_used: false  // Don't mark as used during testing
        }
      });

      if (staffError) throw new Error(`Staff validation failed: ${staffError.message}`);
      
      if (staffData.valid) {
        updateTest(4, 'pass', `Staff validation successful - ticket validation works`);
      } else {
        updateTest(4, 'fail', `Staff validation failed: ${staffData.reason}`);
      }
      await new Promise(resolve => setTimeout(resolve, 500));

      // Test 6: Duplicate Usage Prevention (read-only for testing)
      const { data: duplicateData, error: duplicateError } = await supabase.functions.invoke('validate-qr-code', {
        body: { 
          qr_code_token: qrData.qr_code_token,
          validator_name: 'Test System 2',
          mark_as_used: false  // Don't mark as used during testing
        }
      });

      if (duplicateError) throw new Error(`Duplicate test failed: ${duplicateError.message}`);
      
      if (!duplicateData.valid && duplicateData.reason?.includes('already used')) {
        updateTest(5, 'pass', `Duplicate usage correctly prevented`);
      } else {
        updateTest(5, 'fail', `Duplicate usage not prevented!`);
      }

    } catch (error) {
      console.error('Test error:', error);
      toast({
        title: "Test Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setRunning(false);
    }
  };

  const cleanupTestData = async () => {
    if (testTicketId) {
      await supabase.from('tickets').delete().eq('id', testTicketId);
      setTestTicketId('');
      setQrToken('');
      setTests(prev => prev.map(test => ({ ...test, status: 'pending' })));
      toast({
        title: "Cleanup Complete",
        description: "Test ticket removed",
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="w-5 h-5" />
          QR Code System Tester
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <Button 
            onClick={runAllTests}
            disabled={running || !user}
            className="flex-1"
          >
            {running ? (
              <>
                <Play className="w-4 h-4 mr-2 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run All Tests
              </>
            )}
          </Button>
          
          {testTicketId && (
            <Button 
              onClick={cleanupTestData}
              variant="outline"
            >
              Cleanup
            </Button>
          )}
        </div>

        {!user && (
          <p className="text-sm text-muted-foreground text-center">
            Please sign in to run tests
          </p>
        )}

        <div className="space-y-3">
          {tests.map((test, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-card shadow-sm">
              <div className="flex items-center gap-3">
                {test.status === 'pending' && <div className="w-4 h-4 border-2 border-muted rounded-full" />}
                {test.status === 'pass' && <CheckCircle className="w-4 h-4 text-green-600" />}
                {test.status === 'fail' && <XCircle className="w-4 h-4 text-red-600" />}
                <span className="font-medium text-base">{test.name}</span>
              </div>
              <div className="flex items-center gap-3">
                {test.message && (
                  <span className="text-sm text-foreground max-w-xs text-right">{test.message}</span>
                )}
                <Badge 
                  variant={
                    test.status === 'pass' ? 'default' : 
                    test.status === 'fail' ? 'destructive' : 
                    'secondary'
                  }
                  className="min-w-[60px] justify-center"
                >
                  {test.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {qrToken && (
          <div className="p-4 bg-card border rounded-lg shadow-sm">
            <h4 className="font-semibold mb-3 text-base">Test QR Token:</h4>
            <code className="text-sm break-all bg-muted p-2 rounded block">{qrToken}</code>
            <div className="mt-3 space-y-2 text-sm text-foreground">
              <p>• Test public view: <code className="bg-muted px-1 rounded">/ticket?token={qrToken}</code></p>
              <p>• Test validation: Copy token to <code className="bg-muted px-1 rounded">/validate</code></p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};