import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useExternalLinkHandler } from "@/utils/linkHandler";
import { 
  ExternalLink, 
  Instagram, 
  MessageCircle, 
  Headphones, 
  Star, 
  Handshake 
} from "lucide-react";

const SocialLinks = () => {
  const { handleExternalClick } = useExternalLinkHandler();
  
  const links = [
    {
      icon: ExternalLink,
      title: "🎟 RSVP / Event Info",
      href: "https://instagram.com/skateburnmiami",
      variant: "fire" as const,
    },
    {
      icon: Instagram,
      title: "📸 Instagram: @skateburnmiami",
      href: "https://instagram.com/skateburnmiami",
      variant: "neon" as const,
    },
    {
      icon: MessageCircle,
      title: "💬 Telegram Group",
      href: "#",
      variant: "street" as const,
    },
    {
      icon: Headphones,
      title: "🎧 DJ Submissions",
      href: "#",
      variant: "fire" as const,
    },
    {
      icon: Star,
      title: "🌟 Flow Performer Signup",
      href: "#",
      variant: "neon" as const,
    },
    {
      icon: Handshake,
      title: "🤝 Flow Angels.ent",
      href: "#",
      variant: "street" as const,
    },
  ];

  return (
    <section className="py-24 px-6 bg-gradient-dark relative overflow-hidden">
      {/* Background mesh */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-40"></div>
      
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-graffiti font-bold mb-6">
            <span className="bg-gradient-fire bg-clip-text text-transparent">📲 Connect & Join</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-neon mx-auto rounded-full"></div>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {links.map((link, index) => (
            <div 
              key={index}
              className="animate-scale-in group"
              style={{animationDelay: `${0.1 * index}s`}}
            >
              <Card className="bg-card/10 backdrop-blur-lg border border-white/10 hover:border-white/20 shadow-elevated hover:shadow-glow transition-all duration-500 overflow-hidden group-hover:scale-105">
                <CardContent className="p-8">
                  <Button 
                    variant={link.variant} 
                    className="w-full h-auto py-6 flex-col gap-4 text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500"
                    asChild
                  >
                    <a 
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={handleExternalClick}
                      className="text-center group-hover:scale-105 transition-transform duration-300"
                    >
                      <link.icon className="w-10 h-10" />
                      <span className="leading-tight font-street font-semibold">{link.title}</span>
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialLinks;