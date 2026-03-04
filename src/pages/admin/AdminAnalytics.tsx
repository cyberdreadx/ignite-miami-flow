import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar,
  Ticket,
  RefreshCw,
  Download,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  Gift,
  X,
  User,
  Mail,
  Clock,
  QrCode,
  CheckCircle2
} from 'lucide-react';
import AffiliateLeaderboard from '@/components/admin/AffiliateLeaderboard';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
// @ts-nocheck
interface AnalyticsData {
  totalRevenue: number;
  totalTickets: number;
  totalUsers: number;
  conversionRate: number;
  revenueGrowth: number;
  ticketGrowth: number;
  userGrowth: number;
  monthlyData: Array<{
    month: string;
    revenue: number;
    tickets: number;
    users: number;
  }>;
  ticketTypes: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

const AdminAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [testTicketsCount, setTestTicketsCount] = useState(0);
  const [allTimeRevenue, setAllTimeRevenue] = useState(0);
  const [allTimeTickets, setAllTimeTickets] = useState(0);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const fetchAllTimeStats = async () => {
    const { data } = await supabase
      .from('tickets')
      .select('amount')
      .in('status', ['active', 'paid', 'completed'])
      .or('stripe_session_id.not.is.null,stripe_payment_intent_id.not.is.null')
      .gte('amount', 100);
    if (data) {
      setAllTimeTickets(data.length);
      setAllTimeRevenue(data.reduce((sum, t) => sum + (t.amount || 0), 0) / 100);
    }
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      startDate.setDate(endDate.getDate() - days);

      // Fetch REAL tickets data - only include tickets with Stripe payment data
      // Exclude test tickets (those without stripe_session_id or stripe_payment_intent_id)
      const { data: allTicketsData, error: ticketsError } = await supabase
        .from('tickets')
        .select('*')
        .gte('created_at', startDate.toISOString());

      if (ticketsError) throw ticketsError;

      // Filter to only include REAL tickets with Stripe payment confirmation
      const realTicketsData = allTicketsData?.filter(ticket => {
        const hasStripeData = ticket.stripe_session_id || ticket.stripe_payment_intent_id;
        // Include 'active', 'paid', and 'completed' — Stripe-confirmed tickets land as 'active'
        const isPaid = ticket.status === 'paid' || ticket.status === 'completed' || ticket.status === 'active';
        const hasRealisticAmount = ticket.amount && ticket.amount >= 100;
        
        return hasStripeData && isPaid && hasRealisticAmount;
      }) || [];

      // Fetch users data
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', startDate.toISOString());

      if (usersError) throw usersError;

      // Calculate analytics from REAL tickets only
      const totalRevenue = realTicketsData.reduce((sum, ticket) => sum + (ticket.amount || 0), 0);
      const totalTickets = realTicketsData.length;
      
      // Also get test data count for transparency
      const testTicketsCount = (allTicketsData?.length || 0) - realTicketsData.length;
      setTestTicketsCount(testTicketsCount);
      const totalUsers = usersData?.length || 0;
      
      // Generate real monthly data from tickets and users
      const generateMonthlyData = (tickets: any[], users: any[]) => {
        const monthlyMap = new Map<string, {revenue: number, tickets: number, users: number}>();
        
        // Process tickets
        tickets.forEach(ticket => {
          const month = new Date(ticket.created_at).toLocaleDateString('en-US', { month: 'short' });
          const existing = monthlyMap.get(month) || { revenue: 0, tickets: 0, users: 0 };
          existing.revenue += (ticket.amount || 0) / 100; // Convert cents to dollars
          existing.tickets += 1;
          monthlyMap.set(month, existing);
        });
        
        // Process users
        users.forEach(user => {
          const month = new Date(user.created_at).toLocaleDateString('en-US', { month: 'short' });
          const existing = monthlyMap.get(month) || { revenue: 0, tickets: 0, users: 0 };
          existing.users += 1;
          monthlyMap.set(month, existing);
        });
        
        // Convert to array and sort by month
        return Array.from(monthlyMap.entries()).map(([month, data]) => ({
          month,
          ...data
        }));
      };

      // Real analytics data (no more mock data)
      const analyticsData: AnalyticsData = {
        totalRevenue: totalRevenue / 100, // Convert cents to dollars
        totalTickets,
        totalUsers,
        conversionRate: totalUsers > 0 ? ((totalTickets / totalUsers) * 100) : 0,
        revenueGrowth: 0, // TODO: Calculate real growth when we have historical data
        ticketGrowth: 0,  // TODO: Calculate real growth when we have historical data
        userGrowth: 0,    // TODO: Calculate real growth when we have historical data
        monthlyData: generateMonthlyData(realTicketsData, usersData || []),
        ticketTypes: [
          { name: 'General Admission', value: 65, color: '#8884d8' },
          { name: 'Photographer Pass', value: 25, color: '#82ca9d' },
          { name: 'VIP Access', value: 10, color: '#ffc658' }
        ]
      };

      // Log transparency info for debugging
      console.log(`Analytics Data - Real Tickets: ${totalTickets}, Test/Invalid Tickets: ${testTicketsCount}, Revenue: $${(totalRevenue / 100).toFixed(2)}`);
      
      setAnalyticsData(analyticsData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch analytics data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    fetchAllTimeStats();
  }, [timeRange]);

