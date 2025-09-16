import { Card, CardContent } from "@/components/ui/card";
import { Flame, Music, Users, Palette, Heart } from "lucide-react";

const CommunityVibe = () => {
  const highlights = [
    { icon: Flame, text: "Fire dancing & prop spinning", gradient: "from-flame-red to-neon-orange" },
    { icon: Music, text: "Skatepark sessions", gradient: "from-led-blue to-glow-yellow" },
    { icon: Music, text: "Live music", gradient: "from-neon-orange to-led-blue" },
    { icon: Palette, text: "Local pop-ups & artists", gradient: "from-glow-yellow to-flame-red" },
    { icon: Heart, text: "Flow family energy", gradient: "from-led-blue to-neon-orange" },
  ];

  return (
    <section className="py-24 px-6 bg-background relative overflow-hidden">
      {/* Background mesh */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-20"></div>
      
      <div className="max-w-5xl mx-auto text-center relative z-10">
        <div className="animate-fade-in mb-16">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-graffiti font-bold mb-6">
            <span className="bg-gradient-neon bg-clip-text text-transparent">🧘 Community Vibe</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-fire mx-auto rounded-full mb-8"></div>
        </div>
        
        <div className="animate-scale-in mb-16" style={{animationDelay: '0.2s'}}>
          <Card className="bg-card/10 backdrop-blur-lg border border-flame-red/20 shadow-elevated hover:shadow-fire transition-all duration-500 overflow-hidden group">
            <CardContent className="p-12">
              <p className="text-2xl md:text-3xl text-foreground/90 leading-relaxed font-street group-hover:text-glow-yellow transition-colors duration-500">
                SkateBurn is more than a jam — it's a flow sanctuary. A space for self-expression, creativity, and movement.
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {highlights.map((item, index) => (
            <div 
              key={index}
              className="animate-slide-up group"
              style={{animationDelay: `${0.1 * (index + 3)}s`}}
            >
              <Card className="bg-card/10 backdrop-blur-lg border border-white/10 hover:border-white/20 shadow-elevated hover:shadow-glow transition-all duration-500 hover:scale-105 overflow-hidden">
                <CardContent className="p-8 text-center">
                  <div className={`w-20 h-20 bg-gradient-to-br ${item.gradient} rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                    <item.icon className="w-10 h-10 text-background" />
                  </div>
                  <p className="text-foreground font-street font-semibold text-lg group-hover:text-glow-yellow transition-colors duration-300">
                    {item.text}
                  </p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CommunityVibe;