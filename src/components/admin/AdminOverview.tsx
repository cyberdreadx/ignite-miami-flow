// @ts-nocheck
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
  Clock,
  Activity,
  Target,
  Award,
  Star,
  Shield
} from 'lucide-react';
import { EnhancedMemberManager } from '@/components/admin/EnhancedMemberManager';

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
}

interface RecentActivity {
  id: string;
  type: 'ticket_purchase' | 'user_signup' | 'subscription' | 'validation';
  description: string;
  timestamp: string;
  amount?: number;
  status: 'success' | 'pending' | 'failed';
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
      const [usersRes, ticketsRes, subscriptionsRes] = await Promise.all([
        supabase.from('profiles').select('id, full_name, email, created_at'),
        supabase.from('tickets').select('amount, status, created_at, stripe_session_id, stripe_payment_intent_id'),
        supabase.from('subscriptions').select('status, current_period_end')
      ]);

      const users = usersRes.data || [];
      const totalUsers = users.length;

      const allTickets = ticketsRes.data || [];
      const realTickets = allTickets.filter(ticket => {
        const hasStripeData = ticket.stripe_session_id || ticket.stripe_payment_intent_id;
        const isPaid = ticket.status === 'paid' || ticket.status === 'completed' || ticket.status === 'active';
        const hasRealisticAmount = ticket.amount && ticket.amount >= 100;
        return hasStripeData && isPaid && hasRealisticAmount;
      });

      const totalTicketsSold = realTickets.length;
      const totalRevenue = realTickets.reduce((sum, t) => sum + (t.amount || 0), 0) / 100;

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const monthlyTickets = realTickets.filter(t => new Date(t.created_at) >= thirtyDaysAgo);
      const monthlyRevenue = monthlyTickets.reduce((sum, t) => sum + (t.amount || 0), 0) / 100;

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const weeklyTickets = realTickets.filter(t => new Date(t.created_at) >= sevenDaysAgo).length;

      const averageTicketPrice = totalTicketsSold > 0 ? totalRevenue / totalTicketsSold : 0;

      const ticketsByDate = realTickets.reduce((acc, ticket) => {
        const date = new Date(ticket.created_at).toDateString();
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      const topSellingDate = Object.entries(ticketsByDate).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';

      const conversionRate = totalUsers > 0 ? (totalTicketsSold / totalUsers) * 100 : 0;
      const activeSubscriptions = (subscriptionsRes.data || []).filter(s => s.status === 'active').length;

      setStats({
        totalUsers,
        pendingUsers: 0,
        totalTicketsSold,
        totalRevenue,
        monthlyRevenue,
        weeklyTickets,
        averageTicketPrice,
        topSellingDate,
        conversionRate,
        activeSubscriptions,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setStats({
        totalUsers: 0, pendingUsers: 0, totalTicketsSold: 0, totalRevenue: 0,
        monthlyRevenue: 0, weeklyTickets: 0, averageTicketPrice: 0,
        topSellingDate: 'N/A', conversionRate: 0, activeSubscriptions: 0,
      });
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const { data: allRecentTickets } = await supabase
        .from('tickets')
        .select('id, amount, status, created_at, stripe_session_id, stripe_payment_intent_id')
        .order('created_at', { ascending: false })
        .limit(20);

      const recentTickets = allRecentTickets?.filter(ticket => {
        const hasStripeData = ticket.stripe_session_id || ticket.stripe_payment_intent_id;
        const isPaid = ticket.status === 'paid' || ticket.status === 'completed' || ticket.status === 'active';
        return hasStripeData && isPaid && ticket.amount >= 100;
      }).slice(0, 8) || [];

      const { data: recentUsers } = await supabase
        .from('profiles')
        .select('id, full_name, email, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      const activities: RecentActivity[] = [];

      recentTickets.forEach(ticket => {
        activities.push({
          id: `ticket-${ticket.id}`,
          type: 'ticket_purchase',
          description: `Ticket purchased — $${ticket.amount ? (ticket.amount / 100).toFixed(2) : '0'}`,
          timestamp: ticket.created_at,
          amount: ticket.amount,
          status: 'success',
        });
      });

      recentUsers?.forEach(u => {
        activities.push({
          id: `user-${u.id}`,
          type: 'user_signup',
          description: `${u.full_name || u.email || 'New user'} signed up`,
          timestamp: u.created_at,
          status: 'success',
        });
      });

      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setRecentActivity(activities.slice(0, 8));
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await Promise.all([fetchDashboardStats(), fetchRecentActivity()]);
    setRefreshing(false);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchDashboardStats(), fetchRecentActivity()]);
      setLoading(false);
    };
    if (isAdmin || hasRole('moderator')) loadData();
  }, [isAdmin, hasRole]);

