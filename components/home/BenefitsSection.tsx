"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring, Variants } from 'framer-motion';

// Define a type for our benefits for better type-safety
interface Benefit {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

export default function BenefitsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const titleInView = useInView(titleRef, { once: false, margin: "-100px 0px" });
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  // Create more advanced parallax effects
  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.9, 1], [0.3, 1, 1, 0.3]);
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.9, 1, 1, 0.9]);
  const rotate = useTransform(scrollYProgress, [0, 1], [-1, 1]);
  
  // Floating animation for cards
  const floatY = useMotionValue(0);
  const smoothFloatY = useSpring(floatY, { stiffness: 100, damping: 30 });
  
  // Use state to store random stars that will be generated client-side only
  const [stars, setStars] = useState<Array<{width: string, height: string, top: string, left: string, boxShadow: string}>>([]);

  // Generate stars on client-side only
  useEffect(() => {
    setStars(
      Array(15).fill(0).map(() => {
        const size = Math.random() * 2 + 1;
        return {
          width: `${size}px`,
          height: `${size}px`,
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          boxShadow: `0 0 ${Math.random() * 4 + 2}px rgba(255, 255, 255, 0.7)`,
        };
      })
    );
  }, []);

  // Create scroll-triggered animation for floating
  useEffect(() => {
    const unsubscribe = scrollYProgress.onChange(value => {
      floatY.set(Math.sin(value * Math.PI * 2) * 10);
    });
    return () => unsubscribe();
  }, [scrollYProgress, floatY]);

  const benefits: Benefit[] = [
    {
      id: "save-money",
      title: "Save Money",
      description: "Pay up to 75% less than official Adobe pricing while getting the exact same product and benefits.",
      icon: "fa-piggy-bank",
      color: "#ff3366"
    },
    {
      id: "email-delivery",
      title: "Instant Email Delivery",
      description: "Receive your Adobe account details via email immediately after purchase with all apps ready to download.",
      icon: "fa-envelope-open-text",
      color: "#7e22ce"
    },
    {
      id: "genuine",
      title: "100% Genuine Products",
      description: "Full access to all Creative Cloud apps and services with regular updates and cloud storage.",
      icon: "fa-certificate",
      color: "#3b82f6"
    },
    {
      id: "alternative",
      title: "Safe Alternative",
      description: "A trusted alternative destination for affordable Adobe Creative Cloud subscriptions with excellent support.",
      icon: "fa-shield-alt",
      color: "#10b981"
    },
  ];

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
      className="relative overflow-hidden bg-gradient-to-b from-[#171746] via-[#131347] to-[#151533] py-20 md:py-32"
    >
      {/* Animated background elements with parallax */}
      <motion.div 
        className="absolute inset-0 top-0 h-full w-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,80,255,0.15),rgba(255,255,255,0))]" 
        style={{ y, opacity, scale }}
        transition={{ ease: "easeOut" }}
      />
      
      {/* Subtle star field background with 3D parallax */}
      <div className="absolute inset-0 overflow-hidden">
        {stars.map((star, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              ...star,
              z: Math.floor(Math.random() * 50) - 25
            }}
            animate={{ 
              opacity: [0, 0.7, 0],
              scale: [0, 1, 0],
              x: [0, (i % 2 === 0 ? 5 : -5) * Math.random()],
              y: [0, (i % 2 === 0 ? -5 : 5) * Math.random()]
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: [0.43, 0.13, 0.23, 0.96] // Custom easing for more natural motion
            }}
          />
        ))}
      </div>
      
      {/* Animated Nebula and Stars - matching Hero section */}
      <motion.div
        className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_rgba(120,_80,_255,_0.15),_transparent_70%)]"
        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
        transition={{ duration: 40, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_left,_rgba(255,_51,_102,_0.1),_transparent_70%)]"
        animate={{ scale: [1, 1.05, 1], rotate: [0, -5, 0] }}
        transition={{ duration: 50, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      {/* Enhanced animated glow effects with parallax */}
      <motion.div 
        className="absolute -top-[30%] -left-[10%] w-[40%] h-[70%] bg-[radial-gradient(ellipse_at_center,rgba(120,80,255,0.15),transparent_70%)]"
        style={{ rotate, scale: useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 1.2, 0.9]) }}
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
          rotate: [0, 5, 0]
        }}
        transition={{ 
          duration: 15,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut"
        }}
      />
      
      <motion.div 
        className="absolute -bottom-[30%] -right-[10%] w-[40%] h-[70%] bg-[radial-gradient(ellipse_at_center,rgba(44,45,90,0.25),transparent_70%)]"
        style={{ rotate: useTransform(rotate, value => -value), scale: useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 1.1, 0.9]) }}
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.4, 0.2],
          rotate: [0, -3, 0]
        }}
        transition={{ 
          duration: 20,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut"
        }}
      />
      
      {/* Add floating particles */}
      {Array.from({ length: 10 }).map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-1 h-1 rounded-full bg-white opacity-20"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            filter: 'blur(1px)',
            willChange: 'transform, opacity'
          }}
          animate={{
            y: [0, -100, 0],
            x: [0, Math.sin(i) * 50, 0],
            opacity: [0, 0.8, 0],
            scale: [0, 1, 0]
          }}
          transition={{
            duration: 10 + Math.random() * 20,
            repeat: Infinity,
            delay: i * 2,
            ease: "linear"
          }}
        />
      ))}
      
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
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{ 
              textShadow: '0 0 20px rgba(255, 51, 102, 0.3)',
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
                      <motion.ellipse 
                        cx="50" 
                        cy="50" 
                        rx="40" 
                        ry="25" 
                        fill="none" 
                        stroke={`url(#orbital-gradient-${index})`} 
                        strokeWidth="1"
                        animate={{ 
                          rx: [40, 35, 40],
                          ry: [25, 30, 25],
                          opacity: [1, 0.7, 1]
                        }}
                        transition={{ 
                          duration: 8, 
                          repeat: Infinity, 
                          ease: "easeInOut" 
                        }}
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
                      className={`fas ${benefit.icon}`}
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
                <AnimatePresence>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <motion.div
                      key={i}
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
                        delay: i * 0.3,
                        ease: [0.23, 0.94, 0.41, 1.2] // Custom spring-like easing
                      }}
                      style={{ 
                        top: `${50 + Math.random() * 50}%`,
                        left: `${Math.random() * 100}%`,
                        filter: 'blur(0.5px)',
                        boxShadow: `0 0 5px ${benefit.color}`,
                        transformStyle: "preserve-3d",
                        willChange: 'transform, opacity'
                      }}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}