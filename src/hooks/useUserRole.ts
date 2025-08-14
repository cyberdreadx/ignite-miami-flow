
import { useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

// Cache for user roles to prevent redundant API calls
const roleCache = new Map<string, { role: string; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useUserRole = () => {
  const { user, loading: authLoading } = useAuth();
  console.log('useUserRole hook - received user:', user);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);

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
        fetchedRef.current = false;
        return;
      }

      // Check cache first
      const cached = roleCache.get(user.id);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log('Using cached role:', cached.role);
        setRole(cached.role);
        setLoading(false);
        return;
      }

      // Skip if already fetched for this user
      if (fetchedRef.current && role) {
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
          
          let finalRole: string;
          if (roles.includes('admin')) {
            finalRole = 'admin';
          } else if (roles.includes('moderator')) {
            finalRole = 'moderator';
          } else {
            // Use the first non-user role, or 'user' if no others
            const nonUserRoles = roles.filter(r => r !== 'user');
            finalRole = nonUserRoles.length > 0 ? nonUserRoles[0] : 'user';
          }
          
          setRole(finalRole);
          // Cache the result
          roleCache.set(user.id, { role: finalRole, timestamp: Date.now() });
        } else {
          console.log('No roles found for user_id:', user.id);
          setRole('user');
          roleCache.set(user.id, { role: 'user', timestamp: Date.now() });
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        setRole('user');
        roleCache.set(user.id, { role: 'user', timestamp: Date.now() });
      } finally {
        setLoading(false);
        fetchedRef.current = true;
      }
    };

    fetchUserRole();
  }, [authLoading, user?.id]); // Watch for changes in auth loading and user id only

  const isAdmin = useMemo(() => role === 'admin', [role]);
  const isModerator = useMemo(() => role === 'moderator' || isAdmin, [role, isAdmin]);

  console.log('useUserRole final state:', { role, loading, isAdmin, isModerator });

  return useMemo(() => ({
    role,
    loading,
    isAdmin,
    isModerator
  }), [role, loading, isAdmin, isModerator]);
};