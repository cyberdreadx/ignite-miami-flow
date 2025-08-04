import { motion } from "framer-motion";
import NavBar from "@/components/NavBar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  Flame, 
  Users, 
  Heart, 
  MessageSquare, 
  Pin, 
  Star,
  ArrowRight,
  MapPin,
  Calendar,
  Instagram,
  Send
} from "lucide-react";

const About = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: MessageSquare,
      title: "Share Your Stories",
      description: "Post about your skateboarding adventures, tricks, and experiences with the community."
    },
    {
      icon: Heart,
      title: "Connect with Riders",
      description: "Like and engage with posts from fellow skaters in the SkateBurn community."
    },
    {
      icon: Pin,
      title: "Stay Updated",
      description: "See pinned announcements from admins about events, meetups, and important community news."
    },
    {
      icon: Users,
      title: "Build Community",
      description: "Join a vibrant community of skateboarding enthusiasts in Miami and beyond."
    }
  ];

  const stats = [
    { label: "Community Members", value: "500+", icon: Users },
    { label: "Posts Shared", value: "2.5K+", icon: MessageSquare },
    { label: "Likes Given", value: "15K+", icon: Heart },
    { label: "Years Active", value: "3+", icon: Calendar }
  ];

  return (
    <motion.div 
      className="min-h-screen bg-background overflow-x-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <NavBar />
      
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <motion.div 
            className="text-center mb-16"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-center mb-6">
              <Flame className="h-12 w-12 text-primary mr-4" />
              <h1 className="text-5xl font-bold">About SkateBurn</h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              More than just a skateboarding community - we're a family of riders, creators, and rebels 
              pushing the boundaries of street culture in Miami and beyond.
            </p>
          </motion.div>

          {/* Story Section */}
          <motion.div 
            className="mb-16"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Star className="h-6 w-6 text-primary" />
                  Our Story
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-lg leading-relaxed">
                <p>
                  Founded in 2021, SkateBurn started as a small group of passionate skateboarders 
                  meeting at local parks in Miami. What began as weekend sessions quickly evolved 
                  into something bigger - a movement that celebrates the raw energy, creativity, 
                  and freedom that skateboarding represents.
                </p>
                <p>
                  Today, SkateBurn is a thriving community where riders of all skill levels come 
                  together to share their passion, learn from each other, and push the culture forward. 
                  From beginners landing their first ollie to pros filming street parts, everyone 
                  has a place in our family.
                </p>
                <p>
                  This social platform is our digital home - a space where the SkateBurn community 
                  can stay connected, share their latest sessions, organize meetups, and celebrate 
                  the culture we all love.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Platform Features */}
          <motion.div 
            className="mb-16"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-3xl font-bold text-center mb-8">Platform Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <feature.icon className="h-6 w-6 text-primary" />
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Community Stats */}
          <motion.div 
            className="mb-16"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-center mb-8">Community by Numbers</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                >
                  <Card className="text-center p-6">
                    <stat.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                    <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Community Guidelines */}
          <motion.div 
            className="mb-16"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Community Guidelines</CardTitle>
                <CardDescription>
                  To keep our community positive and inclusive, we ask all members to follow these guidelines:
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-1">1</Badge>
                    <div>
                      <h4 className="font-semibold">Respect Everyone</h4>
                      <p className="text-muted-foreground text-sm">
                        Treat all community members with respect, regardless of skill level or background.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-1">2</Badge>
                    <div>
                      <h4 className="font-semibold">Share Quality Content</h4>
                      <p className="text-muted-foreground text-sm">
                        Post skateboarding-related content that adds value to the community.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-1">3</Badge>
                    <div>
                      <h4 className="font-semibold">Support Each Other</h4>
                      <p className="text-muted-foreground text-sm">
                        Encourage fellow skaters and celebrate everyone's progress and achievements.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-1">4</Badge>
                    <div>
                      <h4 className="font-semibold">No Spam or Self-Promotion</h4>
                      <p className="text-muted-foreground text-sm">
                        Keep posts relevant to skateboarding and avoid excessive self-promotion.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Location & Social */}
          <motion.div 
            className="mb-16"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Find Us
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Based in Miami, Florida, we regularly meet at various skate spots around the city. 
                    Join our social platform to stay updated on session locations and meetups.
                  </p>
                  <Badge variant="secondary" className="mb-2">Miami, FL</Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Instagram className="h-5 w-5 text-primary" />
                    Connect With Us
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Follow us on our social channels and join our Telegram group for instant updates.
                  </p>
                  <div className="flex gap-2">
                    <Badge variant="secondary">@skateburnmiami</Badge>
                    <Badge variant="secondary">
                      <Send className="h-3 w-3 mr-1" />
                      Telegram
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div 
            className="text-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.0 }}
          >
            <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold mb-4">Ready to Join the Community?</h2>
                <p className="text-muted-foreground text-lg mb-6">
                  Sign up today and become part of the SkateBurn family. Share your passion, 
                  connect with fellow riders, and help shape the future of skateboarding culture.
                </p>
                <Button size="lg" onClick={() => navigate('/')} className="animate-fade-in">
                  Join the Feed
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default About;