"use client";
import React, { useRef } from 'react';
// Import necessary hooks and components
import { motion, useInView, animate, Variants } from 'framer-motion';
import { useEffect } from 'react';

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

// A dedicated, reusable Counter component for cleaner code
function Counter({ from, to, suffix, icon, label, index }: CounterProps) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(nodeRef, { once: true, margin: "-100px" });

  useEffect(() => {
    if (inView && nodeRef.current) {
      const node = nodeRef.current;
      // Use framer motion's animate function
      // This is more declarative and robust than requestAnimationFrame
      const controls = animate(from, to, {
        duration: 2,
        delay: index * 0.1,
        ease: "easeOut",
        onUpdate(value) {
          node.textContent = Math.round(value).toString();
        },
      });
      return () => controls.stop();
    }
  }, [inView, from, to, index]);

  return (
    <div className="rounded-[22px] p-4 sm:p-6 bg-slate-900 relative overflow-hidden group">
      {/* Animated border/gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl"></div>
      <div className="absolute inset-[1px] bg-slate-900 rounded-[21px] z-10"></div>

      <div className="flex flex-col items-center text-center relative z-20">
        <i className={`${icon} text-cyan-400 text-4xl mb-4`}></i>
        <div className="text-5xl md:text-6xl font-extrabold text-white mb-2 [text-shadow:0_0_10px_var(--tw-shadow-color)] shadow-cyan-500/50">
          <span ref={nodeRef}>0</span>{suffix}
        </div>
        <div className="text-slate-400 text-sm tracking-wider font-medium uppercase">
          {label}
        </div>
      </div>
    </div>
  );
}

export default function SocialProofSection() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.2 });

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, // Stagger the animation of children
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: "easeOut",
      },
    },
  };

  return (
    // Refined styling for a professional & modern aesthetic
    <section className="bg-slate-950 py-20 md:py-24 relative overflow-hidden border-t border-slate-800">
      {/* Sophisticated background using a radial gradient for a spotlight effect */}
      <div className="absolute inset-0 top-0 h-1/2 w-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(56,189,248,0.2),rgba(255,255,255,0))]" />
      
      <div className="container relative z-10 mx-auto px-4">
        <motion.div
          ref={containerRef}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {COUNTERS_DATA.map((counter, index) => (
            <motion.div key={counter.id} variants={itemVariants}>
              <Counter
                from={0}
                to={counter.target}
                suffix={counter.suffix}
                icon={counter.icon}
                label={counter.label}
                index={index}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}