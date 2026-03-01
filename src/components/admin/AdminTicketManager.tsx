// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/contexts/UserRoleContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Loader2, 
  Search, 
  RefreshCw, 
  XCircle, 
  Settings,
  Download,
  QrCode,
  User,
  Mail,
  Clock,
  DollarSign,
  CheckCircle2,
  AlertCircle
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
  qr_code: string | null;
  qr_code_token: string | null;
  qr_code_data: string | null;
  stripe_session_id: string | null;
  stripe_payment_intent_id: string | null;
  user_email?: string;
  user_name?: string;
}

export const AdminTicketManager: React.FC = () => {
  const [tickets, setTickets] = useState<TicketInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
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

      const userIds = [...new Set(data?.map(ticket => ticket.user_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, email, username')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      const formattedTickets = data?.map(ticket => ({
        ...ticket,
        user_email: profileMap.get(ticket.user_id)?.email,
        user_name: profileMap.get(ticket.user_id)?.full_name || profileMap.get(ticket.user_id)?.username,
      })) || [];

      setTickets(formattedTickets);

      const total = formattedTickets.length;
      const paid = formattedTickets.filter(t => ['paid','active','completed'].includes(t.status)).length;
      const used = formattedTickets.filter(t => t.used_at).length;
      const missingQR = formattedTickets.filter(t => !t.qr_code && !t.qr_code_token).length;
      setStats({ total, paid, used, missingQR });

    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast({ title: "Error", description: "Failed to fetch tickets", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const searchTickets = async () => {
    if (!searchQuery.trim() || !isAuthorized) return;
    setLoading(true);
    try {
      // Search by name/email via profiles first
      const { data: matchingProfiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, email, username')
        .or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,username.ilike.%${searchQuery}%`);

      const matchingUserIds = matchingProfiles?.map(p => p.user_id) || [];
      
      let query = supabase.from('tickets').select('*').order('created_at', { ascending: false });
      
      if (matchingUserIds.length > 0) {
        query = query.or(`qr_code.ilike.%${searchQuery}%,user_id.in.(${matchingUserIds.join(',')})`);
      } else {
        query = query.ilike('qr_code', `%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      const userIds = [...new Set(data?.map(ticket => ticket.user_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, email, username')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      const formattedTickets = data?.map(ticket => ({
        ...ticket,
        user_email: profileMap.get(ticket.user_id)?.email,
        user_name: profileMap.get(ticket.user_id)?.full_name || profileMap.get(ticket.user_id)?.username,
      })) || [];

      setTickets(formattedTickets);
    } catch (error) {
      console.error('Error searching tickets:', error);
      toast({ title: "Search Error", description: "Failed to search tickets", variant: "destructive" });
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
      toast({ title: "QR Code Regenerated", description: "QR code successfully regenerated" });
      await fetchTickets();
    } catch (error) {
      toast({ title: "Regeneration Failed", description: "Could not regenerate QR code", variant: "destructive" });
    } finally {
      setProcessingAction('');
    }
  };

  const markTicketAsUnused = async (ticketId: string) => {
    setProcessingAction(`unused-${ticketId}`);
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ used_at: null, used_by: null })
        .eq('id', ticketId);
      if (error) throw error;
      toast({ title: "Ticket Reset", description: "Ticket marked as unused" });
      await fetchTickets();
    } catch (error) {
      toast({ title: "Reset Failed", description: "Could not reset ticket", variant: "destructive" });
    } finally {
      setProcessingAction('');
    }
  };

  const fixAllMissingQRCodes = async () => {
    setProcessingAction('fix-all-qr');
    try {
      const { data, error } = await supabase.functions.invoke('fix-missing-qr-codes');
      if (error) throw error;
      toast({ title: "QR Codes Fixed", description: data.message || "All missing QR codes generated" });
      await fetchTickets();
    } catch (error) {
      toast({ title: "Fix Failed", description: "Could not fix missing QR codes", variant: "destructive" });
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
      if (data.ticketsCreated > 0) await fetchTickets();
    } catch (error) {
      toast({ title: "Recovery Failed", description: "Could not recover missing tickets", variant: "destructive" });
    } finally {
      setProcessingAction('');
    }
  };

  const exportTicketsCSV = () => {
    const csvContent = [
      ['ID', 'User Name', 'User Email', 'Amount', 'Status', 'Created At', 'Used At', 'Used By', 'Has QR Code'].join(','),
      ...tickets.map(ticket => [
        ticket.id,
        ticket.user_name || '',
        ticket.user_email || '',
        `$${(ticket.amount / 100).toFixed(2)}`,
        ticket.status,
        new Date(ticket.created_at).toLocaleDateString(),
        ticket.used_at ? new Date(ticket.used_at).toLocaleDateString() : '',
        ticket.used_by || '',
        (ticket.qr_code || ticket.qr_code_token) ? 'Yes' : 'No'
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
    toast({ title: "Export Complete", description: "Tickets exported to CSV" });
  };

  useEffect(() => {
    if (isAuthorized) fetchTickets();
  }, [isAuthorized]);

  if (!isAuthorized) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6 text-center">
          <XCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
          <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
          <p className="text-muted-foreground">You need admin or moderator privileges.</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (ticket: TicketInfo) => {
    if (ticket.used_at) return <Badge variant="outline" className="text-xs"><CheckCircle2 className="w-3 h-3 mr-1" />Used</Badge>;
    if (['paid','active','completed'].includes(ticket.status)) return <Badge variant="default" className="text-xs">Active</Badge>;
    return <Badge variant="secondary" className="text-xs">{ticket.status}</Badge>;
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Diagnostic Tool */}
      <TicketSystemDiagnostic />

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total', value: stats.total, color: 'text-foreground' },
            { label: 'Active', value: stats.paid, color: 'text-green-600 dark:text-green-400' },
            { label: 'Used', value: stats.used, color: 'text-blue-600 dark:text-blue-400' },
            { label: 'No QR', value: stats.missingQR, color: 'text-destructive' },
          ].map(({ label, value, color }) => (
            <Card key={label}>
              <CardContent className="p-3 sm:p-4 text-center">
                <div className={`text-xl sm:text-2xl font-bold ${color}`}>{value}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">{label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Controls */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            Admin Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button onClick={fetchTickets} disabled={loading} variant="outline" size="sm">
              {loading ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <RefreshCw className="w-3 h-3 mr-1" />}
              Refresh
            </Button>
            <Button 
              onClick={fixAllMissingQRCodes}
              disabled={processingAction === 'fix-all-qr' || stats?.missingQR === 0}
              variant="outline" size="sm"
            >
              {processingAction === 'fix-all-qr' ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <QrCode className="w-3 h-3 mr-1" />}
              Fix QR ({stats?.missingQR || 0})
            </Button>
            <Button 
              onClick={recoverMissingTickets}
              disabled={processingAction === 'recover-tickets'}
              variant="outline" size="sm"
            >
              {processingAction === 'recover-tickets' ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <RefreshCw className="w-3 h-3 mr-1" />}
              Recover Tickets
            </Button>
            <Button onClick={exportTicketsCSV} disabled={tickets.length === 0} variant="outline" size="sm">
              <Download className="w-3 h-3 mr-1" />
              Export CSV
            </Button>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Search by name, email, or QR token..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchTickets()}
              className="text-sm"
            />
            <Button onClick={searchTickets} disabled={!searchQuery.trim()} size="sm">
              <Search className="w-3 h-3 sm:mr-1" />
              <span className="hidden sm:inline">Search</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">Recent Tickets ({tickets.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground text-sm">Loading tickets...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">No tickets found</div>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="border rounded-lg p-3 sm:p-4 space-y-3 hover:bg-muted/30 transition-colors">
                  {/* Row 1: Buyer info + status + amount */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="font-semibold text-sm truncate max-w-[160px] sm:max-w-xs">
                          {ticket.user_name || 'Unknown User'}
                        </span>
                        {getStatusBadge(ticket)}
                        {!ticket.qr_code && !ticket.qr_code_token && (
                          <Badge variant="destructive" className="text-xs"><AlertCircle className="w-3 h-3 mr-0.5" />No QR</Badge>
                        )}
                      </div>
                      {ticket.user_email && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-muted-foreground shrink-0" />
                          <span className="text-xs text-muted-foreground truncate">{ticket.user_email}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="font-bold text-sm">{(ticket.amount / 100).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Row 2: Metadata */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 shrink-0" />
                      <span>Purchased {new Date(ticket.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    {ticket.used_at && (
                      <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                        <CheckCircle2 className="w-3 h-3 shrink-0" />
                        <span>Scanned {new Date(ticket.used_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                    )}
                    {(ticket.qr_code || ticket.qr_code_token) && (
                      <div className="flex items-center gap-1 font-mono col-span-full">
                        <QrCode className="w-3 h-3 shrink-0" />
                        <span className="truncate">{(ticket.qr_code || ticket.qr_code_token)?.substring(0, 28)}…</span>
                      </div>
                    )}
                  </div>

                  {/* Row 3: Actions */}
                  <div className="flex flex-wrap gap-1.5 pt-1 border-t border-border/40">
                    {!ticket.qr_code && !ticket.qr_code_token && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => regenerateQRCode(ticket.id)}
                        disabled={processingAction === `regenerate-${ticket.id}`}
                        className="h-7 text-xs"
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
                        className="h-7 text-xs"
                      >
                        {processingAction === `unused-${ticket.id}` ? (
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        ) : (
                          <RefreshCw className="w-3 h-3 mr-1" />
                        )}
                        Mark Unused
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
