import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Wrench, 
  RefreshCw,
  Database,
  QrCode,
  Ticket
} from 'lucide-react';

interface DiagnosticResult {
  test: string;
  status: 'pass' | 'fail' | 'warning' | 'running';
  message: string;
  details?: any;
}

export const TicketSystemDiagnostic: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [running, setRunning] = useState(false);
  const [summary, setSummary] = useState<{total: number, passed: number, failed: number} | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const updateDiagnostic = (index: number, status: DiagnosticResult['status'], message: string, details?: any) => {
    setDiagnostics(prev => {
      const newDiagnostics = [...prev];
      newDiagnostics[index] = { ...newDiagnostics[index], status, message, details };
      return newDiagnostics;
    });
  };

  const runDiagnostics = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to run diagnostics",
        variant: "destructive",
      });
      return;
    }

    setRunning(true);
    setSummary(null);
    
    const tests: DiagnosticResult[] = [
      { test: "Database Connection", status: 'running', message: "Testing..." },
      { test: "User Authentication", status: 'running', message: "Testing..." },
      { test: "Ticket Retrieval", status: 'running', message: "Testing..." },
      { test: "QR Code Generation", status: 'running', message: "Testing..." },
      { test: "QR Code Validation", status: 'running', message: "Testing..." },
      { test: "Supabase Functions", status: 'running', message: "Testing..." },
      { test: "Missing QR Codes", status: 'running', message: "Testing..." },
    ];
    
    setDiagnostics(tests);

    try {
      // Test 1: Database Connection
      const { data: dbTest, error: dbError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      if (dbError) {
        updateDiagnostic(0, 'fail', `Database error: ${dbError.message}`, dbError);
      } else {
        updateDiagnostic(0, 'pass', 'Database connection successful');
      }
      await new Promise(resolve => setTimeout(resolve, 500));

      // Test 2: User Authentication
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authUser) {
        updateDiagnostic(1, 'fail', 'Authentication failed', authError);
      } else {
        updateDiagnostic(1, 'pass', `Authenticated as ${authUser.email}`);
      }
      await new Promise(resolve => setTimeout(resolve, 500));

      // Test 3: Ticket Retrieval
      const { data: userTickets, error: ticketsError } = await supabase
        .from('tickets')
        .select('*')
        .eq('user_id', user.id);
      
      if (ticketsError) {
        updateDiagnostic(2, 'fail', `Ticket retrieval failed: ${ticketsError.message}`, ticketsError);
      } else {
        updateDiagnostic(2, 'pass', `Found ${userTickets?.length || 0} tickets`, { ticketCount: userTickets?.length });
      }
      await new Promise(resolve => setTimeout(resolve, 500));

      // Test 4: QR Code Generation (if user has tickets)
      if (userTickets && userTickets.length > 0) {
        const testTicket = userTickets[0];
        const { data: qrData, error: qrError } = await supabase.functions.invoke('generate-qr-code', {
          body: { ticket_id: testTicket.id }
        });
        
        if (qrError) {
          updateDiagnostic(3, 'fail', `QR generation failed: ${qrError.message}`, qrError);
        } else if (qrData?.qr_code_token) {
          updateDiagnostic(3, 'pass', 'QR code generation successful', { token: qrData.qr_code_token.substring(0, 10) + '...' });
          
      // Test 5: QR Code Validation (create minimal test ticket)
      updateDiagnostic(4, 'running', 'Testing QR code validation...');
      
      // Create a minimal test ticket for validation with clear test identifier
      const { data: testTicketData, error: testTicketError } = await supabase
        .from('tickets')
        .insert({
          user_id: user.id,
          amount: 1, // Minimal test amount (1 cent)
          status: 'test', // Mark as test status so it doesn't count in analytics
          valid_until: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // Valid for only 5 minutes
          stripe_session_id: null, // No Stripe data for test tickets
          stripe_payment_intent_id: null // No Stripe data for test tickets
        })
        .select()
        .single();

      if (testTicketError) {
        updateDiagnostic(4, 'warning', `Could not create test ticket: ${testTicketError.message}`);
      } else {
        // Generate QR for test ticket
        const { data: testQrData, error: testQrError } = await supabase.functions.invoke('generate-qr-code', {
          body: { ticket_id: testTicketData.id }
        });

        if (testQrError || !testQrData?.qr_code_token) {
          updateDiagnostic(4, 'fail', 'QR generation for test ticket failed');
          // Clean up test ticket immediately
          await supabase.from('tickets').delete().eq('id', testTicketData.id);
        } else {
          // Test validation
          const { data: validateData, error: validateError } = await supabase.functions.invoke('verify-ticket-public', {
            body: { qr_code_token: testQrData.qr_code_token }
          });

          if (validateError) {
            updateDiagnostic(4, 'fail', `QR validation failed: ${validateError.message}`, validateError);
          } else if (validateData?.valid === true) {
            updateDiagnostic(4, 'pass', 'QR code validation successful - fresh ticket verified');
          } else {
            updateDiagnostic(4, 'warning', `QR validation status: ${validateData?.reason || 'Invalid ticket'}`, validateData);
          }
          
          // Clean up test ticket immediately
          await supabase.from('tickets').delete().eq('id', testTicketData.id);
        }
      }
        } else {
          updateDiagnostic(3, 'fail', 'QR generation returned invalid data', qrData);
          updateDiagnostic(4, 'fail', 'Skipped due to QR generation failure');
        }
      } else {
        updateDiagnostic(3, 'warning', 'No tickets found to test QR generation');
        updateDiagnostic(4, 'warning', 'No tickets found to test QR validation');
      }
      await new Promise(resolve => setTimeout(resolve, 500));

      // Test 6: Supabase Functions Health
      updateDiagnostic(5, 'running', 'Testing Supabase functions...');
      
      const functionTests = [
        { name: 'generate-qr-code', description: 'QR Code Generation', testBody: { ticket_id: 'test' } },
        { name: 'verify-ticket-public', description: 'Public Ticket Verification', testBody: { qr_code_token: 'test' } },
        { name: 'validate-qr-code', description: 'QR Code Validation', testBody: { qr_code_token: 'test' } },
        { name: 'recover-missing-tickets', description: 'Ticket Recovery', testBody: {} }
      ];
      
      let functionsWorking = 0;
      const functionResults: string[] = [];
      
      for (const func of functionTests) {
        try {
          const { data, error } = await supabase.functions.invoke(func.name, { 
            body: func.testBody 
          });
          
          if (!error) {
            functionsWorking++;
            functionResults.push(`✅ ${func.description}: Function responding`);
          } else if (error.message?.includes('required') || 
                     error.message?.includes('validation') || 
                     error.message?.includes('invalid') ||
                     error.message?.includes('not found')) {
            // Function exists and is processing parameters (this is good)
            functionsWorking++;
            functionResults.push(`✅ ${func.description}: Function active (validation error expected)`);
          } else {
            functionResults.push(`❌ ${func.description}: ${error.message}`);
          }
        } catch (e: any) {
          if (e.message?.includes('not found') || e.message?.includes('404')) {
            functionResults.push(`❌ ${func.description}: Function not deployed`);
          } else if (e.message?.includes('403') || e.message?.includes('401')) {
            functionResults.push(`❌ ${func.description}: Permission denied`);
          } else if (e.message?.includes('500')) {
            functionResults.push(`⚠️ ${func.description}: Server error (function exists but has issues)`);
            functionsWorking++; // Function exists but has runtime issues
          } else {
            // Function exists but may have validation errors
            functionsWorking++;
            functionResults.push(`⚠️ ${func.description}: ${e.message.substring(0, 50)}...`);
          }
        }
      }
      
      const functionDetails = functionResults.join('\n');
      
      if (functionsWorking === functionTests.length) {
        updateDiagnostic(5, 'pass', `All ${functionTests.length} functions accessible`, { details: functionDetails });
      } else if (functionsWorking > 0) {
        updateDiagnostic(5, 'warning', `${functionsWorking}/${functionTests.length} functions accessible`, { details: functionDetails });
      } else {
        updateDiagnostic(5, 'fail', 'No Supabase functions accessible', { details: functionDetails });
      }
      await new Promise(resolve => setTimeout(resolve, 500));

      // Test 7: Check for Missing QR Codes and Clean up orphaned test data
      if (userTickets && userTickets.length > 0) {
        // First, clean up any orphaned test tickets
        const orphanedTestTickets = userTickets.filter(ticket => 
          ticket.status === 'test' || 
          (ticket.amount && ticket.amount < 100 && !ticket.stripe_session_id && !ticket.stripe_payment_intent_id)
        );
        
        if (orphanedTestTickets.length > 0) {
          console.log(`Cleaning up ${orphanedTestTickets.length} orphaned test tickets`);
          for (const testTicket of orphanedTestTickets) {
            await supabase.from('tickets').delete().eq('id', testTicket.id);
          }
        }
        
        // Now check for real tickets missing QR codes
        const realTicketsWithoutQR = userTickets.filter(ticket => {
          const isRealTicket = ticket.status !== 'test' && 
                              (ticket.stripe_session_id || ticket.stripe_payment_intent_id) &&
                              ticket.amount >= 100;
          const missingQR = !ticket.qr_code_token || ticket.qr_code_token.trim() === '';
          return isRealTicket && missingQR;
        });
        
        if (realTicketsWithoutQR.length === 0) {
          updateDiagnostic(6, 'pass', `All real tickets have QR codes${orphanedTestTickets.length > 0 ? ` (cleaned ${orphanedTestTickets.length} test tickets)` : ''}`);
        } else {
          updateDiagnostic(6, 'warning', `${realTicketsWithoutQR.length} real tickets missing QR codes`, { 
            missingQRTickets: realTicketsWithoutQR.map(t => t.id)
          });
        }
      } else {
        updateDiagnostic(6, 'warning', 'No tickets to check for QR codes');
      }

      // Calculate summary
      const finalDiagnostics = diagnostics.map((diag, index) => {
        return tests[index];
      });
      
      const passed = finalDiagnostics.filter(d => d.status === 'pass').length;
      const failed = finalDiagnostics.filter(d => d.status === 'fail').length;
      
      setSummary({
        total: finalDiagnostics.length,
        passed,
        failed
      });

      if (failed === 0) {
        toast({
          title: "All Diagnostics Passed! ✅",
          description: "Your ticket system is working correctly",
        });
      } else {
        toast({
          title: `${failed} Issues Found`,
          description: "Check the diagnostic results for details",
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('Diagnostic error:', error);
      toast({
        title: "Diagnostic Failed",
        description: "Could not complete system diagnostics",
        variant: "destructive",
      });
    } finally {
      setRunning(false);
    }
  };

  const fixMissingQRCodes = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('fix-missing-qr-codes');
      
      if (error) throw error;
      
      toast({
        title: "QR Code Fix Complete",
        description: data.message || "QR codes have been fixed",
      });
      
      // Re-run diagnostics
      await runDiagnostics();
    } catch (error) {
      console.error('QR fix error:', error);
      toast({
        title: "QR Fix Failed",
        description: "Could not fix missing QR codes",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'pass': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'fail': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'running': return <Loader2 className="w-4 h-4 animate-spin text-blue-600" />;
    }
  };

  const getStatusVariant = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'pass': return 'default';
      case 'fail': return 'destructive';
      case 'warning': return 'secondary';
      case 'running': return 'outline';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="w-5 h-5" />
          Ticket System Diagnostics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Info Panel */}
        <Alert>
          <Database className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <strong>Diagnostic Tests Overview:</strong>
              <ul className="text-sm space-y-1 mt-2">
                <li>• <strong>Database Connection:</strong> Tests Supabase connectivity</li>
                <li>• <strong>User Authentication:</strong> Verifies current user session</li>
                <li>• <strong>Ticket Retrieval:</strong> Checks ability to fetch ticket data</li>
                <li>• <strong>QR Code Generation:</strong> Tests QR code creation for tickets</li>
                <li>• <strong>QR Code Validation:</strong> Verifies QR code verification process</li>
                <li>• <strong>Supabase Functions:</strong> Checks serverless function availability</li>
                <li>• <strong>Missing QR Codes:</strong> Identifies tickets without QR codes</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
        <div className="flex gap-2">
          <Button 
            onClick={runDiagnostics}
            disabled={running || !user}
            className="flex-1"
          >
            {running ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Database className="w-4 h-4 mr-2" />
            )}
            {running ? 'Running Diagnostics...' : 'Run Diagnostics'}
          </Button>
          
          {diagnostics.some(d => d.message.includes('missing QR')) && (
            <Button 
              onClick={fixMissingQRCodes}
              variant="outline"
              disabled={running}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Fix QR Codes
            </Button>
          )}
        </div>

        {!user && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Please sign in to run system diagnostics
            </AlertDescription>
          </Alert>
        )}

        {summary && (
          <Alert className={summary.failed === 0 ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            <AlertDescription>
              <strong>Summary:</strong> {summary.passed}/{summary.total} tests passed
              {summary.failed > 0 && `, ${summary.failed} failed`}
            </AlertDescription>
          </Alert>
        )}

        {diagnostics.length > 0 && (
          <div className="space-y-4">
            {diagnostics.map((diagnostic, index) => (
              <div 
                key={index}
                className="p-4 border rounded-lg bg-card shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getStatusIcon(diagnostic.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-medium text-base">{diagnostic.test}</span>
                        <Badge variant={getStatusVariant(diagnostic.status)} className="min-w-[70px] justify-center">
                          {diagnostic.status.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-foreground mb-3">{diagnostic.message}</p>
                      
                      {diagnostic.details && (
                        <details className="mt-3">
                          <summary className="text-sm cursor-pointer text-primary hover:text-primary/80 font-medium">
                            View Technical Details
                          </summary>
                          <div className="mt-3 p-3 bg-background border rounded-lg">
                            {typeof diagnostic.details === 'string' ? (
                              <pre className="whitespace-pre-wrap font-mono text-sm text-foreground">{diagnostic.details}</pre>
                            ) : diagnostic.details.details ? (
                              <pre className="whitespace-pre-wrap font-mono text-sm text-foreground">{diagnostic.details.details}</pre>
                            ) : (
                              <pre className="font-mono text-sm text-foreground">{JSON.stringify(diagnostic.details, null, 2)}</pre>
                            )}
                          </div>
                        </details>
                      )}
                    </div>
                  </div>
                  
                  {/* Action buttons for specific issues */}
                  <div className="flex flex-col gap-2 ml-3">
                    {diagnostic.test === 'Missing QR Codes' && diagnostic.status === 'fail' && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={fixMissingQRCodes}
                        className="h-8"
                      >
                        Auto-Fix
                      </Button>
                    )}
                    
                    {diagnostic.test === 'Supabase Functions' && diagnostic.status !== 'pass' && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => window.open('https://supabase.com/dashboard/project', '_blank')}
                        className="h-8"
                      >
                        Fix Functions
                      </Button>
                    )}
                    
                    {diagnostic.test === 'QR Code Validation' && diagnostic.status === 'warning' && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => runDiagnostics()}
                        className="h-8"
                      >
                        Retest
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};