import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type AppRole = 'admin' | 'dj' | 'photographer' | 'performer' | 'moderator' | 'vip' | 'user';

export const useUserRoles = (userId?: string) => {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;
  
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUserRoles = async () => {
      if (!targetUserId) {
        setLoading(false);
        return;
      }

      try {
        setError(null);
        const { data, error: supabaseError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', targetUserId);

        if (supabaseError) {
          throw supabaseError;
        }

        const userRoles = data?.map(r => r.role as AppRole) || [];
        setRoles(userRoles);
      } catch (err) {
        console.error('Error fetching user roles:', err);
        setError(err as Error);
        setRoles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRoles();
  }, [targetUserId]);

  const hasRole = (role: AppRole): boolean => {
    return roles.includes(role);
  };

  const isAdmin = (): boolean => {
    return hasRole('admin');
  };

  const addRole = async (role: AppRole): Promise<boolean> => {
    if (!targetUserId || !user?.id) return false;

    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: targetUserId,
          role,
          created_by: user.id
        });

      if (error) throw error;

      setRoles(prev => [...prev, role]);
      return true;
    } catch (err) {
      console.error('Error adding role:', err);
      return false;
    }
  };

  const removeRole = async (role: AppRole): Promise<boolean> => {
    if (!targetUserId) return false;

    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', targetUserId)
        .eq('role', role);

      if (error) throw error;

      setRoles(prev => prev.filter(r => r !== role));
      return true;
    } catch (err) {
      console.error('Error removing role:', err);
      return false;
    }
  };

  return {
    roles,
    loading,
    error,
    hasRole,
    isAdmin,
    addRole,
    removeRole,
    refetch: () => {
      setLoading(true);
      // The useEffect will trigger a refetch
    }
  };
};

export default useUserRoles;