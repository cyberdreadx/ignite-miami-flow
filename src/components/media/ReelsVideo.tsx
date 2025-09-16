import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Play, Flame } from "lucide-react";

const ReelsVideo = () => {
  return (
    <section className="py-24 px-6 bg-background relative overflow-hidden">
      {/* Background mesh */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-25"></div>
      
      <div className="max-w-5xl mx-auto text-center relative z-10">
        <div className="animate-fade-in mb-16">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-graffiti font-bold mb-6">
            <span className="bg-gradient-fire bg-clip-text text-transparent">🎥 See the Heat</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-neon mx-auto rounded-full mb-8"></div>
          
          <p className="text-2xl text-foreground/80 font-street">
            Fire flow, music, movement — every week.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Instagram Embed Placeholder */}
          <div className="animate-scale-in" style={{animationDelay: '0.2s'}}>
            <Card className="bg-card/10 backdrop-blur-lg border border-neon-orange/20 hover:shadow-fire transition-all duration-500 overflow-hidden group">
              <CardHeader>
                <CardTitle className="text-glow-yellow font-street text-xl">Latest Reel</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="aspect-[9/16] bg-street-gray/50 rounded-xl flex items-center justify-center border border-neon-orange/30 backdrop-blur-sm group-hover:border-neon-orange/50 transition-all duration-500">
                  <div className="text-center group-hover:scale-105 transition-transform duration-300">
                    <Play className="w-20 h-20 text-neon-orange mx-auto mb-4 animate-pulse-glow" />
                    <p className="text-foreground/70 font-street text-lg">Instagram Reel</p>
                    <p className="text-sm text-foreground/50">@skateburnmiami</p>
                  </div>
                </div>
                
                <Button variant="street" className="w-full rounded-xl py-3" asChild>
                  <a 
                    href="https://instagram.com/skateburnmiami" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3"
                  >
                    Watch on Instagram
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
          
          {/* Featured Video */}
          <div className="animate-scale-in" style={{animationDelay: '0.4s'}}>
            <Card className="bg-card/10 backdrop-blur-lg border border-led-blue/20 hover:shadow-neon transition-all duration-500 overflow-hidden group">
              <CardHeader>
                <CardTitle className="text-glow-yellow font-street text-xl">Fire Flow Highlights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="aspect-[9/16] bg-street-gray/50 rounded-xl flex items-center justify-center border border-led-blue/30 backdrop-blur-sm group-hover:border-led-blue/50 transition-all duration-500">
                  <div className="text-center group-hover:scale-105 transition-transform duration-300">
                    <Flame className="w-20 h-20 text-flame-red mx-auto mb-4 animate-pulse-glow" />
                    <p className="text-foreground/70 font-street text-lg">Featured Video</p>
                    <p className="text-sm text-foreground/50">Best Moments</p>
                  </div>
                </div>
                
                <Button variant="neon" className="w-full rounded-xl py-3" asChild>
                  <a 
                    href="https://instagram.com/skateburnmiami" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3"
                  >
                    View Highlights
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReelsVideo;