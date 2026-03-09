import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/contexts/UserRoleContext";
import { Menu, X, Settings, LogOut, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, signOut } = useAuth();
  const { isAdmin } = useUserRole();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({ title: "Error", description: "Failed to sign out.", variant: "destructive" });
    } else {
      navigate("/");
      setIsOpen(false);
    }
  };

  const navItems = [
    { label: "Feed", path: "/" },
    { label: "Tickets", path: "/tickets" },
    { label: "My Tickets", path: "/my-tickets" },
    { label: "Members", path: "/members" },
    { label: "Media Pass", path: "/photographers" },
    { label: "Principles", path: "/principles" },
    { label: "About", path: "/about" },
  ];

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
      scrolled ? 'bg-background/90 backdrop-blur-md border-b border-border/50' : 'bg-transparent'
    }`}>
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <a href="/" className="font-display text-lg font-bold text-foreground tracking-tight">
            SkateBurn
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                size="sm"
                onClick={() => navigate(item.path)}
                className={`text-sm font-medium px-3 py-1.5 h-auto ${
                  isActive(item.path) ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.label}
              </Button>
            ))}
          </div>

          {/* Auth */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate("/profile")} className="text-sm text-muted-foreground hover:text-foreground">
                  <User className="w-4 h-4 mr-1.5" />
                  Profile
                </Button>
                {isAdmin && (
                  <Button variant="ghost" size="sm" onClick={() => navigate("/admin")} className="text-sm text-muted-foreground hover:text-foreground">
                    <Settings className="w-4 h-4 mr-1.5" />
                    Admin
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-sm text-muted-foreground hover:text-destructive">
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate("/auth")} className="text-sm">
                  Sign In
                </Button>
                <Button size="sm" onClick={() => navigate("/auth")} className="text-sm">
                  Sign Up
                </Button>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)} className="md:hidden p-1.5">
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-background border-b border-border/50">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                onClick={() => { navigate(item.path); setIsOpen(false); }}
                className={`w-full justify-start text-sm ${
                  isActive(item.path) ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </Button>
            ))}
            <div className="border-t border-border/50 pt-3 mt-3 space-y-1">
              {user ? (
                <>
                  <Button variant="ghost" onClick={() => { navigate("/profile"); setIsOpen(false); }} className="w-full justify-start text-sm">
                    <User className="w-4 h-4 mr-2" /> Profile
                  </Button>
                  {isAdmin && (
                    <Button variant="ghost" onClick={() => { navigate("/admin"); setIsOpen(false); }} className="w-full justify-start text-sm">
                      <Settings className="w-4 h-4 mr-2" /> Admin
                    </Button>
                  )}
                  <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start text-sm text-muted-foreground hover:text-destructive">
                    <LogOut className="w-4 h-4 mr-2" /> Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => { navigate("/auth"); setIsOpen(false); }} className="w-full justify-start text-sm">Sign In</Button>
                  <Button onClick={() => { navigate("/auth"); setIsOpen(false); }} className="w-full text-sm">Sign Up</Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
