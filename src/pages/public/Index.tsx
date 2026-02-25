import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Ticket } from "lucide-react";
import NavBar from "@/components/layout/NavBar";
import { SocialFeed } from "@/components/features/SocialFeed";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/contexts/UserRoleContext";
import { useApprovalStatus } from "@/hooks/useApprovalStatus";
import ApprovalStatus from "@/components/user/ApprovalStatus";
import { WaiverBanner } from "@/components/tickets/WaiverBanner";
import { PendingUsersCard } from "@/components/user/PendingUsersCard";
import skateburnLogo from "/lovable-uploads/f40780ef-982b-41a4-99b9-49357cc44738.png";

const Index = () => {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const { isApproved, isPending, isRejected } = useApprovalStatus();
  const navigate = useNavigate();

  if (user && (isPending || isRejected)) {
    return <ApprovalStatus />;
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      {/* Hero — minimal, impactful */}
      <section className="pt-20 pb-12 md:pt-24 md:pb-16">
        <div className="container mx-auto px-4">
          <WaiverBanner />
          
          <motion.div 
            className="max-w-2xl mx-auto text-center py-12 md:py-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.img 
              src={skateburnLogo} 
              alt="SkateBurn Miami" 
              className="h-16 md:h-20 w-auto mx-auto mb-8 opacity-90"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 0.9, scale: 1 }}
              transition={{ duration: 0.5 }}
            />
            
            <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-4">
              SkateBurn
              <span className="block text-primary">Tuesdays</span>
            </h1>
            
            <p className="text-muted-foreground text-lg md:text-xl mb-3 font-body">
              Miami's Fire, Flow & Skate Jam
            </p>
            <p className="text-muted-foreground/70 text-sm mb-8 font-body">
              Every Tuesday · SkateBird Miami · 8 PM – Midnight
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate('/tickets')}
                className="text-base px-8 py-6 font-semibold"
              >
                <Ticket className="w-5 h-5 mr-2" />
                Get Tickets
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigate('/about')}
                className="text-base px-8 py-6 border-border hover:bg-muted"
              >
                Learn More
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feed */}
      <section className="pb-8">
        <div className="container mx-auto px-4">
          {user && isAdmin && <PendingUsersCard />}
          <SocialFeed />
        </div>
      </section>
    </div>
  );
};

export default React.memo(Index);
