import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Database, 
  CheckCircle, 
  XCircle, 
  Loader2,
  QrCode,
  TestTube
} from 'lucide-react';

export const DatabaseFunctionTester: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [qrToken, setQrToken] = useState('');
  const { toast } = useToast();

  const testDatabaseFunctions = async () => {
    setLoading(true);
    setResults([]);
    
    const tests = [
      {
        name: 'Generate QR Token',
        test: async () => {
          const { data, error } = await supabase.rpc('generate_qr_token');
          if (error) throw error;
          return { token: data, message: 'QR token generated successfully' };
        }
      },
      {
        name: 'Verify QR Token (Test)',
        test: async () => {
          // Test with a dummy token first
          const { data, error } = await supabase.rpc('verify_qr_token', { token: 'test-token' });
          if (error) throw error;
          return { data, message: 'QR verification function working (expected: invalid token)' };
        }
      },
      {
        name: 'Get Current User Role',
        test: async () => {
          const { data, error } = await supabase.rpc('get_current_user_role_from_profiles');
          if (error) throw error;
          return { role: data, message: `Current user role: ${data}` };
        }
      },
      {
        name: 'Check Admin/Moderator Role',
        test: async () => {
          const { data, error } = await supabase.rpc('current_user_has_admin_or_moderator_role');
          if (error) throw error;
          return { hasRole: data, message: `Has admin/moderator role: ${data}` };
        }
      },
      {
        name: 'Verify Media Pass QR (Test)',
        test: async () => {
          const { data, error } = await supabase.rpc('verify_media_pass_qr', { token: 'test-token' });
          if (error) throw error;
          return { data, message: 'Media pass verification function working' };
        }
      }
    ];

    const testResults = [];

    for (const test of tests) {
      try {
        const result = await test.test();
        testResults.push({
          name: test.name,
          status: 'success',
          message: result.message,
          data: result
        });
      } catch (error: any) {
        testResults.push({
          name: test.name,
          status: 'error',
          message: error.message,
          data: error
        });
      }
    }

    setResults(testResults);
    setLoading(false);

    const successCount = testResults.filter(r => r.status === 'success').length;
    toast({
      title: 'Database Function Test Complete',
      description: `${successCount}/${testResults.length} functions working`,
      variant: successCount === testResults.length ? 'default' : 'destructive'
    });
  };

  const testSpecificQRToken = async () => {
    if (!qrToken.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a QR token to test',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('verify_qr_token', { token: qrToken });
      
      if (error) throw error;

      // Database function returns an array, get first result
      const result = Array.isArray(data) ? data[0] : data;

      toast({
        title: 'QR Token Test Complete',
        description: `Token ${result?.is_valid ? 'is valid' : 'is invalid'}`,
        variant: result?.is_valid ? 'default' : 'destructive'
      });

      // Add to results
      setResults(prev => [...prev, {
        name: `Test QR Token: ${qrToken}`,
        status: result?.is_valid ? 'success' : 'warning',
        message: result?.is_valid ? 'Valid QR token' : 'Invalid QR token',
        data: result
      }]);

    } catch (error: any) {
      toast({
        title: 'Test Failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const generateNewQRToken = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('generate_qr_token');
      
      if (error) throw error;

      setQrToken(data);
      toast({
        title: 'QR Token Generated',
        description: 'New QR token generated and set in input field',
      });

    } catch (error: any) {
      toast({
        title: 'Generation Failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Database Function Tests
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={testDatabaseFunctions} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <TestTube className="w-4 h-4 mr-2" />
                  Test All Functions
                </>
              )}
            </Button>
            <Button onClick={generateNewQRToken} disabled={loading} variant="outline">
              <QrCode className="w-4 h-4 mr-2" />
              Generate QR Token
            </Button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Test Specific QR Token:</label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter QR token to test..."
                value={qrToken}
                onChange={(e) => setQrToken(e.target.value)}
                className="flex-1"
              />
              <Button onClick={testSpecificQRToken} disabled={loading || !qrToken.trim()}>
                Test Token
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {results.map((result, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {result.status === 'success' ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span className="font-medium">{result.name}</span>
                  <Badge variant={result.status === 'success' ? 'default' : 'destructive'}>
                    {result.status.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{result.message}</p>
                {result.data && (
                  <details className="mt-2">
                    <summary className="text-xs cursor-pointer text-blue-600">
                      View Data
                    </summary>
                    <pre className="text-xs mt-1 p-2 bg-muted rounded overflow-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};