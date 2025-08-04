import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Upload, Save, LogOut, Loader2, ImageIcon, X } from "lucide-react";
import NavBar from "@/components/NavBar";

// Import current static assets for preview
import promoFlyer from "@/assets/promo-flyer.jpg";
import galleryImage1 from "@/assets/gallery-1.jpg";
import galleryImage2 from "@/assets/gallery-2.jpg";
import galleryImage3 from "@/assets/gallery-3.jpg";
import logo from "@/assets/skateburn-logo.png";
import heroBackground from "@/assets/hero-bg.jpg";

const Admin = () => {
  const { toast } = useToast();
  const { user, loading: authLoading, signOut } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
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
  const loading = authLoading || roleLoading;

  const [isSaving, setIsSaving] = useState(false);
  
  // Current images state for preview
  const currentImages = {
    promoFlyer, // This could be video or image
    gallery: [galleryImage1, galleryImage2, galleryImage3],
    logo,
    heroBackground
  };

  // Check if flyer is video or image
  const isVideoFlyer = (filename: string) => {
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
    return videoExtensions.some(ext => filename.toLowerCase().includes(ext));
  };

  // Redirect if not authenticated or not admin
  useEffect(() => {
    console.log('Admin page check:', { 
      user: user?.email, 
      isAdmin, 
      authLoading, 
      roleLoading,
      userRole: isAdmin ? 'admin' : 'not admin'
    });
    
    if (!authLoading && !roleLoading) {
      if (!user) {
        console.log('No user found, redirecting to auth');
        navigate("/auth");
      } else if (!isAdmin) {
        console.log('User is not admin, showing access denied');
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges to access this page.",
          variant: "destructive",
        });
        navigate("/");
      } else {
        console.log('User has admin access');
      }
    }
  }, [user, isAdmin, authLoading, roleLoading, navigate, toast]);

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
    // Future implementation for image/video uploads
    const isVideo = type.includes('video');
    const mediaType = isVideo ? 'video' : 'image';
    toast({
      title: `${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)} Upload`,
      description: `${type} ${mediaType} upload functionality coming soon!`,
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
      <>
        <NavBar />
        <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-foreground/60">Checking permissions...</p>
          </div>
        </div>
      </>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gradient-dark p-6 pt-24">
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
            <CardContent className="space-y-6">
              
              {/* Logo Section */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Logo</Label>
                <div className="flex items-center gap-4 p-4 bg-background/20 rounded-lg border border-white/10">
                  <div className="relative w-20 h-20 bg-background/50 rounded-lg flex items-center justify-center overflow-hidden">
                    <img 
                      src={currentImages.logo} 
                      alt="Current logo" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground/80 mb-2">Current logo</p>
                    <Button 
                      onClick={() => handleImageUpload('logo')}
                      variant="outline"
                      size="sm"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Replace Logo
                    </Button>
                  </div>
                </div>
              </div>

              {/* Promo Flyer Section - Video/Image Support */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Promo Flyer (Video/Image)</Label>
                <div className="flex items-center gap-4 p-4 bg-background/20 rounded-lg border border-white/10">
                  <div className="relative w-24 h-32 bg-background/50 rounded-lg flex items-center justify-center overflow-hidden">
                    {isVideoFlyer(currentImages.promoFlyer) ? (
                      <video 
                        src={currentImages.promoFlyer}
                        className="w-full h-full object-cover"
                        muted
                        loop
                        playsInline
                        controls={false}
                        onMouseEnter={(e) => e.currentTarget.play()}
                        onMouseLeave={(e) => e.currentTarget.pause()}
                      />
                    ) : (
                      <img 
                        src={currentImages.promoFlyer} 
                        alt="Current promo flyer" 
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute top-1 right-1 bg-black/60 text-white text-xs px-1 rounded">
                      {isVideoFlyer(currentImages.promoFlyer) ? 'VIDEO' : 'IMAGE'}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground/80 mb-3">
                      Current: {isVideoFlyer(currentImages.promoFlyer) ? 'Video flyer' : 'Image flyer'}
                    </p>
                    <div className="flex flex-col gap-2">
                      <Button 
                        onClick={() => handleImageUpload('promo-flyer-image')}
                        variant="outline"
                        size="sm"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Replace with Image
                      </Button>
                      <Button 
                        onClick={() => handleImageUpload('promo-flyer-video')}
                        variant="outline"
                        size="sm"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Replace with Video
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hero Background Section */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Hero Background</Label>
                <div className="flex items-center gap-4 p-4 bg-background/20 rounded-lg border border-white/10">
                  <div className="relative w-32 h-20 bg-background/50 rounded-lg flex items-center justify-center overflow-hidden">
                    <img 
                      src={currentImages.heroBackground} 
                      alt="Current hero background" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground/80 mb-2">Current hero background</p>
                    <Button 
                      onClick={() => handleImageUpload('hero-background')}
                      variant="outline"
                      size="sm"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Replace Background
                    </Button>
                  </div>
                </div>
              </div>

              {/* Gallery Section */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Gallery Images</Label>
                <div className="space-y-3">
                  {currentImages.gallery.map((image, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-background/20 rounded-lg border border-white/10">
                      <div className="relative w-24 h-16 bg-background/50 rounded-lg flex items-center justify-center overflow-hidden">
                        <img 
                          src={image} 
                          alt={`Gallery image ${index + 1}`} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-foreground/80 mb-2">Gallery image {index + 1}</p>
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => handleImageUpload(`gallery-${index + 1}`)}
                            variant="outline"
                            size="sm"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Replace
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button 
                    onClick={() => handleImageUpload('gallery-add')}
                    variant="outline"
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Add New Gallery Image
                  </Button>
                </div>
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
    </>
  );
};

export default Admin;