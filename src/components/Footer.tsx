import { Instagram, Send, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-neon-orange/30 py-12 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-lg font-street text-foreground/90 mb-6">
          SkateBurn Miami — igniting the streets since 2023.
        </p>
        
        <div className="flex justify-center gap-6 mb-8">
          <a 
            href="https://instagram.com/skateburnmiami" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-12 h-12 bg-gradient-fire rounded-full flex items-center justify-center hover:shadow-fire transition-all duration-300"
          >
            <Instagram className="w-6 h-6 text-background" />
          </a>
          
          <a 
            href="#" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-12 h-12 bg-gradient-neon rounded-full flex items-center justify-center hover:shadow-neon transition-all duration-300"
          >
            <Send className="w-6 h-6 text-background" />
          </a>
          
          <a 
            href="mailto:hello@skateburnmiami.com" 
            className="w-12 h-12 bg-street-gray border border-glow-yellow rounded-full flex items-center justify-center hover:bg-glow-yellow hover:text-background transition-all duration-300"
          >
            <Mail className="w-6 h-6" />
          </a>
        </div>
        
        <p className="text-sm text-foreground/60 font-street">
          Powered by Flow Angels.ent
        </p>
      </div>
    </footer>
  );
};

export default Footer;