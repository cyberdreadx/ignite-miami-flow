import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/AdminSidebar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/contexts/UserRoleContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { 
  Users, 
  Shield, 
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  MoreVertical,
  UserCheck,
  UserX,
  Crown,
  User
} from 'lucide-react';

interface User {
  user_id: string;
  email: string;
  full_name: string;
  role: string;
  approval_status: string;
  created_at: string;
  avatar_url?: string;
  last_active?: string;
}

const AdminMembers = () => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if not authenticated or admin
  useEffect(() => {
    if (!roleLoading && (!user || !isAdmin)) {
      navigate('/');
    }
  }, [user, isAdmin, roleLoading, navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .rpc('get_all_profiles_admin');

      if (error) {
        console.error('Error fetching users:', error);
        toast({
          title: 'Error fetching users',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        const users = data || [];
        setAllUsers(users);
        setPendingUsers(users.filter(u => u.approval_status === 'pending'));
      }
    } catch (error) {
      console.error('Error in fetchUsers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && isAdmin) {
      fetchUsers();
    }
  }, [user, isAdmin]);

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
        fetchUsers();
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
        fetchUsers();
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

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'moderator':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading members...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        
        <main className="flex-1 flex flex-col">
          <header className="h-auto md:h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 flex items-center p-3 md:px-6">
            <div className="flex items-center gap-2 md:gap-4 w-full">
              <SidebarTrigger />
              <div className="flex-1 min-w-0">
                <h1 className="text-lg md:text-2xl font-bold truncate">Member Management</h1>
                <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">Manage users, roles, and approvals</p>
              </div>
            </div>
          </header>

          <div className="flex-1 space-y-4 md:space-y-6 p-3 md:p-6">
            {/* Stats Cards */}
            <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-4">
                  <CardTitle className="text-xs md:text-sm font-medium">Total Members</CardTitle>
                  <Users className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="p-3 md:p-4 pt-0">
                  <div className="text-lg md:text-2xl font-bold">{allUsers.length}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-4">
                  <CardTitle className="text-xs md:text-sm font-medium">Pending Approval</CardTitle>
                  <Clock className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="p-3 md:p-4 pt-0">
                  <div className="text-lg md:text-2xl font-bold">{pendingUsers.length}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-4">
                  <CardTitle className="text-xs md:text-sm font-medium">Admins</CardTitle>
                  <Crown className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="p-3 md:p-4 pt-0">
                  <div className="text-lg md:text-2xl font-bold">
                    {allUsers.filter(u => u.role === 'admin').length}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-4">
                  <CardTitle className="text-xs md:text-sm font-medium">Moderators</CardTitle>
                  <Shield className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="p-3 md:p-4 pt-0">
                  <div className="text-lg md:text-2xl font-bold">
                    {allUsers.filter(u => u.role === 'moderator').length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Pending Approvals */}
            {pendingUsers.length > 0 && (
              <Card>
                <CardHeader className="p-3 md:p-6">
                  <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                    <Clock className="h-4 w-4 md:h-5 md:w-5" />
                    Pending Approvals ({pendingUsers.length})
                  </CardTitle>
                  <CardDescription className="text-xs md:text-sm">
                    New users waiting for approval
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-3 md:p-6 pt-0">
                  <div className="space-y-3 md:space-y-4">
                    {pendingUsers.map((user) => (
                      <div key={user.user_id} className="flex flex-col md:flex-row md:items-center justify-between p-3 md:p-4 border rounded-lg space-y-3 md:space-y-0">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Avatar className="h-8 w-8 md:h-10 md:w-10 flex-shrink-0">
                            <AvatarImage src={user.avatar_url} />
                            <AvatarFallback>
                              {user.full_name?.charAt(0) || user.email.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm md:text-base truncate">{user.full_name || user.email}</p>
                            <p className="text-xs md:text-sm text-muted-foreground truncate">{user.email}</p>
                            <p className="text-xs text-muted-foreground">
                              Requested {formatDistanceToNow(new Date(user.created_at))} ago
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
                          <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">
                            {user.role}
                          </Badge>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUserApproval(user.user_id, 'approved')}
                              className="flex-1 md:flex-none text-xs"
                            >
                              <CheckCircle className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleUserApproval(user.user_id, 'rejected')}
                              className="flex-1 md:flex-none text-xs"
                            >
                              <XCircle className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* All Members */}
            <Card>
              <CardHeader className="p-3 md:p-6">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <Users className="h-4 w-4 md:h-5 md:w-5" />
                  All Members ({allUsers.length})
                </CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  Manage member roles and permissions
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-2">
                  {allUsers.map((userData) => (
                    <div key={userData.user_id} className="flex flex-col md:flex-row md:items-center justify-between p-3 md:p-4 border-b last:border-b-0 hover:bg-muted/50 transition-colors space-y-3 md:space-y-0">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Avatar className="h-8 w-8 md:h-10 md:w-10 flex-shrink-0">
                          <AvatarImage src={userData.avatar_url} />
                          <AvatarFallback>
                            {userData.full_name?.charAt(0) || userData.email.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm md:text-base truncate">{userData.full_name || userData.email}</p>
                          <p className="text-xs md:text-sm text-muted-foreground truncate">{userData.email}</p>
                          <p className="text-xs text-muted-foreground">
                            Joined {formatDistanceToNow(new Date(userData.created_at))} ago
                            {userData.last_active && (
                              <span className="hidden sm:inline"> • Active {formatDistanceToNow(new Date(userData.last_active))} ago</span>
                            )}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-3">
                        <Badge variant={getStatusBadgeVariant(userData.approval_status)} className="text-xs">
                          {userData.approval_status}
                        </Badge>
                        
                        {/* Role Dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="bg-background w-full md:w-auto text-xs">
                              <Badge variant={getRoleBadgeVariant(userData.role)} className="mr-2 text-xs">
                                {userData.role}
                              </Badge>
                              <ChevronDown className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-background border shadow-md z-50">
                            <DropdownMenuItem 
                              onClick={() => handleRoleChange(userData.user_id, 'user')}
                              className="cursor-pointer hover:bg-muted"
                            >
                              <User className="h-4 w-4 mr-2" />
                              User
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleRoleChange(userData.user_id, 'moderator')}
                              className="cursor-pointer hover:bg-muted"
                            >
                              <Shield className="h-4 w-4 mr-2" />
                              Moderator
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleRoleChange(userData.user_id, 'admin')}
                              className="cursor-pointer hover:bg-muted"
                            >
                              <Crown className="h-4 w-4 mr-2" />
                              Admin
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Actions Dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="bg-background w-full md:w-auto">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-background border shadow-md z-50">
                            {userData.approval_status === 'pending' && (
                              <>
                                <DropdownMenuItem 
                                  onClick={() => handleUserApproval(userData.user_id, 'approved')}
                                  className="cursor-pointer hover:bg-muted"
                                >
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  Approve User
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleUserApproval(userData.user_id, 'rejected')}
                                  className="cursor-pointer hover:bg-muted text-destructive"
                                >
                                  <UserX className="h-4 w-4 mr-2" />
                                  Reject User
                                </DropdownMenuItem>
                              </>
                            )}
                            {userData.approval_status === 'rejected' && (
                              <DropdownMenuItem 
                                onClick={() => handleUserApproval(userData.user_id, 'approved')}
                                className="cursor-pointer hover:bg-muted"
                              >
                                <UserCheck className="h-4 w-4 mr-2" />
                                Approve User
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminMembers;