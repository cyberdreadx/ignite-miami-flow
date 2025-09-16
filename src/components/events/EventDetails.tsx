import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, MapPin, Music, Flame, Users } from "lucide-react";
import promoFlyer from "@/assets/promo-flyer.jpg";

const EventDetails = () => {
  const eventInfo = [
    { icon: Calendar, label: "Date", value: "Every Tuesday", gradient: "from-neon-orange to-flame-red" },
    { icon: Clock, label: "Time", value: "8PM–Midnight", gradient: "from-led-blue to-neon-orange" },
    { icon: MapPin, label: "Location", value: "SkateBird Miami (NW 83rd & Biscayne Blvd, El Portal)", gradient: "from-glow-yellow to-led-blue" },
    { icon: Music, label: "Music", value: "Live DJs, open skating, LED flow props", gradient: "from-flame-red to-glow-yellow" },
    { icon: Flame, label: "Fire Arts", value: "Fire spinning & flow arts showcase", gradient: "from-neon-orange to-led-blue" },
    { icon: Users, label: "Community", value: "Local vendors, community hangout", gradient: "from-led-blue to-flame-red" },
  ];

  return (
    <section className="py-24 px-6 bg-gradient-dark relative overflow-hidden">
      {/* Background mesh */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-50"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-graffiti font-bold mb-6">
            <span className="bg-gradient-fire bg-clip-text text-transparent">📆 Event Details</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-neon mx-auto rounded-full"></div>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Promo Flyer */}
          <div className="order-2 lg:order-1 animate-scale-in" style={{animationDelay: '0.2s'}}>
            <div className="relative group">
              <Card className="bg-card/10 backdrop-blur-lg border border-neon-orange/20 shadow-elevated hover:shadow-fire transition-all duration-500 overflow-hidden">
                <CardContent className="p-0">
                  <img 
                    src={promoFlyer} 
                    alt="SkateBurn Miami Event Flyer" 
                    className="w-full h-auto rounded-lg transition-transform duration-500 group-hover:scale-105"
                  />
                </CardContent>
              </Card>
              <div className="absolute inset-0 bg-gradient-fire opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-lg blur-xl"></div>
            </div>
          </div>
          
          {/* Event Info */}
          <div className="order-1 lg:order-2 space-y-6">
            {eventInfo.map((item, index) => (
              <div 
                key={index} 
                className="animate-slide-up" 
                style={{animationDelay: `${0.1 * index}s`}}
              >
                <Card className="bg-card/10 backdrop-blur-lg border border-white/10 hover:border-white/20 shadow-elevated hover:shadow-glow transition-all duration-500 group hover:scale-[1.02] overflow-hidden">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-6">
                      <div className={`flex-shrink-0 w-16 h-16 bg-gradient-to-br ${item.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <item.icon className="w-8 h-8 text-background" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-street font-bold text-xl text-glow-yellow mb-3 group-hover:text-neon-orange transition-colors duration-300">
                          {item.label}
                        </h3>
                        <p className="text-foreground/90 leading-relaxed text-lg">
                          {item.value}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventDetails;