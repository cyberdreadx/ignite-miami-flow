import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useUserRole = () => {
  const { user } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching role for user:', user.id, user.email);
        console.log('About to query profiles table with user_id:', user.id);
        
        // Try querying by email as backup since auth.uid() context issues
        const { data, error } = await supabase
          .from('profiles')
          .select('role, email, user_id')
          .eq('email', user.email)
          .maybeSingle();

        console.log('Raw query result - data:', data);
        console.log('Raw query result - error:', error);

        if (error) {
          console.error('Database error fetching user role:', error);
          setRole('user'); // Default to user role
        } else if (data) {
          console.log('Found profile! Role:', data.role, 'Email:', data.email);
          setRole(data.role || 'user');
        } else {
          console.log('No profile found for user_id:', user.id);
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
  }, [user]);

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