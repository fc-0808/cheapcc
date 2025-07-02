"use client";
import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

export default function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

  // Variants for the main container to orchestrate the staggered animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.5 }
    }
  };

  // Dynamic variants for each step card to create a narrative arc
  const stepVariants = {
    hidden: { opacity: 0, y: 60, filter: 'blur(5px)' },
    visible: (index: number) => ({ // Using custom prop 'index'
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        type: "spring" as const,
        stiffness: 80,
        damping: 15,
        // The final step feels more rewarding with a slightly different animation
        mass: index === 2 ? 1.2 : 1,
        delay: index * 0.15
      }
    })
  };

  // Data for the three steps
  const steps = [
    {
      title: "Choose Your Plan",
      description: "Select the subscription duration that best fits your creative needs.",
      icon: "fas fa-check-circle",
      color: "#d946ef", // fuchsia-500
    },
    {
      title: "Complete Purchase",
      description: "Enter your email and pay securely with Stripe or PayPal.",
      icon: "fas fa-credit-card",
      color: "#ec4899", // pink-500
    },
    {
      title: "Receive Your Credentials",
      description: "Get your genuine Adobe account invitation delivered instantly via email.",
      icon: "fas fa-envelope-open-text",
      color: "#ef4444", // red-500
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative py-20 md:py-32 overflow-hidden"
    >
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16 md:mb-20"
          initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
          animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
            How It{" "}
            <span className="bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500 bg-clip-text text-transparent">
              Works
            </span>
          </h2>
          <p className="text-white/80 mx-auto text-base sm:text-lg font-light tracking-wide max-w-xl">
            Unlock the full <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500 font-medium">Creative Cloud</span> suite in three simple, satisfying steps.
          </p>
        </motion.div>

        {/* Steps Container */}
        {/*
          FIX: Added `style={{ transformStyle: 'preserve-3d' }}`
          This forces the children (steps and line) to respect their z-index within a 3D rendering context,
          solving the overlap issue caused by the animations.
        */}
        <motion.div
          className="max-w-5xl mx-auto relative"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* A more elegant, solid connecting line that feels like a confident path */}
          <div className="hidden md:block absolute top-12 left-0 w-full h-24 pointer-events-none" style={{ transform: 'translateZ(-10px)' }}>
            <svg width="100%" height="100%" viewBox="0 0 1200 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="how-it-works-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#d946ef" />
                  <stop offset="50%" stopColor="#ec4899" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
              </defs>
              <motion.path
                d="M 200 50 Q 400 -20 600 50 T 1000 50"
                fill="none"
                stroke="url(#how-it-works-gradient)"
                strokeWidth="2"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={isInView ? { pathLength: 1, opacity: 0.4 } : {}}
                transition={{ duration: 1.5, delay: 0.8, ease: 'easeInOut' }}
              />
            </svg>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 md:gap-16">
            {steps.map((step, index) => (
              // FIX: Restored the z-index here to ensure each card is above the z-0 line.
              // Also added style to use 3D transforms
              <motion.div
                key={index}
                className="flex flex-col items-center text-center relative z-10 p-6"
                custom={index} // Pass index to variants
                variants={stepVariants}
                style={{ transform: 'translateZ(10px)' }}
              >
                {/* The celebratory "pop" for the step number/icon */}
                <motion.div
                  className="w-24 h-24 flex items-center justify-center rounded-full relative mb-6 border border-white/10 bg-white/5 backdrop-blur-sm"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={isInView ? {
                    scale: 1,
                    opacity: 1,
                    // The final step flashes with a bright glow, signifying success
                    boxShadow: index === 2
                      ? [`0 0 50px ${step.color}80`, `0 0 25px ${step.color}30`]
                      : `0 0 25px ${step.color}30`
                  } : {}}
                  transition={{
                    type: "spring",
                    stiffness: 120,
                    damping: 10,
                    delay: 0.6 + (index * 0.2), // Delayed after the card appears
                    // Transition for the boxShadow flash
                    boxShadow: { duration: 0.4, delay: 1 + (index * 0.2), ease: 'easeOut' }
                  }}
                  whileHover={{ y: -5, scale: 1.05, boxShadow: `0 0 35px ${step.color}50` }}
                >
                  <span className="text-4xl font-bold" style={{ color: step.color }}>
                    {index + 1}
                  </span>
                  <i
                    className={`${step.icon} absolute text-xl`}
                    style={{
                      color: step.color,
                      top: '-12px',
                      right: '-12px',
                      textShadow: `0 0 15px ${step.color}`
                    }}
                  ></i>
                </motion.div>

                <h3 className="text-xl font-semibold text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-white/80 text-sm font-light tracking-wide">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}