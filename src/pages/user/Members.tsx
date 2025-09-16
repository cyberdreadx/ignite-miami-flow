import { motion } from "framer-motion";
import NavBar from '@/components/layout/NavBar';
import { MemberDirectory } from '@/components/user/MemberDirectory';
import { useAuth } from "@/contexts/AuthContext";
import { useApprovalStatus } from "@/hooks/useApprovalStatus";
import ApprovalStatus from '@/components/user/ApprovalStatus';

const Members = () => {
  const { user } = useAuth();
  const { isApproved, isPending, isRejected } = useApprovalStatus();

  // Show approval status for logged in users who aren't approved
  if (user && (isPending || isRejected)) {
    return <ApprovalStatus />;
  }

  return (
    <motion.div 
      className="min-h-screen bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <NavBar />
      <div className="container mx-auto px-4 pt-20 pb-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Community Members</h1>
            <p className="text-muted-foreground">
              Connect with fellow skaters, photographers, and community members
            </p>
          </div>
          <MemberDirectory />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Members;