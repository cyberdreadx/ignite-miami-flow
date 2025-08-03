import NavBar from "@/components/NavBar";
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
      <NavBar />
      <div className="pt-16"> {/* Add padding top to account for fixed navbar */}
        <Hero />
        <div id="event-details">
          <EventDetails />
        </div>
        <ReelsVideo />
        <div id="gallery">
          <Gallery />
        </div>
        <div id="community">
          <CommunityVibe />
        </div>
        <div id="social">
          <SocialLinks />
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default Index;
