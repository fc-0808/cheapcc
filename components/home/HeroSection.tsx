"use client";
import React, { useState, useEffect, useRef } from 'react';
import Script from 'next/script';

export default function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);
  const starContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    // Create floating particles/stars when component mounts
    if (starContainerRef.current) {
      const container = starContainerRef.current;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      
      // Clear any existing stars
      container.innerHTML = '';
      
      // Create stars with different sizes and animation speeds
      for (let i = 0; i < 60; i++) {
        const star = document.createElement('div');
        const size = Math.random() * 3 + 1; // Random size between 1-4px
        const opacity = Math.random() * 0.5 + 0.3; // Random opacity
        
        star.className = 'absolute rounded-full bg-white z-10';
        star.setAttribute('aria-hidden', 'true');
        star.setAttribute('role', 'presentation');
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.opacity = opacity.toString();
        star.style.boxShadow = `0 0 ${size * 2}px rgba(255, 255, 255, ${opacity})`;
        
        // Random animation duration between 20-50s
        const animDuration = Math.random() * 30 + 20;
        star.style.animation = `float ${animDuration}s infinite ease-in-out`;
        star.style.animationDelay = `${Math.random() * 10}s`;
        
        container.appendChild(star);
      }
    }
  }, []);

  // Handle smooth scrolling to the pricing section
  const handleScrollToPricing = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const pricingSection = document.getElementById('pricing');
    if (pricingSection) {
      pricingSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const heroSchemaData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "CheapCC Adobe Creative Cloud Subscription",
    "description": "CheapCC - Unleash Your Creativity with Adobe Creative Cloud. Access the full Adobe Creative Cloud suite for less.",
    "brand": {
      "@type": "Brand",
      "name": "CheapCC"
    },
    "offers": {
      "@type": "AggregateOffer",
      "lowPrice": "14.99",
      "highPrice": "99.99",
      "priceCurrency": "USD",
      "offerCount": "3"
    }
  };

  return (
    <>
      <Script
        id="hero-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(heroSchemaData) }}
      />
      <section 
        className="hero relative overflow-hidden min-h-screen flex items-center -mt-16"
        aria-labelledby="hero-heading"
      >  
        {/* Premium Background - Darker than before */}
        <div 
          className="absolute inset-0 bg-gradient-to-b from-[#070714] via-[#0c0c2b] to-[#151533] z-0"
          aria-hidden="true"
        ></div>
        
        {/* Cloud-like nebula effect */}
        <div className="absolute inset-0 opacity-30 z-0" aria-hidden="true">
          <div className="absolute w-full h-full bg-[radial-gradient(ellipse_at_top_right,_rgba(120,_80,_255,_0.15),_transparent_70%)] animate-nebula-drift"></div>
          <div className="absolute w-full h-full bg-[radial-gradient(ellipse_at_bottom_left,_rgba(255,_51,_102,_0.15),_transparent_70%)] animate-nebula-pulse"></div>
          <div className="absolute w-full h-full bg-[radial-gradient(circle_at_bottom_right,_rgba(100,_220,_255,_0.1),_transparent_60%)] animate-nebula-float"></div>
        </div>
        
        {/* Animated Spotlights - Enhanced for more premium feel */}
        <div className="absolute top-0 left-0 right-0 bottom-0 overflow-hidden" aria-hidden="true">
          <div className="spotlight spotlight-1 opacity-80"></div>
          <div className="spotlight spotlight-2 opacity-70"></div>
          <div className="spotlight spotlight-3 opacity-60"></div>
          <div className="spotlight spotlight-premium absolute w-[60vw] h-[60vw] rounded-full bg-[radial-gradient(circle,rgba(255,_51,_102,_0.03)_0%,rgba(255,_51,_102,_0.01)_40%,transparent_70%)] top-[-20%] right-[20%] animate-spotlight-premium"></div>
        </div>
        
        {/* Star/particle container */}
        <div ref={starContainerRef} className="absolute inset-0 z-0 overflow-hidden" aria-hidden="true"></div>
        
        {/* Subtle grid overlay for depth */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNMzAgMzBoMzB2MzBIMzB6IiBzdHJva2Utb3BhY2l0eT0iLjAyIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iLjUiLz48cGF0aCBkPSJNMCAzMGgzMHYzMEgweiIgc3Ryb2tlLW9wYWNpdHk9Ii4wMiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9Ii41Ii8+PHBhdGggZD0iTTMwIDBIMHYzMGgzMHoiIHN0cm9rZS1vcGFjaXR5PSIuMDIiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIuNSIvPjxwYXRoIGQ9Ik0zMCAwaDMwdjMwSDMweiIgc3Ryb2tlLW9wYWNpdHk9Ii4wMiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9Ii41Ii8+PC9nPjwvc3ZnPg==')] opacity-5 z-0" aria-hidden="true"></div>
        
        {/* Soft light bloom effect at center */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vh] h-[80vh] rounded-full bg-[radial-gradient(circle,rgba(255,_255,_255,_0.03)_0%,transparent_70%)] blur-lg z-0" aria-hidden="true"></div>
        
        <div className="container mx-auto px-4 p-8 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center justify-center text-center">
          <div className={`hero-content ${isVisible ? 'visible' : ''} relative max-w-4xl mx-auto`}>
            {/* Savings badge hidden on screens smaller than md */}
            <div className="hidden md:flex savings-badge mb-8 md:mb-10">
              <div className="savings-badge-inner border border-[#ff3366] bg-transparent backdrop-blur-sm text-[#ff3366]">
                <i className="fas fa-tags mr-2 text-[#ff3366]" aria-hidden="true" /> Save up to 75% vs Official Pricing
              </div>
            </div>
            
            <div className="hero-title-container mb-4 md:mb-6">
              <h1 id="hero-heading" className="hero-title">
                {/* Adjusted font sizes and leading for hero-title-main */}
                <span className="hero-title-main hero-3d-text opacity-85 md:opacity-100 text-white text-[2.2rem] leading-[2.5rem] sm:text-[2.8rem] sm:leading-[3.1rem] md:text-6xl font-bold">Unleash Your Creativity with</span>
                {/* Adjusted font sizes, leading and margin-top for hero-title-accent */}
                <span className="hero-title-accent block mt-0 pt-3 sm:mt-1 md:mt-2 text-[2.4rem] leading-[2.7rem] sm:text-[3rem] sm:leading-[3.3rem] md:text-6xl">
                  Adobe Creative Cloud
                </span>
              </h1>
            </div>
            
            {/* Description for mobile/tablet - Adjusted margin */}
            <p className="md:hidden hero-description text-white/60 max-w-xl mx-auto mb-8 text-md sm:text-lg backdrop-blur-sm py-1 font-light tracking-wide">
              CheapCC provides the full Adobe Creative Cloud suite for less.
            </p>
            {/* Description for desktop - Adjusted margin */}
            <p className="hidden md:block hero-description text-white/60 max-w-2xl mx-auto mb-10 text-lg backdrop-blur-sm py-8 pt-1 font-light tracking-wide">
              CheapCC provides the full Adobe Creative Cloud suite for less.
            </p>
            
            {/* Features hidden on screens smaller than md */}
            <div className="hidden md:block hero-features-wrapper mb-10">
              <h2 className="sr-only">Adobe Creative Cloud Features</h2>
              <ul className="hero-features flex flex-wrap justify-center gap-4" aria-label="Creative Cloud Features">
                <li className="hero-feature bg-[#ffffff08] backdrop-blur-sm border border-[#ffffff10] rounded-full shadow-[0_0_20px_rgba(255,51,102,0.07)]">
                  <div className="hero-feature-icon" aria-hidden="true">
                    <i className="fas fa-th"></i>
                  </div>
                  <span>All Creative Cloud Apps</span>
                </li>
                <li className="hero-feature bg-[#ffffff08] backdrop-blur-sm border border-[#ffffff10] rounded-full shadow-[0_0_20px_rgba(255,51,102,0.07)]">
                  <div className="hero-feature-icon" aria-hidden="true">
                    <i className="fas fa-cloud"></i>
                  </div>
                  <span>100GB Cloud Storage</span>
                </li>
                <li className="hero-feature bg-[#ffffff08] backdrop-blur-sm border border-[#ffffff10] rounded-full shadow-[0_0_20px_rgba(255,51,102,0.07)]">
                  <div className="hero-feature-icon" aria-hidden="true">
                    <i className="fas fa-wand-magic-sparkles"></i>
                  </div>
                  <span>Adobe Firefly Included</span>
                </li>
              </ul>
            </div>
            
            {/* Adjusted CTA margin for mobile */}
            <div className="hero-cta mb-6 md:mb-12">
              {/* Updated with onClick handler for smooth scrolling */}
              <a 
                href="#pricing" 
                onClick={handleScrollToPricing} 
                className="primary-btn glow-effect px-6 py-3 sm:px-8 sm:py-4 rounded-full bg-gradient-to-r from-[#ff3366] to-[#ff6b8b] text-white font-medium text-base sm:text-lg shadow-lg shadow-[#ff336640] hover:shadow-[#ff336670] hover:translate-y-[-2px] transition-all duration-300 border border-[#ff336620] backdrop-blur-sm relative overflow-hidden"
                aria-label="View Adobe Creative Cloud pricing and plans"
              >
                <span className="relative z-10">View Pricing & Plans</span> <i className="fas fa-arrow-right ml-2 relative z-10" aria-hidden="true"></i>
                <span className="absolute inset-0 bg-gradient-to-r from-[#ff4f7b] to-[#ff3366] opacity-0 hover:opacity-100 transition-opacity duration-300"></span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}