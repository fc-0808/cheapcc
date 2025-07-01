"use client";
import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

export default function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const titleInView = useInView(titleRef, { once: false, margin: "-100px 0px" });
  const stepsInView = useInView(sectionRef, { once: true, amount: 0.3 });

  // Main container variants for staggering children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 }
    }
  };

  // Individual step card variants
  const stepVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring" as const, // Add 'as const' here
        stiffness: 100, 
        damping: 15,
        duration: 0.8
      }
    }
  };

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
        <motion.div 
          className="text-center mb-16 md:mb-20"
          initial="hidden"
          animate={titleInView ? "visible" : "hidden"}
          variants={{
            visible: { transition: { staggerChildren: 0.2 } }
          }}
        >
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
              How It{" "}
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
              &nbsp;Works
            </motion.span>
          </motion.h2>
          <motion.p 
            className="text-white/80 mx-auto mb-8 text-base sm:text-lg font-light tracking-wide"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
            }}
          >
            Unlock the full <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500 font-medium">Creative Cloud</span> suite in three simple steps.
          </motion.p>
        </motion.div>
        
        <motion.div 
          className="max-w-5xl mx-auto relative" 
          variants={containerVariants}
          initial="hidden"
          animate={stepsInView ? "visible" : "hidden"}
        >
          {/* Refined SVG Connecting Arcs */}
          <div className="hidden md:block absolute top-12 left-0 w-full h-24 z-0">
            <svg width="100%" height="100%" viewBox="0 0 1200 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="how-it-works-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#d946ef" />
                  <stop offset="50%" stopColor="#ec4899" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
              </defs>
              <motion.path
                d="M 200 50 Q 400 -20 600 50 T 1000 50" // A smooth S-curve
                fill="none"
                stroke="url(#how-it-works-gradient)"
                strokeWidth="2.5"
                strokeDasharray="10 10" // Creates a dashed line effect
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.5 }}
                transition={{ duration: 1.5, delay: 0.5, ease: 'easeInOut' }}
              />
            </svg>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 md:gap-16">
            {steps.map((step, index) => (
              <motion.div 
                key={index}
                className="flex flex-col items-center text-center relative z-10 p-6 rounded-2xl"
                variants={stepVariants}
              >
                {/* Refined Step Icon and Number */}
                <motion.div 
                  className="w-24 h-24 flex items-center justify-center rounded-full relative mb-6 border border-white/10 bg-white/5 backdrop-blur-sm"
                  style={{ boxShadow: `0 0 25px ${step.color}30` }}
                  whileHover={{ y: -5, scale: 1.05, boxShadow: `0 0 35px ${step.color}50` }}
                  transition={{ type: "spring", stiffness: 300, damping: 10 }}
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

                <motion.h3 className="text-xl font-semibold text-white mb-3">
                  {step.title}
                </motion.h3>

                <motion.p className="text-white/80 mx-auto mb-8 text-base sm:text-sm font-light tracking-wide">
                  {step.description}
                </motion.p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}