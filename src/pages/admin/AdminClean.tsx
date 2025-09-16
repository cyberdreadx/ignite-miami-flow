import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/AdminSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/contexts/UserRoleContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  DollarSign,
  Ticket,
  Camera,
  CheckCircle,
  XCircle,
  LogOut
} from 'lucide-react';
import { AdminQRCodeFixer } from '@/components/AdminQRCodeFixer';
import { EventAnalyticsTabs } from '@/components/EventAnalyticsTabs';
import ExpenseTracker from '@/components/ExpenseTracker';
import AdminAffiliateManager from '@/components/AdminAffiliateManager';

interface QuickStats {
  total_tickets: number;
  total_revenue: number;
  pending_users: number;
  media_passes: number;
}

interface PendingUser {
  user_id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

const Admin = () => {
  const { user, signOut } = useAuth();
  const { isAdmin } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [quickStats, setQuickStats] = useState<QuickStats>({
    total_tickets: 0,
    total_revenue: 0,
    pending_users: 0,
    media_passes: 0
  });
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not admin
  useEffect(() => {
    if (user && !isAdmin) {
      navigate('/');
      return;
    }
  }, [user, isAdmin, navigate]);

  // Fetch essential data only
  useEffect(() => {
    if (user && isAdmin) {
      fetchQuickStats();
      fetchPendingUsers();
    }
  }, [user, isAdmin]);

  const fetchQuickStats = async () => {
    try {
      // Get ticket stats
      const { data: tickets } = await supabase
        .from('tickets')
        .select('amount, status')
        .eq('status', 'paid');

      // Get pending users count
      const { data: pending } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('approval_status', 'pending');

      // Get media passes count
      const { data: mediaPasses } = await supabase
        .from('media_passes')
        .select('id')
        .eq('status', 'paid');

      const totalRevenue = tickets?.reduce((sum, ticket) => sum + (ticket.amount || 0), 0) || 0;

      setQuickStats({
        total_tickets: tickets?.length || 0,
        total_revenue: totalRevenue,
        pending_users: pending?.length || 0,
        media_passes: mediaPasses?.length || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingUsers = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('user_id, email, full_name, role, created_at')
        .eq('approval_status', 'pending')
        .order('created_at', { ascending: true })
        .limit(5); // Only show first 5

      setPendingUsers(data || []);
    } catch (error) {
      console.error('Error fetching pending users:', error);
    }
  };

  const handleUserApproval = async (userId: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase.rpc('update_user_approval', {
        target_user_id: userId,
        new_status: status
      });

      if (error) throw error;

      toast({
        title: `User ${status}`,
        description: `User has been ${status} successfully.`,
      });

      fetchPendingUsers();
      fetchQuickStats();
    } catch (error) {
      console.error('Error updating user approval:', error);
      toast({
        title: "Error",
        description: "Failed to update user approval.",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (!user || !isAdmin) {
    return <div>Access denied</div>;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="border-b">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-4">
                <SidebarTrigger className="md:hidden" />
                <div>
                  <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                  <p className="text-muted-foreground">SkateBurn Event Management</p>
                </div>
              </div>
              <Button variant="outline" onClick={handleSignOut} size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-3 md:p-6 space-y-6 md:space-y-8">
            
            {/* Emergency Tools */}
            <div id="qr-fix" className="block md:hidden">
              <AdminQRCodeFixer />
            </div>
            
            {/* Desktop Emergency Tools */}
            <div id="qr-fix" className="hidden md:block">
              <AdminQRCodeFixer />
            </div>
            
            {/* Event Analytics - This replaces the confusing SkateBurn Tuesdays card */}
            <div id="events">
              <EventAnalyticsTabs />
            </div>

            {/* Quick Stats */}
            <div id="dashboard">
              <h2 className="text-lg md:text-xl font-semibold mb-4">Overview</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <Card>
                  <CardHeader className="pb-2 px-3 md:px-6">
                    <CardTitle className="text-xs md:text-sm font-medium flex items-center gap-2">
                      <Ticket className="h-4 w-4" />
                      Tickets Sold
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 md:px-6">
                    <div className="text-xl md:text-2xl font-bold">{quickStats.total_tickets}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2 px-3 md:px-6">
                    <CardTitle className="text-xs md:text-sm font-medium flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Revenue
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 md:px-6">
                    <div className="text-xl md:text-2xl font-bold">${(quickStats.total_revenue / 100).toFixed(0)}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2 px-3 md:px-6">
                    <CardTitle className="text-xs md:text-sm font-medium flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Pending
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 md:px-6">
                    <div className="text-xl md:text-2xl font-bold">{quickStats.pending_users}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2 px-3 md:px-6">
                    <CardTitle className="text-xs md:text-sm font-medium flex items-center gap-2">
                      <Camera className="h-4 w-4" />
                      Media Passes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 md:px-6">
                    <div className="text-xl md:text-2xl font-bold">{quickStats.media_passes}</div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Pending Approvals */}
            {pendingUsers.length > 0 && (
              <div id="pending">
                <h2 className="text-lg md:text-xl font-semibold mb-4">Pending Approvals</h2>
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {pendingUsers.map((user) => (
                        <div key={user.user_id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-medium text-sm md:text-base">{user.full_name || user.email}</div>
                            <div className="text-xs md:text-sm text-muted-foreground flex flex-wrap items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {user.role}
                              </Badge>
                              {user.email}
                            </div>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUserApproval(user.user_id, 'approved')}
                              className="text-green-600 hover:text-green-700 p-2"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUserApproval(user.user_id, 'rejected')}
                              className="text-red-600 hover:text-red-700 p-2"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Financial Management */}
            <div id="expenses">
              <h2 className="text-lg md:text-xl font-semibold mb-4">Expenses</h2>
              <ExpenseTracker />
            </div>

            {/* Affiliate Management */}
            <div id="affiliates">
              <h2 className="text-lg md:text-xl font-semibold mb-4">Affiliates</h2>
              <AdminAffiliateManager />
            </div>

          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Admin;