import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
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
  Clock
} from 'lucide-react';

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

const Admin = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
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
    }
  }, [user, isAdmin]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
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
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate('/')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Feed
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-muted-foreground">Manage your SkateBurn community</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

            <Card>
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
            <Card>
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
                <div className="space-y-4">
                  {pendingUsers.map((user) => (
                    <div
                      key={user.user_id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {user.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{user.full_name || user.email}</p>
                            <Badge 
                              variant="outline" 
                              className={`text-xs capitalize ${
                                user.role === 'dj' ? 'bg-purple-100 text-purple-800' :
                                user.role === 'performer' ? 'bg-orange-100 text-orange-800' :
                                'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {user.role}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <p className="text-xs text-muted-foreground">
                            Applied {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUserApproval(user.user_id, 'approved')}
                          className="flex items-center gap-1 text-green-600 hover:text-green-700"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Approve
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUserApproval(user.user_id, 'rejected')}
                          className="flex items-center gap-1 text-red-600 hover:text-red-700"
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Posts Management */}
          <Card>
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
              <div className="space-y-4">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-start space-x-4 p-4 border rounded-lg"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {post.author_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-medium">{post.author_name}</p>
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
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTogglePin(post.id, post.pinned)}
                        className="flex items-center gap-1"
                      >
                        <Pin className={`h-4 w-4 ${post.pinned ? 'fill-current' : ''}`} />
                        {post.pinned ? 'Unpin' : 'Pin'}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
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
        </div>
      </div>
    </div>
  );
};

export default Admin;