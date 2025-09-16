import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/AdminSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/contexts/UserRoleContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { 
  Users, 
  MessageSquare, 
  Heart, 
  Pin, 
  Trash2, 
  Shield, 
  TrendingUp,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  LogOut,
  DollarSign,
  Calendar,
  CreditCard,
  Camera,
  Ticket
} from 'lucide-react';
import { MultiRoleManager } from '@/components/MultiRoleManager';
import { AdminEventDateCard } from '@/components/AdminEventDateCard';
import EventTicketAnalytics from '@/components/EventTicketAnalytics';
import EnhancedEventAnalytics from '@/components/EnhancedEventAnalytics';
import ExpenseTracker from '@/components/ExpenseTracker';
import AdminAffiliateManager from '@/components/AdminAffiliateManager';
import { AdminQRCodeFixer } from '@/components/AdminQRCodeFixer';

interface Post {
  id: string;
  content: string;
  created_at: string;
  pinned: boolean;
  like_count: number;
  comment_count: number;
  author_name: string;
  author_role: string;
}

interface PendingUser {
  user_id: string;
  email: string;
  full_name: string;
  role: string;
  approval_status: string;
  created_at: string;
}

interface UserStats {
  total_users: number;
  admin_count: number;
  moderator_count: number;
  total_posts: number;
  total_likes: number;
  total_comments: number;
}

interface AllUser {
  user_id: string;
  email: string;
  full_name: string;
  role: string;
  approval_status: string;
  created_at: string;
  avatar_url?: string;
}

interface ReportedPost {
  id: string;
  content: string;
  created_at: string;
  author_name: string;
  author_role: string;
  like_count: number;
  comment_count: number;
}

interface DeletionRequest {
  id: string;
  user_id: string;
  reason: string | null;
  status: string;
  created_at: string;
  user_email: string;
  user_name: string;
}

interface TicketPurchase {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  created_at: string;
  stripe_session_id: string | null;
  user_email: string;
  user_name: string;
  valid_until: string | null;
  used_at: string | null;
  used_by: string | null;
}

interface ReportedPost {
  id: string;
  content: string;
  created_at: string;
  author_name: string;
  author_role: string;
  like_count: number;
  comment_count: number;
  report_count?: number;
}

interface TicketAnalytics {
  total_tickets: number;
  total_revenue: number;
  avg_ticket_price: number;
  paid_tickets: number;
  tickets_last_7_days: number;
}

interface MediaPassAnalytics {
  total_media_passes: number;
  total_media_revenue: number;
  paid_media_passes: number;
  passes_by_type: { pass_type: string; count: number; revenue: number }[];
}

interface SalesData {
  date: string;
  tickets: number;
  media_passes: number;
  revenue: number;
}

const Admin = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [allUsers, setAllUsers] = useState<AllUser[]>([]);
  const [reportedPosts, setReportedPosts] = useState<ReportedPost[]>([]);
  const [deletionRequests, setDeletionRequests] = useState<DeletionRequest[]>([]);
  
  const [ticketAnalytics, setTicketAnalytics] = useState<TicketAnalytics | null>(null);
  const [mediaPassAnalytics, setMediaPassAnalytics] = useState<MediaPassAnalytics | null>(null);
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, signOut } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if not authenticated
  useEffect(() => {
    if (!roleLoading && !user) {
      navigate('/auth');
    }
  }, [user, roleLoading, navigate]);

  // Redirect if not admin
  useEffect(() => {
    if (!roleLoading && user && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, roleLoading, user, navigate]);

  const fetchStats = async () => {
    try {
      // Get basic stats from existing tables only
      const [usersResult, postsResult] = await Promise.all([
        supabase.from('profiles').select('role', { count: 'exact' }),
        supabase.rpc('get_posts_with_counts')
      ]);

      const adminCount = usersResult.data?.filter(u => u.role === 'admin').length || 0;
      const moderatorCount = usersResult.data?.filter(u => u.role === 'moderator').length || 0;

      // Count likes and comments from posts data
      const totalLikes = postsResult.data?.reduce((sum: number, post: any) => sum + (post.like_count || 0), 0) || 0;
      const totalComments = postsResult.data?.reduce((sum: number, post: any) => sum + (post.comment_count || 0), 0) || 0;

      setStats({
        total_users: usersResult.count || 0,
        admin_count: adminCount,
        moderator_count: moderatorCount,
        total_posts: postsResult.data?.length || 0,
        total_likes: totalLikes,
        total_comments: totalComments
      });
    } catch (error) {
      console.error('Error in fetchStats:', error);
      // Set default stats on error
      setStats({
        total_users: 0,
        admin_count: 0,
        moderator_count: 0,
        total_posts: 0,
        total_likes: 0,
        total_comments: 0
      });
    }
  };

  const fetchPosts = async () => {
    try {
      const { data: postsData, error: postsError } = await supabase
        .rpc('get_posts_with_counts');

      if (postsError) {
        console.error('Error fetching posts:', postsError);
      } else {
        setPosts(postsData || []);
      }
    } catch (error) {
      console.error('Error in fetchPosts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, email, full_name, role, approval_status, created_at')
        .eq('approval_status', 'pending')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching pending users:', error);
      } else {
        setPendingUsers(data || []);
      }
    } catch (error) {
      console.error('Error in fetchPendingUsers:', error);
    }
  };

  useEffect(() => {
    if (user && isAdmin) {
      fetchStats();
      fetchPosts();
      fetchPendingUsers();
      fetchAllUsers();
      fetchReportedPosts();
      fetchDeletionRequests();
      fetchTicketAnalytics();
      fetchMediaPassAnalytics();
      fetchSalesData();
    }
  }, [user, isAdmin]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const fetchAllUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, email, full_name, role, approval_status, created_at, avatar_url')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching all users:', error);
      } else {
        setAllUsers(data || []);
      }
    } catch (error) {
      console.error('Error in fetchAllUsers:', error);
    }
  };

  const fetchReportedPosts = async () => {
    try {
      // For now, we'll simulate reported posts by getting posts with high engagement
      // In a real app, you'd have a reports table
      const { data: postsData, error } = await supabase.rpc('get_posts_with_counts');
      
      if (error) {
        console.error('Error fetching reported posts:', error);
      } else {
        // Simulate reported posts (posts with >5 likes or comments might need review)
        const simulatedReports = postsData?.filter((post: any) => 
          (post.like_count + post.comment_count) > 5
        ).map((post: any) => ({
          ...post,
          report_count: Math.floor(Math.random() * 3) + 1 // Simulate 1-3 reports
        })) || [];
        
        setReportedPosts(simulatedReports);
      }
    } catch (error) {
      console.error('Error in fetchReportedPosts:', error);
    }
  };

  const handleTogglePin = async (postId: string, currentlyPinned: boolean) => {
    try {
      const { error } = await supabase.rpc('toggle_pin', {
        post_id: postId
      });

      if (error) {
        toast({
          title: 'Error updating post',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        fetchPosts();
        toast({
          title: currentlyPinned ? 'Post unpinned' : 'Post pinned',
          description: currentlyPinned ? 'Post removed from top of feed.' : 'Post pinned to top of feed.',
        });
      }
    } catch (error) {
      toast({
        title: 'Error updating post',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  };

  const fetchTicketAnalytics = async () => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('amount, status, created_at');

      if (error) {
        console.error('Error fetching ticket analytics:', error);
        return;
      }

      const tickets = data || [];
      const paidTickets = tickets.filter(t => t.status === 'paid');
      const last7Days = tickets.filter(t => 
        new Date(t.created_at) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      );

      setTicketAnalytics({
        total_tickets: tickets.length,
        total_revenue: paidTickets.reduce((sum, t) => sum + (t.amount || 0), 0),
        avg_ticket_price: paidTickets.length > 0 ? paidTickets.reduce((sum, t) => sum + (t.amount || 0), 0) / paidTickets.length : 0,
        paid_tickets: paidTickets.length,
        tickets_last_7_days: last7Days.length
      });
    } catch (error) {
      console.error('Error in fetchTicketAnalytics:', error);
    }
  };

  const fetchMediaPassAnalytics = async () => {
    try {
      // Use secure admin function to get media pass data
      const { data, error } = await supabase
        .rpc('get_all_media_passes_admin');

      if (error) {
        console.error('Error fetching media pass analytics:', error);
        return;
      }

      const passes = data || [];
      const paidPasses = passes.filter(p => p.status === 'paid');
      
      // Group by pass type
      const passByType = passes.reduce((acc: any, pass) => {
        const type = pass.pass_type;
        if (!acc[type]) {
          acc[type] = { pass_type: type, count: 0, revenue: 0 };
        }
        acc[type].count++;
        if (pass.status === 'paid') {
          acc[type].revenue += pass.amount || 0;
        }
        return acc;
      }, {});

      setMediaPassAnalytics({
        total_media_passes: passes.length,
        total_media_revenue: paidPasses.reduce((sum, p) => sum + (p.amount || 0), 0),
        paid_media_passes: paidPasses.length,
        passes_by_type: Object.values(passByType)
      });
    } catch (error) {
      console.error('Error in fetchMediaPassAnalytics:', error);
    }
  };

  const fetchSalesData = async () => {
    try {
      // Get last 30 days of sales data
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      const [ticketsResult, passesResult] = await Promise.all([
        supabase
          .from('tickets')
          .select('amount, created_at, status')
          .gte('created_at', thirtyDaysAgo.toISOString()),
        supabase
          .rpc('get_all_media_passes_admin')
      ]);

      // Filter media passes to only last 30 days since the function returns all
      const filteredPasses = (passesResult.data || []).filter(pass => 
        new Date(pass.created_at) >= thirtyDaysAgo
      );

      // Group by date
      const salesByDate: { [key: string]: SalesData } = {};
      
      // Process tickets
      (ticketsResult.data || []).forEach(ticket => {
        if (ticket.status === 'paid') {
          const date = new Date(ticket.created_at).toISOString().split('T')[0];
          if (!salesByDate[date]) {
            salesByDate[date] = { date, tickets: 0, media_passes: 0, revenue: 0 };
          }
          salesByDate[date].tickets++;
          salesByDate[date].revenue += ticket.amount || 0;
        }
      });

      // Process media passes
      filteredPasses.forEach(pass => {
        if (pass.status === 'paid') {
          const date = new Date(pass.created_at).toISOString().split('T')[0];
          if (!salesByDate[date]) {
            salesByDate[date] = { date, tickets: 0, media_passes: 0, revenue: 0 };
          }
          salesByDate[date].media_passes++;
          salesByDate[date].revenue += pass.amount || 0;
        }
      });

      setSalesData(Object.values(salesByDate).sort((a, b) => a.date.localeCompare(b.date)));
    } catch (error) {
      console.error('Error in fetchSalesData:', error);
    }
  };

  const handleUserApproval = async (userId: string, action: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase.rpc('update_user_approval', {
        target_user_id: userId,
        new_status: action
      });

      if (error) {
        toast({
          title: 'Error updating user status',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        fetchPendingUsers();
        fetchStats();
        toast({
          title: `User ${action}`,
          description: `The user has been ${action} successfully.`,
        });
      }
    } catch (error) {
      toast({
        title: 'Error updating user status',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) {
        toast({
          title: 'Error updating role',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        fetchAllUsers();
        fetchStats();
        toast({
          title: 'Role updated',
          description: `User role has been updated to ${newRole}.`,
        });
      }
    } catch (error) {
      toast({
        title: 'Error updating role',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) {
        toast({
          title: 'Error deleting post',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        fetchPosts();
        fetchReportedPosts();
        toast({
          title: 'Post deleted',
          description: 'The post has been removed.',
        });
      }
    } catch (error) {
      toast({
        title: 'Error deleting post',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  };

  const fetchDeletionRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('account_deletion_requests')
        .select(`
          id,
          user_id,
          reason,
          status,
          created_at,
          profiles!account_deletion_requests_user_id_fkey (
            email,
            full_name
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching deletion requests:', error);
      } else {
        const mappedRequests = (data || []).map((req: any) => ({
          id: req.id,
          user_id: req.user_id,
          reason: req.reason,
          status: req.status,
          created_at: req.created_at,
          user_email: req.profiles?.email || 'Unknown',
          user_name: req.profiles?.full_name || req.profiles?.email || 'Unknown User',
        }));
        setDeletionRequests(mappedRequests);
      }
    } catch (error) {
      console.error('Error in fetchDeletionRequests:', error);
    }
  };



  const handleDeletionRequestAction = async (requestId: string, action: 'approved' | 'denied') => {
    try {
      const { error } = await supabase
        .from('account_deletion_requests')
        .update({
          status: action,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (error) {
        toast({
          title: 'Error updating request',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      if (action === 'approved') {
        // Process the actual deletion
        const { error: processError } = await supabase.rpc('process_account_deletion', {
          request_id: requestId
        });

        if (processError) {
          toast({
            title: 'Error processing deletion',
            description: processError.message,
            variant: 'destructive',
          });
          return;
        }
      }

      fetchDeletionRequests();
      fetchAllUsers();
      fetchStats();
      
      toast({
        title: `Request ${action}`,
        description: action === 'approved' 
          ? 'Account has been deleted successfully.'
          : 'Deletion request has been denied.',
        variant: action === 'approved' ? 'default' : 'destructive',
      });
    } catch (error) {
      toast({
        title: 'Error processing request',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  };

  if (roleLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        
        <main className="flex-1 overflow-auto">
          {/* Header */}
          <div className="border-b border-border bg-card sticky top-0 z-40">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-4">
                <SidebarTrigger className="md:hidden" />
                <div className="hidden md:flex items-center space-x-4">
                  <Button variant="ghost" onClick={() => navigate('/')} className="hidden lg:flex">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Feed
                  </Button>
                  <div>
                    <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                    <p className="text-muted-foreground hidden sm:block">Manage your SkateBurn community</p>
                  </div>
                </div>
                <div className="md:hidden">
                  <h1 className="text-xl font-bold">Admin Dashboard</h1>
                </div>
              </div>
              <Button variant="outline" onClick={handleSignOut} size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-6">
            {/* QR Code Emergency Fix */}
            <div id="qr-fix">
              <AdminQRCodeFixer />
            </div>
            
            {/* Event Scheduler */}
            <div id="events">
              <AdminEventDateCard />
            </div>
            {/* Stats Overview */}
            <div id="dashboard" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.total_users || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.admin_count || 0} admins, {stats?.moderator_count || 0} moderators
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.total_posts || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.total_likes || 0} likes, {stats?.total_comments || 0} comments
                  </p>
                </CardContent>
              </Card>

              <Card className="sm:col-span-2 lg:col-span-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Engagement</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats?.total_posts ? Math.round(((stats?.total_likes || 0) + (stats?.total_comments || 0)) / stats.total_posts * 10) / 10 : 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Average interactions per post
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Pending User Approvals */}
            {pendingUsers.length > 0 && (
              <Card id="pending">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Pending User Approvals
                    <Badge variant="secondary">{pendingUsers.length}</Badge>
                  </CardTitle>
                  <CardDescription>
                    Review and approve new DJs, performers, and photographers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                     {pendingUsers.map((user) => (
                       <div
                         key={user.user_id}
                         className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg space-y-3 sm:space-y-0"
                       >
                         <div className="flex items-center space-x-4">
                           <Avatar className="h-10 w-10 flex-shrink-0">
                             <AvatarFallback>
                               {user.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                             </AvatarFallback>
                           </Avatar>
                           
                           <div className="min-w-0 flex-1">
                             <div className="flex flex-wrap items-center gap-2 mb-1">
                               <p className="font-medium truncate">{user.full_name || user.email}</p>
                               <Badge 
                                 variant="outline" 
                                 className={`text-xs capitalize flex-shrink-0 ${
                                   user.role === 'dj' ? 'bg-purple-100 text-purple-800' :
                                   user.role === 'performer' ? 'bg-orange-100 text-orange-800' :
                                   'bg-blue-100 text-blue-800'
                                 }`}
                               >
                                 {user.role}
                               </Badge>
                             </div>
                             <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                             <p className="text-xs text-muted-foreground">
                               Applied {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                             </p>
                           </div>
                         </div>
                         
                         <div className="flex items-center gap-2 flex-shrink-0">
                           <Button
                             variant="outline"
                             size="sm"
                             onClick={() => handleUserApproval(user.user_id, 'approved')}
                             className="flex items-center gap-1 text-green-600 hover:text-green-700"
                           >
                             <CheckCircle className="h-4 w-4" />
                             <span className="hidden sm:inline">Approve</span>
                           </Button>
                           
                           <Button
                             variant="outline"
                             size="sm"
                             onClick={() => handleUserApproval(user.user_id, 'rejected')}
                             className="flex items-center gap-1 text-red-600 hover:text-red-700"
                           >
                             <XCircle className="h-4 w-4" />
                             <span className="hidden sm:inline">Reject</span>
                           </Button>
                         </div>
                       </div>
                     ))}
                   </div>
                 </CardContent>
               </Card>
             )}

            {/* Analytics Section */}
            <Card id="analytics">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Sales Analytics
                </CardTitle>
                <CardDescription>
                  Track ticket sales, revenue, and performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Revenue Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          ${((ticketAnalytics?.total_revenue || 0) + (mediaPassAnalytics?.total_media_revenue || 0)) / 100}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Tickets: ${(ticketAnalytics?.total_revenue || 0) / 100} | Media: ${(mediaPassAnalytics?.total_media_revenue || 0) / 100}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tickets Sold</CardTitle>
                        <Ticket className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{ticketAnalytics?.paid_tickets || 0}</div>
                        <p className="text-xs text-muted-foreground">
                          {ticketAnalytics?.tickets_last_7_days || 0} in last 7 days
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Media Passes</CardTitle>
                        <Camera className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{mediaPassAnalytics?.paid_media_passes || 0}</div>
                        <p className="text-xs text-muted-foreground">
                          ${(mediaPassAnalytics?.total_media_revenue || 0) / 100} revenue
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Ticket Price</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          ${((ticketAnalytics?.avg_ticket_price || 0) / 100).toFixed(2)}
                        </div>
                        <p className="text-xs text-muted-foreground">Per ticket sold</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Media Pass Breakdown */}
                  {mediaPassAnalytics?.passes_by_type && mediaPassAnalytics.passes_by_type.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Media Pass Breakdown</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {mediaPassAnalytics.passes_by_type.map((passType) => (
                          <Card key={passType.pass_type}>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm">
                                ${passType.pass_type} Media Pass
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="flex justify-between items-center">
                                <span className="text-2xl font-bold">{passType.count}</span>
                                <span className="text-sm text-muted-foreground">
                                  ${passType.revenue / 100} revenue
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent Sales Timeline */}
                  {salesData.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Recent Sales (Last 30 Days)</h3>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {salesData.slice(-10).reverse().map((sale) => (
                          <div key={sale.date} className="flex justify-between items-center p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">{new Date(sale.date).toLocaleDateString()}</p>
                              <p className="text-sm text-muted-foreground">
                                {sale.tickets} tickets, {sale.media_passes} media passes
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">${sale.revenue / 100}</p>
                              <p className="text-sm text-muted-foreground">revenue</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No Data States */}
                  {(!ticketAnalytics || !mediaPassAnalytics) && (
                    <div className="text-center py-8">
                      <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Loading analytics data...</p>
                    </div>
                  )}

                  {ticketAnalytics && mediaPassAnalytics && 
                   ticketAnalytics.total_tickets === 0 && mediaPassAnalytics.total_media_passes === 0 && (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No sales data yet</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Analytics will appear once tickets and media passes are sold
                      </p>
                    </div>
                  )}
                 </div>
               </CardContent>
             </Card>

              {/* Enhanced Event Analytics with Charts */}
             <div id="ticket-purchases">
               <EnhancedEventAnalytics />
             </div>

              {/* Expense Tracker */}
              <div id="expenses">
                <ExpenseTracker />
              </div>

              {/* Affiliates Management */}
              <div id="affiliates">
                <AdminAffiliateManager />
              </div>

              {/* Users Management */}
            <Card id="users">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Management
                  <Badge variant="secondary">{allUsers.length}</Badge>
                </CardTitle>
                <CardDescription>
                  View and manage all users and their multiple roles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6 max-h-96 overflow-y-auto">
                  {allUsers.map((user) => (
                    <MultiRoleManager
                      key={user.user_id}
                      userId={user.user_id}
                      userName={user.full_name || user.email || 'Unknown User'}
                      userEmail={user.email || ''}
                      onRolesChange={() => {
                        fetchAllUsers();
                        fetchStats();
                      }}
                    />
                  ))}
                  
                  {allUsers.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No users found.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Moderation Tools */}
            <Card id="moderation">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Moderation Tools
                  <Badge variant="destructive">{reportedPosts.length}</Badge>
                </CardTitle>
                <CardDescription>
                  Review reported content and manage community guidelines
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {reportedPosts.map((post) => (
                    <div
                      key={post.id}
                      className="flex flex-col lg:flex-row lg:items-start space-y-4 lg:space-y-0 lg:space-x-4 p-4 border rounded-lg border-destructive/20 bg-destructive/5"
                    >
                      <div className="flex items-start space-x-3 flex-1 min-w-0">
                        <Avatar className="h-10 w-10 flex-shrink-0">
                          <AvatarFallback>
                            {post.author_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <p className="font-medium truncate">{post.author_name}</p>
                            {post.author_role === 'admin' && (
                              <Badge variant="destructive" className="text-xs">Admin</Badge>
                            )}
                            {post.author_role === 'moderator' && (
                              <Badge variant="outline" className="text-xs">Mod</Badge>
                            )}
                            <Badge variant="destructive" className="text-xs">
                              {post.report_count} Report{post.report_count !== 1 ? 's' : ''}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          
                          <p className="text-sm text-foreground mb-2 line-clamp-3">
                            {post.content}
                          </p>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Heart className="h-4 w-4" />
                              {post.like_count}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-4 w-4" />
                              {post.comment_count}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          <span className="hidden sm:inline">Approve</span>
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeletePost(post.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          <span className="hidden sm:inline">Remove</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {reportedPosts.length === 0 && (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <p className="text-muted-foreground">No reported content to review.</p>
                      <p className="text-sm text-muted-foreground mt-1">All good in the community!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Posts Management */}
            <Card id="posts">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Post Management
                </CardTitle>
                <CardDescription>
                  Manage community posts, pin important announcements, and moderate content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {posts.map((post) => (
                    <div
                      key={post.id}
                      className="flex flex-col lg:flex-row lg:items-start space-y-4 lg:space-y-0 lg:space-x-4 p-4 border rounded-lg"
                    >
                      <div className="flex items-start space-x-3 flex-1 min-w-0">
                        <Avatar className="h-10 w-10 flex-shrink-0">
                          <AvatarFallback>
                            {post.author_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <p className="font-medium truncate">{post.author_name}</p>
                            {post.author_role === 'admin' && (
                              <Badge variant="destructive" className="text-xs">Admin</Badge>
                            )}
                            {post.author_role === 'moderator' && (
                              <Badge variant="outline" className="text-xs">Mod</Badge>
                            )}
                            {post.pinned && (
                              <Badge variant="secondary" className="text-xs">
                                <Pin className="h-3 w-3 mr-1" />
                                Pinned
                              </Badge>
                            )}
                            <span className="text-sm text-muted-foreground">
                              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          
                          <p className="text-sm text-foreground mb-2 line-clamp-3">
                            {post.content}
                          </p>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Heart className="h-4 w-4" />
                              {post.like_count}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-4 w-4" />
                              {post.comment_count}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTogglePin(post.id, post.pinned)}
                          className="flex items-center gap-1"
                        >
                          <Pin className={`h-4 w-4 ${post.pinned ? 'fill-current' : ''}`} />
                          <span className="hidden sm:inline">{post.pinned ? 'Unpin' : 'Pin'}</span>
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePost(post.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {posts.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No posts to manage yet.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Account Deletion Requests */}
            {deletionRequests.length > 0 && (
              <Card id="deletions">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trash2 className="h-5 w-5" />
                    Account Deletion Requests
                    <Badge variant="destructive">{deletionRequests.length}</Badge>
                  </CardTitle>
                  <CardDescription>
                    Review and approve account deletion requests from users
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {deletionRequests.map((request) => (
                      <div
                        key={request.id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg border-destructive/20 bg-destructive/5 space-y-3 sm:space-y-0"
                      >
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-10 w-10 flex-shrink-0">
                            <AvatarFallback>
                              {request.user_name?.charAt(0) || request.user_email?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <p className="font-medium truncate">{request.user_name}</p>
                              <Badge variant="destructive" className="text-xs">
                                Deletion Request
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">{request.user_email}</p>
                            {request.reason && (
                              <p className="text-sm text-foreground mt-1 italic">
                                "{request.reason}"
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              Requested {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeletionRequestAction(request.id, 'approved')}
                            className="flex items-center gap-1 text-red-600 hover:text-red-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span className="hidden sm:inline">Approve Deletion</span>
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeletionRequestAction(request.id, 'denied')}
                            className="flex items-center gap-1 text-green-600 hover:text-green-700"
                          >
                            <XCircle className="h-4 w-4" />
                            <span className="hidden sm:inline">Deny</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Admin;