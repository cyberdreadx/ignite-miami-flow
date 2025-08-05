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
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { user, signOut } = useAuth();
  const { isModerator, isAdmin } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { scrollY } = useScroll();
  
  // Glassmorphism effect values based on scroll
  const backgroundOpacity = useTransform(scrollY, [0, 100], [0.1, 0.2]);
  const backdropBlur = useTransform(scrollY, [0, 100], [12, 20]);
  const borderOpacity = useTransform(scrollY, [0, 100], [0.1, 0.3]);

  // Handle scroll direction for navbar visibility
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show navbar when at top or scrolling up
      if (currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down and past 100px
        setIsVisible(false);
        setIsOpen(false); // Close mobile menu when hiding
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

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

  // Check if we're in a PWA context
  const isPWA = () => {
    return window.matchMedia('(display-mode: standalone)').matches || 
           (window.navigator as any).standalone || 
           document.referrer.includes('android-app://');
  };

  const handleNavigation = (path: string) => {
    console.log('Navigating to:', path);
    console.log('Is PWA context:', isPWA());

    // Always use normal navigation for consistency
    window.location.href = path;
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
      className="fixed top-0 left-0 right-0 z-50 border-b"
      style={{ 
        background: useTransform(backgroundOpacity, (value) => 
          `linear-gradient(135deg, rgba(255, 255, 255, ${value * 0.1}), rgba(255, 255, 255, ${value * 0.05}))`
        ),
        backdropFilter: useTransform(backdropBlur, (value) => `blur(${value}px) saturate(180%)`),
        borderColor: useTransform(borderOpacity, (value) => `rgba(255, 255, 255, ${value})`),
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
        WebkitBackdropFilter: useTransform(backdropBlur, (value) => `blur(${value}px) saturate(180%)`)
      }}
      initial={{ y: -100 }}
      animate={{ 
        y: isVisible ? 0 : -100
      }}
      transition={{ 
        duration: 0.3, 
        ease: "easeInOut",
        type: "tween"
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <motion.a 
              href="/" 
              className="text-xl font-graffiti font-bold bg-gradient-fire bg-clip-text text-transparent drop-shadow-sm"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              🔥 SkateBurn
            </motion.a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block flex-1">
            <div className="ml-4 flex items-baseline space-x-2 xl:space-x-4 overflow-x-auto">
              {navItems.map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <Button
                    variant="ghost"
                    onClick={() => {
                      if (item.path) {
                        handleNavigation(item.path);
                      } else {
                        scrollToSection(item.id);
                      }
                    }}
                    className="text-primary/90 hover:text-primary hover:bg-primary/10 px-2 xl:px-3 py-2 text-xs xl:text-sm font-medium transition-all duration-200 backdrop-blur-sm whitespace-nowrap hover:shadow-[0_0_20px_rgba(var(--primary),0.3)]"
                  >
                    {item.label}
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Button
                    onClick={() => {
                      console.log('Profile button clicked, navigating to /profile');
                      navigate("/profile");
                    }}
                    variant="ghost"
                    size="sm"
                    className="hover:bg-primary/10 backdrop-blur-sm transition-all duration-200 hover:shadow-[0_0_15px_rgba(var(--primary),0.4)]"
                  >
                    <User className="w-4 h-4 mr-2 text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.6)]" />
                    <span className="text-primary/90 hover:text-primary">Profile</span>
                  </Button>
                </motion.div>
                {isAdmin && (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Button
                      onClick={() => navigate("/admin")}
                      variant="outline"
                      size="sm"
                      className="border-primary/30 hover:bg-primary/10 backdrop-blur-sm transition-all duration-200 hover:shadow-[0_0_15px_rgba(var(--primary),0.4)] hover:border-primary/60"
                    >
                      <Settings className="w-4 h-4 mr-2 text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.6)]" />
                      <span className="text-primary/90 hover:text-primary">Admin</span>
                    </Button>
                  </motion.div>
                )}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Button
                    onClick={handleSignOut}
                    variant="ghost"
                    size="sm"
                    className="hover:bg-red-500/10 backdrop-blur-sm transition-all duration-200 hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                  >
                    <LogOut className="w-4 h-4 mr-2 text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                    <span className="text-red-400/90 hover:text-red-400">Sign Out</span>
                  </Button>
                </motion.div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Button
                    onClick={() => navigate("/auth")}
                    variant="ghost"
                    size="sm"
                    className="hover:bg-primary/10 backdrop-blur-sm transition-all duration-200 hover:shadow-[0_0_15px_rgba(var(--primary),0.4)]"
                  >
                    <User className="w-4 h-4 mr-2 text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.6)]" />
                    <span className="text-primary/90 hover:text-primary">Sign In</span>
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Button
                    onClick={() => navigate("/auth")}
                    variant="outline"
                    size="sm"
                    className="border-primary/30 hover:bg-primary/10 backdrop-blur-sm transition-all duration-200 hover:shadow-[0_0_15px_rgba(var(--primary),0.4)] hover:border-primary/60 text-primary/90 hover:text-primary"
                  >
                    Sign Up
                  </Button>
                </motion.div>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle menu"
                className="hover:bg-primary/10 backdrop-blur-sm transition-all duration-200 hover:shadow-[0_0_15px_rgba(var(--primary),0.4)]"
              >
                {isOpen ? 
                  <X className="w-5 h-5 text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.6)]" /> : 
                  <Menu className="w-5 h-5 text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.6)]" />
                }
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <motion.div 
          className="md:hidden backdrop-blur-xl bg-black/10 border-b border-white/10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => {
                  if (item.path) {
                    handleNavigation(item.path);
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
        </motion.div>
      )}
    </motion.nav>
  );
};

export default NavBar;