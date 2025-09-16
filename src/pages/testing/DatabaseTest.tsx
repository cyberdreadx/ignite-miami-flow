import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import NavBar from '@/components/layout/NavBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertTriangle, User } from 'lucide-react';

const DatabaseTest = () => {
  const { user, loading: authLoading } = useAuth();
  const [testResults, setTestResults] = useState<Array<{
    test: string;
    status: 'pending' | 'success' | 'error';
    message: string;
    data?: any;
  }>>([]);
  const [testing, setTesting] = useState(false);

  const runTests = async () => {
    setTesting(true);
    const results: typeof testResults = [];

    // Test 1: Check authentication
    results.push({
      test: 'Authentication',
      status: user ? 'success' : 'error',
      message: user ? `Authenticated as ${user.email}` : 'Not authenticated',
      data: user ? { email: user.email, id: user.id } : null
    });

    // Test 2: Check profiles table access
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      if (error) throw error;
      
      results.push({
        test: 'Profiles Table Access',
        status: 'success',
        message: 'Can access profiles table',
        data: data
      });
    } catch (error: any) {
      results.push({
        test: 'Profiles Table Access',
        status: 'error',
        message: error.message || 'Unknown error',
        data: error
      });
    }

    // Test 3: Try to fetch all profiles
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(5);
      
      if (error) throw error;
      
      results.push({
        test: 'Fetch Profiles',
        status: 'success',
        message: `Fetched ${data?.length || 0} profiles`,
        data: data
      });
    } catch (error: any) {
      results.push({
        test: 'Fetch Profiles',
        status: 'error',
        message: error.message || 'Unknown error',
        data: error
      });
    }

    // Test 4: Check current user's profile
    if (user) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (error) throw error;
        
        results.push({
          test: 'Current User Profile',
          status: 'success',
          message: 'Found current user profile',
          data: data
        });
      } catch (error: any) {
        results.push({
          test: 'Current User Profile',
          status: 'error',
          message: error.message || 'Unknown error',
          data: error
        });
      }
    }

    setTestResults(results);
    setTesting(false);
  };

  useEffect(() => {
    if (!authLoading && user) {
      runTests();
    }
  }, [authLoading, user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar />
        <div className="pt-24 pb-8">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">Loading Authentication...</h1>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <div className="pt-24 pb-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Database Connection Test</h1>
            <p className="text-muted-foreground">
              Testing database access and user management functionality.
            </p>
          </div>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Authentication Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {user ? (
                  <div className="space-y-2">
                    <p className="text-sm">
                      <strong>Email:</strong> {user.email}
                    </p>
                    <p className="text-sm">
                      <strong>User ID:</strong> {user.id}
                    </p>
                  </div>
                ) : (
                  <p className="text-red-500">Not authenticated</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Database Tests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button onClick={runTests} disabled={testing || !user}>
                    {testing ? 'Running Tests...' : 'Run Database Tests'}
                  </Button>
                  
                  {testResults.map((result, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
                      {getStatusIcon(result.status)}
                      <div className="flex-1">
                        <h4 className="font-semibold">{result.test}</h4>
                        <p className="text-sm text-muted-foreground">{result.message}</p>
                        {result.data && (
                          <details className="mt-2">
                            <summary className="text-xs cursor-pointer">View Details</summary>
                            <pre className="text-xs mt-2 p-2 bg-muted rounded overflow-auto">
                              {JSON.stringify(result.data, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseTest;