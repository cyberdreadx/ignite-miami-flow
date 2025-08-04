import { motion } from "framer-motion";
import NavBar from "@/components/NavBar";
import { SocialFeed } from "@/components/SocialFeed";

const Index = () => {
  return (
    <motion.div 
      className="min-h-screen bg-background overflow-x-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <NavBar />
      <div className="pt-20 pb-8">
        <div className="container mx-auto px-4">
          <SocialFeed />
        </div>
      </div>
    </motion.div>
  );
};

export default Index;
