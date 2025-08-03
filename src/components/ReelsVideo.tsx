import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Play, Flame } from "lucide-react";

const ReelsVideo = () => {
  return (
    <section className="py-16 px-4 bg-background">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-5xl font-graffiti font-bold mb-6 text-flame-red">
          🎥 See the Heat
        </h2>
        
        <p className="text-xl text-foreground/80 mb-12 font-street">
          Fire flow, music, movement — every week.
        </p>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Instagram Embed Placeholder */}
          <Card className="bg-card/80 backdrop-blur-sm border-neon-orange/30 hover:shadow-fire transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-glow-yellow font-street">Latest Reel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-[9/16] bg-street-gray rounded-lg flex items-center justify-center border border-neon-orange/30">
                <div className="text-center">
                  <Play className="w-16 h-16 text-neon-orange mx-auto mb-4" />
                  <p className="text-foreground/70 font-street">Instagram Reel</p>
                  <p className="text-sm text-foreground/50">@skateburnmiami</p>
                </div>
              </div>
              
              <Button variant="street" className="w-full" asChild>
                <a 
                  href="https://instagram.com/skateburnmiami" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  Watch on Instagram
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            </CardContent>
          </Card>
          
          {/* Featured Video */}
          <Card className="bg-card/80 backdrop-blur-sm border-led-blue/30 hover:shadow-neon transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-glow-yellow font-street">Fire Flow Highlights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-[9/16] bg-street-gray rounded-lg flex items-center justify-center border border-led-blue/30">
                <div className="text-center">
                  <Flame className="w-16 h-16 text-flame-red mx-auto mb-4" />
                  <p className="text-foreground/70 font-street">Featured Video</p>
                  <p className="text-sm text-foreground/50">Best Moments</p>
                </div>
              </div>
              
              <Button variant="neon" className="w-full" asChild>
                <a 
                  href="https://instagram.com/skateburnmiami" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  View Highlights
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ReelsVideo;