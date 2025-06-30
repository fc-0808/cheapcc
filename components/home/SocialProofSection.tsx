"use client";
import React, { useRef, useState, useEffect } from 'react';
// Import necessary hooks and components
import { motion, useInView, animate, useMotionValue, useTransform, useScroll } from 'framer-motion';

const COUNTERS_DATA = [
  { id: 'customers', target: 500, label: 'Happy Customers', icon: 'fas fa-users', suffix: '+' },
  { id: 'activations', target: 1500, label: 'Successful Activations', icon: 'fas fa-check-circle', suffix: '+' },
  { id: 'satisfaction', target: 99, label: 'Customer Satisfaction', icon: 'fas fa-star', suffix: '%' },
  { id: 'support', target: 24, label: 'Support Availability', icon: 'fas fa-headset', suffix: '/7' },
];

// Define proper types for Counter props
interface CounterProps {
  from: number;
  to: number;
  suffix: string;
  icon: string;
  label: string;
  index: number;
}

// A dedicated, reusable Counter component with floating elements design
function Counter({ from, to, suffix, icon, label, index }: CounterProps) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(nodeRef, { once: true, margin: "-50px" });
  const [particles, setParticles] = useState<Array<{top: string, left: string, opacity: number, scale: number}>>([]);

  // Values for floating animation
  const floatY = useMotionValue(0);
  const rotateZ = useTransform(floatY, [0, 1], [-1, 1]);

  // Generate particles on client-side only
  useEffect(() => {
    setParticles(
      Array(3).fill(0).map(() => ({
        top: `${Math.random() * 80 - 40}px`,
        left: `${Math.random() * 80 - 40}px`,
        opacity: 0.3 + Math.random() * 0.5,
        scale: 0.5 + Math.random() * 0.5
      }))
    );
  }, []);

  useEffect(() => {
    if (inView && nodeRef.current) {
      const node = nodeRef.current;
      // Use framer motion's animate function
      const controls = animate(from, to, {
        duration: 2.5,
        delay: index * 0.2,
        ease: [0.215, 0.61, 0.355, 1], // Custom cubic bezier for more elegant animation
        onUpdate(value) {
          node.textContent = Math.round(value).toString();
        },
      });
      return () => controls.stop();
    }
  }, [inView, from, to, index]);

  // Generate a unique delay for the floating animation based on index
  const floatDelay = index * 0.7;

  return (
    <motion.div 
      className="relative"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ 
        duration: 0.8, 
        delay: index * 0.15,
        ease: [0.215, 0.61, 0.355, 1]
      }}
    >
      {/* Subtle background glow */}
      <motion.div
        className="absolute w-full h-full blur-[80px] opacity-30 bg-[radial-gradient(circle_at_center,rgba(255,51,102,0.4),transparent_70%)]"
        animate={{ scale: [0.8, 1.1, 0.8], opacity: [0.2, 0.4, 0.2] }}
        transition={{ 
          duration: 8, 
          repeat: Infinity, 
          delay: floatDelay,
          ease: "easeInOut"
        }}
      />
      
      {/* Floating content container */}
      <motion.div
        className="flex flex-col items-center relative z-10"
        animate={{ 
          y: [0, -10, 0], 
          rotate: [0, rotateZ.get(), 0]
        }}
        transition={{ 
          duration: 6,
          repeat: Infinity,
          delay: floatDelay,
          ease: "easeInOut"
        }}
      >
        {/* Icon with glowing orbital ring */}
        <div className="relative mb-5">
          {/* Orbital ring animation */}
          <motion.div 
            className="absolute -inset-3 opacity-0"
            animate={{ 
              opacity: [0, 0.8, 0],
              rotate: [0, 360],
              scale: [0.8, 1.1, 0.8]
            }}
            transition={{ 
              duration: 12, 
              repeat: Infinity,
              delay: floatDelay,
              ease: "linear"
            }}
          >
            <svg width="100" height="100" viewBox="0 0 100 100" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <defs>
                <linearGradient id={`orbital-gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ff3366" stopOpacity="0.6" />
                  <stop offset="50%" stopColor="#ff66a3" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#ff3366" stopOpacity="0" />
                </linearGradient>
              </defs>
              <ellipse cx="50" cy="50" rx="40" ry="20" fill="none" stroke={`url(#orbital-gradient-${index})`} strokeWidth="1" />
            </svg>
          </motion.div>
          
          {/* Icon with background shimmer */}
          <motion.div
            className="w-16 h-16 flex items-center justify-center relative z-10"
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <motion.div 
              className="absolute inset-0 bg-gradient-to-br from-[rgba(255,51,102,0.2)] to-transparent rounded-full opacity-0"
              animate={{ opacity: [0, 0.8, 0], rotate: [0, 90] }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                repeatType: "reverse",
                delay: floatDelay
              }}
            />
            <i className={`${icon} text-[#ff3366] text-3xl`}></i>
          </motion.div>
        </div>
        
        {/* Counter value with floating particles */}
        <div className="relative">
          {/* Floating particles */}
          {particles.map((particle, particleIndex) => (
            <motion.div
              key={particleIndex}
              className="absolute w-1.5 h-1.5 rounded-full bg-[#ff3366]"
              style={{
                top: particle.top,
                left: particle.left,
                opacity: particle.opacity,
                scale: particle.scale
              }}
              animate={{
                y: [0, -15, 0],
                x: [0, Math.random() * 10 - 5, 0],
                opacity: [0, 0.8, 0]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: floatDelay + particleIndex * 0.5,
                ease: "easeInOut"
              }}
            />
          ))}
          
          {/* Counter number */}
          <motion.div 
            className="text-6xl md:text-7xl font-bold text-white mb-2"
            style={{ 
              textShadow: "0 0 20px rgba(255, 51, 102, 0.5), 0 0 40px rgba(255, 51, 102, 0.2)" 
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              duration: 0.7, 
              delay: 0.3 + index * 0.2,
              type: "spring"
            }}
          >
            <span ref={nodeRef}>0</span>
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                duration: 0.4, 
                delay: 0.6 + index * 0.2 
              }}
            >
              {suffix}
            </motion.span>
          </motion.div>
          
          {/* Label with gradient underline */}
          <div className="relative">
            <motion.div 
              className="text-[#d1d5db] text-sm tracking-wider font-medium uppercase"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.5, 
                delay: 0.5 + index * 0.2 
              }}
            >
              {label}
            </motion.div>
            
            {/* Animated gradient underline */}
            <motion.div 
              className="h-0.5 bg-gradient-to-r from-transparent via-[#ff3366] to-transparent mt-2 w-0"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ 
                duration: 0.8, 
                delay: 0.7 + index * 0.2,
                ease: "easeOut"
              }}
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function SocialProofSection() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  // Transform scrollYProgress into a parallax effect
  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);
  
  // Use state to store random stars that will be generated client-side only
  const [stars, setStars] = useState<Array<{width: string, height: string, top: string, left: string, boxShadow: string}>>([]);

  // Generate stars on client-side only
  useEffect(() => {
    setStars(
      Array(20).fill(0).map(() => {
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
  
  return (
    <section 
      ref={sectionRef}
      className="bg-gradient-to-b from-[#171746] via-[#131347] to-[#151533] py-20 md:py-32 relative overflow-hidden"
    >
      {/* Animated background elements for depth */}
      <motion.div 
        className="absolute inset-0 -top-20 h-full w-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(255,51,102,0.15),rgba(255,255,255,0))]" 
        style={{ y }}
      />
      
      {/* Subtle star field background */}
      <div className="absolute inset-0 overflow-hidden">
        {stars.map((star, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={star}
            animate={{ 
              opacity: [0, 0.7, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeInOut"
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
      
      <div className="container relative z-10 mx-auto px-4">
        
        {/* Counter grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {COUNTERS_DATA.map((counter, index) => (
            <Counter
              key={counter.id}
              from={0}
              to={counter.target}
              suffix={counter.suffix}
              icon={counter.icon}
              label={counter.label}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}