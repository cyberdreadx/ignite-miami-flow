import { Instagram, Send, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border/50 py-12 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <p className="font-display text-lg text-foreground/80 mb-6 font-semibold">
          SkateBurn Miami
        </p>
        
        <div className="flex justify-center gap-4 mb-8">
          <a href="https://instagram.com/skateburnmiami" target="_blank" rel="noopener noreferrer"
            className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-accent transition-colors">
            <Instagram className="w-5 h-5" />
          </a>
          <a href="#" className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-accent transition-colors">
            <Send className="w-5 h-5" />
          </a>
          <a href="mailto:hello@skateburnmiami.com"
            className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-accent transition-colors">
            <Mail className="w-5 h-5" />
          </a>
        </div>
        
        <p className="text-xs text-muted-foreground">
          Powered by Flow Angels.ent
        </p>
      </div>
    </footer>
  );
};

export default Footer;
