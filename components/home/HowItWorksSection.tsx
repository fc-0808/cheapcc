"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function HowItWorksSection() {
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (howItWorksRef.current) {
      observer.observe(howItWorksRef.current);
    }
    return () => {
      if (howItWorksRef.current) {
        observer.unobserve(howItWorksRef.current);
      }
    };
  }, []);

  const steps = [
    {
      title: "Choose a Plan",
      description: "Select the subscription duration that best fits your needs.",
      delay: "",
    },
    {
      title: "Complete Purchase",
      description: "Enter your email and pay securely with PayPal or credit card with Stripe.",
      delay: "delay-100",
    },
    {
      title: "Receive Details",
      description: "Get your Adobe account information delivered via email.",
      delay: "delay-200",
    },
  ];

  return (
    <section className="how-it-works py-20 md:py-32 relative overflow-hidden bg-gradient-to-b from-[#171746] via-[#131347] to-[#151533]">
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

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className={`section-heading text-center mb-10 sm:mb-16 stagger-item ${isVisible ? 'visible' : ''}`}>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-2 hero-3d-text">How It Works</h2>
          <p className="text-base sm:text-lg text-gray-300">Getting your Adobe Creative Cloud subscription is simple and fast</p>
        </div>
        
        <div 
          className={`steps-container steps-container-with-line grid grid-cols-1 sm:grid-cols-3 gap-y-16 sm:gap-y-12 sm:gap-x-10 md:gap-x-16 max-w-4xl mx-auto relative`} 
          ref={howItWorksRef}
        >
          {/* Custom colored horizontal line for steps */}
          <div className="hidden sm:block absolute top-7 left-1/2 transform -translate-x-1/2 w-4/5 h-0.5 bg-gradient-to-r from-[rgba(255,255,255,0.1)] via-[rgba(255,51,102,0.3)] to-[rgba(255,255,255,0.1)] z-0" />
          
          {steps.map((step, index) => (
            <div 
              key={index}
              className={`step flex flex-col items-center text-center relative stagger-item ${step.delay} ${isVisible ? 'visible' : ''}`}
            >
              <div className="step-number z-10 w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-full bg-[#ff3366] text-white text-xl sm:text-2xl font-bold mb-4 shadow-lg border-4 border-[#131347]">
                {index + 1}
              </div>
              <div className="step-title-wrapper bg-[#131347]/60 backdrop-blur-sm px-4 z-10 relative rounded-lg">
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">{step.title}</h3>
              </div>
              <p className="text-sm sm:text-base hidden md:block text-gray-300 px-4 mt-2 max-w-[200px] mx-auto">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}