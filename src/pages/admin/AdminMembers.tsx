import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/AdminSidebar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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
  UserPlus,
  Search,
  Crown,
  User,
  MoreHorizontal,
  Mail,
  UserCheck,
  UserX,
  Camera,
  Music,
  Flame
} from 'lucide-react';

type AppRole = 'admin' | 'dj' | 'photographer' | 'performer' | 'moderator' | 'vip' | 'user';
type ApprovalStatus = 'pending' | 'approved' | 'rejected';

interface UserProfile {
  user_id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  approval_status: ApprovalStatus;
  created_at: string;
  updated_at?: string;
  last_active?: string;
  roles: AppRole[];
}

const ROLE_CONFIG = {
  admin: { label: 'Administrator', icon: Shield, color: 'bg-red-500 text-white', priority: 1 },
  moderator: { label: 'Moderator', icon: Shield, color: 'bg-green-500 text-white', priority: 2 },
  dj: { label: 'DJ', icon: Music, color: 'bg-purple-500 text-white', priority: 3 },
  performer: { label: 'Performer', icon: Flame, color: 'bg-orange-500 text-white', priority: 4 },
  photographer: { label: 'Photographer', icon: Camera, color: 'bg-blue-500 text-white', priority: 5 },
  vip: { label: 'VIP Member', icon: Crown, color: 'bg-yellow-500 text-black', priority: 6 },
  user: { label: 'Member', icon: User, color: 'bg-gray-500 text-white', priority: 7 }
};

const APPROVAL_STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: XCircle }
};

