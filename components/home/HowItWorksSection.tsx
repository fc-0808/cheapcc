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

  return (
    <section className="how-it-works py-10 sm:py-16 md:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`section-heading text-center mb-8 sm:mb-12 stagger-item ${isVisible ? 'visible' : ''}`}>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#2c2d5a] mb-2">How It Works</h2>
          <p className="text-base sm:text-lg text-gray-500">Getting your Adobe Creative Cloud subscription is simple and fast</p>
        </div>
        
        {/* Steps container - grid on mobile, flex row with connected steps on desktop */}
        <div 
          className="steps-container grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-0 max-w-4xl mx-auto" 
          ref={howItWorksRef}
        >
          <div className={`step flex flex-col items-center text-center sm:items-start sm:text-left relative stagger-item ${isVisible ? 'visible' : ''}`}>
            <div className="step-number w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-[#ff3366] text-white text-xl sm:text-2xl font-bold mb-4">1</div>
            <h3 className="text-lg sm:text-xl font-semibold text-[#2c2d5a] mb-2">Choose a Plan</h3>
            <p className="text-sm sm:text-base text-gray-600">Select the subscription duration that best fits your needs.</p>
            
            {/* Connect arrow - visible on desktop only */}
            <div className="hidden sm:block absolute top-7 left-[110%] transform -translate-x-1/2 w-16 h-2 bg-[#ff3366]/20 sm:w-full">
              <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 text-[#ff3366]">
                <i className="fas fa-chevron-right"></i>
              </div>
            </div>
          </div>
          
          <div className={`step flex flex-col items-center text-center sm:items-start sm:text-left relative stagger-item delay-100 ${isVisible ? 'visible' : ''}`}>
            <div className="step-number w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-[#ff3366] text-white text-xl sm:text-2xl font-bold mb-4">2</div>
            <h3 className="text-lg sm:text-xl font-semibold text-[#2c2d5a] mb-2">Complete Purchase</h3>
            <p className="text-sm sm:text-base text-gray-600">Enter your email and pay securely with PayPal.</p>
            
            {/* Connect arrow - visible on desktop only */}
            <div className="hidden sm:block absolute top-7 left-[110%] transform -translate-x-1/2 w-16 h-2 bg-[#ff3366]/20 sm:w-full">
              <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 text-[#ff3366]">
                <i className="fas fa-chevron-right"></i>
              </div>
            </div>
          </div>
          
          <div className={`step flex flex-col items-center text-center sm:items-start sm:text-left stagger-item delay-200 ${isVisible ? 'visible' : ''}`}>
            <div className="step-number w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-[#ff3366] text-white text-xl sm:text-2xl font-bold mb-4">3</div>
            <h3 className="text-lg sm:text-xl font-semibold text-[#2c2d5a] mb-2">Receive Details</h3>
            <p className="text-sm sm:text-base text-gray-600">Get your Adobe account information delivered via email.</p>
          </div>
        </div>
      </div>
    </section>
  );
} 