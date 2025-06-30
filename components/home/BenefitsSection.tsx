"use client";
import React, { useState, useEffect, useRef } from 'react';

// Define a type for our benefits for better type-safety
interface Benefit {
  id: string;
  title: string;
  description: string;
  animationClass: string;
  svg: JSX.Element;
}

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

  const benefits: Benefit[] = [
    {
      id: "save-money",
      title: "Save Money",
      description: "Pay up to 75% less than official Adobe pricing while getting the exact same product and benefits.",
      animationClass: "animate-saving-pig",
      svg: (
        <svg viewBox="0 0 100 100">
          {/* Coin to be animated */}
          <g className="coin-path">
            <circle cx="50" cy="15" r="10" fill="#fde047" stroke="#facc15" strokeWidth="1.5"/>
            <text x="50" y="19" textAnchor="middle" fontSize="12" fill="#ca8a04" fontWeight="bold">$</text>
          </g>
          {/* Pig Body */}
          <g className="piggy-bank-body">
            <path 
              fill="#fce7f3" 
              stroke="#db2777" 
              strokeWidth="2.5" 
              d="M75,45 C95,45 95,75 75,80 C60,88 40,88 25,80 C5,75 5,45 25,45 C35,35 65,35 75,45 Z"
            />
            {/* Features */}
            <path fill="#db2777" d="M48 48h4a1 1 0 010 2h-4a1 1 0 010-2z" /> {/* Slot */}
            <circle cx="35" cy="58" r="2.5" fill="#2c2d5a" /> {/* Eye */}
            <path d="M18 60 C 12 60, 12 70, 18 70" stroke="#db2777" strokeWidth="2" fill="none" strokeLinecap="round" /> {/* Tail */}
            <ellipse cx="78" cy="55" rx="6" ry="8" fill="#fbcfe8" stroke="#db2777" strokeWidth="2" /> {/* Snout */}
            
            {/* Legs */}
            <path fill="#fbcfe8" stroke="#db2777" strokeWidth="2" d="M30 84 V 90 H 36 V 84 Z" />
            <path fill="#fbcfe8" stroke="#db2777" strokeWidth="2" d="M64 84 V 90 H 70 V 84 Z" />
          </g>
        </svg>
      )
    },
    {
      id: "email-delivery",
      title: "Email Delivery",
      description: "Receive your Adobe account details via email after purchase with all apps ready to download.",
      animationClass: "animate-email-delivery",
      svg: (
        <svg viewBox="0 0 100 100">
          <g>
            {/* Document inside */}
            <rect className="document" x="20" y="35" width="60" height="40" rx="3" fill="#f3f4f6" />
            <rect className="document" x="28" y="45" width="44" height="4" rx="1" fill="#cbd5e1"/>
            <rect className="document" x="28" y="55" width="30" height="4" rx="1" fill="#cbd5e1"/>
            {/* Envelope Body */}
            <path fill="#e5e7eb" d="M10 30 L50 60 L90 30 V80 H10 Z" />
            <path fill="#d1d5db" d="M10 30 L50 60 L90 30 L50 0 Z" className="envelope-flap" />
          </g>
        </svg>
      )
    },
    {
      id: "genuine",
      title: "100% Genuine",
      description: "Full access to all Creative Cloud apps and services with regular updates and cloud storage.",
      animationClass: "animate-genuine-seal",
      svg: (
        <svg viewBox="0 0 100 100">
          <g className="medal-group">
            {/* Ribbon */}
            <path fill="#ff3366" d="M40,10 L35,40 L50,30 L65,40 L60,10 Z" />
            {/* Medal */}
            <circle cx="50" cy="65" r="25" fill="#2c2d5a" />
            {/* Checkmark */}
            <path d="M40 65 L48 73 L62 55" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            {/* Shine effect */}
            <g clipPath="url(#medalClip)">
              <rect className="shine" x="0" y="40" width="50" height="50" fill="white" fillOpacity="0.3" transform="skewX(-30)" />
            </g>
          </g>
          <defs>
            <clipPath id="medalClip">
              <circle cx="50" cy="65" r="25" />
            </clipPath>
          </defs>
        </svg>
      )
    },
    {
      id: "alternative",
      title: "Alternative to cheapcc.net",
      description: "cheapcc.online is your alternative destination to cheapcc.net for affordable Adobe Creative Cloud subscriptions.",
      animationClass: "animate-cc-swap",
      svg: (
         <svg viewBox="0 0 100 100">
            {/* A professional icon showing a choice between two "CC"s. */}
            <g fontFamily="Arial, sans-serif" fontSize="60" fontWeight="bold" textAnchor="middle">
              {/* First 'C' representing the old option */}
              <text className="cc-1" x="32" y="70" fill="#2c2d5a">C</text>
              {/* Second 'C' representing our alternative */}
              <text className="cc-2" x="68" y="70" fill="#2c2d5a" opacity="0.2">C</text>
            </g>
        </svg>
      )
    },
  ];

  return (
    <section className="benefits py-10 sm:py-16 md:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8" ref={benefitsRef}>
        <div className={`section-heading text-center mb-6 sm:mb-10 stagger-item ${isVisible ? 'visible' : ''}`}>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-[#2c2d5a] to-[#484a9e] bg-clip-text text-transparent inline-block mb-2 hero-3d-text">
            Why Choose Us?
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-500 max-w-xl mx-auto">
            We deliver authorized Adobe Creative Cloud subscriptions at significantly reduced prices compared to official channels.
          </p>
        </div>
        <div className={`benefits-container grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-8 max-w-3xl mx-auto mt-2 sm:mt-4 md:mt-12 stagger-item delay-100 ${isVisible ? 'visible' : ''}`}>
          {benefits.map((benefit) => (
            <div 
              key={benefit.id}
              className="benefit-card bg-gray-50 hover:bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center text-center"
            >
              <div className={`benefit-icon-wrapper ${benefit.animationClass}`}>
                {benefit.svg}
              </div>
              <h3 className="text-sm md:text-xl font-semibold text-[#2c2d5a] mb-2 mt-4">{benefit.title}</h3>
              <p className="text-sm sm:text-base text-gray-600 hidden md:block">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}