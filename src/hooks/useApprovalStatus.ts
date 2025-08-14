import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useApprovalStatus = () => {
  const { user } = useAuth();
  const [approvalStatus, setApprovalStatus] = useState<'pending' | 'approved' | 'rejected' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApprovalStatus = async () => {
      if (!user) {
        setApprovalStatus(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('approval_status')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching approval status:', error);
          setApprovalStatus(null);
        } else {
          const status = data?.approval_status as 'pending' | 'approved' | 'rejected' | null;
          setApprovalStatus(status);
        }
      } catch (error) {
        console.error('Error:', error);
        setApprovalStatus(null);
      } finally {
        setLoading(false);
      }
    };

    fetchApprovalStatus();
  }, [user]);

  const isApproved = approvalStatus === 'approved';
  const isPending = approvalStatus === 'pending';
  const isRejected = approvalStatus === 'rejected';

  return {
    approvalStatus,
    isApproved,
    isPending,
    isRejected,
    loading
  };
};