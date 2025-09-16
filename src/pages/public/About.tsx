import { motion, useScroll, useTransform } from "framer-motion";
import NavBar from "@/components/layout/NavBar";
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
import { useRef } from "react";
import firePerformerBg from "@/assets/fire-performer-bg.png";

const About = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Parallax transforms
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const logoY = useTransform(scrollYProgress, [0, 1], ["0%", "-20%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-10%"]);
  const fadeOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

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
    <div ref={containerRef} className="relative min-h-screen bg-background overflow-hidden">
      <NavBar />
      
      {/* Fire Performer Background */}
      <motion.div 
        className="fixed inset-0 -z-10"
        style={{ y: backgroundY }}
      >
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(/lovable-uploads/4ce48732-086e-4dd7-8c60-444377496357.png)` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/90" />
      </motion.div>
      
      {/* Hero Section with Parallax */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        <motion.div 
          className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background/60"
          style={{ opacity: fadeOpacity }}
        />
        
        <motion.div 
          className="relative z-10 text-center px-6 max-w-6xl mx-auto"
          style={{ y: contentY }}
        >
          <motion.div 
            className="flex flex-col items-center mb-16 pt-8"
            style={{ y: logoY }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, type: "spring", stiffness: 100 }}
          >
            <motion.img 
              src="/lovable-uploads/f40780ef-982b-41a4-99b9-49357cc44738.png" 
              alt="SkateBurn Miami" 
              className="h-40 w-40 mb-8 drop-shadow-2xl"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
            
            <motion.h1 
              className="text-4xl sm:text-6xl md:text-7xl lg:text-9xl font-bold bg-gradient-fire bg-clip-text text-transparent leading-none mb-6 px-4"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              About Skateburn
            </motion.h1>
            
            <motion.div 
              className="text-lg sm:text-xl md:text-2xl text-muted-foreground font-medium mb-8 px-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              Founded by Miranda Shines & Brandon Menard • June 2023 – Present
            </motion.div>
            
            <motion.div
              className="space-y-6 text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold bg-gradient-neon bg-clip-text text-transparent px-4">
                🔥 Skate. Flow. Burn. Repeat. 🔥
              </h2>
              
              <p className="text-lg sm:text-xl md:text-2xl text-foreground/80 max-w-4xl mx-auto leading-relaxed px-4">
                A pulsing hub where skaters, spinners, dancers, and creatives unite through movement and expression at Miami's Skatebird.
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

        {/* Content Sections */}
        <div className="relative z-10 bg-background">
          {/* Origin Story */}
          <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6">
            <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
            >
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-background to-secondary/10 border border-primary/20 p-16">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-pulse"></div>
                
                <motion.div 
                  className="relative text-center mb-12"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  <Sparkles className="h-16 w-16 text-primary mx-auto mb-6" />
                  <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-8">
                    The Spark That Started It All
                  </h2>
                </motion.div>

                <div className="space-y-6 sm:space-y-8 text-base sm:text-lg md:text-xl leading-relaxed relative max-w-4xl mx-auto">
                  <motion.p 
                    className="text-lg sm:text-xl md:text-2xl font-semibold text-center text-foreground"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  >
                    Skateburn was born from a spark — a vision to bring community, creativity, and healing to the heart of a concrete jungle.
                  </motion.p>
                  
                  <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                  >
                    In the summer of 2023, Miranda Shines and Brandon Menard gathered a small circle of intentional fire artists to practice their craft safely, under the stars. What began as a humble gathering of performers has grown into a <span className="text-primary font-semibold">biweekly movement</span> that blends fire, flow, dance, and skate culture at Miami's Skatebird.
                  </motion.p>
                  
                  <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                  >
                    Now, Skateburn is a pulsing hub for skaters, spinners, dancers, and creatives to unite through movement and expression. Each event is a celebration — with live DJs, skill shares, workshops, themed jams, choreography collabs, and powerful <span className="text-primary font-semibold">fire performances that light up the night</span>.
                  </motion.p>
                  
                  <motion.div 
                    className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl p-8 border border-primary/30 mt-12"
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                  >
                    <p className="text-lg sm:text-xl md:text-2xl font-semibold text-center italic">
                      "At its core, Skateburn is about courage, connection, and transformation. Whether you're here to ignite your flow, meet your people, or simply catch the flame, you're welcome here."
                    </p>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Core Values */}
        <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <motion.h2 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-center mb-12 sm:mb-16 md:mb-20 bg-gradient-primary bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              Our Core Values
            </motion.h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {coreValues.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 80 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="group"
                >
                  <Card className="relative h-full bg-gradient-to-b from-card/80 to-card/40 backdrop-blur-lg border-primary/20 hover:border-primary/40 transition-all duration-500 hover:shadow-glow">
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
                    
                    <CardContent className="relative text-center p-8">
                      <motion.div
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.6, type: "spring" }}
                        className="mb-6"
                      >
                        <value.icon className="h-16 w-16 text-primary mx-auto" />
                      </motion.div>
                      
                      <CardTitle className="text-2xl font-bold mb-4 bg-gradient-fire bg-clip-text text-transparent">{value.title}</CardTitle>
                      <CardDescription className="text-muted-foreground leading-relaxed text-base">{value.description}</CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Event Features */}
        <section className="py-32 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.h2 
              className="text-5xl md:text-7xl font-bold text-center mb-20 bg-gradient-neon bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              What Makes Our Events Special
            </motion.h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {eventFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -80 : 80 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.8 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="group"
                >
                  <Card className="relative h-full bg-gradient-to-br from-card/90 to-card/40 backdrop-blur-lg border-primary/20 hover:border-primary/40 transition-all duration-500 hover:shadow-glow">
                    <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-xl"></div>
                    
                    <CardContent className="relative p-8">
                      <div className="flex items-center gap-4 mb-6">
                        <motion.div
                          whileHover={{ scale: 1.2, rotate: 10 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <feature.icon className="h-12 w-12 text-primary" />
                        </motion.div>
                        <CardTitle className="text-2xl font-bold bg-gradient-neon bg-clip-text text-transparent">{feature.title}</CardTitle>
                      </div>
                      <CardDescription className="text-muted-foreground text-lg leading-relaxed">{feature.description}</CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Community Stats */}
        <section className="py-32 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.h2 
              className="text-5xl md:text-7xl font-bold text-center mb-20 bg-gradient-fire bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              Community by Numbers
            </motion.h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ 
                    delay: index * 0.1, 
                    duration: 0.6,
                    type: "spring",
                    stiffness: 100
                  }}
                  whileHover={{ scale: 1.1, y: -10 }}
                  className="group"
                >
                  <Card className="relative text-center bg-gradient-to-b from-card/60 to-card/20 backdrop-blur-lg border-primary/20 hover:border-primary/40 transition-all duration-500 hover:shadow-glow">
                    <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-xl"></div>
                    
                    <CardContent className="relative p-8">
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <stat.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                      </motion.div>
                      <div className="text-5xl font-bold bg-gradient-fire bg-clip-text text-transparent mb-2">{stat.value}</div>
                      <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Instagram Feed */}
        <section className="py-32 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.h2 
              className="text-5xl md:text-7xl font-bold text-center mb-20 bg-gradient-primary bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              Follow Our Journey
            </motion.h2>
            
            <motion.div
              initial={{ opacity: 0, y: 80 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="relative bg-gradient-to-br from-primary/5 to-secondary/5 backdrop-blur-sm rounded-3xl border border-primary/20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-pulse"></div>
                
                <div className="relative p-12">
                  <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-4 mb-6">
                      <Instagram className="h-12 w-12 text-primary" />
                      <h3 className="text-3xl font-bold text-foreground">@skateburnmiami</h3>
                    </div>
                    <p className="text-xl text-muted-foreground">
                      See the latest from our fire-fueled community events and sessions
                    </p>
                  </div>
                  
                  <div 
                    className="elfsight-app-280d9a60-a69f-44a6-8575-f8de1937b009" 
                    data-elfsight-app-lazy
                  ></div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Location & Community */}
        <section className="py-32 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              <motion.div
                initial={{ opacity: 0, x: -80 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <div className="relative h-full bg-gradient-to-br from-primary/5 to-secondary/5 backdrop-blur-sm rounded-3xl border border-primary/20 p-12 hover:border-primary/40 transition-all duration-500">
                  <div className="absolute inset-0 bg-gradient-primary opacity-0 hover:opacity-10 transition-opacity duration-500 rounded-3xl"></div>
                  
                  <div className="relative">
                    <div className="flex items-center gap-4 mb-8">
                      <MapPin className="h-12 w-12 text-primary" />
                      <h3 className="text-3xl font-bold text-foreground">Find Us at Skatebird</h3>
                    </div>
                    
                    <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                      Every other week, we transform Miami's Skatebird into a canvas of creativity and community. 
                      Join us under the stars where concrete meets fire and flow.
                    </p>
                    
                    <Badge variant="secondary" className="text-lg py-3 px-6 rounded-xl">
                      NW 83rd & Biscayne Blvd, El Portal
                    </Badge>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 80 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <div className="relative h-full bg-gradient-to-br from-secondary/5 to-primary/5 backdrop-blur-sm rounded-3xl border border-primary/20 p-12 hover:border-primary/40 transition-all duration-500">
                  <div className="absolute inset-0 bg-gradient-secondary opacity-0 hover:opacity-10 transition-opacity duration-500 rounded-3xl"></div>
                  
                  <div className="relative">
                    <div className="flex items-center gap-4 mb-8">
                      <Instagram className="h-12 w-12 text-primary" />
                      <h3 className="text-3xl font-bold text-foreground">Connect With Us</h3>
                    </div>
                    
                    <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                      Stay connected with our vibrant community and never miss an event or update.
                    </p>
                    
                    <div className="flex flex-col gap-4">
                      <Badge variant="secondary" className="text-lg py-3 px-6 w-fit rounded-xl">
                        @skateburnmiami
                      </Badge>
                      <Badge variant="outline" className="text-lg py-3 px-6 w-fit rounded-xl">
                        Biweekly Events
                      </Badge>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 80 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="relative text-center bg-gradient-to-r from-primary/20 via-primary/10 to-secondary/20 backdrop-blur-sm rounded-3xl border border-primary/30 overflow-hidden p-16">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-pulse"></div>
                
                <div className="relative">
                  <motion.h2 
                    className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-primary bg-clip-text text-transparent"
                    initial={{ scale: 0.9 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2, type: "spring" }}
                  >
                    Ready to Catch the Flame?
                  </motion.h2>
                  
                  <motion.p 
                    className="text-muted-foreground text-xl mb-12 max-w-2xl mx-auto leading-relaxed"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  >
                    Join our community of fire artists, skaters, and creatives. Whether you're here to ignite your flow, 
                    meet your people, or simply catch the flame — you're welcome here.
                  </motion.p>
                  
                   <motion.div
                    className="flex justify-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                  >
                    <Button 
                      size="lg" 
                      onClick={() => navigate('/')} 
                      className="text-xl px-12 py-6 h-auto rounded-2xl mx-auto"
                      variant="fire"
                    >
                      Join the Community
                      <ArrowRight className="h-6 w-6 ml-3" />
                    </Button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;