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
    <section className="py-16 px-4 bg-gradient-dark">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-graffiti font-bold text-center mb-12 text-led-blue">
          🖼️ Gallery
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <Card 
              key={index}
              className="overflow-hidden cursor-pointer hover:shadow-glow transition-all duration-300 border-glow-yellow/30"
              onClick={() => setSelectedImage(image.src)}
            >
              <img 
                src={image.src} 
                alt={image.alt}
                className="w-full h-48 md:h-64 object-cover hover:scale-110 transition-transform duration-300"
              />
            </Card>
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