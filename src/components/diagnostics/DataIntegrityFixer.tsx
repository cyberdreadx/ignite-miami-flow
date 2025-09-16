import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Loader2,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';

interface IntegrityIssue {
  ticketId: string;
  issue: string;
  amount: number;
  status: string;
  createdAt: string;
  userId: string;
  userEmail?: string;
  userName?: string;
}

export const DataIntegrityFixer: React.FC = () => {
  const [issues, setIssues] = useState<IntegrityIssue[]>([]);
  const [loading, setLoading] = useState(false);
  const [fixing, setFixing] = useState<string | null>(null);
  const { toast } = useToast();

  const findIntegrityIssues = async () => {
    setLoading(true);
    
    try {
      // Find tickets marked as paid but missing Stripe data
      const { data: tickets, error: ticketsError } = await supabase
        .from('tickets')
        .select(`
          id,
          amount,
          status,
          created_at,
          stripe_session_id,
          stripe_payment_intent_id,
          user_id
        `)
        .eq('status', 'paid')
        .order('created_at', { ascending: false });

      if (ticketsError) {
        throw new Error(`Failed to fetch tickets: ${ticketsError.message}`);
      }

      // Get user IDs for profile lookup
      const userIds = [...new Set(tickets?.map(t => t.user_id).filter(Boolean))];
      
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, email, full_name')
        .in('user_id', userIds);

      const profileMap = new Map();
      profiles?.forEach(profile => {
        profileMap.set(profile.user_id, profile);
      });

      // Find issues
      const foundIssues: IntegrityIssue[] = [];

      tickets?.forEach(ticket => {
        const hasStripeData = ticket.stripe_session_id || ticket.stripe_payment_intent_id;
        const profile = profileMap.get(ticket.user_id);

        if (!hasStripeData && ticket.amount > 500) { // > $5 in cents
          foundIssues.push({
            ticketId: ticket.id,
            issue: 'Marked as paid but missing Stripe data',
            amount: ticket.amount,
            status: ticket.status,
            createdAt: ticket.created_at,
            userId: ticket.user_id,
            userEmail: profile?.email,
            userName: profile?.full_name
          });
        }

        if (ticket.amount <= 0) {
          foundIssues.push({
            ticketId: ticket.id,
            issue: 'Invalid amount',
            amount: ticket.amount,
            status: ticket.status,
            createdAt: ticket.created_at,
            userId: ticket.user_id,
            userEmail: profile?.email,
            userName: profile?.full_name
          });
        }

        if (ticket.stripe_session_id && ticket.stripe_payment_intent_id) {
          foundIssues.push({
            ticketId: ticket.id,
            issue: 'Has both session ID and payment intent (unusual)',
            amount: ticket.amount,
            status: ticket.status,
            createdAt: ticket.created_at,
            userId: ticket.user_id,
            userEmail: profile?.email,
            userName: profile?.full_name
          });
        }
      });

      setIssues(foundIssues);

      toast({
        title: 'Integrity Check Complete',
        description: `Found ${foundIssues.length} data integrity issues`,
        variant: foundIssues.length === 0 ? 'default' : 'destructive'
      });

    } catch (error: any) {
      console.error('Integrity check error:', error);
      toast({
        title: 'Check Failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsTest = async (ticketId: string) => {
    setFixing(ticketId);
    
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ status: 'test' })
        .eq('id', ticketId);

      if (error) throw error;

      setIssues(prev => prev.filter(issue => issue.ticketId !== ticketId));
      
      toast({
        title: 'Success',
        description: 'Ticket marked as test',
        variant: 'default'
      });

    } catch (error: any) {
      toast({
        title: 'Failed to mark as test',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setFixing(null);
    }
  };

  const deleteTicket = async (ticketId: string) => {
    if (!confirm('Are you sure you want to delete this ticket? This cannot be undone.')) {
      return;
    }

    setFixing(ticketId);
    
    try {
      // Use edge function to delete with service role permissions
      const { data, error } = await supabase.functions.invoke('delete-ticket', {
        body: { ticketId }
      });

      if (error) throw error;

      setIssues(prev => prev.filter(issue => issue.ticketId !== ticketId));
      
      toast({
        title: 'Success',
        description: 'Ticket deleted',
        variant: 'default'
      });

    } catch (error: any) {
      // Fallback to direct delete (in case function doesn't exist)
      try {
        const { error: directError } = await supabase
          .from('tickets')
          .delete()
          .eq('id', ticketId);

        if (directError) throw directError;

        setIssues(prev => prev.filter(issue => issue.ticketId !== ticketId));
        
        toast({
          title: 'Success',
          description: 'Ticket deleted (direct)',
          variant: 'default'
        });

      } catch (fallbackError: any) {
        toast({
          title: 'Failed to delete ticket',
          description: `${error.message} | ${fallbackError.message}`,
          variant: 'destructive'
        });
      }
    } finally {
      setFixing(null);
    }
  };

  const viewTicketDetails = (ticketId: string) => {
    // Open ticket details in new tab or modal
    window.open(`/admin/tickets/${ticketId}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Data Integrity Issues</h3>
          <p className="text-sm text-muted-foreground">
            Find and fix tickets with payment data problems
          </p>
        </div>
        <Button onClick={findIntegrityIssues} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Find Issues
            </>
          )}
        </Button>
      </div>

      {issues.length > 0 && (
        <div className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Found {issues.length} data integrity issues that need attention.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4">
            {issues.map((issue, index) => (
              <Card key={index} className="border-orange-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-500" />
                        <Badge variant="destructive" className="text-xs">
                          Issue #{index + 1}
                        </Badge>
                        <span className="text-sm font-medium">
                          Ticket: {issue.ticketId.slice(-8)}
                        </span>
                      </div>
                      
                      <div>
                        <p className="font-medium text-red-700">{issue.issue}</p>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>Amount: ${(issue.amount / 100).toFixed(2)}</p>
                          <p>Status: {issue.status}</p>
                          <p>Date: {new Date(issue.createdAt).toLocaleDateString()}</p>
                          <p>Customer: {issue.userName || issue.userEmail || 'Unknown'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => viewTicketDetails(issue.ticketId)}
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markAsTest(issue.ticketId)}
                        disabled={fixing === issue.ticketId}
                      >
                        {fixing === issue.ticketId ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Edit className="w-3 h-3" />
                        )}
                      </Button>

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteTicket(issue.ticketId)}
                        disabled={fixing === issue.ticketId}
                      >
                        {fixing === issue.ticketId ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Trash2 className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {issues.length === 0 && !loading && (
        <Card>
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
            <h4 className="text-lg font-medium mb-2">No Issues Found</h4>
            <p className="text-muted-foreground">
              Your ticket data integrity looks good! Run a scan to check for any new issues.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};