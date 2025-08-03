import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import skateburnLogo from "@/assets/skateburn-logo.png";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Mesh Background */}
      <div className="absolute inset-0 bg-gradient-mesh"></div>
      
      {/* Main Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/50 to-background/90 backdrop-blur-xs"></div>
      </div>
      
      {/* Floating Logo */}
      <div className="absolute top-8 left-8 z-20 animate-float">
        <div className="relative">
          <img 
            src={skateburnLogo} 
            alt="SkateBurn Miami" 
            className="h-20 md:h-24 w-auto drop-shadow-2xl filter brightness-110"
          />
          <div className="absolute inset-0 bg-gradient-fire opacity-20 blur-xl rounded-lg"></div>
        </div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <div className="space-y-8 animate-fade-in">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-graffiti font-bold leading-none">
            <span className="block bg-gradient-fire bg-clip-text text-transparent drop-shadow-2xl animate-pulse-glow">
              🔥 SkateBurn
            </span>
            <span className="block bg-gradient-neon bg-clip-text text-transparent drop-shadow-2xl mt-2 animate-slide-up" style={{animationDelay: '0.2s'}}>
              Tuesdays
            </span>
            <span className="block text-glow-yellow text-3xl md:text-5xl lg:text-6xl mt-4 animate-slide-up font-street font-bold" style={{animationDelay: '0.4s'}}>
              Miami's Fire, Flow, & Skate Jam
            </span>
          </h1>
          
          <div className="animate-slide-up" style={{animationDelay: '0.6s'}}>
            <p className="text-xl md:text-3xl text-foreground/90 mb-12 font-street leading-relaxed">
              Every Tuesday Night | SkateBird Miami | 8PM – Midnight
            </p>
            
            <div className="relative inline-block">
              <Button 
                variant="fire" 
                size="lg" 
                className="text-xl px-12 py-6 h-auto rounded-2xl shadow-elevated hover:shadow-fire transition-all duration-500 hover:scale-105 backdrop-blur-sm"
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
              <div className="absolute inset-0 bg-gradient-fire opacity-30 blur-xl rounded-2xl -z-10 animate-pulse-glow"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modern scroll indicator */}
      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 animate-float">
        <div className="flex flex-col items-center space-y-2">
          <div className="w-0.5 h-20 bg-gradient-to-b from-neon-orange via-led-blue to-glow-yellow rounded-full opacity-80 shadow-glow"></div>
          <div className="text-xs text-foreground/60 font-street uppercase tracking-wider">Scroll</div>
        </div>
      </div>
    </section>
  );
};

export default Hero;