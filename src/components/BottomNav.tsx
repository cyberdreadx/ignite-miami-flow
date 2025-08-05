import { Home, Ticket, User, Scan, ShoppingBag } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { isModerator } = useUserRole();

  const navItems = [
    { 
      label: "Feed", 
      path: "/", 
      icon: Home,
      show: true 
    },
    { 
      label: "Tickets", 
      path: "/tickets", 
      icon: Ticket,
      show: true 
    },
    { 
      label: "My Tickets", 
      path: "/my-tickets", 
      icon: ShoppingBag,
      show: !!user 
    },
    { 
      label: "Validate", 
      path: "/validate", 
      icon: Scan,
      show: !!user && isModerator 
    },
    { 
      label: "Profile", 
      path: user ? "/profile" : "/auth", 
      icon: User,
      show: true 
    },
  ];

  const visibleItems = navItems.filter(item => item.show);

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/20 backdrop-blur-xl border-t border-white/10 shadow-[0_-8px_30px_rgb(0,0,0,0.12)] supports-[backdrop-filter]:bg-background/20">
      <div className="flex justify-around items-center py-2 px-4 max-w-lg mx-auto">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Button
              key={item.path}
              variant="ghost"
              size="sm"
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 h-auto py-2 px-3 min-w-0 flex-1 transition-colors ${
                active 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <Icon 
                className={`w-5 h-5 ${active ? "text-primary" : ""}`} 
              />
              <span className="text-xs font-medium leading-none truncate">
                {item.label}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;