import { Card, CardContent } from "@/components/ui/card";
import { Flame, Music, Users, Palette, Heart } from "lucide-react";

const CommunityVibe = () => {
  const highlights = [
    { icon: Flame, text: "Fire dancing & prop spinning" },
    { icon: Music, text: "Skatepark sessions" },
    { icon: Music, text: "Live music" },
    { icon: Palette, text: "Local pop-ups & artists" },
    { icon: Heart, text: "Flow family energy" },
  ];

  return (
    <section className="py-16 px-4 bg-background">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-5xl font-graffiti font-bold mb-8 text-glow-yellow">
          🧘 Community Vibe
        </h2>
        
        <Card className="bg-card/80 backdrop-blur-sm border-flame-red/30 shadow-fire mb-12">
          <CardContent className="p-8">
            <p className="text-xl md:text-2xl text-foreground/90 leading-relaxed font-street">
              SkateBurn is more than a jam — it's a flow sanctuary. A space for self-expression, creativity, and movement.
            </p>
          </CardContent>
        </Card>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {highlights.map((item, index) => (
            <Card 
              key={index}
              className="bg-card/80 backdrop-blur-sm border-led-blue/30 hover:shadow-neon transition-all duration-300 hover:scale-105"
            >
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-fire rounded-full flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-8 h-8 text-background" />
                </div>
                <p className="text-foreground font-street font-semibold">
                  {item.text}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CommunityVibe;