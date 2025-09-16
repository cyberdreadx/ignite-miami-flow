import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Cloud, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  ExternalLink,
  RefreshCw,
  Loader2
} from 'lucide-react';

interface FunctionStatus {
  name: string;
  displayName: string;
  status: 'unknown' | 'active' | 'error' | 'missing';
  message: string;
  details?: any;
}

export const SupabaseFunctionChecker: React.FC = () => {
  const [functions, setFunctions] = useState<FunctionStatus[]>([]);
  const [testing, setTesting] = useState(false);
  const { toast } = useToast();

  const checkFunctions = async () => {
    setTesting(true);
    
    const functionsToTest = [
      { name: 'generate-qr-code', displayName: 'Generate QR Code' },
      { name: 'verify-ticket-public', displayName: 'Verify Ticket (Public)' },
      { name: 'validate-qr-code', displayName: 'Validate QR Code' },
      { name: 'recover-missing-tickets', displayName: 'Recover Missing Tickets' }
    ];

    const results: FunctionStatus[] = [];

    for (const func of functionsToTest) {
      try {
        const { data, error } = await supabase.functions.invoke(func.name, {
          body: { test: 'healthcheck' }
        });

        if (!error) {
          results.push({
            name: func.name,
            displayName: func.displayName,
            status: 'active',
            message: 'Function is responding normally',
            details: data
          });
        } else if (error.message?.includes('validation') || 
                   error.message?.includes('required') ||
                   error.message?.includes('invalid')) {
          results.push({
            name: func.name,
            displayName: func.displayName,
            status: 'active',
            message: 'Function is active (validation error expected for test data)',
            details: error
          });
        } else {
          results.push({
            name: func.name,
            displayName: func.displayName,
            status: 'error',
            message: error.message || 'Unknown error',
            details: error
          });
        }
      } catch (e: any) {
        if (e.message?.includes('404') || e.message?.includes('not found')) {
          results.push({
            name: func.name,
            displayName: func.displayName,
            status: 'missing',
            message: 'Function not deployed or not found',
            details: e
          });
        } else {
          results.push({
            name: func.name,
            displayName: func.displayName,
            status: 'error',
            message: e.message || 'Connection error',
            details: e
          });
        }
      }
    }

    setFunctions(results);
    setTesting(false);

    const activeCount = results.filter(f => f.status === 'active').length;
    toast({
      title: 'Function Check Complete',
      description: `${activeCount}/${results.length} functions are working`,
      variant: activeCount === results.length ? 'default' : 'destructive'
    });
  };

  const getStatusIcon = (status: FunctionStatus['status']) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'missing': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusVariant = (status: FunctionStatus['status']) => {
    switch (status) {
      case 'active': return 'default';
      case 'error': return 'destructive';
      case 'missing': return 'secondary';
      default: return 'outline';
    }
  };

  const openSupabaseDashboard = () => {
    window.open('https://supabase.com/dashboard/project', '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="w-5 h-5" />
          Supabase Function Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={checkFunctions} disabled={testing}>
            {testing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Check Functions
              </>
            )}
          </Button>
          <Button variant="outline" onClick={openSupabaseDashboard}>
            <ExternalLink className="w-4 h-4 mr-2" />
            Open Dashboard
          </Button>
        </div>

        {functions.length > 0 && (
          <div className="space-y-3">
            {functions.map((func, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(func.status)}
                    <span className="font-medium">{func.displayName}</span>
                    <Badge variant={getStatusVariant(func.status)}>
                      {func.status.toUpperCase()}
                    </Badge>
                  </div>
                  <code className="text-xs text-muted-foreground">{func.name}</code>
                </div>
                <p className="text-sm text-muted-foreground">{func.message}</p>
                {func.details && (
                  <details className="mt-2">
                    <summary className="text-xs cursor-pointer text-blue-600">
                      Technical Details
                    </summary>
                    <pre className="text-xs mt-1 p-2 bg-muted rounded overflow-auto">
                      {JSON.stringify(func.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-3">
              <div>
                <strong>🚨 Function Deployment Issue Detected</strong>
                <p className="text-sm mt-1">Your functions exist in the code but are not deployed to Supabase.</p>
              </div>
              
              <div>
                <strong>📁 Available Functions in Code:</strong>
                <ul className="text-sm space-y-1 mt-1 ml-4">
                  <li>• <code>generate-qr-code</code> - Creates QR codes for tickets</li>
                  <li>• <code>verify-ticket-public</code> - Public ticket verification</li>
                  <li>• <code>validate-qr-code</code> - QR code validation</li>
                  <li>• <code>recover-missing-tickets</code> - Ticket recovery tools</li>
                </ul>
              </div>

              <div>
                <strong>🛠️ To Deploy Functions:</strong>
                <ol className="text-sm space-y-1 mt-1 ml-4">
                  <li>1. Install Supabase CLI: <code>npm install -g supabase</code></li>
                  <li>2. Login: <code>supabase login</code></li>
                  <li>3. Link project: <code>supabase link --project-ref YOUR_PROJECT_ID</code></li>
                  <li>4. Deploy functions: <code>supabase functions deploy</code></li>
                </ol>
              </div>

              <div>
                <strong>🔗 Quick Links:</strong>
                <div className="flex gap-2 mt-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => window.open('https://supabase.com/docs/guides/cli', '_blank')}
                  >
                    CLI Docs
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => window.open('https://supabase.com/dashboard/project', '_blank')}
                  >
                    Dashboard
                  </Button>
                </div>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};