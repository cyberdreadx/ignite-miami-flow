import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Ticket, Flame, Clock } from "lucide-react";
import NavBar from "@/components/layout/NavBar";
import { SocialFeed } from "@/components/features/SocialFeed";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/contexts/UserRoleContext";
import { useApprovalStatus } from "@/hooks/useApprovalStatus";
import ApprovalStatus from "@/components/user/ApprovalStatus";
import { WaiverBanner } from "@/components/tickets/WaiverBanner";
import { PendingUsersCard } from "@/components/user/PendingUsersCard";

const Index = () => {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const { isApproved, isPending, isRejected } = useApprovalStatus();
  const navigate = useNavigate();

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
          
          {/* Prominent Buy Tickets Section */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="bg-card border-border shadow-elevated">
              <CardContent className="p-8 text-center relative overflow-hidden">
                {/* Gradient mesh background effect */}
                <div className="absolute inset-0 bg-gradient-mesh opacity-50" />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-center mb-4">
                    <Flame className="w-8 h-8 text-primary mr-3" />
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                      Get Your Tickets Now!
                    </h2>
                    <Flame className="w-8 h-8 text-primary ml-3" />
                  </div>
                  
                  <p className="text-muted-foreground text-lg mb-6 max-w-2xl mx-auto">
                    Don't miss out on the hottest event in Miami! Secure your spot at SkateBurn - 
                    where fire meets wheels in an unforgettable night of performance and entertainment.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Button 
                      size="lg" 
                      className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-8 py-4 text-lg shadow-fire transform hover:scale-105 transition-all duration-200"
                      onClick={() => navigate('/tickets')}
                    >
                      <Ticket className="w-6 h-6 mr-2" />
                      Buy Tickets
                    </Button>
                    
                    <div className="flex items-center text-muted-foreground text-sm">
                      <Clock className="w-4 h-4 mr-2" />
                      Limited tickets available
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {user && isAdmin && <PendingUsersCard />}
          <SocialFeed />
        </div>
      </div>
    </motion.div>
  );
};

export default React.memo(Index);
