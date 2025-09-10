import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/AdminSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/contexts/UserRoleContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO } from 'date-fns';
import { 
  Users, 
  DollarSign,
  Ticket,
  TrendingUp,
  LogOut,
  RefreshCw,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { AdminQRCodeFixer } from '@/components/AdminQRCodeFixer';

interface EventAnalytics {
  date: string;
  name: string;
  tickets_sold: number;
  total_revenue: number;
  unique_attendees: number;
  sales: Array<{
    id: string;
    user_name: string;
    amount: number;
    created_at: string;
    stripe_session_id: string;
  }>;
}

interface AdminAnalytics {
  event_stats: Record<string, EventAnalytics>;
  total_tickets: number;
  total_revenue: number;
}

const AdminRebuild = () => {
  const { user, signOut } = useAuth();
  const { isAdmin } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [rebuilding, setRebuilding] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (user && !isAdmin) {
      navigate('/');
      return;
    }
  }, [user, isAdmin, navigate]);

  // Load analytics on mount
  useEffect(() => {
    if (user && isAdmin) {
      rebuildAnalytics();
    }
  }, [user, isAdmin]);

  const rebuildAnalytics = async () => {
    setRebuilding(true);
    try {
      console.log("Starting analytics rebuild...");
      
      const { data, error } = await supabase.functions.invoke('rebuild-admin-analytics');

      if (error) {
        throw new Error(error.message);
      }

      if (data.success) {
        setAnalytics(data);
        toast({
          title: "Analytics Rebuilt",
          description: `Successfully processed ${data.total_tickets} tickets across all Tuesday events.`,
        });
      } else {
        throw new Error(data.error || 'Failed to rebuild analytics');
      }

    } catch (error) {
      console.error('Error rebuilding analytics:', error);
      toast({
        title: "Error",
        description: "Failed to rebuild analytics. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRebuilding(false);
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const formatCurrency = (cents: number) => {
    return (cents / 100).toFixed(2);
  };

  const getTuesdayStatus = (dateStr: string) => {
    const eventDate = new Date(dateStr);
    const today = new Date('2025-09-09'); // Current Tuesday
    
    if (dateStr === '2025-09-09') return 'current';
    if (eventDate < today) return 'past';
    return 'future';
  };

  if (!user || !isAdmin) {
    return <div>Access denied</div>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading admin analytics...</p>
        </div>
      </div>
    );
  }

  const eventStats = analytics?.event_stats || {};
  const events = Object.values(eventStats).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-4">
                <SidebarTrigger className="md:hidden" />
                <div>
                  <h1 className="text-2xl font-bold">Admin Analytics Dashboard</h1>
                  <p className="text-muted-foreground">Tuesday Event Sales & Analytics</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={rebuildAnalytics}
                  disabled={rebuilding}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${rebuilding ? 'animate-spin' : ''}`} />
                  {rebuilding ? 'Rebuilding...' : 'Rebuild Analytics'}
                </Button>
                <Button variant="outline" onClick={handleSignOut} size="sm">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-3 md:p-6 space-y-6">
            
            {/* Emergency Tools */}
            <AdminQRCodeFixer />

            {/* Overall Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Ticket className="h-4 w-4" />
                    Total Tickets Sold
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.total_tickets || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Total Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${formatCurrency(analytics?.total_revenue || 0)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Average per Ticket
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${analytics?.total_tickets ? formatCurrency(analytics.total_revenue / analytics.total_tickets) : '0.00'}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tuesday Events Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Tuesday Events Breakdown
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Tickets are assigned to Tuesday events based on purchase date. 
                  Purchases made UP TO a Tuesday are for that event.
                </p>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="2025-09-09" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-11 gap-1 h-auto p-1">
                    {events.map((event) => {
                      const status = getTuesdayStatus(event.date);
                      return (
                        <TabsTrigger 
                          key={event.date} 
                          value={event.date}
                          className={`text-[10px] md:text-xs p-1 md:p-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap ${
                            status === 'current' ? 'border-2 border-yellow-400' :
                            status === 'past' ? 'opacity-75' : 
                            'opacity-60'
                          }`}
                        >
                          <div className="text-center">
                            <div>{format(parseISO(event.date), 'MMM d')}</div>
                            {status === 'current' && <div className="text-[8px]">(Today)</div>}
                            {status === 'past' && <div className="text-[8px]">(Past)</div>}
                            {status === 'future' && <div className="text-[8px]">(Future)</div>}
                          </div>
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>

                  {events.map((event) => (
                    <TabsContent key={event.date} value={event.date} className="mt-4">
                      <div className="space-y-4">
                        {/* Stats for this Tuesday */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <Card>
                            <CardHeader className="pb-1 px-2 md:px-4">
                              <CardTitle className="text-xs font-medium flex items-center gap-1">
                                <Ticket className="h-3 w-3" />
                                Tickets
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="px-2 md:px-4">
                              <div className="text-lg md:text-xl font-bold">{event.tickets_sold}</div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader className="pb-1 px-2 md:px-4">
                              <CardTitle className="text-xs font-medium flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                Revenue
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="px-2 md:px-4">
                              <div className="text-lg md:text-xl font-bold">${formatCurrency(event.total_revenue)}</div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader className="pb-1 px-2 md:px-4">
                              <CardTitle className="text-xs font-medium flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                Attendees
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="px-2 md:px-4">
                              <div className="text-lg md:text-xl font-bold">{event.unique_attendees}</div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader className="pb-1 px-2 md:px-4">
                              <CardTitle className="text-xs font-medium flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                Avg. Price
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="px-2 md:px-4">
                              <div className="text-lg md:text-xl font-bold">
                                ${event.tickets_sold > 0 ? formatCurrency(event.total_revenue / event.tickets_sold) : '0.00'}
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        {/* Detailed Sales List */}
                        {event.sales && event.sales.length > 0 ? (
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-base">Sales Details</CardTitle>
                              <p className="text-sm text-muted-foreground">
                                {event.sales.length} ticket{event.sales.length !== 1 ? 's' : ''} sold for {format(parseISO(event.date), 'EEEE, MMMM d, yyyy')}
                              </p>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2 max-h-64 overflow-y-auto">
                                {event.sales.map((sale) => (
                                  <div key={sale.id} className="flex justify-between items-center p-3 border rounded-lg">
                                    <div className="flex-1">
                                      <div className="font-medium text-sm">{sale.user_name}</div>
                                      <div className="text-xs text-muted-foreground">
                                        Purchased: {format(parseISO(sale.created_at), 'MMM d, yyyy h:mm a')}
                                      </div>
                                      <div className="text-xs text-muted-foreground font-mono">
                                        {sale.stripe_session_id}
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="font-bold text-green-600">
                                        ${formatCurrency(sale.amount)}
                                      </div>
                                      <Badge variant="outline" className="text-xs">
                                        Paid
                                      </Badge>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        ) : (
                          <Card>
                            <CardContent className="p-6 text-center text-muted-foreground">
                              <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                              <p>No ticket sales for this Tuesday event</p>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminRebuild;