import { motion } from "framer-motion";
import { Shirt, Package, Star, Mail, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Merch = () => {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const handleNotifyMe = () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email to get notified.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "You're on the list! 🔥",
      description: "We'll notify you when merch drops.",
    });
    setEmail("");
  };

  const mockMerchItems = [
    {
      name: "SkateBurn Fire Hoodie",
      type: "Hoodie",
      description: "Premium heavyweight hoodie with flame graphic",
      price: "$65",
      image: "🔥",
    },
    {
      name: "Burn Bright Tee",
      type: "T-Shirt", 
      description: "Soft cotton blend with glow-in-the-dark print",
      price: "$25",
      image: "✨",
    },
    {
      name: "Skate Flame Deck",
      type: "Skateboard",
      description: "Limited edition custom deck design",
      price: "$85",
      image: "🛹",
    },
    {
      name: "Fire Squad Cap",
      type: "Hat",
      description: "Embroidered snapback with SkateBurn logo",
      price: "$35",
      image: "🧢",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-background via-accent/5 to-primary/5">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iNyIgY3k9IjciIHI9IjEiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50" />
          
          <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <Badge variant="outline" className="px-4 py-2 text-primary border-primary/30">
                  <Gift className="w-4 h-4 mr-2" />
                  Coming Soon
                </Badge>
                
                <h1 className="text-5xl md:text-7xl font-bold bg-gradient-fire bg-clip-text text-transparent">
                  SkateBurn Merch
                </h1>
                
                <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
                  Premium streetwear that burns bright. Get ready to rep your crew in style.
                </p>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-8xl md:text-9xl"
              >
                🔥👕🛹
              </motion.div>

              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-foreground">
                  Be the first to know when we drop
                </h2>
                
                <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && handleNotifyMe()}
                  />
                  <Button onClick={handleNotifyMe} className="whitespace-nowrap">
                    <Mail className="w-4 h-4 mr-2" />
                    Notify Me
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Preview Section */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                What's Coming
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                A sneak peek at the fire collection we're preparing for the community
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {mockMerchItems.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow bg-card/50 backdrop-blur-sm border-primary/10">
                    <CardHeader className="text-center">
                      <div className="text-6xl mb-4">{item.image}</div>
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                      <Badge variant="secondary" className="w-fit mx-auto">
                        {item.type}
                      </Badge>
                    </CardHeader>
                    <CardContent className="text-center space-y-3">
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                      <p className="text-xl font-bold text-primary">
                        {item.price}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 bg-accent/5">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold mb-6">Why Wait?</h2>
              <p className="text-xl text-muted-foreground">
                Here's what makes our merch worth the anticipation
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Star className="w-8 h-8" />,
                  title: "Premium Quality",
                  description: "High-quality materials and prints that last as long as your passion for skating"
                },
                {
                  icon: <Shirt className="w-8 h-8" />,
                  title: "Unique Designs",
                  description: "Exclusive artwork created by and for the SkateBurn community"
                },
                {
                  icon: <Package className="w-8 h-8" />,
                  title: "Limited Drops",
                  description: "Small batch releases that make each piece special and collectible"
                }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Don't Sleep on the Drop
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join the waitlist and be among the first to get your hands on exclusive SkateBurn gear when it launches.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleNotifyMe()}
              />
              <Button onClick={handleNotifyMe} size="lg">
                Join Waitlist
              </Button>
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Merch;