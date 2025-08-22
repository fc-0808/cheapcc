"use client";
import React, { useRef } from 'react';
import { motion, useInView, cubicBezier } from 'framer-motion';

export default function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });
  
  // Define custom easing function
  const customEase = cubicBezier(0.43, 0, 0.23, 0.99);

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

  // Animation variants for the connecting lines
  const desktopLineVariants = {
    hidden: { width: "0%", opacity: 0 },
    visible: { 
      width: "100%", 
      opacity: 0.5,
      transition: { 
        duration: 1.2,
        ease: customEase,
        delay: 0.8
      }
    }
  };

  const mobileLineVariants = {
    hidden: { height: "0%", opacity: 0 },
    visible: { 
      height: "70%", 
      opacity: 0.5,
      transition: { 
        duration: 1.5,
        ease: customEase,
        delay: 0.8
      }
    }
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
      description: "Get your genuine Adobe account invitation delivered via email.",
      icon: "fas fa-envelope-open-text",
      color: "#ef4444", // red-500
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="hidden md:block relative py-20 md:py-32 overflow-hidden"
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

        {/* Steps Container with visible connection line */}
        <div className="max-w-5xl mx-auto relative">
          {/* Desktop Connection Lines - Animated as two separate segments */}
          <div className="hidden md:block relative">
            {/* First segment - connecting step 1 and 2 */}
            <motion.div 
              className="absolute"
              style={{
                height: '120px',
                left: '20%', 
                top: '40px',
                zIndex: 5,
                pointerEvents: 'none',
                width: '30%' // Connect first and second step only
              }}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              variants={desktopLineVariants}
            >
              <motion.div
                style={{
                  position: 'absolute',
                  width: '70%',
                  height: '2px',
                  background: 'linear-gradient(90deg, #d946ef, #ec4899)',
                  top: '40%',
                  borderRadius: '50%',
                  transform: 'translateY(-50%)',
                  boxShadow: '0 0 10px rgba(236, 72, 153, 0.2)',
                }}
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 0.5 } : { opacity: 0 }}
                transition={{ duration: 0.3, delay: 1.5 }}
              ></motion.div>
            </motion.div>

            {/* Second segment - connecting step 2 and 3 */}
            <motion.div 
              className="absolute"
              style={{
                height: '120px',
                left: '50%',
                top: '40px',
                zIndex: 5,
                pointerEvents: 'none',
                width: '25%' // Reduced from 30% to 25% to shorten the line
              }}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              variants={{
                hidden: { width: "0%", opacity: 0 },
                visible: { 
                  opacity: 0.5,
                  transition: { 
                    duration: 1.2,
                    ease: customEase,
                    delay: 1.1 // Slightly delayed after the first segment
                  }
                }
              }}
            >
              <motion.div
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '2px',
                  background: 'linear-gradient(90deg, #ec4899, #ef4444)',
                  top: '40%',
                  borderRadius: '50%',
                  transform: 'translateY(-50%)',
                  boxShadow: '0 0 10px rgba(236, 72, 153, 0.2)',
                }}
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 0.5 } : { opacity: 0 }}
                transition={{ duration: 0.3, delay: 1.8 }}
              ></motion.div>
            </motion.div>
          </div>

          {/* Mobile Connection Line - Animated with dots for steps */}
          <div className="md:hidden relative">
            {/* Main vertical line */}
            <motion.div 
              className="absolute"
              style={{
                width: '2px',
                left: '50%',
                top: '100px',
                zIndex: 5,
                background: 'linear-gradient(180deg, #d946ef, #ec4899, #ef4444)',
                boxShadow: '0 0 10px rgba(236, 72, 153, 0.2)',
              }}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              variants={mobileLineVariants}
            ></motion.div>
            
            {/* First node dot (connecting step 1 to 2) */}
            <motion.div
              className="absolute"
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#ec4899',
                left: 'calc(50% - 3px)',
                top: '33%',
                zIndex: 6,
                boxShadow: '0 0 8px #ec4899'
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
              transition={{ delay: 1.3, duration: 0.3 }}
            ></motion.div>
            
            {/* Second node dot (connecting step 2 to 3) */}
            <motion.div
              className="absolute"
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#ef4444',
                left: 'calc(50% - 3px)',
                top: '66%',
                zIndex: 6,
                boxShadow: '0 0 8px #ef4444'
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
              transition={{ delay: 1.6, duration: 0.3 }}
            ></motion.div>
          </div>
          
          {/* Grid for the steps */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-3 gap-12 md:gap-16 relative"
            style={{ position: 'relative', zIndex: 10 }}
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            {steps.map((step, index) => (
              <motion.div
                key={index}
                className="flex flex-col items-center text-center relative p-6"
                custom={index}
                variants={stepVariants}
                style={{ zIndex: 20 }} // Higher z-index
              >
                {/* The celebratory "pop" for the step number/icon */}
                <motion.div
                  className="w-24 h-24 flex items-center justify-center rounded-full relative mb-6 border border-white/10 bg-[#121225]" // Solid background color that matches the page background
                  style={{
                    position: 'relative',
                    zIndex: 30, // Very high z-index
                    background: "rgba(17, 17, 40, 1)", // Solid background color
                    boxShadow: "0 0 25px rgba(0, 0, 0, 0.4)" // Shadow to create depth
                  }}
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
                <p className="text-white/80 text-sm font-light tracking-wide hidden sm:block">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}