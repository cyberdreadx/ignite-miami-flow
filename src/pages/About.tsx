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
  Zap, 
  Star,
  ArrowRight,
  MapPin,
  Calendar,
  Instagram,
  Music,
  Sparkles,
  Target,
  Crown
} from "lucide-react";

const About = () => {
  const navigate = useNavigate();

  const coreValues = [
    {
      icon: Flame,
      title: "Courage",
      description: "The bravery to try new tricks, express yourself, and take creative risks in a supportive environment."
    },
    {
      icon: Heart,
      title: "Connection",
      description: "Building genuine relationships through shared passion for movement, art, and self-expression."
    },
    {
      icon: Sparkles,
      title: "Transformation",
      description: "Personal growth through fire, flow, and community that ignites your potential."
    },
    {
      icon: Users,
      title: "Unity",
      description: "Bringing together skaters, spinners, dancers, and all creatives under one flame."
    }
  ];

  const eventFeatures = [
    {
      icon: Music,
      title: "Live DJs",
      description: "Pulsing beats that fuel your flow and keep the energy burning bright"
    },
    {
      icon: Zap,
      title: "Skill Shares & Workshops",
      description: "Learn new techniques and share knowledge across disciplines"
    },
    {
      icon: Crown,
      title: "Themed Jams",
      description: "Creative sessions with unique themes that challenge and inspire"
    },
    {
      icon: Target,
      title: "Choreography Collabs",
      description: "Collaborative performances that blend movement and artistry"
    }
  ];

  const stats = [
    { label: "Years Strong", value: "2+", icon: Calendar },
    { label: "Community Events", value: "50+", icon: Flame },
    { label: "Fire Performers", value: "25+", icon: Star },
    { label: "Creative Souls", value: "200+", icon: Users }
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
            className="text-center mb-20"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div 
              className="flex items-center justify-center mb-8"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
            >
              <Flame className="h-16 w-16 text-primary mr-6 animate-pulse" />
              <div>
                <h1 className="text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  About Skateburn
                </h1>
                <div className="text-lg text-muted-foreground mt-2 font-medium">
                  Founded by Miranda Shines & Brandon Menard • June 2023 – Present
                </div>
              </div>
            </motion.div>
            
            <motion.p 
              className="text-2xl text-primary font-semibold max-w-4xl mx-auto leading-relaxed mb-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              🔥 Skate. Flow. Burn. Repeat. 🔥
            </motion.p>
            
            <motion.p 
              className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              A pulsing hub where skaters, spinners, dancers, and creatives unite through movement and expression at Miami's Skatebird.
            </motion.p>
          </motion.div>

          {/* Origin Story */}
          <motion.div 
            className="mb-20"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10 border-primary/30 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-pulse"></div>
              <CardHeader className="relative">
                <CardTitle className="text-3xl flex items-center gap-3">
                  <Sparkles className="h-8 w-8 text-primary" />
                  The Spark That Started It All
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-lg leading-relaxed relative">
                <p className="text-xl font-medium text-foreground">
                  Skateburn was born from a spark — a vision to bring community, creativity, and healing to the heart of a concrete jungle.
                </p>
                <p>
                  In the summer of 2023, Miranda Shines and Brandon Menard gathered a small circle of intentional fire artists to practice their craft safely, under the stars. What began as a humble gathering of performers has grown into a <span className="text-primary font-semibold">biweekly movement</span> that blends fire, flow, dance, and skate culture at Miami's Skatebird.
                </p>
                <p>
                  Now, Skateburn is a pulsing hub for skaters, spinners, dancers, and creatives to unite through movement and expression. Each event is a celebration — with live DJs, skill shares, workshops, themed jams, choreography collabs, and powerful <span className="text-primary font-semibold">fire performances that light up the night</span>.
                </p>
                <div className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg p-6 border-l-4 border-primary">
                  <p className="text-xl font-semibold text-center">
                    "At its core, Skateburn is about courage, connection, and transformation. Whether you're here to ignite your flow, meet your people, or simply catch the flame, you're welcome here."
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Core Values */}
          <motion.div 
            className="mb-20"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-primary bg-clip-text text-transparent">
              Our Core Values
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {coreValues.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Card className="h-full hover:shadow-xl transition-all duration-300 border-primary/20 bg-gradient-to-b from-background to-primary/5">
                    <CardHeader className="text-center">
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        <value.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                      </motion.div>
                      <CardTitle className="text-xl">{value.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-center">{value.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Event Features */}
          <motion.div 
            className="mb-20"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <h2 className="text-4xl font-bold text-center mb-12">What Makes Our Events Special</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {eventFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ x: index % 2 === 0 ? -30 : 30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1.0 + index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-all duration-300 border-primary/10">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-xl">
                        <feature.icon className="h-7 w-7 text-primary" />
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-lg">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Community Stats */}
          <motion.div 
            className="mb-20"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.1 }}
          >
            <h2 className="text-4xl font-bold text-center mb-12">Community by Numbers</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 1.2 + index * 0.1, type: "spring", stiffness: 100 }}
                  whileHover={{ scale: 1.1 }}
                >
                  <Card className="text-center p-6 bg-gradient-to-b from-primary/10 to-secondary/10 border-primary/20">
                    <stat.icon className="h-10 w-10 text-primary mx-auto mb-4" />
                    <div className="text-4xl font-bold text-primary mb-2">{stat.value}</div>
                    <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Location & Community */}
          <motion.div 
            className="mb-20"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.3 }}
          >
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <MapPin className="h-7 w-7 text-primary" />
                    Find Us at Skatebird
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 text-lg">
                    Every other week, we transform Miami's Skatebird into a canvas of creativity and community. 
                    Join us under the stars where concrete meets fire and flow.
                  </p>
                  <Badge variant="secondary" className="mb-2 text-base py-2 px-4">
                    NW 83rd & Biscayne Blvd, El Portal
                  </Badge>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-secondary/5 to-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <Instagram className="h-7 w-7 text-primary" />
                    Connect With Us
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 text-lg">
                    Stay connected with our vibrant community and never miss an event or update.
                  </p>
                  <div className="flex flex-col gap-2">
                    <Badge variant="secondary" className="text-base py-2 px-4 w-fit">
                      @skateburnmiami
                    </Badge>
                    <Badge variant="outline" className="text-base py-2 px-4 w-fit">
                      Biweekly Events
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div 
            className="text-center"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.4 }}
          >
            <Card className="bg-gradient-to-r from-primary/20 via-primary/10 to-secondary/20 border-primary/30 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-pulse"></div>
              <CardContent className="p-12 relative">
                <motion.h2 
                  className="text-4xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.5, type: "spring" }}
                >
                  Ready to Catch the Flame?
                </motion.h2>
                <p className="text-muted-foreground text-xl mb-8 max-w-2xl mx-auto">
                  Join our community of fire artists, skaters, and creatives. Whether you're here to ignite your flow, 
                  meet your people, or simply catch the flame — you're welcome here.
                </p>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    size="lg" 
                    onClick={() => navigate('/')} 
                    className="text-lg px-8 py-6"
                  >
                    Join the Community
                    <ArrowRight className="h-6 w-6 ml-3" />
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default About;