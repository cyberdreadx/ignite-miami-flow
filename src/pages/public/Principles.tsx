import { motion } from "framer-motion";
import NavBar from '@/components/layout/NavBar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, Gift, DollarSign, Heart, Palette, Users, Leaf, Shield, Zap, Eye } from "lucide-react";

const Principles = () => {
  const principles = [
    {
      number: 1,
      title: "Cosmic Inclusion",
      icon: <Flame className="h-4 w-4" />,
      description: "Everyone is welcome at Skateburn. We embrace and respect the stranger, ensuring no prerequisites for participation in our cosmic community.",
      color: "text-orange-500",
      bgGradient: "from-orange-500/10 to-red-500/10"
    },
    {
      number: 2,
      title: "Spirit of Giving",
      icon: <Gift className="h-4 w-4" />,
      description: "Skateburn thrives on acts of unconditional giving. Gifts flow freely without the expectation of return or exchange of equal value.",
      color: "text-pink-500",
      bgGradient: "from-pink-500/10 to-rose-500/10"
    },
    {
      number: 3,
      title: "Free Flowing",
      icon: <DollarSign className="h-4 w-4 line-through" />,
      description: "To preserve the spirit of giving, Skateburn creates an environment free from commercial influences. We protect our culture from exploitation, ensuring experiences are rooted in participation, not consumption.",
      color: "text-green-500",
      bgGradient: "from-green-500/10 to-emerald-500/10"
    },
    {
      number: 4,
      title: "Inner Harmony",
      icon: <Heart className="h-4 w-4" />,
      description: "Skateburn encourages individuals to discover, exercise, and rely on their inner resources, fostering self-reliance and personal growth.",
      color: "text-purple-500",
      bgGradient: "from-purple-500/10 to-violet-500/10"
    },
    {
      number: 5,
      title: "Expressive Freedom",
      icon: <Palette className="h-4 w-4" />,
      description: "Creative expression is a unique gift from each individual. This expression is shared freely, respecting the rights and liberties of others.",
      color: "text-blue-500",
      bgGradient: "from-blue-500/10 to-cyan-500/10"
    },
    {
      number: 6,
      title: "Tribal Unity",
      icon: <Users className="h-4 w-4" />,
      description: "Our community values creative cooperation and collaboration. We work together to build and protect social networks, communal spaces, artworks, and methods of communication that enhance our shared experience.",
      color: "text-indigo-500",
      bgGradient: "from-indigo-500/10 to-blue-500/10"
    },
    {
      number: 7,
      title: "Earth Guardianship",
      icon: <Leaf className="h-4 w-4" />,
      description: "We honor our duty to the Earth. Skateburn commits to leaving no trace, ensuring our activities respect and preserve the natural environment.",
      color: "text-emerald-500",
      bgGradient: "from-emerald-500/10 to-green-500/10"
    },
    {
      number: 8,
      title: "Harmonic Responsibility",
      icon: <Shield className="h-4 w-4" />,
      description: "We value our civic duties. Community members who organize events are responsible for public welfare and must communicate civic responsibilities, adhering to local laws and promoting peace.",
      color: "text-amber-500",
      bgGradient: "from-amber-500/10 to-yellow-500/10"
    },
    {
      number: 9,
      title: "Active Vibes",
      icon: <Zap className="h-4 w-4" />,
      description: "Skateburn thrives on active participation. We believe transformative change happens through personal engagement. Everyone is invited to work, everyone is invited to play, bringing the community to life through open-hearted actions.",
      color: "text-red-500",
      bgGradient: "from-red-500/10 to-orange-500/10"
    },
    {
      number: 10,
      title: "Here and Now",
      icon: <Eye className="h-4 w-4" />,
      description: "Living in the moment is our ultimate value. We strive to overcome barriers that stand between us and the recognition of our inner selves, the reality of others, and our participation in society. No idea can substitute for this immediate experience.",
      color: "text-violet-500",
      bgGradient: "from-violet-500/10 to-purple-500/10"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      <div className="container mx-auto px-4 pt-20 pb-12 max-w-3xl">
        {/* Header */}
        <motion.div 
          className="text-center mb-10 pt-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-3 bg-gradient-primary bg-clip-text text-transparent">
            Ten Principles of Skateburn
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            The foundational values that guide our community, inspire our gatherings, and shape our culture of fire, flow, and connection.
          </p>
        </motion.div>

        {/* Principles List */}
        <div className="space-y-3">
          {principles.map((principle, index) => (
            <motion.div
              key={principle.number}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.05 + index * 0.04 }}
            >
              <Card className={`bg-gradient-to-br ${principle.bgGradient} border-l-4 border-l-primary hover:shadow-md transition-all duration-200`}>
                <CardHeader className="pb-1 pt-4 px-4">
                  <CardTitle className="flex items-center gap-3 text-base">
                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 border border-primary/20 shrink-0">
                      <span className="text-xs font-bold text-primary">{principle.number}</span>
                    </div>
                    <span className={`${principle.color} shrink-0`}>
                      {principle.icon}
                    </span>
                    <span className="bg-gradient-primary bg-clip-text text-transparent font-semibold">
                      {principle.title}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-1">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {principle.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Footer Message */}
        <motion.div 
          className="mt-8 text-center"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-6">
              <h3 className="text-base font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
                🔥 Skate. Flow. Burn. Repeat. 🔥
              </h3>
              <p className="text-muted-foreground text-sm">
                These principles are our compass, guiding us through every gathering, every moment of connection, and every flame we ignite together.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Principles;
