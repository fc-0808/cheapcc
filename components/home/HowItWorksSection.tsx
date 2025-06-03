"use client";
import React, { useState, useEffect, useRef } from 'react';

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
      description: "Enter your email and pay securely with PayPal.",
      delay: "delay-100",
    },
    {
      title: "Receive Details",
      description: "Get your Adobe account information delivered via email.",
      delay: "delay-200",
    },
  ];

  return (
    <section className="how-it-works py-10 sm:py-16 md:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`section-heading text-center mb-8 sm:mb-12 stagger-item ${isVisible ? 'visible' : ''}`}>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#2c2d5a] mb-2">How It Works</h2>
          <p className="text-base sm:text-lg text-gray-500">Getting your Adobe Creative Cloud subscription is simple and fast</p>
        </div>
        
        <div 
          // Added 'steps-container-with-line' for CSS targeting and adjusted gaps
          className={`steps-container steps-container-with-line grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-8 sm:gap-x-4 md:gap-x-8 max-w-4xl mx-auto`} 
          ref={howItWorksRef}
        >
          {steps.map((step, index) => (
            <div 
              key={index}
              // Always center text content
              className={`step flex flex-col items-center text-center relative stagger-item ${step.delay} ${isVisible ? 'visible' : ''}`}
            >
              <div className="step-number w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-[#ff3366] text-white text-xl sm:text-2xl font-bold mb-4">
                {index + 1}
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-[#2c2d5a] mb-2">{step.title}</h3>
              <p className="text-sm sm:text-base text-gray-600 px-2 sm:px-0">{step.description}</p>
              {/* Individual connecting lines/arrows are removed */}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}