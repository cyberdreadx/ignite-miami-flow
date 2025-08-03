import { useState } from "react";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";
import gallery1 from "@/assets/gallery-1.jpg";
import gallery2 from "@/assets/gallery-2.jpg";
import gallery3 from "@/assets/gallery-3.jpg";

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const images = [
    { src: gallery1, alt: "Fire spinning performance with LED flow props" },
    { src: gallery2, alt: "Skateboarder performing tricks under neon lights" },
    { src: gallery3, alt: "DJ setup with colorful lighting" },
    { src: gallery1, alt: "Flow arts showcase" },
    { src: gallery2, alt: "Skateboard session" },
    { src: gallery3, alt: "Underground venue atmosphere" },
  ];

  return (
    <section className="py-24 px-6 bg-gradient-dark relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-30"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-graffiti font-bold mb-6">
            <span className="bg-gradient-neon bg-clip-text text-transparent">🖼️ Gallery</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-fire mx-auto rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {images.map((image, index) => (
            <div 
              key={index}
              className="animate-scale-in group"
              style={{animationDelay: `${0.1 * index}s`}}
            >
              <Card 
                className="overflow-hidden cursor-pointer border border-white/10 bg-card/10 backdrop-blur-lg hover:border-glow-yellow/50 transition-all duration-500 hover:shadow-glow group-hover:scale-105"
                onClick={() => setSelectedImage(image.src)}
              >
                <div className="relative overflow-hidden">
                  <img 
                    src={image.src} 
                    alt={image.alt}
                    className="w-full h-48 md:h-64 object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute inset-0 bg-gradient-fire opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
      
      {/* Lightbox */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-background/95 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-foreground hover:text-neon-orange transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <img 
              src={selectedImage} 
              alt="Gallery image"
              className="max-w-full max-h-full object-contain rounded-lg shadow-glow"
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default Gallery;