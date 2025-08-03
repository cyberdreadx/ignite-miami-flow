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
        
        const { data, error } = await supabase
          .from('profiles')
          .select('role, email')
          .eq('user_id', user.id)
          .maybeSingle();

        console.log('Profile data:', data);
        console.log('Profile error:', error);

        if (error) {
          console.error('Error fetching user role:', error);
          setRole('user'); // Default to user role
        } else if (data) {
          console.log('User role from database:', data.role);
          setRole(data.role || 'user');
        } else {
          console.log('No profile found for user, defaulting to user role');
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