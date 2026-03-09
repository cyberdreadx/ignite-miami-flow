import { motion, useScroll, useTransform } from "framer-motion";
import NavBar from "@/components/layout/NavBar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  Flame, Users, Heart, Zap, Star,
  ArrowRight, MapPin, Calendar, Instagram,
  Music, Sparkles, Target, Crown
} from "lucide-react";
import { useRef } from "react";

const About = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-8%"]);
  const fadeOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  const coreValues = [
    { icon: Flame, title: "Courage", description: "The bravery to try new tricks, express yourself, and take creative risks in a supportive environment." },
    { icon: Heart, title: "Connection", description: "Building genuine relationships through shared passion for movement, art, and self-expression." },
    { icon: Sparkles, title: "Transformation", description: "Personal growth through fire, flow, and community that ignites your potential." },
    { icon: Users, title: "Unity", description: "Bringing together skaters, spinners, dancers, and all creatives under one flame." }
  ];

  const eventFeatures = [
    { icon: Music, title: "Live DJs", description: "Pulsing beats that fuel your flow and keep the energy burning bright" },
    { icon: Zap, title: "Skill Shares & Workshops", description: "Learn new techniques and share knowledge across disciplines" },
    { icon: Crown, title: "Themed Jams", description: "Creative sessions with unique themes that challenge and inspire" },
    { icon: Target, title: "Choreography Collabs", description: "Collaborative performances that blend movement and artistry" }
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
      
      {/* Background */}
      <motion.div className="fixed inset-0 -z-10" style={{ y: backgroundY }}>
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(/lovable-uploads/4ce48732-086e-4dd7-8c60-444377496357.png)` }} />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/90" />
      </motion.div>
      
      {/* Hero */}
      <section className="relative flex items-center justify-center pt-20 pb-8 min-h-[60vh]">
        <motion.div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background/60"
          style={{ opacity: fadeOpacity }} />
        
        <motion.div className="relative z-10 text-center px-6 max-w-4xl mx-auto" style={{ y: contentY }}>
          <motion.div
            className="flex flex-col items-center pt-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
          >
            <motion.img
              src="/lovable-uploads/f40780ef-982b-41a4-99b9-49357cc44738.png"
              alt="SkateBurn Miami"
              className="h-24 w-24 mb-6 drop-shadow-2xl"
              style={{ borderRadius: "50%", objectFit: "cover" }}
              whileHover={{ scale: 1.08, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
            
            <motion.h1
              className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-fire bg-clip-text text-transparent leading-tight mb-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
            >
              About Skateburn
            </motion.h1>
            
            <motion.p
              className="text-base sm:text-lg text-muted-foreground mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.7 }}
            >
              Founded by Miranda Shines & Brandon Menard · June 2023 – Present
            </motion.p>

            <motion.h2
              className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-neon bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7 }}
            >
              🔥 Skate. Flow. Burn. Repeat. 🔥
            </motion.h2>
          </motion.div>
        </motion.div>
      </section>

      {/* Content Sections */}
      <div className="relative z-10 bg-background">

        {/* Origin Story */}
        <section className="py-12 sm:py-16 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-background to-secondary/10 border border-primary/20 p-8 sm:p-10">
                <div className="text-center mb-6">
                  <Sparkles className="h-10 w-10 text-primary mx-auto mb-3" />
                  <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    The Spark That Started It All
                  </h2>
                </div>

                <div className="space-y-4 text-base leading-relaxed max-w-3xl mx-auto">
                  <p className="text-base sm:text-lg font-semibold text-center text-foreground">
                    Skateburn was born from a spark — a vision to bring community, creativity, and healing to the heart of a concrete jungle.
                  </p>
                  <p className="text-muted-foreground">
                    In the summer of 2023, Miranda Shines and Brandon Menard gathered a small circle of intentional fire artists to practice their craft safely, under the stars. What began as a humble gathering has grown into a <span className="text-primary font-semibold">biweekly movement</span> that blends fire, flow, dance, and skate culture at Miami's Skatebird.
                  </p>
                  <p className="text-muted-foreground">
                    Now, Skateburn is a pulsing hub for skaters, spinners, dancers, and creatives to unite through movement and expression. Each event is a celebration — with live DJs, skill shares, workshops, themed jams, choreography collabs, and powerful <span className="text-primary font-semibold">fire performances that light up the night</span>.
                  </p>
                  <div className="bg-gradient-to-r from-primary/15 to-secondary/15 rounded-xl p-6 border border-primary/20 mt-4">
                    <p className="text-base font-semibold text-center italic">
                      "At its core, Skateburn is about courage, connection, and transformation. Whether you're here to ignite your flow, meet your people, or simply catch the flame, you're welcome here."
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Core Values */}
        <section className="py-12 sm:py-16 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <motion.h2
              className="text-2xl sm:text-3xl font-bold text-center mb-8 bg-gradient-primary bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Our Core Values
            </motion.h2>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {coreValues.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: index * 0.08, duration: 0.5 }}
                  whileHover={{ y: -4 }}
                  className="group"
                >
                  <Card className="h-full bg-card/80 border-primary/20 hover:border-primary/40 transition-all duration-300">
                    <CardContent className="text-center p-5">
                      <value.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                      <CardTitle className="text-base font-bold mb-2 bg-gradient-fire bg-clip-text text-transparent">{value.title}</CardTitle>
                      <CardDescription className="text-xs text-muted-foreground leading-relaxed">{value.description}</CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Event Features */}
        <section className="py-12 sm:py-16 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <motion.h2
              className="text-2xl sm:text-3xl font-bold text-center mb-8 bg-gradient-neon bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              What Makes Our Events Special
            </motion.h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {eventFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08, duration: 0.5 }}
                  whileHover={{ y: -3 }}
                  className="group"
                >
                  <Card className="h-full bg-card/80 border-primary/20 hover:border-primary/40 transition-all duration-300">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <feature.icon className="h-6 w-6 text-primary shrink-0" />
                        <CardTitle className="text-base font-bold bg-gradient-neon bg-clip-text text-transparent">{feature.title}</CardTitle>
                      </div>
                      <CardDescription className="text-sm text-muted-foreground leading-relaxed">{feature.description}</CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Community Stats */}
        <section className="py-12 sm:py-16 px-4 sm:px-6">
          <div className="max-w-3xl mx-auto">
            <motion.h2
              className="text-2xl sm:text-3xl font-bold text-center mb-8 bg-gradient-fire bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Community by Numbers
            </motion.h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08, duration: 0.5, type: "spring", stiffness: 120 }}
                  whileHover={{ y: -4 }}
                >
                  <Card className="text-center bg-card/60 border-primary/20 hover:border-primary/40 transition-all duration-300">
                    <CardContent className="p-5">
                      <stat.icon className="h-7 w-7 text-primary mx-auto mb-2" />
                      <div className="text-3xl font-bold bg-gradient-fire bg-clip-text text-transparent mb-1">{stat.value}</div>
                      <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Instagram Feed */}
        <section className="py-12 sm:py-16 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <motion.h2
              className="text-2xl sm:text-3xl font-bold text-center mb-8 bg-gradient-primary bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Follow Our Journey
            </motion.h2>
            
            <div className="relative rounded-2xl border border-primary/20 overflow-hidden bg-primary/5">
              <div className="p-6 sm:p-8">
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <Instagram className="h-6 w-6 text-primary" />
                    <h3 className="text-lg font-bold text-foreground">@skateburnmiami</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    See the latest from our fire-fueled community events
                  </p>
                </div>
                <div className="elfsight-app-280d9a60-a69f-44a6-8575-f8de1937b009" data-elfsight-app-lazy></div>
              </div>
            </div>
          </div>
        </section>

        {/* Location & Community */}
        <section className="py-12 sm:py-16 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                whileHover={{ y: -3 }}
              >
                <div className="h-full rounded-2xl border border-primary/20 bg-primary/5 p-6 hover:border-primary/40 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <MapPin className="h-6 w-6 text-primary shrink-0" />
                    <h3 className="text-lg font-bold text-foreground">Find Us at Skatebird</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    Every other week, we transform Miami's Skatebird into a canvas of creativity and community. Join us under the stars where concrete meets fire and flow.
                  </p>
                  <Badge variant="secondary" className="text-sm py-1.5 px-4 rounded-lg">
                    NW 83rd & Biscayne Blvd, El Portal
                  </Badge>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                whileHover={{ y: -3 }}
              >
                <div className="h-full rounded-2xl border border-primary/20 bg-primary/5 p-6 hover:border-primary/40 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <Instagram className="h-6 w-6 text-primary shrink-0" />
                    <h3 className="text-lg font-bold text-foreground">Connect With Us</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    Stay connected with our vibrant community and never miss an event or update.
                  </p>
                  <div className="flex flex-col gap-2">
                    <Badge variant="secondary" className="text-sm py-1.5 px-4 w-fit rounded-lg">@skateburnmiami</Badge>
                    <Badge variant="outline" className="text-sm py-1.5 px-4 w-fit rounded-lg">Biweekly Events</Badge>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 sm:py-16 px-4 sm:px-6">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="text-center rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 p-8 sm:p-10">
                <h2 className="text-2xl sm:text-3xl font-bold mb-3 bg-gradient-primary bg-clip-text text-transparent">
                  Ready to Catch the Flame?
                </h2>
                <p className="text-muted-foreground text-sm sm:text-base mb-6 max-w-xl mx-auto leading-relaxed">
                  Join our community of fire artists, skaters, and creatives. Whether you're here to ignite your flow, meet your people, or simply catch the flame — you're welcome here.
                </p>
                <Button size="lg" onClick={() => navigate('/')} className="px-8">
                  Join the Community
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default About;
