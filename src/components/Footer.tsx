import { Instagram, Send, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-neon-orange/30 py-16 px-6 relative overflow-hidden">
      {/* Background mesh */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-20"></div>
      
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="animate-fade-in">
          <p className="text-2xl font-street text-foreground/90 mb-8 font-bold">
            SkateBurn Miami — igniting the streets since 2023.
          </p>
          
          <div className="flex justify-center gap-8 mb-12">
            <a 
              href="https://instagram.com/skateburnmiami" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group"
            >
              <div className="w-16 h-16 bg-gradient-fire rounded-2xl flex items-center justify-center hover:shadow-fire transition-all duration-500 group-hover:scale-110 shadow-lg">
                <Instagram className="w-8 h-8 text-background" />
              </div>
            </a>
            
            <a 
              href="#" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group"
            >
              <div className="w-16 h-16 bg-gradient-neon rounded-2xl flex items-center justify-center hover:shadow-neon transition-all duration-500 group-hover:scale-110 shadow-lg">
                <Send className="w-8 h-8 text-background" />
              </div>
            </a>
            
            <a 
              href="mailto:hello@skateburnmiami.com" 
              className="group"
            >
              <div className="w-16 h-16 bg-street-gray border-2 border-glow-yellow rounded-2xl flex items-center justify-center hover:bg-glow-yellow hover:text-background transition-all duration-500 group-hover:scale-110 shadow-lg">
                <Mail className="w-8 h-8" />
              </div>
            </a>
          </div>
          
          <div className="space-y-2">
            <p className="text-foreground/60 font-street text-lg">
              Powered by Flow Angels.ent
            </p>
            <div className="w-16 h-0.5 bg-gradient-neon mx-auto rounded-full"></div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;