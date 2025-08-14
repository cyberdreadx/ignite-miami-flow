import React from "react";
import { motion } from "framer-motion";
import NavBar from "@/components/NavBar";
import { SocialFeed } from "@/components/SocialFeed";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/contexts/UserRoleContext";
import { useApprovalStatus } from "@/hooks/useApprovalStatus";
import ApprovalStatus from "@/components/ApprovalStatus";
import { WaiverBanner } from "@/components/WaiverBanner";
import { PendingUsersCard } from "@/components/PendingUsersCard";

const Index = () => {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const { isApproved, isPending, isRejected } = useApprovalStatus();

  // Show approval status for logged in users who aren't approved
  if (user && (isPending || isRejected)) {
    return <ApprovalStatus />;
  }

  return (
    <motion.div 
      className="min-h-screen bg-background overflow-x-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <NavBar />
      <div className="pt-20 pb-8">
        <div className="container mx-auto px-4">
          <WaiverBanner />
          {user && isAdmin && <PendingUsersCard />}
          <SocialFeed />
        </div>
      </div>
    </motion.div>
  );
};

export default React.memo(Index);