  const quickActions = [
    { title: 'Users', description: `${stats?.totalUsers || 0} total`, icon: Users, action: () => document.getElementById('member-management')?.scrollIntoView({ behavior: 'smooth' }), color: 'bg-blue-500' },
    { title: 'Tickets', description: `${stats?.totalTicketsSold || 0} sold`, icon: Calendar, action: () => window.location.href = '/my-tickets', color: 'bg-green-500' },
    { title: 'Analytics', description: 'Revenue & reports', icon: TrendingUp, action: () => window.location.href = '/admin/analytics', color: 'bg-purple-500' },
    { title: 'Diagnostics', description: 'System health', icon: Activity, action: () => window.location.href = '/admin/diagnostics', color: 'bg-orange-500' },
  ];

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

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
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-3 bg-muted rounded w-3/4 mb-3"></div>
                <div className="h-7 bg-muted rounded w-1/2"></div>
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
        <AlertDescription>Failed to load dashboard data. Please refresh.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Dashboard Overview</h2>
          <p className="text-sm text-muted-foreground">Real-time insights into your business</p>
        </div>
        <Button onClick={refreshData} disabled={refreshing} variant="outline" size="sm">
          <Activity className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Data Filter Notice */}
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 flex items-center gap-2">
        <Shield className="w-4 h-4 text-primary shrink-0" />
        <span className="text-sm text-primary">Analytics show only real transactions (test purchases under $1.00 are filtered out)</span>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              <Card className="cursor-pointer hover:shadow-md transition-all duration-200" onClick={action.action}>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className={`p-2 rounded-lg ${action.color} text-white shrink-0`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-foreground text-xs sm:text-sm">{action.title}</h3>
                      <p className="text-xs text-muted-foreground truncate">{action.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), sub: `${formatCurrency(stats.monthlyRevenue)} / mo`, icon: DollarSign },
          { label: 'Tickets Sold', value: String(stats.totalTicketsSold), sub: `${stats.weeklyTickets} this week`, icon: Activity },
          { label: 'Active Users', value: String(stats.totalUsers), sub: `${stats.pendingUsers} pending`, icon: Users },
          { label: 'Conversion', value: `${stats.conversionRate.toFixed(1)}%`, sub: 'Users → buyers', icon: Target },
        ].map(({ label, value, sub, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
              <CardTitle className="text-xs font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className="h-3.5 w-3.5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="text-lg sm:text-2xl font-bold">{value}</div>
              <p className="text-xs text-muted-foreground">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance & Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: 'Avg Ticket Price', value: formatCurrency(stats.averageTicketPrice) },
              { label: 'Active Subscriptions', value: String(stats.activeSubscriptions) },
              { label: 'Best Sales Day', value: stats.topSellingDate },
              { label: 'Monthly Revenue', value: formatCurrency(stats.monthlyRevenue) },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{label}</span>
                <span className="font-semibold text-sm text-right max-w-[150px] truncate">{value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
            ) : (
              <div className="space-y-2">
                {recentActivity.map((activity) => {
                  const Icon = getActivityIcon(activity.type);
                  return (
                    <div key={activity.id} className="flex items-start gap-2">
                      <div className={`p-1.5 rounded-full shrink-0 mt-0.5 ${
                        activity.status === 'success' ? 'bg-green-500/10' : 'bg-destructive/10'
                      }`}>
                        <Icon className={`w-3 h-3 ${
                          activity.status === 'success' ? 'text-green-600 dark:text-green-400' : 'text-destructive'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs truncate">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(activity.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      {activity.amount && (
                        <span className="text-xs font-semibold shrink-0">${(activity.amount / 100).toFixed(2)}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Member Management */}
      <div id="member-management">
        <EnhancedMemberManager />
      </div>
    </div>
  );
};
