import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  Search, 
  UserCheck, 
  UserX, 
  Crown, 
  Shield, 
  Camera,
  Download,
  RefreshCw,
  Mail,
  Phone,
  Instagram,
  ExternalLink,
  MoreHorizontal,
  Filter
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string;
  bio: string | null;
  location: string | null;
  instagram_handle: string | null;
  avatar_url: string | null;
  role: string;
  approval_status: string;
  show_in_directory: boolean;
  show_contact_info: boolean;
  last_active: string | null;
  created_at: string;
  updated_at: string;
}

interface UserStats {
  totalUsers: number;
  newThisWeek: number;
  photographerRequests: number;
  activeUsers: number;
}

const EnhancedMemberManagement = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [processingUsers, setProcessingUsers] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const fetchUsers = async () => {
    console.log('Fetching users...');
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Supabase response:', { data, error });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Setting users:', data?.length || 0, 'users');
      setUsers(data || []);
      calculateStats(data || []);
      console.log('Fetch completed successfully');
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users. Check console for details.",
        variant: "destructive",
      });
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  const calculateStats = (userData: UserProfile[]) => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const newThisWeek = userData.filter(user => 
      new Date(user.created_at) >= oneWeekAgo
    ).length;

    const photographerRequests = userData.filter(user => 
      user.role === 'photographer'
    ).length;

    const activeUsers = userData.filter(user => 
      user.last_active ? new Date(user.last_active) >= oneWeekAgo : false
    ).length;

    setStats({
      totalUsers: userData.length,
      newThisWeek,
      photographerRequests,
      activeUsers
    });
  };

  const filterUsers = () => {
    console.log('Starting filterUsers with:', { usersLength: users.length, searchTerm, activeTab });
    let filtered = users;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.instagram_handle?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by tab
    switch (activeTab) {
      case 'photographers':
        filtered = filtered.filter(user => 
          user.role === 'photographer'
        );
        break;
      case 'recent':
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        filtered = filtered.filter(user => 
          new Date(user.created_at) >= oneWeekAgo
        );
        break;
      case 'incomplete':
        filtered = filtered.filter(user => 
          !user.full_name || !user.bio
        );
        break;
    }

    console.log('Filtered users:', filtered.length);
    setFilteredUsers(filtered);
  };

  const updateUserRole = async (userId: string, role: string) => {
    setProcessingUsers(prev => new Set(prev).add(userId));
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId);

      if (error) throw error;

      // Refresh the users list
      await fetchUsers();
      
      toast({
        title: "Role Updated",
        description: `User role updated to ${role}`,
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    } finally {
      setProcessingUsers(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  const sendEmail = (email: string) => {
    window.open(`mailto:${email}`, '_blank');
  };

  const exportUsers = () => {
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Instagram', 'Photography Experience', 'Equipment', 'Portfolio', 'Joined'].join(','),
      ...filteredUsers.map(user => [
        user.full_name || '',
        user.email,
        user.bio || '',
        user.instagram_handle || '',
        user.location || '',
        user.role || '',
        user.approval_status || '',
        new Date(user.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `skateburn-users-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "User data exported successfully",
    });
  };

  useEffect(() => {
    console.log('Component mounted, fetching users...');
    fetchUsers();
  }, []);

  useEffect(() => {
    console.log('Filtering users:', { usersCount: users.length, searchTerm, activeTab });
    filterUsers();
  }, [users, searchTerm, activeTab]);

  const UserCard = ({ user }: { user: UserProfile }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback>
                {user.full_name?.charAt(0) || user.email.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold">
                  {user.full_name || 'No name provided'}
                </h3>
                {user.role === 'photographer' && (
                  <Badge variant="secondary">
                    <Camera className="w-3 h-3 mr-1" />
                    Photographer
                  </Badge>
                )}
                <Badge variant={user.approval_status === 'approved' ? 'default' : 'secondary'}>
                  {user.approval_status}
                </Badge>
              </div>
              
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Mail className="w-3 h-3" />
                  <span>{user.email}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-auto p-0"
                    onClick={() => sendEmail(user.email)}
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
                
                {user.location && (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-3 h-3" />
                    <span>{user.location}</span>
                  </div>
                )}
                
                {user.instagram_handle && (
                  <div className="flex items-center space-x-2">
                    <Instagram className="w-3 h-3" />
                    <span>@{user.instagram_handle}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-auto p-0"
                      onClick={() => window.open(`https://instagram.com/${user.instagram_handle}`, '_blank')}
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                )}
                
                <div className="text-xs">
                  Joined: {new Date(user.created_at).toLocaleDateString()}
                </div>
              </div>

              {user.bio && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium mb-2">Bio</h4>
                  <p className="text-xs text-muted-foreground">
                    {user.bio}
                  </p>
                </div>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
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
              <DropdownMenuItem onClick={() => updateUserRole(user.id, 'admin')}>
                <Crown className="w-4 h-4 mr-2" />
                Make Admin
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => updateUserRole(user.id, 'moderator')}>
                <Shield className="w-4 h-4 mr-2" />
                Make Moderator
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <UserX className="w-4 h-4 mr-2" />
                Deactivate User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <AdminLayout 
      title="Member Management" 
      description="Manage user accounts, roles, and photographer applications"
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats.totalUsers}</p>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <UserCheck className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats.newThisWeek}</p>
                    <p className="text-sm text-muted-foreground">New This Week</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Camera className="w-8 h-8 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats.photographerRequests}</p>
                    <p className="text-sm text-muted-foreground">Photographers</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Shield className="w-8 h-8 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats.activeUsers}</p>
                    <p className="text-sm text-muted-foreground">Active Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Controls */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 flex items-center space-x-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by name, email, or Instagram..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" onClick={exportUsers}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" onClick={fetchUsers}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Lists */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Users ({users.length})</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="photographers">Photographers</TabsTrigger>
            <TabsTrigger value="incomplete">Incomplete Profiles</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No users found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search criteria or filters.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredUsers.map(user => (
                  <UserCard key={user.id} user={user} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default EnhancedMemberManagement;