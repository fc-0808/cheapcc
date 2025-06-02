"use client";
import React, { useState, useEffect, useRef } from 'react';

export default function BenefitsSection() {
  const benefitsRef = useRef<HTMLDivElement>(null);
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

    if (benefitsRef.current) {
      observer.observe(benefitsRef.current);
    }
    return () => {
      if (benefitsRef.current) {
        observer.unobserve(benefitsRef.current);
      }
    };
  }, []);

  return (
    <section className="benefits py-10 sm:py-16 md:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8" ref={benefitsRef}>
        <div className={`section-heading text-center mb-8 sm:mb-12 stagger-item ${isVisible ? 'visible' : ''}`}>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-[#2c2d5a] to-[#484a9e] bg-clip-text text-transparent inline-block mb-2">
            Why Choose CheapCC?
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-500 max-w-xl mx-auto">
            Authorized Adobe Creative Cloud subscriptions at significantly reduced prices compared to official channels
          </p>
        </div>
        <div className={`benefits-container grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 max-w-3xl mx-auto mt-8 sm:mt-12 stagger-item delay-100 ${isVisible ? 'visible' : ''}`}>
          <div className="benefit-card bg-gray-50 hover:bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center sm:items-start text-center sm:text-left">
            <div className="benefit-icon w-14 h-14 bg-[#ff3366]/10 text-[#ff3366] flex items-center justify-center rounded-full mb-4">
              <i className="fas fa-piggy-bank text-xl"></i>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-[#2c2d5a] mb-2">Massive Savings</h3>
            <p className="text-sm sm:text-base text-gray-600">Pay up to 86% less than official Adobe pricing while getting the exact same product and benefits.</p>
          </div>
          <div className="benefit-card bg-gray-50 hover:bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center sm:items-start text-center sm:text-left">
            <div className="benefit-icon w-14 h-14 bg-[#ff3366]/10 text-[#ff3366] flex items-center justify-center rounded-full mb-4">
              <i className="fas fa-bolt text-xl"></i>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-[#2c2d5a] mb-2">Email Delivery</h3>
            <p className="text-sm sm:text-base text-gray-600">Receive your Adobe account details via email after purchase with all apps ready to download.</p>
          </div>
          <div className="benefit-card bg-gray-50 hover:bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center sm:items-start text-center sm:text-left">
            <div className="benefit-icon w-14 h-14 bg-[#ff3366]/10 text-[#ff3366] flex items-center justify-center rounded-full mb-4">
              <i className="fas fa-check-circle text-xl"></i>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-[#2c2d5a] mb-2">100% Genuine</h3>
            <p className="text-sm sm:text-base text-gray-600">Full access to all Creative Cloud apps and services with regular updates and cloud storage.</p>
          </div>
          <div className="benefit-card bg-gray-50 hover:bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center sm:items-start text-center sm:text-left">
            <div className="benefit-icon w-14 h-14 bg-[#ff3366]/10 text-[#ff3366] flex items-center justify-center rounded-full mb-4">
              <i className="fas fa-exchange-alt text-xl"></i>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-[#2c2d5a] mb-2">Alternative to cheapcc.net</h3>
            <p className="text-sm sm:text-base text-gray-600">cheapcc.online is your alternative destination to cheapcc.net for affordable Adobe Creative Cloud subscriptions.</p>
          </div>
        </div>
      </div>
    </section>
  );
} 