import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

export type AppRole = 'admin' | 'dj' | 'photographer' | 'performer' | 'moderator' | 'vip' | 'user';

interface UserRoleContextType {
  role: string | null;
  roles: AppRole[];
  loading: boolean;
  isAdmin: boolean;
  isModerator: boolean;
  hasRole: (role: AppRole) => boolean;
  refetch: () => void;
}

const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined);

export const UserRoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserRoles = async (userId: string) => {
    try {
      const { data: rolesData, error: rolesError } = await supabase
        .rpc('get_user_roles', { _user_id: userId });

      if (rolesError) {
        console.error('Database error fetching user roles:', rolesError);
        setRole('user');
        setRoles(['user']);
        return;
      }

      if (rolesData && rolesData.length > 0) {
        const userRoles = rolesData.map(r => r.role as AppRole);
        setRoles(userRoles);

        // Set primary role based on hierarchy
        let primaryRole: string;
        if (userRoles.includes('admin')) {
          primaryRole = 'admin';
        } else if (userRoles.includes('moderator')) {
          primaryRole = 'moderator';
        } else {
          const nonUserRoles = userRoles.filter(r => r !== 'user');
          primaryRole = nonUserRoles.length > 0 ? nonUserRoles[0] : 'user';
        }
        
        setRole(primaryRole);
      } else {
        setRole('user');
        setRoles(['user']);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setRole('user');
      setRoles(['user']);
    }
  };

  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    }

    if (!user) {
      setRole(null);
      setRoles([]);
      setLoading(false);
      return;
    }

    fetchUserRoles(user.id).finally(() => setLoading(false));
  }, [authLoading, user?.id]);

  const isAdmin = useMemo(() => role === 'admin', [role]);
  const isModerator = useMemo(() => role === 'moderator' || isAdmin, [role, isAdmin]);
  
  const hasRole = useMemo(() => (targetRole: AppRole): boolean => {
    return roles.includes(targetRole);
  }, [roles]);

  const refetch = () => {
    if (user) {
      setLoading(true);
      fetchUserRoles(user.id).finally(() => setLoading(false));
    }
  };

  const value = useMemo(() => ({
    role,
    roles,
    loading,
    isAdmin,
    isModerator,
    hasRole,
    refetch
  }), [role, roles, loading, isAdmin, isModerator, hasRole, refetch]);

  return (
    <UserRoleContext.Provider value={value}>
      {children}
    </UserRoleContext.Provider>
  );
};

export const useUserRole = () => {
  const context = useContext(UserRoleContext);
  if (context === undefined) {
    throw new Error('useUserRole must be used within a UserRoleProvider');
  }
  return context;
};

export const useUserRoles = (userId?: string) => {
  const { user } = useAuth();
  const context = useUserRole();
  const [externalRoles, setExternalRoles] = useState<AppRole[]>([]);
  const [externalLoading, setExternalLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const targetUserId = userId || user?.id;
  const isCurrentUser = targetUserId === user?.id;

  useEffect(() => {
    if (isCurrentUser || !targetUserId) {
      return; // Use context data for current user
    }

    setExternalLoading(true);
    setError(null);

    const fetchExternalUserRoles = async () => {
      try {
        const { data, error: supabaseError } = await supabase
          .rpc('get_user_roles', { _user_id: targetUserId });

        if (supabaseError) {
          throw supabaseError;
        }

        const userRoles = data?.map(r => r.role as AppRole) || [];
        setExternalRoles(userRoles);
      } catch (err) {
        console.error('Error fetching external user roles:', err);
        setError(err as Error);
        setExternalRoles([]);
      } finally {
        setExternalLoading(false);
      }
    };

    fetchExternalUserRoles();
  }, [targetUserId, isCurrentUser]);

  if (isCurrentUser) {
    return {
      roles: context.roles,
      loading: context.loading,
      error: null,
      hasRole: context.hasRole,
      isAdmin: context.isAdmin,
      addRole: async () => false, // Not implemented in context
      removeRole: async () => false, // Not implemented in context
      refetch: context.refetch
    };
  }

  const hasRole = (role: AppRole): boolean => {
    return externalRoles.includes(role);
  };

  const isAdmin = (): boolean => {
    return hasRole('admin');
  };

  return {
    roles: externalRoles,
    loading: externalLoading,
    error,
    hasRole,
    isAdmin,
    addRole: async () => false, // Not implemented for external users
    removeRole: async () => false, // Not implemented for external users
    refetch: () => {
      if (targetUserId && !isCurrentUser) {
        setExternalLoading(true);
        // Re-trigger the useEffect
      }
    }
  };
};