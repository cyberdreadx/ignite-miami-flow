import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Ticket, Clock, Flame } from "lucide-react";
import NavBar from "@/components/layout/NavBar";
import { SocialFeed } from "@/components/features/SocialFeed";
import { PixelFireBackground } from "@/components/features/PixelFireBackground";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/contexts/UserRoleContext";
import { useApprovalStatus } from "@/hooks/useApprovalStatus";
import ApprovalStatus from "@/components/user/ApprovalStatus";
import { WaiverBanner } from "@/components/tickets/WaiverBanner";
import { PendingUsersCard } from "@/components/user/PendingUsersCard";
import skateburnLogo from "/lovable-uploads/f40780ef-982b-41a4-99b9-49357cc44738.png";

const EarlyBirdBanner = () => {
  const now = new Date();
  const isTuesday = now.getDay() === 2;
  const miamiHour = new Date(
    now.toLocaleString("en-US", { timeZone: "America/New_York" })
  ).getHours();
  const isPriceUp = isTuesday && miamiHour >= 20;

  if (isPriceUp) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center gap-2 mb-6 px-4 py-2.5 rounded-none border border-destructive/60 bg-destructive/10 text-destructive text-sm font-semibold tracking-wide"
        style={{ fontFamily: "'Courier New', monospace", imageRendering: "pixelated" }}
      >
        <Flame className="w-4 h-4 animate-pulse" />
        ▶ AT-THE-DOOR PRICE NOW ACTIVE — $15 TONIGHT ◀
        <Flame className="w-4 h-4 animate-pulse" />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-2.5 mb-6 px-4 py-3 rounded-none border border-primary/40 bg-primary/5"
      style={{ fontFamily: "'Courier New', monospace" }}
    >
      <Clock className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
      <div className="text-xs leading-relaxed">
        <span className="text-primary font-bold tracking-widest">EARLY BIRD: </span>
        <span className="text-foreground/80">Tickets start at </span>
        <span className="text-primary font-bold">$10</span>
        <span className="text-foreground/80"> — price goes up to </span>
        <span className="text-destructive font-bold">$15 at 8 PM</span>
        <span className="text-foreground/80"> (event start). Get yours early!</span>
      </div>
    </motion.div>
  );
};

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

      {/* Hero — 8-bit fire background */}
      <section className="relative pt-20 pb-12 md:pt-24 md:pb-16 overflow-hidden">
        <PixelFireBackground />

        <div className="container mx-auto px-4 relative" style={{ zIndex: 10 }}>
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

            <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-4"
              style={{ textShadow: "0 0 24px hsl(28 100% 56% / 0.6), 0 2px 8px rgba(0,0,0,0.8)" }}
            >
              SkateBurn
              <span className="block text-primary">Tuesdays</span>
            </h1>

            <p className="text-muted-foreground text-lg md:text-xl mb-3 font-body">
              Miami's Fire, Flow & Skate Jam
            </p>
            <p className="text-muted-foreground/70 text-sm mb-8 font-body">
              Every Tuesday · SkateBird Miami · 8 PM – Midnight
            </p>

            {/* Early-bird pricing disclaimer */}
            <EarlyBirdBanner />

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                onClick={() => navigate("/tickets")}
                className="text-base px-8 py-6 font-semibold"
                style={{ boxShadow: "0 0 16px hsl(28 100% 56% / 0.4)" }}
              >
                <Ticket className="w-5 h-5 mr-2" />
                Get Tickets · $10
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate("/about")}
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
