import { motion } from "framer-motion";
import NavBar from "@/components/NavBar";
import Hero from "@/components/Hero";
import EventDetails from "@/components/EventDetails";
import ReelsVideo from "@/components/ReelsVideo";
import Gallery from "@/components/Gallery";
import CommunityVibe from "@/components/CommunityVibe";
import InstagramFeed from "@/components/InstagramFeed";
import SocialLinks from "@/components/SocialLinks";
import Footer from "@/components/Footer";
import { AnimatedSection } from "@/components/animations/AnimatedSection";

const Index = () => {
  return (
    <motion.div 
      className="min-h-screen bg-background overflow-x-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <NavBar />
      
      {/* Hero - No wrapper needed, already has its own animations */}
      <Hero />
      
      {/* Animated Sections with staggered entrance */}
      <AnimatedSection 
        id="event-details" 
        delay={0.1}
        className="relative"
      >
        <EventDetails />
      </AnimatedSection>

      <AnimatedSection 
        delay={0.2}
        direction="left"
        className="relative"
      >
        <ReelsVideo />
      </AnimatedSection>

      <AnimatedSection 
        id="gallery" 
        delay={0.4}
        direction="right"
        className="relative"
      >
        <Gallery />
      </AnimatedSection>

      <AnimatedSection 
        id="instagram" 
        delay={0.5}
        direction="left"
        className="relative"
      >
        <InstagramFeed />
      </AnimatedSection>

      <AnimatedSection 
        id="community" 
        delay={0.6}
        className="relative"
      >
        <CommunityVibe />
      </AnimatedSection>

      <AnimatedSection 
        id="social" 
        delay={0.7}
        direction="up"
        className="relative"
      >
        <SocialLinks />
      </AnimatedSection>

      <AnimatedSection 
        delay={0.8}
        className="relative"
      >
        <Footer />
      </AnimatedSection>
    </motion.div>
  );
};

export default Index;
