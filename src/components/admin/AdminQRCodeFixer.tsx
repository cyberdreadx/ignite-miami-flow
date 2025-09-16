import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Loader2, 
  QrCode, 
  AlertTriangle, 
  Eye, 
  ExternalLink, 
  Search,
  RefreshCw,
  Copy,
  Download
} from 'lucide-react';

interface Ticket {
  id: string;
  user_id: string;
  qr_code_token: string | null;
  amount: number;
  status: string;
  created_at: string;
  valid_until: string;
  profiles?: {
    full_name: string;
    email: string;
  };
}

export const AdminQRCodeFixer: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [qrTestResult, setQrTestResult] = useState<any>(null);
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          id,
          user_id,
          qr_code_token,
          amount,
          status,
          created_at,
          valid_until
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Fetch user profiles separately to avoid relation issues
      const ticketsWithProfiles = await Promise.all(
        (data || []).map(async (ticket) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('user_id', ticket.user_id)
            .single();

          return {
            ...ticket,
            profiles: profile || { full_name: 'Unknown', email: 'Unknown' }
          };
        })
      );

      setTickets(ticketsWithProfiles);
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

  useEffect(() => {
    fetchTickets();
  }, []);

  const filteredTickets = tickets.filter(ticket => 
    !searchTerm || 
    ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.profiles?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const generateQRCode = async (ticketId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-qr-code', {
        body: { ticket_id: ticketId }
      });

      if (error) throw error;

      toast({
        title: "QR Code Generated",
        description: "QR code has been generated successfully",
      });

      // Refresh tickets
      await fetchTickets();
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive",
      });
    }
  };

  const testQRCode = async (qrToken: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-ticket-public', {
        body: { qr_code_token: qrToken }
      });

      if (error) throw error;
      setQrTestResult(data);

      toast({
        title: "QR Test Complete",
        description: data.valid ? "QR code is valid" : "QR code validation failed",
        variant: data.valid ? "default" : "destructive",
      });
    } catch (error) {
      console.error('Error testing QR code:', error);
      toast({
        title: "Test Failed",
        description: "Failed to test QR code",
        variant: "destructive",
      });
    }
  };

  const copyQRUrl = (qrToken: string) => {
    const url = `${window.location.origin}/verify?token=${qrToken}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "URL Copied",
      description: "QR verification URL copied to clipboard",
    });
  };

  const openQRPage = (qrToken: string) => {
    const url = `${window.location.origin}/verify?token=${qrToken}`;
    window.open(url, '_blank');
  };

  const fixMissingQRCodes = async () => {
    setLoading(true);
    setResults(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('fix-missing-qr-codes');

      if (error) throw error;

      setResults(data);
      
      if (data.success) {
        toast({
          title: "QR Code Fix Complete",
          description: `Fixed ${data.fixed_count} tickets. ${data.errors ? `${data.errors.length} errors occurred.` : ''}`,
          variant: data.errors && data.errors.length > 0 ? "destructive" : "default",
        });
        
        // Refresh tickets
        await fetchTickets();
      } else {
        throw new Error(data.error || 'Unknown error occurred');
      }

    } catch (error) {
      console.error('Error fixing QR codes:', error);
      toast({
        title: "Error",
        description: "Failed to fix QR codes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="browse" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse">Browse QR Codes</TabsTrigger>
          <TabsTrigger value="test">Test QR Code</TabsTrigger>
          <TabsTrigger value="fix">Emergency Fix</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                QR Code Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search and Controls */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search by ticket ID, email, or name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button onClick={fetchTickets} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>

              {/* Tickets List */}
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredTickets.map((ticket) => (
                    <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-sm">{ticket.id.substring(0, 8)}...</span>
                          <Badge variant={ticket.qr_code_token ? 'default' : 'destructive'}>
                            {ticket.qr_code_token ? 'Has QR' : 'No QR'}
                          </Badge>
                          <Badge variant="outline">${ticket.amount}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {ticket.profiles?.full_name || 'No name'} ({ticket.profiles?.email})
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        {ticket.qr_code_token ? (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyQRUrl(ticket.qr_code_token!)}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openQRPage(ticket.qr_code_token!)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => testQRCode(ticket.qr_code_token!)}
                            >
                              Test
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => generateQRCode(ticket.id)}
                          >
                            Generate QR
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                QR Code Testing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter QR code token to test..."
                  value={selectedTicket?.qr_code_token || ''}
                  onChange={(e) => setSelectedTicket(prev => prev ? {...prev, qr_code_token: e.target.value} : null)}
                />
                <Button 
                  onClick={() => selectedTicket?.qr_code_token && testQRCode(selectedTicket.qr_code_token)}
                  disabled={!selectedTicket?.qr_code_token}
                >
                  Test
                </Button>
              </div>

              {qrTestResult && (
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Test Results:</h4>
                  <pre className="text-sm bg-muted p-3 rounded overflow-auto">
                    {JSON.stringify(qrTestResult, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fix" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                QR Code Emergency Fix
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This will scan all tickets and generate missing QR codes. Use this if you have tickets without QR codes.
              </p>
              
              <Button 
                onClick={fixMissingQRCodes} 
                disabled={loading}
                variant="destructive"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Fixing QR Codes...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Fix Missing QR Codes
                  </>
                )}
              </Button>

              {results && (
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Fix Results:</h4>
                  <pre className="text-sm bg-muted p-3 rounded overflow-auto">
                    {JSON.stringify(results, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};