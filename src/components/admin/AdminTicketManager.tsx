import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/contexts/UserRoleContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Loader2, 
  Search, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Settings,
  Download,
  QrCode,
  User
} from 'lucide-react';
import { TicketSystemDiagnostic } from '../diagnostics/TicketSystemDiagnostic';

interface TicketInfo {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  created_at: string;
  valid_until: string | null;
  used_at: string | null;
  used_by: string | null;
  qr_code_token: string | null;
  qr_code_data: string | null;
  user_email?: string;
  user_name?: string;
}

export const AdminTicketManager: React.FC = () => {
  const [tickets, setTickets] = useState<TicketInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<TicketInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [processingAction, setProcessingAction] = useState<string>('');
  const [stats, setStats] = useState<{
    total: number;
    paid: number;
    used: number;
    missingQR: number;
  } | null>(null);
  
  const { user } = useAuth();
  const { isAdmin, hasRole } = useUserRoles();
  const { toast } = useToast();

  const isAuthorized = isAdmin || hasRole('moderator');

  const fetchTickets = async () => {
    if (!isAuthorized) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Get user profiles separately
      const userIds = [...new Set(data?.map(ticket => ticket.user_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      const formattedTickets = data?.map(ticket => ({
        ...ticket,
        user_email: profileMap.get(ticket.user_id)?.email,
        user_name: profileMap.get(ticket.user_id)?.full_name
      })) || [];

      setTickets(formattedTickets);

      // Calculate stats
      const total = formattedTickets.length;
      const paid = formattedTickets.filter(t => t.status === 'paid').length;
      const used = formattedTickets.filter(t => t.used_at).length;
      const missingQR = formattedTickets.filter(t => !t.qr_code_token).length;
      
      setStats({ total, paid, used, missingQR });

    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast({
        title: "Error",
        description: "Failed to fetch tickets",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const searchTickets = async () => {
    if (!searchQuery.trim() || !isAuthorized) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .or(`qr_code_token.ilike.%${searchQuery}%,id.eq.${searchQuery}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get user profiles separately
      const userIds = [...new Set(data?.map(ticket => ticket.user_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      const formattedTickets = data?.map(ticket => ({
        ...ticket,
        user_email: profileMap.get(ticket.user_id)?.email,
        user_name: profileMap.get(ticket.user_id)?.full_name
      })) || [];

      setTickets(formattedTickets);

    } catch (error) {
      console.error('Error searching tickets:', error);
      toast({
        title: "Search Error",
        description: "Failed to search tickets",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const regenerateQRCode = async (ticketId: string) => {
    setProcessingAction(`regenerate-${ticketId}`);
    try {
      const { data, error } = await supabase.functions.invoke('generate-qr-code', {
        body: { ticket_id: ticketId }
      });

      if (error) throw error;

      toast({
        title: "QR Code Regenerated",
        description: "QR code has been successfully regenerated",
      });

      await fetchTickets();

    } catch (error) {
      console.error('Error regenerating QR code:', error);
      toast({
        title: "Regeneration Failed",
        description: "Could not regenerate QR code",
        variant: "destructive",
      });
    } finally {
      setProcessingAction('');
    }
  };

  const markTicketAsUnused = async (ticketId: string) => {
    setProcessingAction(`unused-${ticketId}`);
    try {
      const { error } = await supabase
        .from('tickets')
        .update({
          used_at: null,
          used_by: null
        })
        .eq('id', ticketId);

      if (error) throw error;

      toast({
        title: "Ticket Reset",
        description: "Ticket has been marked as unused",
      });

      await fetchTickets();

    } catch (error) {
      console.error('Error resetting ticket:', error);
      toast({
        title: "Reset Failed",
        description: "Could not reset ticket",
        variant: "destructive",
      });
    } finally {
      setProcessingAction('');
    }
  };

  const fixAllMissingQRCodes = async () => {
    setProcessingAction('fix-all-qr');
    try {
      const { data, error } = await supabase.functions.invoke('fix-missing-qr-codes');

      if (error) throw error;

      toast({
        title: "QR Codes Fixed",
        description: data.message || "All missing QR codes have been generated",
      });

      await fetchTickets();

    } catch (error) {
      console.error('Error fixing QR codes:', error);
      toast({
        title: "Fix Failed",
        description: "Could not fix missing QR codes",
        variant: "destructive",
      });
    } finally {
      setProcessingAction('');
    }
  };

  const recoverMissingTickets = async () => {
    setProcessingAction('recover-tickets');
    try {
      const { data, error } = await supabase.functions.invoke('recover-missing-tickets');

      if (error) throw error;

      toast({
        title: data.ticketsCreated > 0 ? "Tickets Recovered!" : "All Caught Up!",
        description: data.message,
      });

      if (data.ticketsCreated > 0) {
        await fetchTickets();
      }

    } catch (error) {
      console.error('Error recovering tickets:', error);
      toast({
        title: "Recovery Failed",
        description: "Could not recover missing tickets",
        variant: "destructive",
      });
    } finally {
      setProcessingAction('');
    }
  };

  const exportTicketsCSV = () => {
    const csvContent = [
      ['ID', 'User Email', 'User Name', 'Amount', 'Status', 'Created At', 'Valid Until', 'Used At', 'Used By', 'Has QR Code'].join(','),
      ...tickets.map(ticket => [
        ticket.id,
        ticket.user_email || '',
        ticket.user_name || '',
        `$${(ticket.amount / 100).toFixed(2)}`,
        ticket.status,
        new Date(ticket.created_at).toLocaleDateString(),
        ticket.valid_until ? new Date(ticket.valid_until).toLocaleDateString() : '',
        ticket.used_at ? new Date(ticket.used_at).toLocaleDateString() : '',
        ticket.used_by || '',
        ticket.qr_code_token ? 'Yes' : 'No'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tickets-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Tickets exported to CSV file",
    });
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchTickets();
    }
  }, [isAuthorized]);

  if (!isAuthorized) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6 text-center">
          <XCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
          <p className="text-muted-foreground">You need admin or moderator privileges to access this tool.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Diagnostic Tool */}
      <TicketSystemDiagnostic />

      {/* Stats Dashboard */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Tickets</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.paid}</div>
              <div className="text-sm text-muted-foreground">Paid Tickets</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.used}</div>
              <div className="text-sm text-muted-foreground">Used Tickets</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.missingQR}</div>
              <div className="text-sm text-muted-foreground">Missing QR</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Admin Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Admin Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={fetchTickets}
              disabled={loading}
              variant="outline"
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              Refresh
            </Button>
            
            <Button 
              onClick={fixAllMissingQRCodes}
              disabled={processingAction === 'fix-all-qr' || stats?.missingQR === 0}
              variant="outline"
            >
              {processingAction === 'fix-all-qr' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <QrCode className="w-4 h-4 mr-2" />}
              Fix Missing QR Codes ({stats?.missingQR || 0})
            </Button>
            
            <Button 
              onClick={recoverMissingTickets}
              disabled={processingAction === 'recover-tickets'}
              variant="outline"
            >
              {processingAction === 'recover-tickets' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              Recover Missing Tickets
            </Button>
            
            <Button 
              onClick={exportTicketsCSV}
              disabled={tickets.length === 0}
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Search by email, QR token, or ticket ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchTickets()}
            />
            <Button onClick={searchTickets} disabled={!searchQuery.trim()}>
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Tickets ({tickets.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p>Loading tickets...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No tickets found
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span className="font-medium">{ticket.user_name || ticket.user_email || 'Unknown User'}</span>
                      <Badge variant={ticket.status === 'paid' ? 'default' : 'secondary'}>
                        {ticket.status}
                      </Badge>
                      {ticket.used_at && <Badge variant="outline">Used</Badge>}
                      {!ticket.qr_code_token && <Badge variant="destructive">No QR</Badge>}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ${(ticket.amount / 100).toFixed(2)}
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    <div>Created: {new Date(ticket.created_at).toLocaleString()}</div>
                    {ticket.used_at && (
                      <div>Used: {new Date(ticket.used_at).toLocaleString()} by {ticket.used_by}</div>
                    )}
                    {ticket.qr_code_token && (
                      <div className="font-mono">QR: {ticket.qr_code_token.substring(0, 20)}...</div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    {!ticket.qr_code_token && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => regenerateQRCode(ticket.id)}
                        disabled={processingAction === `regenerate-${ticket.id}`}
                      >
                        {processingAction === `regenerate-${ticket.id}` ? (
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        ) : (
                          <QrCode className="w-3 h-3 mr-1" />
                        )}
                        Generate QR
                      </Button>
                    )}
                    
                    {ticket.used_at && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markTicketAsUnused(ticket.id)}
                        disabled={processingAction === `unused-${ticket.id}`}
                      >
                        {processingAction === `unused-${ticket.id}` ? (
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        ) : (
                          <RefreshCw className="w-3 h-3 mr-1" />
                        )}
                        Mark as Unused
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};