import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  Loader2,
  Database,
  Filter
} from 'lucide-react';

interface TestDataStats {
  totalTickets: number;
  realTickets: number;
  testTickets: number;
  invalidTickets: number;
  pendingTickets: number;
  cleanupActions: string[];
}

export const TestDataCleaner: React.FC = () => {
  const [stats, setStats] = useState<TestDataStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const { toast } = useToast();

  const analyzeTickets = async () => {
    setLoading(true);
    try {
      const { data: allTickets, error } = await supabase
        .from('tickets')
        .select('*');

      if (error) throw error;

      const realTickets = allTickets?.filter(ticket => {
        const hasStripeData = ticket.stripe_session_id || ticket.stripe_payment_intent_id;
        const isPaid = ticket.status === 'paid' || ticket.status === 'completed';
        const hasRealisticAmount = ticket.amount && ticket.amount >= 100;
        return hasStripeData && isPaid && hasRealisticAmount;
      }) || [];

      const testTickets = allTickets?.filter(ticket => {
        return ticket.status === 'test' || 
               (ticket.amount && ticket.amount < 100 && !ticket.stripe_session_id);
      }) || [];

      // Find pending tickets older than 1 hour (likely abandoned)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const pendingTickets = allTickets?.filter(ticket => {
        return ticket.status === 'pending' && ticket.created_at < oneHourAgo;
      }) || [];

      const invalidTickets = allTickets?.filter(ticket => {
        const isReal = realTickets.includes(ticket);
        const isTest = testTickets.includes(ticket);
        const isPending = pendingTickets.includes(ticket);
        return !isReal && !isTest && !isPending;
      }) || [];

      const cleanupActions: string[] = [];
      if (testTickets.length > 0) {
        cleanupActions.push(`Remove ${testTickets.length} test tickets`);
      }
      if (pendingTickets.length > 0) {
        cleanupActions.push(`Remove ${pendingTickets.length} abandoned pending tickets (>1hr old)`);
      }
      if (invalidTickets.length > 0) {
        cleanupActions.push(`Remove ${invalidTickets.length} invalid/orphaned tickets`);
      }

      setStats({
        totalTickets: allTickets?.length || 0,
        realTickets: realTickets.length,
        testTickets: testTickets.length,
        invalidTickets: invalidTickets.length,
        pendingTickets: pendingTickets.length,
        cleanupActions
      });

    } catch (error: any) {
      console.error('Error analyzing tickets:', error);
      toast({
        title: 'Analysis Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const cleanupTestData = async () => {
    if (!stats) return;
    
    setCleaning(true);
    try {
      let cleanedCount = 0;

      // Remove test tickets
      const { data: testTickets } = await supabase
        .from('tickets')
        .select('id')
        .eq('status', 'test');

      if (testTickets && testTickets.length > 0) {
        const { error: deleteTestError } = await supabase
          .from('tickets')
          .delete()
          .eq('status', 'test');

        if (deleteTestError) throw deleteTestError;
        cleanedCount += testTickets.length;
      }

      // Remove pending tickets older than 1 hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { data: pendingTickets } = await supabase
        .from('tickets')
        .select('id')
        .eq('status', 'pending')
        .lt('created_at', oneHourAgo);

      if (pendingTickets && pendingTickets.length > 0) {
        const { error: deletePendingError } = await supabase
          .from('tickets')
          .delete()
          .eq('status', 'pending')
          .lt('created_at', oneHourAgo);

        if (deletePendingError) throw deletePendingError;
        cleanedCount += pendingTickets.length;
      }

      // Remove tiny amount tickets without Stripe data (likely test data)
      const { data: tinyTickets } = await supabase
        .from('tickets')
        .select('id')
        .lt('amount', 100)
        .is('stripe_session_id', null)
        .is('stripe_payment_intent_id', null);

      if (tinyTickets && tinyTickets.length > 0) {
        const { error: deleteTinyError } = await supabase
          .from('tickets')
          .delete()
          .lt('amount', 100)
          .is('stripe_session_id', null)
          .is('stripe_payment_intent_id', null);

        if (deleteTinyError) throw deleteTinyError;
        cleanedCount += tinyTickets.length;
      }

      toast({
        title: 'Cleanup Complete',
        description: `Removed ${cleanedCount} test/invalid tickets`,
      });

      // Refresh analysis
      await analyzeTickets();

    } catch (error: any) {
      console.error('Error cleaning up test data:', error);
      toast({
        title: 'Cleanup Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setCleaning(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Test Data Cleaner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={analyzeTickets} 
            disabled={loading}
            variant="outline"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Database className="h-4 w-4 mr-2" />
            )}
            Analyze Tickets
          </Button>
          
          {stats && stats.cleanupActions.length > 0 && (
            <Button 
              onClick={cleanupTestData} 
              disabled={cleaning}
              variant="destructive"
            >
              {cleaning ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Clean Up Test Data
            </Button>
          )}
        </div>

        {stats && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.totalTickets}</div>
                <div className="text-sm text-muted-foreground">Total Tickets</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.realTickets}</div>
                <div className="text-sm text-muted-foreground">Real Tickets</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.testTickets}</div>
                <div className="text-sm text-muted-foreground">Test Tickets</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.pendingTickets}</div>
                <div className="text-sm text-muted-foreground">Pending Tickets</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.invalidTickets}</div>
                <div className="text-sm text-muted-foreground">Invalid Tickets</div>
              </div>
            </div>

            {stats.cleanupActions.length > 0 ? (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Cleanup Recommended:</strong>
                  <ul className="mt-2 space-y-1">
                    {stats.cleanupActions.map((action, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            ) : (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Data Clean:</strong> No test or invalid tickets found. Analytics are using real data only.
                </AlertDescription>
              </Alert>
            )}

            <div className="text-sm text-muted-foreground space-y-1">
              <div><strong>Real Ticket Criteria:</strong> Must have Stripe payment data, 'paid' status, and amount ≥ $1.00</div>
              <div><strong>Pending Cleanup:</strong> Removes pending tickets older than 1 hour (likely abandoned checkouts)</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};