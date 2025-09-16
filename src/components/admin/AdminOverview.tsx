import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/contexts/UserRoleContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  Target,
  Award,
  Star,
  Shield
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  pendingUsers: number;
  totalTicketsSold: number;
  totalRevenue: number;
  monthlyRevenue: number;
  weeklyTickets: number;
  averageTicketPrice: number;
  topSellingDate: string;
  conversionRate: number;
  activeSubscriptions: number;
  totalEvents: number;
  upcomingEvents: number;
}

interface RecentActivity {
  id: string;
  type: 'ticket_purchase' | 'user_signup' | 'subscription' | 'validation';
  description: string;
  timestamp: string;
  amount?: number;
  status: 'success' | 'pending' | 'failed';
}

interface QuickAction {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  action: () => void;
  color: string;
  urgent?: boolean;
}

export const AdminOverview: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const { user } = useAuth();
  const { isAdmin, hasRole } = useUserRoles();

  const fetchDashboardStats = async () => {
    try {
      // Fetch comprehensive stats
      const [
        usersRes,
        ticketsRes,
        subscriptionsRes
      ] = await Promise.all([
        supabase.from('profiles').select('id, full_name, email, created_at'),
        supabase.from('tickets').select('amount, status, created_at, valid_until, stripe_session_id, stripe_payment_intent_id'),
        supabase.from('subscriptions').select('status, current_period_end')
      ]);

      // Process users data
      const users = usersRes.data || [];
      const totalUsers = users.length;
      const pendingUsers = 0; // Will need to check user roles for approval status

      // Process tickets data - filter out test tickets
      const allTickets = ticketsRes.data || [];
      
      // Filter to only include REAL tickets with Stripe payment confirmation
      const realTickets = allTickets.filter(ticket => {
        // Must have either Stripe session ID or payment intent ID
        const hasStripeData = ticket.stripe_session_id || ticket.stripe_payment_intent_id;
        // Must have paid status
        const isPaid = ticket.status === 'paid' || ticket.status === 'completed';
        // Must have realistic amount (> $1 = 100 cents)
        const hasRealisticAmount = ticket.amount && ticket.amount >= 100;
        
        return hasStripeData && isPaid && hasRealisticAmount;
      });
      
      const tickets = realTickets;
      const paidTickets = tickets; // Already filtered for paid tickets above
      const totalTicketsSold = paidTickets.length;
      const totalRevenue = paidTickets.reduce((sum, t) => sum + (t.amount || 0), 0) / 100; // Convert cents to dollars
      
      // Monthly revenue (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const monthlyTickets = paidTickets.filter(t => 
        new Date(t.created_at) >= thirtyDaysAgo
      );
      const monthlyRevenue = monthlyTickets.reduce((sum, t) => sum + (t.amount || 0), 0) / 100; // Convert cents to dollars

      // Weekly tickets (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const weeklyTickets = paidTickets.filter(t => 
        new Date(t.created_at) >= sevenDaysAgo
      ).length;

      // Average ticket price
      const averageTicketPrice = totalTicketsSold > 0 ? totalRevenue / totalTicketsSold : 0;

      // Top selling date
      const ticketsByDate = paidTickets.reduce((acc, ticket) => {
        const date = new Date(ticket.created_at).toDateString();
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const topSellingDate = Object.entries(ticketsByDate)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';

      // Conversion rate (tickets sold vs total users)
      const conversionRate = totalUsers > 0 ? (totalTicketsSold / totalUsers) * 100 : 0;

      // Active subscriptions
      const activeSubscriptions = (subscriptionsRes.data || [])
        .filter(s => s.status === 'active').length;

      // Events data - set defaults since events table might not exist
      const totalEvents = 0;
      const upcomingEvents = 0;

      setStats({
        totalUsers,
        pendingUsers,
        totalTicketsSold,
        totalRevenue,
        monthlyRevenue,
        weeklyTickets,
        averageTicketPrice,
        topSellingDate,
        conversionRate,
        activeSubscriptions,
        totalEvents,
        upcomingEvents
      });

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Set default stats if there's an error
      setStats({
        totalUsers: 0,
        pendingUsers: 0,
        totalTicketsSold: 0,
        totalRevenue: 0,
        monthlyRevenue: 0,
        weeklyTickets: 0,
        averageTicketPrice: 0,
        topSellingDate: 'N/A',
        conversionRate: 0,
        activeSubscriptions: 0,
        totalEvents: 0,
        upcomingEvents: 0
      });
    }
  };

  const fetchRecentActivity = async () => {
    try {
      // Get recent tickets - exclude test tickets
      const { data: allRecentTickets } = await supabase
        .from('tickets')
        .select('id, amount, status, created_at, stripe_session_id, stripe_payment_intent_id')
        .order('created_at', { ascending: false })
        .limit(20); // Get more to filter and then limit

      // Filter out test tickets (same logic as AdminAnalytics)
      const recentTickets = allRecentTickets?.filter(ticket => {
        // Must have either Stripe session ID or payment intent ID
        const hasStripeData = ticket.stripe_session_id || ticket.stripe_payment_intent_id;
        // Must have paid status
        const isPaid = ticket.status === 'paid' || ticket.status === 'completed';
        // Must have realistic amount (> $1 = 100 cents)
        const hasRealisticAmount = ticket.amount && ticket.amount >= 100;
        
        return hasStripeData && isPaid && hasRealisticAmount;
      }).slice(0, 10) || []; // Limit to 10 after filtering

      // Get recent users
      const { data: recentUsers } = await supabase
        .from('profiles')
        .select('id, full_name, email, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      const activities: RecentActivity[] = [];

      // Add ticket activities
      recentTickets?.forEach(ticket => {
        activities.push({
          id: `ticket-${ticket.id}`,
          type: 'ticket_purchase',
          description: `Ticket purchased for ${ticket.amount ? (ticket.amount / 100).toFixed(2) : '0'} USD`,
          timestamp: ticket.created_at,
          amount: ticket.amount,
          status: ticket.status === 'paid' ? 'success' : 'pending'
        });
      });

      // Add user signup activities
      recentUsers?.forEach(user => {
        activities.push({
          id: `user-${user.id}`,
          type: 'user_signup',
          description: `${user.full_name || user.email || 'New user'} signed up`,
          timestamp: user.created_at,
          status: 'success'
        });
      });

      // Sort by timestamp
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setRecentActivity(activities.slice(0, 10));

    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchDashboardStats(),
      fetchRecentActivity()
    ]);
    setRefreshing(false);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchDashboardStats(),
        fetchRecentActivity()
      ]);
      setLoading(false);
    };

    if (isAdmin || hasRole('moderator')) {
      loadData();
    }
  }, [isAdmin, hasRole]);

  const quickActions: QuickAction[] = [
    {
      title: 'Manage Users',
      description: `${stats?.totalUsers || 0} total users`,
      icon: Users,
      action: () => window.location.href = '/admin/members',
      color: 'bg-blue-500',
      urgent: false
    },
    {
      title: 'View Tickets',
      description: `${stats?.totalTicketsSold || 0} tickets sold`,
      icon: Calendar,
      action: () => window.location.href = '/my-tickets',
      color: 'bg-green-500'
    },
    {
      title: 'View Analytics',
      description: 'Detailed reports & insights',
      icon: TrendingUp,
      action: () => window.location.href = '/admin/analytics',
      color: 'bg-purple-500'
    },
    {
      title: 'System Diagnostics',
      description: 'Check system health',
      icon: Activity,
      action: () => window.location.href = '/admin/diagnostics',
      color: 'bg-orange-500'
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount); // Amount is already in dollars
  };

  const formatDate = (dateString: string) => {
    return new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
      .format(
        Math.round((new Date(dateString).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
        'day'
      );
  };

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'ticket_purchase': return DollarSign;
      case 'user_signup': return Users;
      case 'subscription': return Star;
      case 'validation': return CheckCircle;
      default: return Activity;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load dashboard data. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with refresh */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>
          <p className="text-gray-400">Real-time insights into your business</p>
        </div>
        <Button 
          onClick={refreshData} 
          disabled={refreshing}
          variant="outline"
          className="bg-gray-800 border-gray-600 text-gray-200 hover:bg-gray-700 hover:text-white"
        >
          <Activity className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Data Filter Notice */}
      <div className="bg-blue-900/50 border border-blue-700 rounded-lg p-3">
        <div className="flex items-center space-x-2 text-blue-200">
          <Shield className="w-4 h-4" />
          <span className="text-sm">
            📊 Analytics show only real transactions (test purchases under $1.00 are filtered out)
          </span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className={`cursor-pointer hover:shadow-lg transition-all duration-200 border-gray-800 bg-gray-950 hover:bg-gray-900 ${
                  action.urgent ? 'ring-2 ring-yellow-400 bg-yellow-900/20' : 'hover:shadow-md'
                }`}
                onClick={action.action}
              >
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-xl ${action.color} text-white shadow-sm`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-1">{action.title}</h3>
                      <p className="text-sm text-gray-400">{action.description}</p>
                    </div>
                    {action.urgent && (
                      <Badge variant="destructive" className="text-xs">
                        Urgent
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-gray-800 bg-gradient-to-r from-green-950/80 to-black">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-200">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-100">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-green-300">
              {formatCurrency(stats.monthlyRevenue)} this month
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gradient-to-r from-blue-950/80 to-black">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-200">Tickets Sold</CardTitle>
            <Activity className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-100">{stats.totalTicketsSold}</div>
            <p className="text-xs text-blue-300">
              {stats.weeklyTickets} this week
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gradient-to-r from-purple-950/80 to-black">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-200">Active Users</CardTitle>
            <Users className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-100">{stats.totalUsers}</div>
            <p className="text-xs text-purple-300">
              {stats.pendingUsers} pending approval
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gradient-to-r from-orange-950/80 to-black">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-200">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-100">{stats.conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-orange-300">
              Users to ticket buyers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-gray-800 bg-gray-950">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-200">Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Average Ticket Price</span>
              <span className="font-semibold text-gray-200">{formatCurrency(stats.averageTicketPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Active Subscriptions</span>
              <span className="font-semibold text-gray-200">{stats.activeSubscriptions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Upcoming Events</span>
              <span className="font-semibold text-gray-200">{stats.upcomingEvents}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Top Sales Day</span>
              <span className="font-semibold text-gray-200 text-xs">{stats.topSellingDate}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 border-gray-800 bg-gray-950">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-200">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {recentActivity.map(activity => {
                const Icon = getActivityIcon(activity.type);
                return (
                  <div key={activity.id} className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <Icon className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-gray-200">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDate(activity.timestamp)}
                        {activity.amount && ` • $${(activity.amount / 100).toFixed(2)}`}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      {activity.status === 'success' && <CheckCircle className="w-3 h-3 text-green-400" />}
                      {activity.status === 'pending' && <Clock className="w-3 h-3 text-yellow-400" />}
                      {activity.status === 'failed' && <XCircle className="w-3 h-3 text-red-400" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Notifications */}
      {stats.pendingUsers > 0 && (
        <Alert className="border-yellow-600 bg-yellow-900/20">
          <AlertTriangle className="h-4 w-4 text-yellow-400" />
          <AlertDescription className="text-yellow-200">
            You have {stats.pendingUsers} users waiting for approval. 
            <Button variant="link" className="p-0 h-auto ml-2 text-yellow-300 hover:text-yellow-100" onClick={() => window.location.href = '/admin/members'}>
              Review now
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};