import Hero from "@/components/Hero";
import EventDetails from "@/components/EventDetails";
import ReelsVideo from "@/components/ReelsVideo";
import Gallery from "@/components/Gallery";
import CommunityVibe from "@/components/CommunityVibe";
import SocialLinks from "@/components/SocialLinks";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <EventDetails />
      <ReelsVideo />
      <Gallery />
      <CommunityVibe />
      <SocialLinks />
      <Footer />
    </div>
  );
};

export default Index;
