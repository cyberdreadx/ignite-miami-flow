import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Camera, Flame, Users, Shield, CheckCircle, XCircle, Download } from "lucide-react";
import NavBar from "@/components/NavBar";
import { supabase } from "@/integrations/supabase/client";

const Photographers = () => {
  const [passType, setPassType] = useState("30");
  const [name, setName] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Handle success/cancel from payment redirect
  useEffect(() => {
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");
    const passTypeParam = searchParams.get("pass_type");

    if (success === "true" && passTypeParam) {
      toast({
        title: "Payment Successful!",
        description: `Your ${passTypeParam === "30" ? "$30" : "$150"} media pass has been purchased. Check your email for details.`,
      });
      // Clear URL parameters
      window.history.replaceState({}, '', '/photographers');
    } else if (canceled === "true") {
      toast({
        title: "Payment Canceled",
        description: "Your payment was canceled. You can try again anytime.",
        variant: "destructive",
      });
      // Clear URL parameters
      window.history.replaceState({}, '', '/photographers');
    }
  }, [searchParams, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to purchase a media pass.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (!agreed) {
      toast({
        title: "Agreement Required",
        description: "Please agree to the terms and conditions.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Call the media pass payment edge function
      const { data, error } = await supabase.functions.invoke('create-media-pass-payment', {
        body: {
          passType,
          name,
          instagramHandle
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.url) {
        // Redirect to Stripe checkout
        window.open(data.url, '_blank');
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show sign-in prompt if user is not authenticated
  if (!user) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen bg-gradient-dark pt-24 px-6">
          <div className="max-w-2xl mx-auto">
            <div className="text-center">
              <div className="mb-8">
                <Camera className="w-16 h-16 text-primary mx-auto mb-4" />
                <h1 className="text-4xl font-graffiti bg-gradient-fire bg-clip-text text-transparent mb-4">
                  📸 SKATEBURN MEDIA PASS
                </h1>
                <p className="text-glow-yellow text-xl mb-8">
                  Capture the Magic of Fire & Flow
                </p>
              </div>
              
              <Card className="bg-card/10 backdrop-blur-lg border border-white/10">
                <CardContent className="p-8 text-center">
                  <Shield className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-semibold text-foreground mb-4">
                    Sign In Required
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    You need to be signed in to access media pass applications. 
                    Create an account or sign in to continue.
                  </p>
                  <div className="space-y-3">
                    <Button 
                      onClick={() => navigate("/auth")} 
                      size="lg" 
                      className="w-full"
                    >
                      Sign In to Continue
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Don't have an account? Sign up is available on the auth page.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gradient-dark pt-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-graffiti bg-gradient-fire bg-clip-text text-transparent mb-4">
              📸 SKATEBURN MEDIA PASS
            </h1>
            <p className="text-glow-yellow text-xl">
              Capture the Magic of Fire & Flow
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Media Pass Benefits */}
            <Card className="bg-card/10 backdrop-blur-lg border border-white/10">
              <CardHeader>
                <CardTitle className="text-2xl font-normal text-glow-yellow">
                  Media Pass Includes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Flame className="w-5 h-5 text-primary mt-1" />
                  <p>Permission to shoot inside the fire + flow zone</p>
                </div>
                <div className="flex items-start space-x-3">
                  <Camera className="w-5 h-5 text-primary mt-1" />
                  <p>Closer access than general guests (maintain 8–10 feet distance unless invited closer)</p>
                </div>
                <div className="flex items-start space-x-3">
                  <Users className="w-5 h-5 text-primary mt-1" />
                  <p>Access to performer handles (by request)</p>
                </div>
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-primary mt-1" />
                  <p>Support for fire permits, music, safety, and event continuation</p>
                </div>
              </CardContent>
            </Card>

            {/* Pass Options */}
            <Card className="bg-card/10 backdrop-blur-lg border border-white/10">
              <CardHeader>
                <CardTitle className="text-2xl font-normal text-glow-yellow">
                  Pass Options & Usage Rights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="border border-white/20 rounded-lg p-4">
                    <h3 className="text-xl font-semibold text-primary mb-2">$30 Media Pass</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Grant Skateburn Miami & Flow Angels LLC non-exclusive, royalty-free license to use your media.
                    </p>
                    <ul className="text-sm space-y-1">
                      <li>• Include Skateburn watermark</li>
                      <li>• Tag @SkateburnMiami and @Skatebird305</li>
                      <li>• Upload content to designated Google Drive</li>
                    </ul>
                  </div>
                  
                  <div className="border border-white/20 rounded-lg p-4">
                    <h3 className="text-xl font-semibold text-primary mb-2">$150 Media Pass</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Retain exclusive rights to your content with your own watermark.
                    </p>
                    <ul className="text-sm space-y-1">
                      <li>• Full content ownership</li>
                      <li>• Custom watermark allowed</li>
                      <li>• Must follow event guidelines</li>
                      <li>• Cannot obstruct other photographers</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Guidelines */}
          <Card className="bg-card/10 backdrop-blur-lg border border-white/10 my-8">
            <CardHeader>
              <CardTitle className="text-2xl font-normal text-glow-yellow">
                Media Conduct & Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <ul className="space-y-2 text-sm">
                  <li>• Maintain respectful distance (8–10 feet minimum) from performers</li>
                  <li>• No flash photography without explicit permission</li>
                </ul>
                <ul className="space-y-2 text-sm">
                  <li>• Respect others—communicate, rotate, and share space</li>
                  <li>• Do not crowd performance space or block others</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Branding Assets */}
          <Card className="bg-card/10 backdrop-blur-lg border border-white/10 my-8">
            <CardHeader>
              <CardTitle className="text-2xl font-normal text-glow-yellow">
                Branding Assets for Photographers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <p className="text-muted-foreground">
                  Use these official SkateBurn assets in your content and watermarks. Right-click to save or use the download button.
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="border border-white/20 rounded-lg p-6 bg-white/5">
                    <h3 className="text-lg font-semibold text-primary mb-4">Official SkateBurn Logo</h3>
                    <div className="flex flex-col items-center space-y-4">
                      <div className="bg-white/10 rounded-lg p-4 w-full flex justify-center">
                        <img 
                          src="/lovable-uploads/7ae4542c-245a-41d9-8301-b991fcffdffa.png"
                          alt="SkateBurn Official Logo"
                          className="max-w-full h-auto max-h-32 object-contain"
                        />
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = '/lovable-uploads/7ae4542c-245a-41d9-8301-b991fcffdffa.png';
                          link.download = 'skateburn-logo.png';
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Logo
                      </Button>
                    </div>
                  </div>
                  
                  <div className="border border-white/20 rounded-lg p-6 bg-white/5">
                    <h3 className="text-lg font-semibold text-primary mb-4">Usage Guidelines</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Use on dark backgrounds for best visibility</li>
                      <li>• Maintain logo proportions - do not stretch</li>
                      <li>• Place in corner or non-intrusive area</li>
                      <li>• For $30 pass holders: required watermark</li>
                      <li>• For $150 pass holders: optional branding</li>
                      <li>• Always tag @SkateburnMiami when posting</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Application Form */}
          <Card className="bg-card/10 backdrop-blur-lg border border-white/10 mb-8">
            <CardHeader>
              <CardTitle className="text-2xl font-normal text-glow-yellow">
                Media Pass Application
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label className="text-base font-semibold mb-4 block">Select Media Pass Type</Label>
                  <RadioGroup value={passType} onValueChange={setPassType}>
                    <div className="flex items-center space-x-2 p-4 border border-white/20 rounded-lg">
                      <RadioGroupItem value="30" id="pass-30" />
                      <Label htmlFor="pass-30" className="flex-1 cursor-pointer">
                        <span className="font-semibold text-primary">$30 Media Pass</span>
                        <span className="block text-sm text-muted-foreground">
                          Shared usage rights with Skateburn branding requirements
                        </span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-4 border border-white/20 rounded-lg">
                      <RadioGroupItem value="150" id="pass-150" />
                      <Label htmlFor="pass-150" className="flex-1 cursor-pointer">
                        <span className="font-semibold text-primary">$150 Media Pass</span>
                        <span className="block text-sm text-muted-foreground">
                          Exclusive content rights with custom watermark
                        </span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="bg-background/50"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="instagram">Instagram Handle</Label>
                    <Input
                      id="instagram"
                      value={instagramHandle}
                      onChange={(e) => setInstagramHandle(e.target.value)}
                      required
                      className="bg-background/50"
                      placeholder="@your_handle"
                    />
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="agreement" 
                    checked={agreed}
                    onCheckedChange={(checked) => setAgreed(checked === true)}
                  />
                  <Label htmlFor="agreement" className="text-sm leading-relaxed cursor-pointer">
                    I agree to the above expectations and media pass terms. I understand the guidelines 
                    for respectful photography and the usage rights associated with my selected pass type.
                  </Label>
                </div>

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full"
                  disabled={isLoading || !agreed}
                >
                  {isLoading ? "Processing..." : `Purchase ${passType === "30" ? "$30" : "$150"} Media Pass`}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Photographers;