import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import heroBg from "@/assets/hero-bg.jpg";
import skateburnLogo from "/lovable-uploads/f40780ef-982b-41a4-99b9-49357cc44738.png";

const Hero = () => {
  const { scrollY } = useScroll();
  const logoY = useTransform(scrollY, [0, 300], [0, -50]);
  const contentY = useTransform(scrollY, [0, 300], [0, -100]);
  const backgroundY = useTransform(scrollY, [0, 300], [0, 50]);

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Parallax Background */}
      <motion.div 
        className="absolute inset-0 bg-gradient-mesh"
        style={{ y: backgroundY }}
      />
      
      {/* Gradient Overlay */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background"
        style={{ y: backgroundY, scale: useTransform(scrollY, [0, 300], [1, 1.1]) }}
      />
      
      {/* Animated Logo */}
      <motion.div 
        className="absolute top-24 left-8 z-10"
        style={{ y: logoY }}
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
      >
        <motion.div 
          className="relative"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <img 
            src={skateburnLogo} 
            alt="SkateBurn Miami" 
            className="h-20 md:h-24 w-auto drop-shadow-2xl filter brightness-110"
          />
          <div className="absolute inset-0 bg-gradient-fire opacity-20 blur-xl rounded-lg"></div>
        </motion.div>
      </motion.div>
      
      {/* Main Content with Parallax */}
      <motion.div 
        className="relative z-10 text-center px-6 max-w-5xl mx-auto"
        style={{ y: contentY }}
      >
        <div className="space-y-8">
          <motion.h1 
            className="text-5xl md:text-7xl lg:text-8xl font-graffiti font-bold leading-none"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <motion.span 
              className="block bg-gradient-fire bg-clip-text text-transparent drop-shadow-2xl"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              🔥 SkateBurn
            </motion.span>
            <motion.span 
              className="block bg-gradient-neon bg-clip-text text-transparent drop-shadow-2xl mt-2"
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              Tuesdays
            </motion.span>
            <motion.span 
              className="block text-glow-yellow text-3xl md:text-5xl lg:text-6xl mt-4 font-street font-bold"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
            >
              Miami's Fire, Flow, & Skate Jam
            </motion.span>
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1 }}
          >
            <p className="text-xl md:text-3xl text-foreground/90 mb-12 font-street leading-relaxed">
              Every Tuesday Night | SkateBird Miami | 8PM – Midnight
            </p>
            
            <motion.div 
              className="relative inline-block"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                variant="fire" 
                size="lg" 
                className="text-xl px-12 py-6 h-auto rounded-2xl shadow-elevated hover:shadow-fire transition-all duration-500 backdrop-blur-sm"
                asChild
              >
                <a 
                  href="https://instagram.com/skateburnmiami" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-4"
                >
                  🎟 RSVP / Watch Reels
                  <ExternalLink className="w-6 h-6" />
                </a>
              </Button>
              <div className="absolute inset-0 bg-gradient-fire opacity-30 blur-xl rounded-2xl -z-10"></div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Animated Scroll Indicator */}
      <motion.div 
        className="absolute bottom-12 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.5, repeat: Infinity, repeatType: "reverse", repeatDelay: 2 }}
      >
        <div className="flex flex-col items-center space-y-2">
          <motion.div 
            className="w-0.5 h-20 bg-gradient-to-b from-neon-orange via-led-blue to-glow-yellow rounded-full opacity-80 shadow-glow"
            animate={{ scaleY: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <div className="text-xs text-foreground/60 font-street uppercase tracking-wider">Scroll</div>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;