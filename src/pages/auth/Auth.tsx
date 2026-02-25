import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft } from "lucide-react";
import NavBar from "@/components/layout/NavBar";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("member");
  const [isLoading, setIsLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);
  
  const { toast } = useToast();
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (user) {
      navigate(searchParams.get('redirect') || '/');
    }
  }, [user, navigate, searchParams]);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({ title: "Email Required", description: "Please enter your email.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/`,
      });
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else setForgotPasswordSent(true);
    } catch {
      toast({ title: "Error", description: "Something went wrong.", variant: "destructive" });
    } finally { setIsLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({ title: "Login Failed", description: error.message === "Invalid login credentials" ? "Invalid email or password." : error.message, variant: "destructive" });
        } else {
          toast({ title: "Welcome back!", description: "Signed in successfully." });
          navigate(searchParams.get('redirect') || '/');
        }
      } else {
        const { error } = await signUp(email, password, username, role);
        if (error) {
          toast({ title: error.message === "User already registered" ? "Account Exists" : "Sign Up Failed", description: error.message, variant: "destructive" });
        } else {
          setShowVerification(true);
        }
      }
    } catch {
      toast({ title: "Error", description: "Something went wrong.", variant: "destructive" });
    } finally { setIsLoading(false); }
  };

  const resetForm = () => {
    setShowVerification(false); setForgotPasswordSent(false); setShowForgotPassword(false);
    setIsLogin(true); setEmail(""); setPassword(""); setUsername("");
  };

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-background flex items-center justify-center p-4 pt-20">
        <div className="w-full max-w-sm">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="mb-4 text-muted-foreground">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
          </Button>
          
          <Card className="border-border/50">
            <CardHeader className="text-center pb-4">
              <CardTitle className="font-display text-2xl">
                {showVerification ? "Check Your Email" : 
                 forgotPasswordSent ? "Reset Link Sent" :
                 showForgotPassword ? "Reset Password" : 
                 isLogin ? "Welcome Back" : "Join SkateBurn"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {showVerification ? (
                <div className="text-center space-y-4">
                  <p className="text-4xl">📧</p>
                  <p className="text-muted-foreground text-sm">
                    Verification email sent to <strong>{email}</strong>
                  </p>
                  <Button variant="outline" onClick={resetForm} className="mt-4 w-full">Back to Sign In</Button>
                </div>
              ) : forgotPasswordSent ? (
                <div className="text-center space-y-4">
                  <p className="text-4xl">🔑</p>
                  <p className="text-muted-foreground text-sm">Reset link sent to <strong>{email}</strong></p>
                  <Button variant="outline" onClick={resetForm} className="mt-4 w-full">Back to Sign In</Button>
                </div>
              ) : showForgotPassword ? (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <Label htmlFor="reset-email" className="text-sm">Email</Label>
                    <Input id="reset-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Send Reset Link
                  </Button>
                  <Button variant="ghost" onClick={() => setShowForgotPassword(false)} className="w-full text-sm" type="button">
                    Back to Sign In
                  </Button>
                </form>
              ) : (
                <>
                  <form onSubmit={handleSubmit} className="space-y-3">
                    {!isLogin && (
                      <>
                        <div>
                          <Label htmlFor="username" className="text-sm">Username</Label>
                          <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required placeholder="Your name" />
                        </div>
                        <div>
                          <Label htmlFor="role" className="text-sm">Role</Label>
                          <Select value={role} onValueChange={setRole}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="member">Member</SelectItem>
                              <SelectItem value="dj">DJ</SelectItem>
                              <SelectItem value="performer">Performer</SelectItem>
                              <SelectItem value="photographer">Photographer</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}
                    <div>
                      <Label htmlFor="email" className="text-sm">Email</Label>
                      <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
                    </div>
                    <div>
                      <Label htmlFor="password" className="text-sm">Password</Label>
                      <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" minLength={6} />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      {isLogin ? "Sign In" : "Sign Up"}
                    </Button>
                  </form>
                  <div className="mt-4 text-center space-y-2">
                    {isLogin && (
                      <Button variant="link" onClick={() => setShowForgotPassword(true)} className="text-xs text-muted-foreground" type="button">
                        Forgot password?
                      </Button>
                    )}
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">{isLogin ? "Don't have an account?" : "Already have an account?"}</p>
                      <Button variant="outline" onClick={() => setIsLogin(!isLogin)} className="w-full text-sm">
                        {isLogin ? "Sign Up" : "Sign In"}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Auth;
