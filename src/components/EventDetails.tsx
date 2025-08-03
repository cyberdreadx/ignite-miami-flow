import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, MapPin, Music, Flame, Users } from "lucide-react";
import promoFlyer from "@/assets/promo-flyer.jpg";

const EventDetails = () => {
  const eventInfo = [
    { icon: Calendar, label: "Date", value: "Every Tuesday" },
    { icon: Clock, label: "Time", value: "8PM–Midnight" },
    { icon: MapPin, label: "Location", value: "SkateBird Miami (NW 83rd & Biscayne Blvd, El Portal)" },
    { icon: Music, label: "Music", value: "Live DJs, open skating, LED flow props" },
    { icon: Flame, label: "Fire Arts", value: "Fire spinning & flow arts showcase" },
    { icon: Users, label: "Community", value: "Local vendors, community hangout" },
  ];

  return (
    <section className="py-16 px-4 bg-gradient-dark">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-graffiti font-bold text-center mb-12 text-neon-orange">
          📆 Event Details
        </h2>
        
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Promo Flyer */}
          <div className="order-2 lg:order-1">
            <Card className="bg-card/80 backdrop-blur-sm border-neon-orange/30 shadow-fire">
              <CardContent className="p-0">
                <img 
                  src={promoFlyer} 
                  alt="SkateBurn Miami Event Flyer" 
                  className="w-full h-auto rounded-lg"
                />
              </CardContent>
            </Card>
          </div>
          
          {/* Event Info */}
          <div className="order-1 lg:order-2 space-y-6">
            {eventInfo.map((item, index) => (
              <Card key={index} className="bg-card/80 backdrop-blur-sm border-led-blue/30 hover:shadow-neon transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-neon rounded-lg flex items-center justify-center">
                      <item.icon className="w-6 h-6 text-background" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-street font-bold text-lg text-glow-yellow mb-1">
                        {item.label}
                      </h3>
                      <p className="text-foreground/90 leading-relaxed">
                        {item.value}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventDetails;