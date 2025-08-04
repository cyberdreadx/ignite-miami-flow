import React from 'react';

const InstagramFeed = () => {
  return (
    <section className="py-16 px-4 bg-gradient-to-br from-background via-background/95 to-primary/5 relative overflow-hidden">
      {/* Background mesh pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,111,97,0.1),transparent_50%)]" />
      
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
            Follow Our Journey
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto mb-6"></div>
          <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
            Stay connected with our latest updates, behind-the-scenes moments, and community highlights on Instagram.
          </p>
        </div>
        
        {/* Instagram Feed Widget */}
        <div className="flex justify-center">
          <div 
            className="elfsight-app-b2941b2b-ee01-47a8-a704-a31f6705c1d2" 
            data-elfsight-app-lazy
          ></div>
        </div>
      </div>
    </section>
  );
};

export default InstagramFeed;