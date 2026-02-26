import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useWaiver = () => {
  const [hasCompletedWaiver, setHasCompletedWaiver] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      checkWaiverCompletion();
    } else {
      setLoading(false);
    }
  }, [user]);

  const checkWaiverCompletion = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('waivers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setHasCompletedWaiver(!!data);
    } catch (error) {
      console.error('Error checking waiver completion:', error);
      setHasCompletedWaiver(false);
    } finally {
      setLoading(false);
    }
  };

  const markWaiverCompleted = async () => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('waivers')
        .insert({
          user_id: user.id,
          completed_at: new Date().toISOString()
        });

      if (error) throw error;
      
      setHasCompletedWaiver(true);
      return true;
    } catch (error) {
      console.error('Error marking waiver as completed:', error);
      return false;
    }
  };

  return {
    hasCompletedWaiver: hasCompletedWaiver as boolean,
    loading,
    markWaiverCompleted,
    checkWaiverCompletion
  };
};
