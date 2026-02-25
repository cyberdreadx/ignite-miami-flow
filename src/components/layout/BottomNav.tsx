import React from "react";
import { Home, Ticket, User, ShoppingBag, Gift } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { label: "Feed", path: "/", icon: Home, show: true },
    { label: "Tickets", path: "/tickets", icon: Ticket, show: true },
    { label: "My Tickets", path: "/my-tickets", icon: ShoppingBag, show: !!user },
    { label: "Affiliate", path: "/affiliate", icon: Gift, show: !!user },
    { label: "Profile", path: user ? "/profile" : "/auth", icon: User, show: true },
  ];

  const visibleItems = navItems.filter(item => item.show);

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border/50">
      <div className="flex justify-around items-center py-1.5 px-2 max-w-lg mx-auto">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-0.5 py-1 px-2 min-w-0 flex-1 transition-colors rounded-md ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium leading-none truncate">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(BottomNav);
