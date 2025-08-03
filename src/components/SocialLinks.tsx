import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ExternalLink, 
  Instagram, 
  MessageCircle, 
  Headphones, 
  Star, 
  Handshake 
} from "lucide-react";

const SocialLinks = () => {
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
    <section className="py-16 px-4 bg-gradient-dark">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-graffiti font-bold text-center mb-12 text-neon-orange">
          📲 Connect & Join
        </h2>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {links.map((link, index) => (
            <Card 
              key={index}
              className="bg-card/80 backdrop-blur-sm border-glow-yellow/30 hover:shadow-glow transition-all duration-300 hover:scale-105"
            >
              <CardContent className="p-6">
                <Button 
                  variant={link.variant} 
                  className="w-full h-auto py-4 flex-col gap-3"
                  asChild
                >
                  <a 
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-center"
                  >
                    <link.icon className="w-8 h-8" />
                    <span className="text-sm leading-tight">{link.title}</span>
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialLinks;