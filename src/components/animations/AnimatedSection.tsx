import { motion, useTransform, useScroll } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  id?: string;
}

export const AnimatedSection = ({ 
  children, 
  className = "", 
  delay = 0, 
  direction = "up",
  id 
}: AnimatedSectionProps) => {
  const getInitialTransform = () => {
    switch (direction) {
      case "up": return { y: 100, opacity: 0 };
      case "down": return { y: -100, opacity: 0 };
      case "left": return { x: 100, opacity: 0 };
      case "right": return { x: -100, opacity: 0 };
      default: return { y: 100, opacity: 0 };
    }
  };

  return (
    <motion.section
      id={id}
      initial={getInitialTransform()}
      whileInView={{ x: 0, y: 0, opacity: 1 }}
      transition={{ 
        duration: 0.8, 
        delay,
        ease: [0.25, 0.46, 0.45, 0.94] 
      }}
      viewport={{ once: false, margin: "-100px" }}
      className={`${className}`}
    >
      {children}
    </motion.section>
  );
};

interface ParallaxContainerProps {
  children: ReactNode;
  speed?: number;
  className?: string;
}

export const ParallaxContainer = ({ 
  children, 
  speed = 0.5, 
  className = "" 
}: ParallaxContainerProps) => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, speed * 100]);

  return (
    <motion.div
      className={className}
      style={{ y }}
    >
      {children}
    </motion.div>
  );
};

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

export const StaggerContainer = ({ 
  children, 
  className = "", 
  staggerDelay = 0.1 
}: StaggerContainerProps) => {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, margin: "-50px" }}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay
          }
        }
      }}
    >
      {children}
    </motion.div>
  );
};