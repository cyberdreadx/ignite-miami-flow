import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useApprovalStatus } from '@/hooks/useApprovalStatus';
import AffiliateDashboard from '@/components/features/AffiliateDashboard';
import ApprovalStatus from '@/components/user/ApprovalStatus';

const Affiliate = () => {
  const { user } = useAuth();
  const { isApproved, loading: approvalLoading } = useApprovalStatus();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user && !approvalLoading) {
      navigate('/auth');
    }
  }, [user, approvalLoading, navigate]);

  if (!user) {
    return null;
  }

  if (approvalLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isApproved) {
    return <ApprovalStatus />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <AffiliateDashboard />
      </div>
    </div>
  );
};

export default Affiliate;