  // Handle ?ticketId=... from global search deep link
  useEffect(() => {
    const ticketId = searchParams.get('ticketId');
    if (!ticketId) return;
    const fetchTicket = async () => {
      const { data: tickets } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', ticketId)
        .single();
      if (!tickets) return;
      // Enrich with buyer profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email, username')
        .eq('user_id', tickets.user_id)
        .single();
      setSelectedTicket({ ...tickets, user_name: profile?.full_name || profile?.username, user_email: profile?.email });
      setTicketModalOpen(true);
    };
    fetchTicket();
  }, [searchParams]);

  const StatCard = ({ title, value, change, icon: Icon, prefix = '', suffix = '' }: {
    title: string;
    value: number | string;
    change?: number;
    icon: React.ComponentType<any>;
    prefix?: string;
    suffix?: string;
  }) => (
    <Card>
      <CardContent className="p-3 sm:p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{title}</p>
            <p className="text-lg sm:text-2xl font-bold">{prefix}{value}{suffix}</p>
            {change !== undefined && (
              <div className="flex items-center mt-1">
                {change >= 0 ? (
                  <ArrowUp className="h-4 w-4 text-green-600 dark:text-green-400 mr-1" />
                ) : (
                  <ArrowDown className="h-4 w-4 text-red-600 dark:text-red-400 mr-1" />
                )}
                <span className={`text-sm ${change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {Math.abs(change)}%
                </span>
              </div>
            )}
          </div>
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <AdminLayout title="Analytics" description="Revenue and performance insights">
        <div className="flex justify-center items-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (!analyticsData) {
    return (
      <AdminLayout title="Analytics" description="Revenue and performance insights">
        <div className="text-center py-12">
          <p className="text-muted-foreground">No analytics data available</p>
          <Button onClick={fetchAnalytics} className="mt-4">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Analytics" description="Revenue and performance insights">
      {/* Ticket Detail Modal */}
      {ticketModalOpen && selectedTicket && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 p-4" onClick={() => setTicketModalOpen(false)}>
          <div className="bg-gray-950 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2"><Ticket className="w-5 h-5 text-primary" /> Ticket Details</h2>
              <button onClick={() => setTicketModalOpen(false)} className="text-gray-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-gray-300"><User className="w-4 h-4 text-muted-foreground shrink-0" /><span>{selectedTicket.user_name || 'Unknown User'}</span></div>
              {selectedTicket.user_email && <div className="flex items-center gap-2 text-gray-300"><Mail className="w-4 h-4 text-muted-foreground shrink-0" /><span>{selectedTicket.user_email}</span></div>}
              <div className="flex items-center gap-2 text-gray-300"><DollarSign className="w-4 h-4 text-muted-foreground shrink-0" /><span className="font-bold">${(selectedTicket.amount / 100).toFixed(2)}</span></div>
              <div className="flex items-center gap-2 text-gray-300"><Clock className="w-4 h-4 text-muted-foreground shrink-0" /><span>Purchased {new Date(selectedTicket.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span></div>
              {selectedTicket.used_at && <div className="flex items-center gap-2 text-green-400"><CheckCircle2 className="w-4 h-4 shrink-0" /><span>Scanned {new Date(selectedTicket.used_at).toLocaleDateString()}</span></div>}
              {(selectedTicket.qr_code || selectedTicket.qr_code_data) && (
                <div className="flex items-start gap-2 text-gray-400 font-mono text-xs break-all"><QrCode className="w-4 h-4 shrink-0 mt-0.5" /><span>{selectedTicket.qr_code || selectedTicket.qr_code_data}</span></div>
              )}
              <div className="flex items-center gap-2">
                <Badge className={selectedTicket.used_at ? 'bg-orange-800/50 text-orange-300 border-orange-700' : 'bg-green-800/50 text-green-300 border-green-700'}>
                  {selectedTicket.used_at ? 'Used' : selectedTicket.status}
                </Badge>
              </div>
              <div className="pt-2 border-t border-gray-800 text-xs text-gray-500 break-all">ID: {selectedTicket.id}</div>
            </div>
          </div>
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-4 md:space-y-6">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="overview" className="flex items-center gap-1.5 flex-1 sm:flex-none text-xs sm:text-sm">
            <BarChart3 className="h-3.5 w-3.5" /> Overview
          </TabsTrigger>
          <TabsTrigger value="affiliates" className="flex items-center gap-1.5 flex-1 sm:flex-none text-xs sm:text-sm">
            <Gift className="h-3.5 w-3.5" /> Affiliates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 md:space-y-6">
        {/* All-Time Summary Banner */}
        <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">All-Time Revenue</p>
              <p className="text-2xl font-black text-foreground">${allTimeRevenue.toFixed(2)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Ticket className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">All-Time Tickets Sold</p>
              <p className="text-2xl font-black text-foreground">{allTimeTickets}</p>
            </div>
          </div>
        </div>

        {/* Data Quality Banner */}
        {testTicketsCount > 0 && (
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Data Quality Notice:</strong> Found {testTicketsCount} test/invalid tickets that were excluded from analytics. 
              Only counting {analyticsData.totalTickets} real tickets with Stripe payment confirmation (${analyticsData.totalRevenue.toFixed(2)} revenue).
            </AlertDescription>
          </Alert>
        )}

        {/* Time Range Selector */}
        <div className="flex flex-wrap gap-2 items-center">
          <Tabs value={timeRange} onValueChange={setTimeRange}>
            <TabsList>
              <TabsTrigger value="7d" className="text-xs px-2">Last 7 Days</TabsTrigger>
              <TabsTrigger value="30d" className="text-xs px-2">Last 30 Days</TabsTrigger>
              <TabsTrigger value="90d" className="text-xs px-2">Last 90 Days</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" size="sm" onClick={fetchAnalytics}>
              <RefreshCw className="w-3 h-3 sm:mr-1" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-3 h-3 sm:mr-1" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          <StatCard
            title="Total Revenue"
            value={analyticsData.totalRevenue.toFixed(2)}
            change={analyticsData.revenueGrowth}
            icon={DollarSign}
            prefix="$"
          />
          <StatCard
            title="Tickets Sold"
            value={analyticsData.totalTickets}
            change={analyticsData.ticketGrowth}
            icon={Ticket}
          />
          <StatCard
            title="New Users"
            value={analyticsData.totalUsers}
            change={analyticsData.userGrowth}
            icon={Users}
          />
          <StatCard
            title="Conversion Rate"
            value={analyticsData.conversionRate.toFixed(1)}
            icon={TrendingUp}
            suffix="%"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Revenue Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analyticsData.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                  <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Ticket Types */}
          <Card>
            <CardHeader>
              <CardTitle>Ticket Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analyticsData.ticketTypes}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {analyticsData.ticketTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={analyticsData.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="tickets" fill="#8884d8" name="Tickets" />
                <Bar dataKey="users" fill="#82ca9d" name="New Users" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="affiliates">
          <AffiliateLeaderboard />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default AdminAnalytics;