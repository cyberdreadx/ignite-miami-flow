import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Loader2, ArrowLeft } from "lucide-react";
import NavBar from "@/components/NavBar";
import { AvatarUpload } from "@/components/AvatarUpload";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("member");
  const [isLoading, setIsLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  
  const { toast } = useToast();
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message === "Invalid login credentials") {
            toast({
              title: "Login Failed",
              description: "Invalid email or password. Please check your credentials.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Login Failed",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Welcome back!",
            description: "You have been logged in successfully.",
          });
          navigate("/");
        }
      } else {
        const { error } = await signUp(email, password, username, role);
        if (error) {
          if (error.message === "User already registered") {
            toast({
              title: "Account Exists",
              description: "An account with this email already exists. Please sign in instead.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Sign Up Failed",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          setShowVerification(true);
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-6 pt-24">
        <div className="w-full max-w-md">
        <Button 
          variant="outline" 
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
        
        <Card className="bg-card/10 backdrop-blur-lg border border-white/10">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-graffiti bg-gradient-fire bg-clip-text text-transparent">
              {showVerification ? "Check Your Email" : (isLogin ? "Welcome Back" : "Join SkateBurn")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {showVerification ? (
              <div className="text-center space-y-4">
                <div className="text-6xl mb-4">📧</div>
                <p className="text-muted-foreground">
                  We've sent a verification email to <strong>{email}</strong>
                </p>
                <p className="text-sm text-muted-foreground">
                  {["dj", "performer", "photographer"].includes(role) 
                    ? "Please verify your email, then your account will be reviewed by an admin before activation."
                    : "Please check your email and click the verification link to complete your registration."
                  }
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowVerification(false);
                    setIsLogin(true);
                    setEmail("");
                    setPassword("");
                    setUsername("");
                  }}
                  className="mt-6"
                >
                  Back to Sign In
                </Button>
              </div>
            ) : (
              <>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isLogin && (
                    <>
                      <div className="flex justify-center mb-6">
                        <AvatarUpload 
                          userName={username || email || "User"} 
                          size="lg"
                        />
                      </div>
                      <div>
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          required={!isLogin}
                          className="bg-background/50"
                          placeholder="Enter your username"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="role">Role</Label>
                        <Select value={role} onValueChange={setRole}>
                          <SelectTrigger className="bg-background/50">
                            <SelectValue placeholder="Select your role" />
                          </SelectTrigger>
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
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-background/50"
                      placeholder="Enter your email"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-background/50"
                      placeholder="Enter your password"
                      minLength={6}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {isLogin ? "Sign In" : "Sign Up"}
                  </Button>
                </form>
                
                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                  </p>
                  <Button
                    variant="link"
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-glow-yellow"
                  >
                    {isLogin ? "Sign up here" : "Sign in here"}
                  </Button>
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