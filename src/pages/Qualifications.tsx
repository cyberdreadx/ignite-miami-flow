import { motion } from "framer-motion";
import NavBar from "@/components/NavBar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Music, Camera, Users, CheckCircle, AlertCircle } from "lucide-react";

const Qualifications = () => {
  const qualificationCategories = [
    {
      title: "Fire Performer",
      icon: <Flame className="h-8 w-8" />,
      color: "text-orange-500",
      bgColor: "from-orange-500/10 to-red-500/10",
      borderColor: "border-orange-500/30",
      requirements: [
        "Minimum 6 months of documented fire performance experience",
        "Completed fire safety training or workshop certification",
        "Own professional-grade fire equipment (poi, staff, fans, etc.)",
        "Knowledge of fire safety protocols and emergency procedures",
        "Ability to demonstrate 3+ fire flow techniques",
        "Valid insurance or waiver acknowledgment"
      ],
      preferred: [
        "Performance videos or portfolio",
        "Workshop teaching experience",
        "Community event participation history"
      ]
    },
    {
      title: "DJ / Music Artist",
      icon: <Music className="h-8 w-8" />,
      color: "text-purple-500",
      bgColor: "from-purple-500/10 to-pink-500/10",
      borderColor: "border-purple-500/30",
      requirements: [
        "Professional DJ equipment (decks, mixer, speakers)",
        "Curated music library suitable for skate/flow culture",
        "Minimum 1 year of DJing experience",
        "Understanding of event flow and crowd energy management",
        "Ability to read the room and adapt music accordingly",
        "Reliable transportation for equipment"
      ],
      preferred: [
        "Live performance recordings or mixes",
        "Experience with outdoor/skate events",
        "Original music production skills",
        "Social media following in music/skate community"
      ]
    },
    {
      title: "Photographer / Videographer",
      icon: <Camera className="h-8 w-8" />,
      color: "text-blue-500",
      bgColor: "from-blue-500/10 to-cyan-500/10",
      borderColor: "border-blue-500/30",
      requirements: [
        "Professional camera equipment capable of low-light shooting",
        "Portfolio demonstrating action/movement photography",
        "Experience with fire photography safety protocols",
        "Post-production skills (editing software proficiency)",
        "Ability to work in fast-paced, dynamic environments",
        "Understanding of skate culture and fire performance aesthetics"
      ],
      preferred: [
        "Previous event photography experience",
        "Drone operation certification",
        "Social media content creation skills",
        "Quick turnaround time for event highlights"
      ]
    }
  ];

  const groundRules = [
    "NO IGNITING OR SMOKING NEAR THE DIPPING STATION",
    "FLOW ONLY IN SKATING AREA",
    "IGNITED PROPS MUST HAVE DESIGNATED FIRE SAFETY"
  ];

  const generalGuidelines = [
    "All performers must be 18+ years old",
    "Commitment to community safety and positive vibes",
    "Respect for the venue, equipment, and fellow participants",
    "Willingness to collaborate and share knowledge",
    "Adherence to Skateburn's code of conduct",
    "Regular attendance and community participation"
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
            Performer Qualifications
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Join our community of talented performers, DJs, and photographers. Here's what we look for in each role.
          </p>
        </motion.div>

        {/* Ground Rules */}
        <motion.div 
          className="mb-8"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Flame className="h-7 w-7 text-red-500" />
                Skateburn Ground Rules
              </CardTitle>
              <CardDescription>
                These rules MUST be followed at all times - failure to follow will lead to harsh punishments. LOL.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {groundRules.map((rule, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <span className="font-semibold text-red-600">{rule}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* General Guidelines */}
        <motion.div 
          className="mb-16"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Users className="h-7 w-7 text-primary" />
                Community Guidelines
              </CardTitle>
              <CardDescription>
                These apply to all performer roles at Skateburn events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {generalGuidelines.map((guideline, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{guideline}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Role-Specific Qualifications */}
        <div className="space-y-8">
          {qualificationCategories.map((category, index) => (
            <motion.div
              key={category.title}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <Card className={`bg-gradient-to-br ${category.bgColor} border ${category.borderColor}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-3xl">
                    <span className={category.color}>
                      {category.icon}
                    </span>
                    {category.title}
                  </CardTitle>
                  <CardDescription className="text-lg">
                    Requirements and qualifications for {category.title.toLowerCase()} role
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                      <h4 className="text-lg font-semibold">Required Qualifications</h4>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      {category.requirements.map((req, reqIndex) => (
                        <div key={reqIndex} className="flex items-start gap-3">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                          <span className="text-sm">{req}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="secondary" className="text-sm">
                        Preferred
                      </Badge>
                      <h4 className="text-lg font-semibold">Additional Preferred Qualifications</h4>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      {category.preferred.map((pref, prefIndex) => (
                        <div key={prefIndex} className="flex items-start gap-3">
                          <CheckCircle className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{pref}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Application Process */}
        <motion.div 
          className="mt-16 text-center"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl">Ready to Apply?</CardTitle>
              <CardDescription className="text-lg">
                Submit your application through our registration process and our team will review your qualifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Applications are reviewed within 48-72 hours. Approved performers will receive access to our performer community and event coordination channels.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Badge variant="outline">Community Driven</Badge>
                <Badge variant="outline">Safety First</Badge>
                <Badge variant="outline">Creative Expression</Badge>
                <Badge variant="outline">Professional Standards</Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Qualifications;