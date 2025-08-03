import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, Save } from "lucide-react";

const Admin = () => {
  const { toast } = useToast();
  const [eventData, setEventData] = useState({
    title: "🔥 SkateBurn Tuesdays",
    subtitle: "Miami's Fire, Flow, & Skate Jam",
    time: "8PM–Midnight",
    location: "SkateBird Miami (NW 83rd & Biscayne Blvd, El Portal)",
    description: "Live DJs, open skating, LED flow props, fire spinning & flow arts showcase, local vendors, community hangout"
  });

  const handleSave = () => {
    // Here you would integrate with Supabase to save the data
    toast({
      title: "Event Updated",
      description: "Event information has been saved successfully.",
    });
  };

  const handleImageUpload = (type: string) => {
    // Here you would handle image uploads to Supabase storage
    toast({
      title: "Image Upload",
      description: `${type} image upload functionality would go here.`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-dark p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-graffiti font-bold bg-gradient-fire bg-clip-text text-transparent mb-4">
            🔧 Admin Dashboard
          </h1>
          <Button asChild variant="outline" className="mb-6">
            <a href="/">← Back to Site</a>
          </Button>
        </div>

        <div className="grid gap-6">
          {/* Event Info Card */}
          <Card className="bg-card/10 backdrop-blur-lg border border-white/10">
            <CardHeader>
              <CardTitle className="text-glow-yellow">Event Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Event Title</Label>
                <Input
                  id="title"
                  value={eventData.title}
                  onChange={(e) => setEventData({...eventData, title: e.target.value})}
                  className="bg-background/50"
                />
              </div>
              
              <div>
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  value={eventData.subtitle}
                  onChange={(e) => setEventData({...eventData, subtitle: e.target.value})}
                  className="bg-background/50"
                />
              </div>
              
              <div>
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  value={eventData.time}
                  onChange={(e) => setEventData({...eventData, time: e.target.value})}
                  className="bg-background/50"
                />
              </div>
              
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={eventData.location}
                  onChange={(e) => setEventData({...eventData, location: e.target.value})}
                  className="bg-background/50"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={eventData.description}
                  onChange={(e) => setEventData({...eventData, description: e.target.value})}
                  className="bg-background/50"
                  rows={3}
                />
              </div>
              
              <Button onClick={handleSave} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Save Event Info
              </Button>
            </CardContent>
          </Card>

          {/* Image Management */}
          <Card className="bg-card/10 backdrop-blur-lg border border-white/10">
            <CardHeader>
              <CardTitle className="text-glow-yellow">Image Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <Button 
                  onClick={() => handleImageUpload('promo-flyer')}
                  variant="outline"
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload New Promo Flyer
                </Button>
                
                <Button 
                  onClick={() => handleImageUpload('gallery')}
                  variant="outline"
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Add Gallery Images
                </Button>
                
                <Button 
                  onClick={() => handleImageUpload('logo')}
                  variant="outline"
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Update Logo
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card className="bg-card/10 backdrop-blur-lg border border-white/10">
            <CardHeader>
              <CardTitle className="text-glow-yellow">Social Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="instagram">Instagram URL</Label>
                <Input
                  id="instagram"
                  placeholder="https://instagram.com/skateburnmiami"
                  className="bg-background/50"
                />
              </div>
              
              <div>
                <Label htmlFor="telegram">Telegram Group URL</Label>
                <Input
                  id="telegram"
                  placeholder="https://t.me/skateburnmiami"
                  className="bg-background/50"
                />
              </div>
              
              <Button className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Save Social Links
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Admin;