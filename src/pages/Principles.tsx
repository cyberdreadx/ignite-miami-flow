import { motion } from "framer-motion";
import NavBar from "@/components/NavBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, Gift, DollarSign, Heart, Palette, Users, Leaf, Shield, Zap, Eye } from "lucide-react";

const Principles = () => {
  const principles = [
    {
      number: 1,
      title: "Cosmic Inclusion",
      icon: <Flame className="h-6 w-6" />,
      description: "Everyone is welcome at Skateburn. We embrace and respect the stranger, ensuring no prerequisites for participation in our cosmic community.",
      color: "text-orange-500",
      bgGradient: "from-orange-500/20 to-red-500/20"
    },
    {
      number: 2,
      title: "Spirit of Giving",
      icon: <Gift className="h-6 w-6" />,
      description: "Skateburn thrives on acts of unconditional giving. Gifts flow freely without the expectation of return or exchange of equal value.",
      color: "text-pink-500",
      bgGradient: "from-pink-500/20 to-rose-500/20"
    },
    {
      number: 3,
      title: "Free Flowing",
      icon: <DollarSign className="h-6 w-6 line-through" />,
      description: "To preserve the spirit of giving, Skateburn creates an environment free from commercial influences. We protect our culture from exploitation, ensuring experiences are rooted in participation, not consumption.",
      color: "text-green-500",
      bgGradient: "from-green-500/20 to-emerald-500/20"
    },
    {
      number: 4,
      title: "Inner Harmony",
      icon: <Heart className="h-6 w-6" />,
      description: "Skateburn encourages individuals to discover, exercise, and rely on their inner resources, fostering self-reliance and personal growth.",
      color: "text-purple-500",
      bgGradient: "from-purple-500/20 to-violet-500/20"
    },
    {
      number: 5,
      title: "Expressive Freedom",
      icon: <Palette className="h-6 w-6" />,
      description: "Creative expression is a unique gift from each individual. This expression is shared freely, respecting the rights and liberties of others.",
      color: "text-blue-500",
      bgGradient: "from-blue-500/20 to-cyan-500/20"
    },
    {
      number: 6,
      title: "Tribal Unity",
      icon: <Users className="h-6 w-6" />,
      description: "Our community values creative cooperation and collaboration. We work together to build and protect social networks, communal spaces, artworks, and methods of communication that enhance our shared experience.",
      color: "text-indigo-500",
      bgGradient: "from-indigo-500/20 to-blue-500/20"
    },
    {
      number: 7,
      title: "Earth Guardianship",
      icon: <Leaf className="h-6 w-6" />,
      description: "We honor our duty to the Earth. Skateburn commits to leaving no trace, ensuring our activities respect and preserve the natural environment.",
      color: "text-emerald-500",
      bgGradient: "from-emerald-500/20 to-green-500/20"
    },
    {
      number: 8,
      title: "Harmonic Responsibility",
      icon: <Shield className="h-6 w-6" />,
      description: "We value our civic duties. Community members who organize events are responsible for public welfare and must communicate civic responsibilities, adhering to local laws and promoting peace.",
      color: "text-amber-500",
      bgGradient: "from-amber-500/20 to-yellow-500/20"
    },
    {
      number: 9,
      title: "Active Vibes",
      icon: <Zap className="h-6 w-6" />,
      description: "Skateburn thrives on active participation. We believe transformative change happens through personal engagement. Everyone is invited to work, everyone is invited to play, bringing the community to life through open-hearted actions.",
      color: "text-red-500",
      bgGradient: "from-red-500/20 to-orange-500/20"
    },
    {
      number: 10,
      title: "Here and Now",
      icon: <Eye className="h-6 w-6" />,
      description: "Living in the moment is our ultimate value. We strive to overcome barriers that stand between us and the recognition of our inner selves, the reality of others, and our participation in society. No idea can substitute for this immediate experience.",
      color: "text-violet-500",
      bgGradient: "from-violet-500/20 to-purple-500/20"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5">
      <NavBar />
      
      <div className="container mx-auto px-4 pt-24 pb-16">
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            Ten Principles of Skateburn
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            The foundational values that guide our community, inspire our gatherings, and shape our cosmic culture of fire, flow, and connection.
          </p>
        </motion.div>

        {/* Principles Grid */}
        <div className="space-y-6">
          {principles.map((principle, index) => (
            <motion.div
              key={principle.number}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <Card className={`bg-gradient-to-br ${principle.bgGradient} border-l-4 border-l-primary hover:shadow-lg transition-all duration-300`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-4 text-2xl">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 border-2 border-primary/20">
                      <span className="text-lg font-bold text-primary">{principle.number}</span>
                    </div>
                    <span className={principle.color}>
                      {principle.icon}
                    </span>
                    <span className="bg-gradient-primary bg-clip-text text-transparent">
                      {principle.title}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg leading-relaxed text-muted-foreground">
                    {principle.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Footer Message */}
        <motion.div 
          className="mt-16 text-center"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="pt-8">
              <h3 className="text-2xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
                🔥 Skate. Flow. Burn. Repeat. 🔥
              </h3>
              <p className="text-muted-foreground text-lg">
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