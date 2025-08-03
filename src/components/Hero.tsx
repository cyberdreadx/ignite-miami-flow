import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import skateburnLogo from "@/assets/skateburn-logo.png";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/40 to-background/80"></div>
      </div>
      
      {/* Logo */}
      <div className="absolute top-6 left-6 z-20">
        <img 
          src={skateburnLogo} 
          alt="SkateBurn Miami" 
          className="h-16 md:h-20 w-auto drop-shadow-lg"
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-graffiti font-bold mb-6 leading-tight">
          <span className="block text-neon-orange drop-shadow-lg">🔥 SkateBurn</span>
          <span className="block text-led-blue drop-shadow-lg">Tuesdays</span>
          <span className="block text-glow-yellow text-2xl md:text-4xl lg:text-5xl mt-2">
            Miami's Fire, Flow, & Skate Jam
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-foreground/90 mb-8 font-street">
          Every Tuesday Night | SkateBird Miami | 8PM – Midnight
        </p>
        
        <Button 
          variant="fire" 
          size="lg" 
          className="text-lg px-8 py-4 h-auto"
          asChild
        >
          <a 
            href="https://instagram.com/skateburnmiami" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-3"
          >
            🎟 RSVP / Watch Reels
            <ExternalLink className="w-5 h-5" />
          </a>
        </Button>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-1 h-16 bg-gradient-to-b from-neon-orange to-led-blue rounded-full opacity-70"></div>
      </div>
    </section>
  );
};

export default Hero;