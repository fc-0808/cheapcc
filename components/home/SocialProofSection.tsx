"use client";
import React, { useRef, useState, useEffect } from 'react';
// Import necessary hooks and components
import { motion, useInView, animate, useMotionValue, useTransform, Variants } from 'framer-motion';

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
        top: `${Math.random() * 60 - 30}px`,
        left: `${Math.random() * 60 - 30}px`,
        opacity: 0.3 + Math.random() * 0.4,
        scale: 0.4 + Math.random() * 0.4
      }))
    );
  }, []);

  useEffect(() => {
    if (inView && nodeRef.current) {
      const node = nodeRef.current;
      const controls = animate(from, to, {
        duration: 2.5,
        delay: index * 0.2,
        ease: "easeOut",
        onUpdate(value) {
          node.textContent = Math.round(value).toString();
        },
      });
      return () => controls.stop();
    }
  }, [inView, from, to, index]);

  const floatDelay = index * 0.7;
  
  // Define gradient colors
  const fromColor = "#ec4899"; // pink-500
  const toColor = "#ef4444"; // red-500

  return (
    <motion.div 
      className="relative"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ 
        duration: 0.8, 
        delay: index * 0.15,
        ease: "easeOut"
      }}
    >
      {/* Subtle background glow - UPDATED with pink color */}
      <motion.div
        className="absolute w-full h-full blur-[70px] opacity-30 bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.4),transparent_70%)]"
        animate={{ scale: [0.8, 1.1, 0.8], opacity: [0.2, 0.4, 0.2] }}
        transition={{ 
          duration: 8, 
          repeat: Infinity, 
          delay: floatDelay,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        className="flex flex-col items-center relative z-10"
        animate={{ y: [0, -8, 0] }}
        transition={{ 
          duration: 6,
          repeat: Infinity,
          delay: floatDelay,
          ease: "easeInOut"
        }}
      >
        <div className="relative mb-4">
          <motion.div 
            className="absolute -inset-2.5 opacity-0"
            animate={{ opacity: [0, 0.8, 0], rotate: [0, 360], scale: [0.8, 1.1, 0.8] }}
            transition={{ duration: 12, repeat: Infinity, delay: floatDelay, ease: "linear" }}
          >
            <svg width="80" height="80" viewBox="0 0 100 100" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <defs>
                {/* UPDATED SVG gradient */}
                <linearGradient id={`orbital-gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={fromColor} stopOpacity="0.6" />
                  <stop offset="100%" stopColor={toColor} stopOpacity="0" />
                </linearGradient>
              </defs>
              <ellipse cx="50" cy="50" rx="40" ry="20" fill="none" stroke={`url(#orbital-gradient-${index})`} strokeWidth="1" />
            </svg>
          </motion.div>
          
          <motion.div
            className="w-14 h-14 flex items-center justify-center relative z-10"
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <motion.div 
              className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-transparent rounded-full opacity-0"
              animate={{ opacity: [0, 0.8, 0], rotate: [0, 90] }}
              transition={{ duration: 3, repeat: Infinity, repeatType: "reverse", delay: floatDelay }}
            />
            {/* UPDATED Icon with gradient text styling */}
            <i className={`${icon} text-2xl bg-gradient-to-br from-pink-500 to-red-500 bg-clip-text text-transparent`} aria-hidden="true"></i>
          </motion.div>
        </div>
        
        <div className="relative">
          {particles.map((particle, particleIndex) => (
            <motion.div
              key={particleIndex}
              className="absolute w-1 h-1 rounded-full bg-pink-500"
              style={{ top: particle.top, left: particle.left, opacity: particle.opacity, scale: particle.scale }}
              animate={{ y: [0, -12, 0], x: [0, Math.random() * 8 - 4, 0], opacity: [0, 0.8, 0] }}
              transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: floatDelay + particleIndex * 0.5, ease: "easeInOut" }}
            />
          ))}
          
          <motion.div 
            className="text-5xl md:text-6xl font-bold text-white mb-1.5"
            style={{ textShadow: `0 0 15px ${fromColor}50, 0 0 30px ${toColor}20` }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.3 + index * 0.2, type: "spring" }}
          >
            <span ref={nodeRef}>0</span>
            <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.6 + index * 0.2 }}>
              {suffix}
            </motion.span>
          </motion.div>
          
          <div className="relative">
            <motion.div 
              className="text-gray-300 text-xs tracking-wider font-medium uppercase"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.2 }}
            >
              {label}
            </motion.div>
            
            <motion.div 
              className="h-px bg-gradient-to-r from-transparent via-pink-500 to-transparent mt-1.5 w-0"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.8, delay: 0.7 + index * 0.2, ease: "easeOut" }}
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function SocialProofSection() {
  const sectionRef = useRef(null);

  return (
    <section 
      ref={sectionRef}
      className="hidden md:block py-16 md:py-28 relative overflow-hidden"
    >
      <div className="container relative z-10 mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 max-w-6xl mx-auto">
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