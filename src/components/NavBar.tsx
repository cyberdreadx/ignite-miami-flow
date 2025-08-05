import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Menu, X, Settings, LogOut, User, Scan } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { motion, useScroll, useTransform } from "framer-motion";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { isModerator, isAdmin } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { scrollY } = useScroll();
  
  // Background opacity based on scroll
  const backgroundOpacity = useTransform(scrollY, [0, 100], [0.8, 0.95]);
  const backdropBlur = useTransform(scrollY, [0, 100], [8, 16]);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out.",
        variant: "destructive",
      });
    } else {
      navigate("/");
      setIsOpen(false);
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsOpen(false);
    }
  };

  const navItems = [
    { label: "Feed", id: "feed", path: "/" },
    { label: "Get Tickets", id: "tickets", path: "/tickets" },
    { label: "My Tickets", id: "my-tickets", path: "/my-tickets" },
    { label: "Media Pass", id: "photographers", path: "/photographers" },
    { label: "Merch", id: "merch", path: "/merch" },
    { label: "Qualifications", id: "qualifications", path: "/qualifications" },
    { label: "Principles", id: "principles", path: "/principles" },
    { label: "About", id: "about", path: "/about" },
  ];

  return (
    <motion.nav 
      className="fixed top-0 left-0 right-0 z-50 border-b border-white/10"
      style={{ 
        backgroundColor: useTransform(backgroundOpacity, (value) => `rgba(0, 0, 0, ${value})`),
        backdropFilter: useTransform(backdropBlur, (value) => `blur(${value}px)`)
      }}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a 
              href="/" 
              className="text-xl font-graffiti font-bold bg-gradient-fire bg-clip-text text-transparent"
            >
              🔥 SkateBurn
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navItems.map((item) => (
                <Button
                  key={item.id}
                  variant="ghost"
                  onClick={() => item.path ? navigate(item.path) : scrollToSection(item.id)}
                  className="text-foreground/80 hover:text-glow-yellow px-3 py-2 text-sm font-medium transition-colors"
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                 <Button
                   onClick={() => {
                     console.log('Profile button clicked, navigating to /profile');
                     navigate("/profile");
                   }}
                   variant="ghost"
                   size="sm"
                 >
                   <User className="w-4 h-4 mr-2" />
                   Profile
                 </Button>
                 {isModerator && (
                   <Button
                     onClick={() => navigate("/validate")}
                     variant="outline"
                     size="sm"
                   >
                     <Scan className="w-4 h-4 mr-2" />
                     Validate
                   </Button>
                 )}
                 {isAdmin && (
                   <Button
                     onClick={() => navigate("/admin")}
                     variant="outline"
                     size="sm"
                   >
                     <Settings className="w-4 h-4 mr-2" />
                     Admin
                   </Button>
                 )}
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  size="sm"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => navigate("/auth")}
                  variant="ghost"
                  size="sm"
                >
                  <User className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
                <Button
                  onClick={() => navigate("/auth")}
                  variant="outline"
                  size="sm"
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button - Hide on mobile since we use bottom nav */}
          <div className="sm:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
              className="hidden"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation - Hide on small screens where bottom nav is used */}
      {isOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-lg border-b border-white/10 hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => {
                  if (item.path) {
                    navigate(item.path);
                  } else {
                    scrollToSection(item.id);
                  }
                  setIsOpen(false);
                }}
                className="text-foreground/80 hover:text-glow-yellow w-full justify-start px-3 py-2 text-base font-medium transition-colors"
              >
                {item.label}
              </Button>
            ))}
            
            <div className="border-t border-white/10 pt-4 mt-4">
              {user ? (
                <div className="space-y-2">
                  <Button
                    onClick={() => {
                      console.log('Mobile profile button clicked, navigating to /profile');
                      navigate("/profile");
                      setIsOpen(false);
                    }}
                    variant="ghost"
                    className="w-full justify-start"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Button>
                  {isModerator && (
                    <Button
                      onClick={() => {
                        navigate("/validate");
                        setIsOpen(false);
                      }}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <Scan className="w-4 h-4 mr-2" />
                      Validate Tickets
                    </Button>
                  )}
                  {isAdmin && (
                    <Button
                      onClick={() => {
                        navigate("/admin");
                        setIsOpen(false);
                      }}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Admin Panel
                    </Button>
                  )}
                  <Button
                    onClick={handleSignOut}
                    variant="ghost"
                    className="w-full justify-start"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Button
                    onClick={() => {
                      navigate("/auth");
                      setIsOpen(false);
                    }}
                    variant="ghost"
                    className="w-full justify-start"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                  <Button
                    onClick={() => {
                      navigate("/auth");
                      setIsOpen(false);
                    }}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.nav>
  );
};

export default NavBar;