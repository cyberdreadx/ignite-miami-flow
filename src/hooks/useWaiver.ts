import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

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
        .from('waiver_completions')
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
        .from('waiver_completions')
        .insert({
          user_id: user.id,
          waiver_url: 'https://tally.so/r/mY71ZB',
          ip_address: null, // Could be populated with actual IP if needed
          user_agent: navigator.userAgent
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