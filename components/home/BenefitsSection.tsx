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

    const currentRef = benefitsRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  const benefits = [
    {
      icon: "fas fa-piggy-bank",
      title: "Massive Savings",
      description: "Pay up to 86% less than official Adobe pricing while getting the exact same product and benefits.",
    },
    {
      icon: "fas fa-bolt",
      title: "Email Delivery",
      description: "Receive your Adobe account details via email after purchase with all apps ready to download.",
    },
    {
      icon: "fas fa-check-circle",
      title: "100% Genuine",
      description: "Full access to all Creative Cloud apps and services with regular updates and cloud storage.",
    },
    {
      icon: "fas fa-exchange-alt",
      title: "Alternative to cheapcc.net",
      description: "cheapcc.online is your alternative destination to cheapcc.net for affordable Adobe Creative Cloud subscriptions.",
    },
  ];

  return (
    <section className="benefits py-10 sm:py-16 md:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8" ref={benefitsRef}>
        <div className={`section-heading text-center mb-6 sm:mb-10 stagger-item ${isVisible ? 'visible' : ''}`}>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-[#2c2d5a] to-[#484a9e] bg-clip-text text-transparent inline-block mb-2">
            Why Choose CheapCC?
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-500 max-w-xl mx-auto">
            CheapCC delivers authorized Adobe Creative Cloud subscriptions at significantly reduced prices compared to official channels
          </p>
        </div>
        <div className={`benefits-container grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-8 max-w-3xl mx-auto mt-2 sm:mt-4 md:mt-12 stagger-item delay-100 ${isVisible ? 'visible' : ''}`}>
          {benefits.map((benefit, index) => (
            <div 
              key={index}
              className="benefit-card bg-gray-50 hover:bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center text-center"
            >
              <div className="mb-3 sm:mb-4 md:mb-5">
                <i className={`${benefit.icon} text-3xl sm:text-4xl md:text-5xl text-[#2c2d5a]`}></i>
              </div>
              <h3 className="text-sm md:text-xl font-semibold text-[#2c2d5a] mb-2">{benefit.title}</h3>
              <p className="text-sm sm:text-base text-gray-600 hidden md:block">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}