
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useUserRole = () => {
  const { user, loading: authLoading } = useAuth();
  console.log('useUserRole hook - received user:', user);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only run when auth is done loading
    if (authLoading) {
      setLoading(true);
      return;
    }

    const fetchUserRole = async () => {
      console.log('fetchUserRole called, user is:', user);

      if (!user) {
        console.log('No user found, setting role to null');
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching roles for user:', user.id, user.email);

        // Get all user roles using the new multi-role system
        const { data: rolesData, error: rolesError } = await supabase
          .rpc('get_user_roles', { _user_id: user.id });

        console.log('User roles data:', rolesData);
        console.log('User roles error:', rolesError);

        if (rolesError) {
          console.error('Database error fetching user roles:', rolesError);
          setRole('user'); // Default to user role
        } else if (rolesData && rolesData.length > 0) {
          // Set role based on highest priority: admin > moderator > other roles > user
          const roles = rolesData.map(r => r.role);
          console.log('Found roles:', roles);
          
          if (roles.includes('admin')) {
            setRole('admin');
          } else if (roles.includes('moderator')) {
            setRole('moderator');
          } else {
            // Use the first non-user role, or 'user' if no others
            const nonUserRoles = roles.filter(r => r !== 'user');
            setRole(nonUserRoles.length > 0 ? nonUserRoles[0] : 'user');
          }
        } else {
          console.log('No roles found for user_id:', user.id);
          setRole('user');
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        setRole('user');
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [authLoading, user?.id, user?.email]); // Watch for changes in auth loading, user id AND email

  const isAdmin = role === 'admin';
  const isModerator = role === 'moderator' || isAdmin;

  console.log('useUserRole final state:', { role, loading, isAdmin, isModerator });

  return {
    role,
    loading,
    isAdmin,
    isModerator
  };
};