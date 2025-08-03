import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Upload, Save, LogOut, Loader2 } from "lucide-react";

const Admin = () => {
  const { toast } = useToast();
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [eventData, setEventData] = useState({
    id: "",
    title: "",
    subtitle: "",
    time: "",
    location: "",
    description: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  // Load event data
  useEffect(() => {
    const loadEventData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('is_active', true)
          .maybeSingle();

        if (error) {
          console.error('Error loading event:', error);
          toast({
            title: "Error",
            description: "Failed to load event data.",
            variant: "destructive",
          });
        } else if (data) {
          setEventData(data);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadEventData();
  }, [user, toast]);

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('events')
        .upsert({
          id: eventData.id || undefined,
          title: eventData.title,
          subtitle: eventData.subtitle,
          time: eventData.time,
          location: eventData.location,
          description: eventData.description,
          is_active: true
        }, {
          onConflict: eventData.id ? 'id' : undefined
        });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to save event data.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Event Updated",
          description: "Event information has been saved successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = (type: string) => {
    // Future implementation for image uploads
    toast({
      title: "Image Upload",
      description: `${type} image upload functionality coming soon!`,
    });
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out.",
        variant: "destructive",
      });
    } else {
      navigate("/");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-dark p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-graffiti font-bold bg-gradient-fire bg-clip-text text-transparent mb-4">
              🔧 Admin Dashboard
            </h1>
            <Button asChild variant="outline" className="mb-6">
              <a href="/">← Back to Site</a>
            </Button>
          </div>
          <Button onClick={handleSignOut} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
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
              
              <Button onClick={handleSave} className="w-full" disabled={isSaving || isLoading}>
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                {isSaving ? "Saving..." : "Save Event Info"}
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