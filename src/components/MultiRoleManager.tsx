import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, X } from "lucide-react";

interface MultiRoleManagerProps {
  userId: string;
  userName: string;
  userEmail: string;
  onRolesChange: () => void;
}

type AppRole = 'admin' | 'dj' | 'photographer' | 'performer' | 'moderator' | 'vip' | 'user';

const ROLE_COLORS: Record<AppRole, string> = {
  admin: "bg-red-500 text-white",
  dj: "bg-purple-500 text-white", 
  photographer: "bg-blue-500 text-white",
  performer: "bg-orange-500 text-white",
  moderator: "bg-green-500 text-white",
  vip: "bg-yellow-500 text-black",
  user: "bg-gray-500 text-white"
};

const ROLE_LABELS: Record<AppRole, string> = {
  admin: "Administrator",
  dj: "DJ",
  photographer: "Photographer", 
  performer: "Performer",
  moderator: "Moderator",
  vip: "VIP Member",
  user: "Member"
};

const ALL_ROLES: AppRole[] = ['admin', 'dj', 'photographer', 'performer', 'moderator', 'vip', 'user'];

export const MultiRoleManager = ({ userId, userName, userEmail, onRolesChange }: MultiRoleManagerProps) => {
  const [currentRoles, setCurrentRoles] = useState<AppRole[]>([]);
  const [availableRoles, setAvailableRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUserRoles();
  }, [userId]);

  const fetchUserRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching user roles:', error);
        return;
      }

      const userRoles = data?.map(r => r.role as AppRole) || [];
      setCurrentRoles(userRoles);
      
      // Set available roles (excluding current ones)
      setAvailableRoles(ALL_ROLES.filter(role => !userRoles.includes(role)));
    } catch (error) {
      console.error('Error fetching user roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const addRole = async (role: AppRole) => {
    if (currentRoles.includes(role)) return;

    setUpdating(true);
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: role
        });

      if (error) {
        toast({
          title: 'Error adding role',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        setCurrentRoles(prev => [...prev, role]);
        setAvailableRoles(prev => prev.filter(r => r !== role));
        onRolesChange();
        toast({
          title: 'Role added',
          description: `${ROLE_LABELS[role]} role added to ${userName}`,
        });
      }
    } catch (error) {
      toast({
        title: 'Error adding role',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  const removeRole = async (role: AppRole) => {
    // Prevent removing the last role
    if (currentRoles.length === 1) {
      toast({
        title: 'Cannot remove role',
        description: 'User must have at least one role.',
        variant: 'destructive',
      });
      return;
    }

    setUpdating(true);
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);

      if (error) {
        toast({
          title: 'Error removing role',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        setCurrentRoles(prev => prev.filter(r => r !== role));
        setAvailableRoles(prev => [...prev, role].sort());
        onRolesChange();
        toast({
          title: 'Role removed',
          description: `${ROLE_LABELS[role]} role removed from ${userName}`,
        });
      }
    } catch (error) {
      toast({
        title: 'Error removing role',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse h-32 bg-muted rounded"></div>;
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span>Manage Roles: {userName}</span>
          <span className="text-sm font-normal text-muted-foreground">{userEmail}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Roles */}
        <div>
          <h4 className="text-sm font-semibold mb-2">Current Roles</h4>
          <div className="flex flex-wrap gap-2">
            {currentRoles.length > 0 ? (
              currentRoles.map((role) => (
                <Badge 
                  key={role} 
                  className={`${ROLE_COLORS[role]} flex items-center gap-1`}
                >
                  {ROLE_LABELS[role]}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => removeRole(role)}
                    disabled={updating || currentRoles.length === 1}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">No roles assigned</span>
            )}
          </div>
        </div>

        {/* Add New Roles */}
        {availableRoles.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2">Add Roles</h4>
            <div className="flex flex-wrap gap-2">
              {availableRoles.map((role) => (
                <Button
                  key={role}
                  variant="outline"
                  size="sm"
                  className="h-6 text-xs flex items-center gap-1"
                  onClick={() => addRole(role)}
                  disabled={updating}
                >
                  <Plus className="h-3 w-3" />
                  {ROLE_LABELS[role]}
                </Button>
              ))}
            </div>
          </div>
        )}

        {availableRoles.length === 0 && currentRoles.length > 0 && (
          <div className="text-sm text-muted-foreground">
            All available roles have been assigned to this user.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MultiRoleManager;