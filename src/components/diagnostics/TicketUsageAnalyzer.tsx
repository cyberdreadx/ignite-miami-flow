import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, RefreshCw, Loader2, RotateCcw, Eye, Calendar } from 'lucide-react';
interface SuspiciousTicket {
  id: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  amount: number;
  createdAt: string;
  usedAt: string;
  usedBy: string;
  timeBetween: number; // minutes between purchase and use
  suspicious: boolean;
}
export const TicketUsageAnalyzer: React.FC = () => {
  const [suspiciousTickets, setSuspiciousTickets] = useState<SuspiciousTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [fixing, setFixing] = useState<string | null>(null);
  const {
    toast
  } = useToast();
  const analyzeSuspiciousUsage = async () => {
    setLoading(true);
    try {
      // Get tickets that were marked as used
      const {
        data: tickets,
        error: ticketsError
      } = await supabase.from('tickets').select(`
          id,
          user_id,
          amount,
          created_at,
          used_at,
          used_by,
          status
        `).not('used_at', 'is', null).eq('status', 'paid').order('created_at', {
        ascending: false
      });
      if (ticketsError) {
        throw new Error(`Failed to fetch tickets: ${ticketsError.message}`);
      }

      // Get user profiles
      const userIds = [...new Set(tickets?.map(t => t.user_id).filter(Boolean))];
      const {
        data: profiles
      } = await supabase.from('profiles').select('user_id, email, full_name').in('user_id', userIds);
      const profileMap = new Map();
      profiles?.forEach(profile => {
        profileMap.set(profile.user_id, profile);
      });

      // Analyze for suspicious patterns
      const analyzed: SuspiciousTicket[] = [];
      tickets?.forEach(ticket => {
        if (!ticket.used_at) return;
        const profile = profileMap.get(ticket.user_id);
        const createdTime = new Date(ticket.created_at);
        const usedTime = new Date(ticket.used_at);
        const timeBetween = (usedTime.getTime() - createdTime.getTime()) / (1000 * 60); // minutes

        // Suspicious if:
        // 1. Used within 10 minutes of purchase (likely automatic)
        // 2. Used by "Test System" or similar test names
        // 3. Used immediately after purchase by someone who isn't door staff
        const suspicious = timeBetween < 10 ||
        // Used within 10 minutes
        ticket.used_by?.includes('Test') || ticket.used_by?.includes('System') || timeBetween < 60 && !ticket.used_by?.includes('Door'); // Used within 1 hour by non-door staff

        analyzed.push({
          id: ticket.id,
          userId: ticket.user_id,
          userEmail: profile?.email,
          userName: profile?.full_name,
          amount: ticket.amount,
          createdAt: ticket.created_at,
          usedAt: ticket.used_at,
          usedBy: ticket.used_by,
          timeBetween,
          suspicious
        });
      });

      // Sort by most suspicious first
      analyzed.sort((a, b) => {
        if (a.suspicious && !b.suspicious) return -1;
        if (!a.suspicious && b.suspicious) return 1;
        return a.timeBetween - b.timeBetween;
      });
      setSuspiciousTickets(analyzed);
      const suspiciousCount = analyzed.filter(t => t.suspicious).length;
      toast({
        title: 'Analysis Complete',
        description: `Found ${suspiciousCount} suspicious ticket usage patterns`,
        variant: suspiciousCount > 0 ? 'destructive' : 'default'
      });
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast({
        title: 'Analysis Failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  const resetTicketUsage = async (ticketId: string) => {
    setFixing(ticketId);
    try {
      const {
        error
      } = await supabase.from('tickets').update({
        used_at: null,
        used_by: null
      }).eq('id', ticketId);
      if (error) throw error;
      setSuspiciousTickets(prev => prev.map(ticket => ticket.id === ticketId ? {
        ...ticket,
        usedAt: '',
        usedBy: '',
        suspicious: false
      } : ticket));
      toast({
        title: 'Ticket Reset',
        description: 'Ticket usage has been reset - can now be used for entry',
        variant: 'default'
      });
    } catch (error: any) {
      toast({
        title: 'Failed to reset ticket',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setFixing(null);
    }
  };
  const formatTimeBetween = (minutes: number) => {
    if (minutes < 1) return '<1 min';
    if (minutes < 60) return `${Math.round(minutes)} min`;
    if (minutes < 1440) return `${Math.round(minutes / 60)} hours`;
    return `${Math.round(minutes / 1440)} days`;
  };
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Ticket Usage Analyzer</h3>
          <p className="text-sm text-muted-foreground">
            Find tickets that may have been incorrectly marked as used
          </p>
        </div>
        <Button onClick={analyzeSuspiciousUsage} disabled={loading}>
          {loading ? <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </> : <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Analyze Usage
            </>}
        </Button>
      </div>

      {suspiciousTickets.length > 0 && <div className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Found {suspiciousTickets.filter(t => t.suspicious).length} tickets with suspicious usage patterns.
              These may have been automatically marked as used by diagnostic tests.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4">
            {suspiciousTickets.map((ticket, index) => <Card key={ticket.id} className={ticket.suspicious ? "border-red-200 bg-red-50" : "border-gray-200"}>
                <CardContent className="p-4 bg-zinc-900">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {ticket.suspicious && <AlertTriangle className="w-4 h-4 text-red-500" />}
                        <Badge variant={ticket.suspicious ? "destructive" : "secondary"}>
                          {ticket.suspicious ? "Suspicious" : "Normal"}
                        </Badge>
                        <span className="text-sm font-medium">
                          Ticket: {ticket.id.slice(-8)}
                        </span>
                      </div>
                      
                      <div className="text-sm space-y-1">
                        <p><strong>Customer:</strong> {ticket.userName || ticket.userEmail || 'Unknown'}</p>
                        <p><strong>Amount:</strong> ${(ticket.amount / 100).toFixed(2)}</p>
                        <p><strong>Purchased:</strong> {new Date(ticket.createdAt).toLocaleString()}</p>
                        <p><strong>Marked Used:</strong> {new Date(ticket.usedAt).toLocaleString()}</p>
                        <p><strong>Used By:</strong> {ticket.usedBy}</p>
                        <p className={ticket.timeBetween < 10 ? "text-red-600 font-medium" : ""}>
                          <strong>Time Between:</strong> {formatTimeBetween(ticket.timeBetween)}
                          {ticket.timeBetween < 10 && " ⚠️ Very Quick"}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => window.open(`/admin/tickets/${ticket.id}`, '_blank')}>
                        <Eye className="w-3 h-3" />
                      </Button>
                      
                      {ticket.suspicious && <Button size="sm" variant="outline" onClick={() => resetTicketUsage(ticket.id)} disabled={fixing === ticket.id} className="text-blue-600 hover:text-blue-700">
                          {fixing === ticket.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
                          Reset
                        </Button>}
                    </div>
                  </div>
                </CardContent>
              </Card>)}
          </div>
        </div>}

      {suspiciousTickets.length === 0 && !loading && <Card>
          <CardContent className="p-6 text-center">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-green-500" />
            <h4 className="text-lg font-medium mb-2">No Analysis Yet</h4>
            <p className="text-muted-foreground">
              Click "Analyze Usage" to check for tickets that may have been incorrectly marked as used.
            </p>
          </CardContent>
        </Card>}
    </div>;
};