import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Clock, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PendingUser {
  user_id: string;
  email: string;
  full_name: string;
  role: string;
  approval_status: string;
  created_at: string;
}

export const PendingUsersCard = () => {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPendingUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, email, full_name, role, approval_status, created_at')
        .eq('approval_status', 'pending')
        .order('created_at', { ascending: true })
        .limit(5); // Only show first 5 on home page

      if (error) {
        console.error('Error fetching pending users:', error);
      } else {
        setPendingUsers(data || []);
      }
    } catch (error) {
      console.error('Error in fetchPendingUsers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

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

  if (loading || pendingUsers.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6 border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-amber-600" />
          <CardTitle className="text-lg text-amber-900 dark:text-amber-100">
            Pending User Approvals
          </CardTitle>
        </div>
        <CardDescription className="text-amber-700 dark:text-amber-300">
          {pendingUsers.length} user{pendingUsers.length !== 1 ? 's' : ''} waiting for approval
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {pendingUsers.map((user) => (
          <div key={user.user_id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                  {user.full_name ? user.full_name.slice(0, 2).toUpperCase() : user.email.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {user.full_name || user.email}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {user.email}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {user.role}
                  </Badge>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleUserApproval(user.user_id, 'approved')}
                className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-300"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleUserApproval(user.user_id, 'rejected')}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </Button>
            </div>
          </div>
        ))}
        
        {pendingUsers.length === 5 && (
          <div className="text-center pt-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.location.href = '/admin'}
              className="text-amber-700 hover:text-amber-800 hover:bg-amber-100"
            >
              View all pending users in Admin Panel →
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};