"use client";
import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView, AnimatePresence, useMotionValue, useSpring, Variants } from 'framer-motion';

// Define a type for our benefits for better type-safety
interface Benefit {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

// Define a type for particles
interface Particle {
  id: number;
  top: string;
  left: string;
}

export default function BenefitsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const titleInView = useInView(titleRef, { once: false, margin: "-100px 0px" });
  
  // State to track client-side rendering
  const [isClient, setIsClient] = useState(false);
  // State to store particles data
  const [benefitParticles, setBenefitParticles] = useState<{[benefitId: string]: Particle[]}>({});


  
  // Floating animation for cards
  const floatY = useMotionValue(0);
  const smoothFloatY = useSpring(floatY, { stiffness: 100, damping: 30 });

  const benefits: Benefit[] = [
    {
      id: "save-money",
      title: "Save Money",
      description: "Pay up to 75% less than official Adobe pricing while getting the exact same product and benefits.",
      icon: "fas fa-piggy-bank",
      color: "#ff3366"
    },
    {
      id: "email-delivery",
      title: "Email Delivery",
      description: "Receive your Adobe account details via email immediately after purchase with all apps ready to download.",
      icon: "fas fa-envelope-open-text",
      color: "#7e22ce"
    },
    {
      id: "genuine",
      title: "100% Genuine Products",
      description: "Full access to all Creative Cloud apps and services with regular updates and cloud storage.",
      icon: "fas fa-certificate",
      color: "#3b82f6"
    },
    {
      id: "alternative",
      title: "Safe Alternative",
      description: "A trusted alternative destination for affordable Adobe Creative Cloud subscriptions with excellent support.",
      icon: "fas fa-shield-alt",
      color: "#10b981"
    },
  ];

  // Generate particles only on the client side
  useEffect(() => {
    setIsClient(true);
    
    if (isClient) {
      const particles: {[benefitId: string]: Particle[]} = {};
      
      benefits.forEach(benefit => {
        particles[benefit.id] = Array.from({ length: 5 }).map((_, i) => ({
          id: i,
          top: `${50 + Math.random() * 50}%`,
          left: `${Math.random() * 100}%`,
        }));
      });
      
      setBenefitParticles(particles);
    }
  }, [isClient]);

  // Animation variants for staggered card animations
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const cardVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      rotateX: 15,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      rotateX: 0,
      scale: 1,
      transition: { 
        type: "spring", 
        stiffness: 100, 
        damping: 15,
        mass: 1
      }
    }
  };

  // 3D tilt animation values
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  
  const handleTiltMove = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const moveX = (x - centerX) / 25;
    const moveY = (y - centerY) / 25;
    
    tiltX.set(moveY);
    tiltY.set(-moveX);
  };
  
  const handleTiltExit = () => {
    tiltX.set(0);
    tiltY.set(0);
  };

  return (
    <section 
      ref={sectionRef}
      className="hidden md:block relative overflow-hidden py-20 md:py-32"
    >
      <div className="container relative z-10 mx-auto px-4">
        <motion.div 
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <motion.div 
            className="inline-block mb-4"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
 
          </motion.div>
          <motion.h2 
            ref={titleRef}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 tracking-tight leading-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{ 
              textShadow: '0 4px 12px rgba(0,0,0,0.3), 0 0 30px rgba(255, 51, 102, 0.2)',
              transform: titleInView ? "perspective(1000px) rotateX(0deg)" : "perspective(1000px) rotateX(10deg)",
              willChange: 'transform'
            }}
          >
            <motion.span 
              className="inline-block"
              animate={{ 
                y: [0, -5, 0],
                x: [0, 2, 0]
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              Why Choose{" "}
            </motion.span>
            <motion.span 
              className="bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500 bg-clip-text text-transparent inline-block"
              animate={{ 
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              style={{ 
                backgroundSize: "200% 100%",
                willChange: 'background-position'
              }}
            >
              &nbsp;Our Service
            </motion.span>
          </motion.h2>
          <motion.p 
            className="text-white/80 mx-auto mb-8 text-base sm:text-lg font-light tracking-wide"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Explore the advantages of our premium Adobe Creative Cloud subscriptions
          </motion.p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.id}
              className="relative"
              variants={cardVariants}
              style={{ 
                willChange: 'transform, opacity',
                y: smoothFloatY
              }}
              custom={index}
            >
              <motion.div 
                className="relative z-10 bg-white/5 backdrop-blur-sm border border-white/10 p-6 md:p-8 rounded-2xl overflow-hidden group"
                whileHover={{ 
                  y: -5, 
                  boxShadow: '0 15px 30px rgba(0, 0, 0, 0.25)',
                  scale: 1.02
                }}
                style={{
                  perspective: 1000,
                  rotateX: tiltX,
                  rotateY: tiltY,
                  transformStyle: "preserve-3d",
                  willChange: 'transform, box-shadow'
                }}
                onMouseMove={(e) => handleTiltMove(e, index)}
                onMouseLeave={handleTiltExit}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 15,
                  mass: 0.8 
                }}
              >
                {/* 3D transform effect for child elements */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-30 transition-all duration-500" 
                  style={{ transformStyle: "preserve-3d", transform: "translateZ(20px)" }}
                />
                
                <motion.div 
                  className="absolute -inset-1.5 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-y-0 opacity-0 group-hover:opacity-100 blur-md transition-all duration-700 -z-10"
                  animate={{
                    background: [
                      "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent)",
                      "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)",
                      "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent)"
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
                
                {/* Icon with orbital animation */}
                <motion.div 
                  className="relative flex items-center justify-center mb-6"
                  style={{ transformStyle: "preserve-3d", transform: "translateZ(30px)" }}
                >
                  <motion.div
                    className="absolute w-16 h-16 rounded-full"
                    style={{ backgroundColor: `${benefit.color}10` }}
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0.8, 0.5]
                    }}
                    transition={{ 
                      duration: 3 + index, 
                      repeat: Infinity,
                      ease: [0.43, 0.13, 0.23, 0.96]
                    }}
                  />
                  
                  <motion.div
                    className="absolute -inset-3 opacity-0 group-hover:opacity-30"
                    animate={{ 
                      rotate: [0, 360],
                    }}
                    transition={{ 
                      duration: 10, 
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  >
                    <svg width="100" height="100" viewBox="0 0 100 100" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <defs>
                        <linearGradient id={`orbital-gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor={benefit.color} stopOpacity="0.6" />
                          <stop offset="50%" stopColor={benefit.color} stopOpacity="0.3" />
                          <stop offset="100%" stopColor={benefit.color} stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <ellipse 
                        cx="50" 
                        cy="50" 
                        rx="40" 
                        ry="25" 
                        fill="none" 
                        stroke={`url(#orbital-gradient-${index})`} 
                        strokeWidth="1"
                        className="animate-pulse"
                      />
                    </svg>
                  </motion.div>
                  
                  <motion.div
                    className="w-14 h-14 flex items-center justify-center relative z-10 bg-white/10 rounded-full text-2xl"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    style={{ 
                      color: benefit.color,
                      boxShadow: `0 0 20px ${benefit.color}30`
                    }}
                  >
                    <motion.i 
                      className={benefit.icon}
                      animate={{ rotate: [0, 10, 0, -10, 0] }}
                      transition={{ 
                        duration: 6, 
                        repeat: Infinity, 
                        ease: "easeInOut",
                        times: [0, 0.2, 0.5, 0.8, 1] 
                      }}
                    />
                  </motion.div>
                </motion.div>
                
                <motion.h3 
                  className="text-xl md:text-2xl font-bold text-white mb-3 group-hover:text-[#ff3366] transition-colors duration-300"
                  style={{ 
                    transformStyle: "preserve-3d", 
                    transform: "translateZ(20px)",
                    textShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
                  }}
                >
                  {benefit.title}
                </motion.h3>
                
                <motion.p 
                  className="text-gray-300 group-hover:text-white/90 transition-colors duration-300"
                  style={{ transformStyle: "preserve-3d", transform: "translateZ(15px)" }}
                >
                  {benefit.description}
                </motion.p>
                
                {/* Animated particles on hover with improved 3D effect */}
                {isClient && benefitParticles[benefit.id] && (
                  <AnimatePresence>
                    {benefitParticles[benefit.id].map((particle) => (
                      <motion.div
                        key={`particle-${benefit.id}-${particle.id}`}
                        className="absolute w-1 h-1 rounded-full bg-white opacity-0 group-hover:opacity-100"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{
                          y: [0, -30 - Math.random() * 50],
                          x: [0, (Math.random() - 0.5) * 60],
                          opacity: [0, 0.7, 0],
                          scale: [0.5, 1, 0.5],
                          z: [0, 50, 0]
                        }}
                        transition={{
                          duration: 2 + Math.random() * 2,
                          repeat: Infinity,
                          delay: particle.id * 0.3,
                          ease: [0.23, 0.94, 0.41, 1.2] // Custom spring-like easing
                        }}
                        style={{ 
                          top: particle.top,
                          left: particle.left,
                          filter: 'blur(0.5px)',
                          boxShadow: `0 0 5px ${benefit.color}`,
                          transformStyle: "preserve-3d",
                          willChange: 'transform, opacity'
                        }}
                      />
                    ))}
                  </AnimatePresence>
                )}
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}