const AdminMembers = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<AppRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<ApprovalStatus | 'all'>('all');
  const [activeTab, setActiveTab] = useState('overview');
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
    setLoading(true);
    try {
      // Get users with their roles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, email, full_name, avatar_url, approval_status, created_at, updated_at')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Get all user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Combine profiles with roles
      const usersWithRoles: UserProfile[] = profiles?.map(profile => ({
        ...profile,
        approval_status: profile.approval_status as ApprovalStatus,
        roles: userRoles?.filter(ur => ur.user_id === profile.user_id).map(ur => ur.role as AppRole) || []
      })) || [];

      setUsers(usersWithRoles);
    } catch (error: any) {
      toast({
        title: 'Failed to fetch users',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && isAdmin) {
      fetchUsers();
    }
  }, [user, isAdmin]);

  const updateUserApproval = async (userId: string, status: ApprovalStatus) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ approval_status: status })
        .eq('user_id', userId);

      if (error) throw error;

      setUsers(prev => prev.map(user => 
        user.user_id === userId ? { ...user, approval_status: status } : user
      ));

      toast({
        title: `User ${status}`,
        description: `User has been ${status} successfully.`,
        variant: status === 'approved' ? 'default' : 'destructive'
      });
    } catch (error: any) {
      toast({
        title: 'Error updating user status',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const updateUserRole = async (userId: string, role: AppRole, action: 'add' | 'remove') => {
    try {
      if (action === 'add') {
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role });

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', role);

        if (error) throw error;
      }

      // Update local state
      setUsers(prev => prev.map(user => {
        if (user.user_id === userId) {
          const newRoles = action === 'add' 
            ? [...user.roles, role]
            : user.roles.filter(r => r !== role);
          return { ...user, roles: newRoles };
        }
        return user;
      }));

      toast({
        title: `Role ${action === 'add' ? 'added' : 'removed'}`,
        description: `${ROLE_CONFIG[role].label} role ${action === 'add' ? 'added to' : 'removed from'} user.`,
      });
    } catch (error: any) {
      toast({
        title: `Error ${action === 'add' ? 'adding' : 'removing'} role`,
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const sendEmail = (email: string) => {
    window.open(`mailto:${email}`, '_blank');
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.roles.includes(roleFilter);
    const matchesStatus = statusFilter === 'all' || user.approval_status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getUserPrimaryRole = (roles: AppRole[]): AppRole => {
    if (roles.length === 0) return 'user';
    return roles.sort((a, b) => ROLE_CONFIG[a].priority - ROLE_CONFIG[b].priority)[0];
  };

  const getRoleBadge = (role: AppRole) => {
    const config = ROLE_CONFIG[role];
    const Icon = config.icon;
    return (
      <Badge key={role} className={`${config.color} flex items-center gap-1 text-xs`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getStatusBadge = (status: ApprovalStatus) => {
    const config = APPROVAL_STATUS_CONFIG[status];
    const Icon = config.icon;
    return (
      <Badge className={`${config.color} flex items-center gap-1 text-xs`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
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
                <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">Comprehensive overview and management of all community members</p>
              </div>
            </div>
          </header>

          <div className="flex-1 space-y-4 md:space-y-6 p-3 md:p-6">
            <div className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0">
              <div>
                <h3 className="text-xl md:text-2xl font-bold">Member Management</h3>
                <p className="text-sm md:text-base text-muted-foreground">
                  Comprehensive overview and management of all community members
                </p>
              </div>
              <Button className="w-full md:w-auto">
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Member
              </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
                <TabsTrigger value="overview" className="text-xs md:text-sm px-2 py-2">Overview</TabsTrigger>
                <TabsTrigger value="pending" className="text-xs md:text-sm px-2 py-2">Pending ({users.filter(u => u.approval_status === 'pending').length})</TabsTrigger>
                <TabsTrigger value="approved" className="text-xs md:text-sm px-2 py-2">Approved ({users.filter(u => u.approval_status === 'approved').length})</TabsTrigger>
                <TabsTrigger value="roles" className="text-xs md:text-sm px-2 py-2">Analytics</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4 md:space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                  <Card>
                    <CardContent className="p-3 md:p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs md:text-sm text-muted-foreground">Total Members</p>
                          <p className="text-xl md:text-2xl font-bold">{users.length}</p>
                        </div>
                        <Users className="w-6 h-6 md:w-8 md:h-8 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-3 md:p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs md:text-sm text-muted-foreground">Pending Approval</p>
                          <p className="text-xl md:text-2xl font-bold text-yellow-600">
                            {users.filter(u => u.approval_status === 'pending').length}
                          </p>
                        </div>
                        <Clock className="w-6 h-6 md:w-8 md:h-8 text-yellow-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-3 md:p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs md:text-sm text-muted-foreground">Active Members</p>
                          <p className="text-xl md:text-2xl font-bold text-green-600">
                            {users.filter(u => u.approval_status === 'approved').length}
                          </p>
                        </div>
                        <CheckCircle className="w-6 h-6 md:w-8 md:h-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-3 md:p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs md:text-sm text-muted-foreground">Special Roles</p>
                          <p className="text-xl md:text-2xl font-bold text-purple-600">
                            {users.filter(u => u.roles.some(r => ['dj', 'performer', 'photographer'].includes(r))).length}
                          </p>
                        </div>
                        <Crown className="w-6 h-6 md:w-8 md:h-8 text-purple-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Filters */}
                <Card>
                  <CardContent className="p-3 md:p-4">
                    <div className="flex flex-col space-y-4">
                      <div className="w-full">
                        <Label htmlFor="search" className="text-sm">Search Members</Label>
                        <div className="relative">
                          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="search"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="role-filter" className="text-sm">Filter by Role</Label>
                          <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as AppRole | 'all')}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="All Roles" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Roles</SelectItem>
                              {Object.entries(ROLE_CONFIG).map(([role, config]) => (
                                <SelectItem key={role} value={role}>{config.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="status-filter" className="text-sm">Filter by Status</Label>
                          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ApprovalStatus | 'all')}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="All Statuses" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Statuses</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="approved">Approved</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Members List */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base md:text-lg">All Members ({filteredUsers.length})</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {filteredUsers.map((user) => {
                        const primaryRole = getUserPrimaryRole(user.roles);
                        const primaryRoleConfig = ROLE_CONFIG[primaryRole];
                        
                        return (
                          <div key={user.user_id} className="flex flex-col md:flex-row md:items-center justify-between p-3 md:p-4 border-b last:border-b-0 space-y-3 md:space-y-0">
                            <div className="flex items-start md:items-center space-x-3 flex-1 min-w-0">
                              <Avatar className="flex-shrink-0">
                                <AvatarImage src={user.avatar_url} />
                                <AvatarFallback className={primaryRoleConfig.color}>
                                  {user.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2 mb-1">
                                  <p className="font-medium text-sm md:text-base truncate">{user.full_name || user.email}</p>
                                  {getStatusBadge(user.approval_status)}
                                </div>
                                <p className="text-xs md:text-sm text-muted-foreground truncate">{user.email}</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {user.roles.map(role => getRoleBadge(role))}
                                  {user.roles.length === 0 && getRoleBadge('user')}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Joined {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-2 md:flex-shrink-0">
                              {user.approval_status === 'pending' && (
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => updateUserApproval(user.user_id, 'approved')}
                                    className="bg-green-600 hover:bg-green-700 flex-1 md:flex-none text-xs"
                                  >
                                    <CheckCircle className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => updateUserApproval(user.user_id, 'rejected')}
                                    className="flex-1 md:flex-none text-xs"
                                  >
                                    <XCircle className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                                    Reject
                                  </Button>
                                </div>
                              )}
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="w-full md:w-auto">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => sendEmail(user.email)}>
                                    <Mail className="w-4 h-4 mr-2" />
                                    Send Email
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => updateUserRole(user.user_id, 'admin', 'add')}>
                                    <Crown className="w-4 h-4 mr-2" />
                                    Make Admin
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => updateUserRole(user.user_id, 'moderator', 'add')}>
                                    <Shield className="w-4 h-4 mr-2" />
                                    Make Moderator
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => updateUserRole(user.user_id, 'dj', 'add')}>
                                    <Music className="w-4 h-4 mr-2" />
                                    Make DJ
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => updateUserRole(user.user_id, 'performer', 'add')}>
                                    <Flame className="w-4 h-4 mr-2" />
                                    Make Performer
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => updateUserRole(user.user_id, 'photographer', 'add')}>
                                    <Camera className="w-4 h-4 mr-2" />
                                    Make Photographer
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => updateUserRole(user.user_id, 'vip', 'add')}>
                                    <Crown className="w-4 h-4 mr-2" />
                                    Make VIP
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => updateUserRole(user.user_id, 'user', 'add')}>
                                    <User className="w-4 h-4 mr-2" />
                                    Make Member
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        );
                      })}

                      {filteredUsers.length === 0 && (
                        <div className="text-center py-8">
                          <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-muted-foreground">No members found matching your criteria.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Other tabs can be added here following the same pattern */}
              <TabsContent value="pending">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                      <Clock className="w-4 h-4 md:w-5 md:w-5 text-yellow-600" />
                      Pending Approvals
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="space-y-2">
                      {users.filter(u => u.approval_status === 'pending').map((user) => (
                        <div key={user.user_id} className="flex flex-col md:flex-row md:items-center justify-between p-3 md:p-4 border-b last:border-b-0 border-yellow-200 bg-yellow-50 space-y-3 md:space-y-0">
                          <div className="flex items-start md:items-center space-x-3 flex-1 min-w-0">
                            <Avatar className="flex-shrink-0">
                              <AvatarImage src={user.avatar_url} />
                              <AvatarFallback>
                                {user.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm md:text-base truncate">{user.full_name || user.email}</p>
                              <p className="text-xs md:text-sm text-muted-foreground truncate">{user.email}</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {user.roles.map(role => getRoleBadge(role))}
                                {user.roles.length === 0 && (
                                  <Badge className="bg-gray-100 text-gray-800 text-xs">Requesting Access</Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                Applied {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => updateUserApproval(user.user_id, 'approved')}
                              className="bg-green-600 hover:bg-green-700 flex-1 md:flex-none text-xs"
                            >
                              <CheckCircle className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateUserApproval(user.user_id, 'rejected')}
                              className="flex-1 md:flex-none text-xs"
                            >
                              <XCircle className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      ))}

                      {users.filter(u => u.approval_status === 'pending').length === 0 && (
                        <div className="text-center py-8">
                          <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                          <p className="text-muted-foreground">No pending approvals. All caught up!</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="approved">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                      <CheckCircle className="w-4 h-4 md:w-5 md:w-5 text-green-600" />
                      Approved Members
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {users.filter(u => u.approval_status === 'approved').map((user) => {
                        const primaryRole = getUserPrimaryRole(user.roles);
                        const primaryRoleConfig = ROLE_CONFIG[primaryRole];
                        
                        return (
                          <div key={user.user_id} className="flex flex-col md:flex-row md:items-center justify-between p-3 md:p-4 border-b last:border-b-0 space-y-3 md:space-y-0">
                            <div className="flex items-start md:items-center space-x-3 flex-1 min-w-0">
                              <Avatar className="flex-shrink-0">
                                <AvatarImage src={user.avatar_url} />
                                <AvatarFallback className={primaryRoleConfig.color}>
                                  {user.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm md:text-base truncate">{user.full_name || user.email}</p>
                                <p className="text-xs md:text-sm text-muted-foreground truncate">{user.email}</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {user.roles.map(role => getRoleBadge(role))}
                                  {user.roles.length === 0 && getRoleBadge('user')}
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="w-full md:w-auto">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => sendEmail(user.email)}>
                                    <Mail className="w-4 h-4 mr-2" />
                                    Send Email
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => updateUserRole(user.user_id, 'admin', 'add')}>
                                    <Crown className="w-4 h-4 mr-2" />
                                    Make Admin
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => updateUserRole(user.user_id, 'moderator', 'add')}>
                                    <Shield className="w-4 h-4 mr-2" />
                                    Make Moderator
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => updateUserRole(user.user_id, 'dj', 'add')}>
                                    <Music className="w-4 h-4 mr-2" />
                                    Make DJ
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => updateUserRole(user.user_id, 'performer', 'add')}>
                                    <Flame className="w-4 h-4 mr-2" />
                                    Make Performer
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => updateUserRole(user.user_id, 'photographer', 'add')}>
                                    <Camera className="w-4 h-4 mr-2" />
                                    Make Photographer
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => updateUserRole(user.user_id, 'vip', 'add')}>
                                    <Crown className="w-4 h-4 mr-2" />
                                    Make VIP
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => updateUserRole(user.user_id, 'user', 'add')}>
                                    <User className="w-4 h-4 mr-2" />
                                    Make Member
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="roles">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  {Object.entries(ROLE_CONFIG).map(([role, config]) => {
                    const Icon = config.icon;
                    const roleUsers = users.filter(u => u.roles.includes(role as AppRole));
                    const approvedCount = roleUsers.filter(u => u.approval_status === 'approved').length;
                    const pendingCount = roleUsers.filter(u => u.approval_status === 'pending').length;
                    
                    return (
                      <Card key={role}>
                        <CardContent className="p-3 md:p-4">
                          <div className="flex items-center justify-between mb-3 md:mb-4">
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4 md:w-5 md:h-5" />
                              <h4 className="font-semibold text-sm md:text-base">{config.label}</h4>
                            </div>
                            <Badge className={`${config.color} text-xs`}>{roleUsers.length}</Badge>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs md:text-sm">
                              <span>Approved:</span>
                              <span className="font-medium text-green-600">{approvedCount}</span>
                            </div>
                            <div className="flex justify-between text-xs md:text-sm">
                              <span>Pending:</span>
                              <span className="font-medium text-yellow-600">{pendingCount}</span>
                            </div>
                            
                            {roleUsers.length > 0 && (
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-green-600 h-2 rounded-full" 
                                  style={{ width: `${(approvedCount / roleUsers.length) * 100}%` }}
                                ></div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminMembers;