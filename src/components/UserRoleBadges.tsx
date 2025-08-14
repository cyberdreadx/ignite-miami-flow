import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

interface UserRoleBadgesProps {
  userId: string;
  className?: string;
}

type AppRole = 'admin' | 'dj' | 'photographer' | 'performer' | 'moderator' | 'vip' | 'user';

const ROLE_COLORS: Record<AppRole, string> = {
  admin: "bg-red-500/90 text-white border-red-500/50 hover:bg-red-500",
  dj: "bg-purple-500/90 text-white border-purple-500/50 hover:bg-purple-500", 
  photographer: "bg-blue-500/90 text-white border-blue-500/50 hover:bg-blue-500",
  performer: "bg-orange-500/90 text-white border-orange-500/50 hover:bg-orange-500",
  moderator: "bg-green-500/90 text-white border-green-500/50 hover:bg-green-500",
  vip: "bg-yellow-500/90 text-black border-yellow-500/50 hover:bg-yellow-500",
  user: "bg-gray-500/90 text-white border-gray-500/50 hover:bg-gray-500"
};

const ROLE_ABBREVIATIONS: Record<AppRole, string> = {
  admin: "👑",
  dj: "🎧",
  photographer: "📷",
  performer: "🎭",
  moderator: "M",
  vip: "⭐",
  user: "U"
};

const ROLE_FULL_NAMES: Record<AppRole, string> = {
  admin: "Administrator",
  dj: "DJ",
  photographer: "Photographer", 
  performer: "Performer",
  moderator: "Moderator",
  vip: "VIP Member",
  user: "Member"
};

export const UserRoleBadges = ({ userId, className = "" }: UserRoleBadgesProps) => {
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRoles = async () => {
      try {
        // Use the get_user_roles function that's accessible to everyone
        const { data, error } = await supabase
          .rpc('get_user_roles', { _user_id: userId });

        if (error) {
          console.error('Error fetching user roles:', error);
          return;
        }

        const userRoles = data?.map(r => r.role as AppRole) || [];
        setRoles(userRoles);
      } catch (error) {
        console.error('Error fetching user roles:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserRoles();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className={`flex gap-1 ${className}`}>
        <div className="w-6 h-6 bg-muted/50 rounded-full animate-pulse" />
      </div>
    );
  }

  if (!roles.length) {
    return null;
  }

  // Filter out 'user' role if there are other roles present
  const displayRoles = roles.length > 1 ? roles.filter(role => role !== 'user') : roles;

  return (
    <TooltipProvider>
      <div className={`flex gap-1 ${className}`}>
        {displayRoles.map((role, index) => (
          <Tooltip key={role} delayDuration={0}>
            <TooltipTrigger asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.2 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Badge 
                  variant="secondary"
                  className={`
                    w-4 h-4 p-0 rounded-full text-[8px] font-bold flex items-center justify-center
                    cursor-help transition-all duration-200
                    ${ROLE_COLORS[role]}
                  `}
                >
                  {ROLE_ABBREVIATIONS[role]}
                </Badge>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent 
              side="top" 
              className="bg-background/95 border border-primary/20 backdrop-blur-sm"
            >
              <p className="font-medium">{ROLE_FULL_NAMES[role]}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
};

export default UserRoleBadges;